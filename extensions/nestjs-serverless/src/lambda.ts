import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import serverlessExpress from '@vendia/serverless-express';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Context, Handler } from 'aws-lambda';
import express from 'express';

import { AppModule } from './app.module.js';

let cachedServer: Handler;

// @vendia/serverless-express is untyped CJS whose default export is the
// factory function. Under nodenext the namespace import is not callable,
// so type the factory explicitly (runtime interop is unaffected).
const createServer = serverlessExpress as unknown as (options: { app: unknown }) => Handler;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    nestApp.enableCors();

    await nestApp.init();

    cachedServer = createServer({ app: expressApp });
  }

  return cachedServer;
}

export const handler = async (event: any, context: Context, callback: any) => {
  const server = await bootstrap();
  return server(event, context, callback);
};
