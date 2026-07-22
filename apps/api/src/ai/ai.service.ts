import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private ai: GoogleGenAI;

  constructor() {
    // Requires GEMINI_API_KEY environment variable
    this.ai = new GoogleGenAI({});
  }

  /**
   * Generates a 768-dimensional embedding for the given text using Gemini.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });

      const embeddings = response.embeddings;
      if (!embeddings || embeddings.length === 0 || !embeddings[0].values) {
        throw new Error('No embeddings returned from Gemini');
      }

      return embeddings[0].values;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error.message}`);
      throw error;
    }
  }

  /**
   * Answers a query using context chunks.
   */
  async generateAnswer(query: string, contextChunks: string[]): Promise<string> {
    const prompt = `You are a helpful software engineering assistant answering questions about a codebase.
Use the following code chunks as context to answer the user's question.
If the answer is not contained in the context, say that you don't have enough information.

Context:
${contextChunks.join('\n\n---\n\n')}

Question: ${query}
`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || '';
    } catch (error) {
      this.logger.error(`Failed to generate answer: ${error.message}`);
      throw error;
    }
  }
}
