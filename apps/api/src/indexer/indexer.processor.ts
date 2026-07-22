import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit from 'simple-git';

import { ParserService } from '../parser/parser.service';
import { AiService } from '../ai/ai.service';
import * as crypto from 'crypto';

@Processor('repository-index-queue')
export class IndexerProcessor extends WorkerHost {
  private readonly logger = new Logger(IndexerProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ParserService,
    private readonly aiService: AiService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { repositoryId, githubUrl } = job.data;
    this.logger.log(`Starting indexing for repo ${githubUrl} (ID: ${repositoryId})`);

    const tempDir = path.join('/tmp', 'repo-index', repositoryId);
    
    try {
      // 1. Setup temporary directory
      await fs.ensureDir(tempDir);
      await fs.emptyDir(tempDir);

      // 2. Clone repository
      this.logger.log(`Cloning ${githubUrl} to ${tempDir}`);
      const git = simpleGit();
      await git.clone(githubUrl, tempDir, ['--depth', '1']);

      // 3. Process files via AST Parser
      this.logger.log(`Repository cloned. Parsing AST and chunking files...`);
      const chunks = await this.parser.chunkRepository(tempDir);
      
      this.logger.log(`Generated ${chunks.length} chunks. Saving to database...`);

      // 4. Save to Database
      for (const chunk of chunks) {
        // Find or create file
        const fileChecksum = crypto.createHash('md5').update(chunk.path).digest('hex');
        
        const file = await this.prisma.file.upsert({
          where: {
            repository_id_path: {
              repository_id: repositoryId,
              path: chunk.path,
            }
          },
          update: { checksum: fileChecksum },
          create: {
            repository_id: repositoryId,
            path: chunk.path,
            checksum: fileChecksum,
          },
        });

        // Generate Gemini Embedding for this chunk
        const embedding = await this.aiService.generateEmbedding(chunk.content);
        const embeddingStr = `[${embedding.join(',')}]`;

        // Save chunk with pgvector embedding (Prisma raw query needed for vector type)
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO "Chunk" (id, file_id, chunk_text, embedding, created_at)
          VALUES (gen_random_uuid(), $1, $2, $3::vector, NOW())
        `, file.id, chunk.content, embeddingStr);
      }

      // Update repository status in DB
      await this.prisma.repository.update({
        where: { id: repositoryId },
        data: {
          indexed_at: new Date(),
        },
      });

      this.logger.log(`Finished indexing ${githubUrl}`);
    } catch (error) {
      this.logger.error(`Failed to index ${githubUrl}: ${error}`);
      throw error;
    } finally {
      // Cleanup
      await fs.remove(tempDir);
    }
  }
}
