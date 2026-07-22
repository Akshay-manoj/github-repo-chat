import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { IndexerModule } from './indexer/indexer.module';
import { ParserModule } from './parser/parser.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        // If connecting to a managed Redis that requires TLS (like Render's external connection),
        // uncomment the tls object below:
        // tls: process.env.NODE_ENV === 'production' ? {} : undefined,
      },
    }),
    RepositoriesModule,
    IndexerModule,
    ParserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
