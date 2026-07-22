import { Module } from '@nestjs/common';
import { IndexerProcessor } from './indexer.processor';
import { ParserModule } from '../parser/parser.module';

@Module({
  imports: [ParserModule],
  providers: [IndexerProcessor],
})
export class IndexerModule {}
