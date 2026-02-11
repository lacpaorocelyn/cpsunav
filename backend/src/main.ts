import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create the app with Express
  const app = await NestFactory.create(AppModule);

  // 1. Manual CORS Headers (The most reliable way)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Authorization, X-Requested-With',
    );

    // Handle Preflight
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
    } else {
      next();
    }
  });

  // 2. Also enable the built-in CORS as a secondary layer
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
  });

  app.setGlobalPrefix('api');

  // Railway expects the PORT env var, but we must default to 3000 to match your config
  const port = process.env.PORT || 3000;

  // IMPORTANT: 0.0.0.0 is often required for cloud deployments
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 API is running on: ${await app.getUrl()}`);
}
bootstrap();
