import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      this.logger.error('GEMINI_API_KEY is missing from environment variables! AI features will fail.');
    }
    // Requires GEMINI_API_KEY environment variable
    this.ai = new GoogleGenAI({});
  }

  /**
   * Generates a 768-dimensional embedding for the given text using Gemini.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: text,
        config: {
          outputDimensionality: 768,
        },
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
    try {
      const contextText = contextChunks.join('\n\n---\n\n');
      
      const prompt = `
You are an expert AI software architect and senior engineer. 
Answer the user's question based strictly on the provided codebase context.
Format your entire response using Github Flavored Markdown. 
Use rich markdown elements like code blocks (\`\`\`), tables, lists, and bold text to structure your answer beautifully and make it easy to read.

Context from the repository:
${contextText}

Question: ${query}

Expert Answer (in Markdown):
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
      });

      return response.text || '';
    } catch (error) {
      this.logger.error(`Failed to generate answer: ${error.message}`);
      throw error;
    }
  }
}
