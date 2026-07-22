import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async searchRepository(repositoryId: string, query: string): Promise<any> {
    try {
      this.logger.log(`Searching repository ${repositoryId} for query: ${query}`);

      // 1. Generate embedding for user query
      const queryEmbedding = await this.aiService.generateEmbedding(query);
      const embeddingStr = `[${queryEmbedding.join(',')}]`;

      // 2. Perform vector search using pgvector
      // We use raw SQL because Prisma doesn't have native ORM methods for pgvector operators yet
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
        ORDER BY distance ASC
        LIMIT 5;
      `, embeddingStr, repositoryId);

      if (nearestChunks.length === 0) {
        return {
          answer: "I couldn't find any relevant code snippets in this repository.",
          references: [],
        };
      }

      // 3. Extract text from the nearest chunks
      const contextChunks = nearestChunks.map(chunk => 
        `File: ${chunk.path}\nCode:\n${chunk.chunk_text}`
      );

      // 4. Generate answer using Gemini
      const answer = await this.aiService.generateAnswer(query, contextChunks);

      // 5. Return the final payload
      return {
        answer,
        references: nearestChunks.map(c => ({
          path: c.path,
          distance: c.distance,
        })),
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      throw error;
    }
  }
}
