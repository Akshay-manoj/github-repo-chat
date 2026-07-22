import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import express from 'express';
import serverlessExpress from '@vendia/serverless-express';
import { Handler } from '@netlify/functions';

let cachedServer: Handler;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    nestApp.enableCors();
    await nestApp.init();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer;
}

export const handler: Handler = async (event, context) => {
  const server = await bootstrap();
  const serverlessEvent = {
    ...event,
    requestContext: (event as any).requestContext || {},
  };
  return server(serverlessEvent, context) as any;
};

