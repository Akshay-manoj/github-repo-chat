import { Module } from '@nestjs/common';
import { IndexerProcessor } from './indexer.processor';
import { ParserModule } from '../parser/parser.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ParserModule, AiModule],
  providers: [IndexerProcessor],
})
export class IndexerModule {}
