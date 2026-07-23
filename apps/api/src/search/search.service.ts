import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) { }

  async searchRepository(repositoryId: string, query: string): Promise<any> {
    try {
      this.logger.log(`Searching repository ${repositoryId} for: "${query}"`);

      // 1. Generate embedding for user query
      const queryEmbedding = await this.aiService.generateEmbedding(query);
      const embeddingStr = `[${queryEmbedding.join(',')}]`;

      // 2. Vector search — retrieve top 12 chunks below distance threshold 0.8
      const nearestChunks = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT
          c.id,
          c.chunk_text,
          c.embedding <-> $1::vector AS distance,
          f.path
        FROM "Chunk" c
        JOIN "File" f ON c.file_id = f.id
        WHERE f.repository_id = $2
          AND c.embedding IS NOT NULL
          AND c.embedding <-> $1::vector < 0.8
        ORDER BY distance ASC
        LIMIT 12;
      `, embeddingStr, repositoryId);

      if (nearestChunks.length === 0) {
        return {
          answer: "I couldn't find any relevant code in this repository for that question. Try rephrasing or asking about a specific file or function name.",
          references: [],
        };
      }

      // 3. Format context — include file path for attribution
      const contextChunks = nearestChunks.map(chunk =>
        `### File: ${chunk.path}\n\`\`\`\n${chunk.chunk_text}\n\`\`\``
      );

      // 4. Generate grounded answer
      const answer = await this.aiService.generateAnswer(query, contextChunks);

      return {
        answer,
        references: nearestChunks.map(c => ({
          path: c.path,
          distance: Number(c.distance),
        })),
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      throw error;
    }
  }
}
