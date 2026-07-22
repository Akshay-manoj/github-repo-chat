import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit from 'simple-git';

import { ParserService } from '../parser/parser.service';
import * as crypto from 'crypto';

@Processor('repository-index-queue')
export class IndexerProcessor extends WorkerHost {
  private readonly logger = new Logger(IndexerProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ParserService,
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

        // Save chunk (Embeddings will be added in Phase 3)
        await this.prisma.chunk.create({
          data: {
            file_id: file.id,
            chunk_text: chunk.content,
            // embedding is omitted, will be added by embeddings background job or directly in Phase 3
          }
        });
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
