import 'reflect-metadata';
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
  try {
    const server = await bootstrap();
    const serverlessEvent = {
      ...event,
      requestContext: (event as any).requestContext || {},
    };
    return await server(serverlessEvent, context) as any;
  } catch (error: any) {
    console.error('NestJS Bootstrap Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error during function execution',
        error: error.message,
        stack: error.stack,
        name: error.name,
      }),
    };
  }
};

