import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // BRUTE FORCE CORS MIDDLEWARE
  // This ensures headers are set at the earliest possible moment
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req, res, next) => {
    const origin = req.headers.origin;
    // Allow any origin for now to confirm connectivity
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With, Content-Type, Authorization, Accept',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Immediately respond to preflight (OPTIONS) requests
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
    next();
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;

  // Bind to 0.0.0.0 for Railway networking
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 API is running on: http://0.0.0.0:${port}/api`);
}
bootstrap();
