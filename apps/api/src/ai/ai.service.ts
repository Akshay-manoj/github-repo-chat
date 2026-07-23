import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is missing from environment variables.',
      );
    }

    this.ai = new GoogleGenAI({
      apiKey,
    });
  }

  /**
   * Generates a 768-dimensional embedding for the given text.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text?.trim()) {
      throw new Error('Cannot generate an embedding for empty text.');
    }

    try {
      const response = await this.ai.models.embedContent({
        model:
          process.env.GEMINI_EMBEDDING_MODEL ||
          'gemini-embedding-001',
        contents: text.trim(),
        config: {
          outputDimensionality: 768,
        },
      });
      console.log(response, 'custom');

      const values = response.embeddings?.[0]?.values;

      if (!values?.length) {
        throw new Error('No embedding values returned from Gemini.');
      }

      return values;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);

      this.logger.error(`Failed to generate embedding: ${message}`);
      throw error;
    }
  }

  /**
   * Answers a query using context chunks.
   */
  async generateAnswer(
    query: string,
    contextChunks: string[],
  ): Promise<string> {
    try {
      const contextText = contextChunks.join('\n\n---\n\n');

      const prompt = `You are an expert AI software architect and senior engineer analysing a codebase.

Your job is to answer the user's question accurately and concisely using ONLY the provided code context.
- If the context clearly answers the question, give a precise, well-structured answer.
- If the context is partially relevant, answer what you can and note what is missing.
- If the context is completely irrelevant, say so in one sentence — do NOT hallucinate.
- Always cite the file name(s) when referencing specific code.
- Format your answer in GitHub Flavored Markdown: use headings, bullet lists, and fenced code blocks.
- Keep the answer focused and avoid padding or repetition.

## Code Context
${contextText}

## Question
${query}

## Answer`;

      const response = await this.ai.models.generateContent({
        model: process.env.GEMINI_GENERATION_MODEL || 'gemini-2.0-flash',
        contents: prompt,
      });

      // Robust text extraction across SDK versions
      const text =
        response.text ??
        (response as any)?.candidates?.[0]?.content?.parts?.[0]?.text ??
        '';

      return text.trim();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);

      this.logger.error(`Failed to generate answer: ${message}`);
      throw error;
    }
  }
}