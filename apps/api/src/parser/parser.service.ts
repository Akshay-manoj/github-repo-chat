import { Injectable, Logger } from '@nestjs/common';
import { Project, SourceFile, SyntaxKind } from 'ts-morph';

export interface CodeChunk {
  path: string;
  content: string;
  type: string; // 'class', 'function', 'interface', etc.
  name?: string;
}

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  /**
   * Parses a directory of TypeScript/JavaScript files and chunks them.
   */
  async chunkRepository(repoPath: string): Promise<CodeChunk[]> {
    const project = new Project();
    
    // Add all TS/JS files in the repo
    project.addSourceFilesAtPaths(`${repoPath}/**/*.ts`);
    project.addSourceFilesAtPaths(`${repoPath}/**/*.js`);
    project.addSourceFilesAtPaths(`${repoPath}/**/*.tsx`);
    project.addSourceFilesAtPaths(`${repoPath}/**/*.jsx`);

    const sourceFiles = project.getSourceFiles();
    const chunks: CodeChunk[] = [];

    for (const sourceFile of sourceFiles) {
      const filePath = sourceFile.getFilePath().replace(repoPath, '');
      const fileChunks = this.processSourceFile(sourceFile, filePath);
      chunks.push(...fileChunks);
    }

    return chunks;
  }

  private processSourceFile(sourceFile: SourceFile, path: string): CodeChunk[] {
    const chunks: CodeChunk[] = [];

    // 1. Extract Classes
    const classes = sourceFile.getClasses();
    for (const cls of classes) {
      chunks.push({
        path,
        content: cls.getText(),
        type: 'class',
        name: cls.getName(),
      });
    }

    // 2. Extract Functions
    const functions = sourceFile.getFunctions();
    for (const func of functions) {
      chunks.push({
        path,
        content: func.getText(),
        type: 'function',
        name: func.getName(),
      });
    }

    // 3. Extract Interfaces/Types
    const interfaces = sourceFile.getInterfaces();
    for (const intf of interfaces) {
      chunks.push({
        path,
        content: intf.getText(),
        type: 'interface',
        name: intf.getName(),
      });
    }

    // 4. Extract global variables / top-level statements if needed
    // (For simplicity, we'll stick to primary constructs for now)

    return chunks;
  }
}
