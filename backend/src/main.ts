import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Dynamic CORS: Mirror the origin to satisfy 'credentials: true'
  app.enableCors({
    origin: (origin, callback) => {
      // Allow any origin that tries to connect (safe for mobile/web mix)
      // This solves the '*' vs 'credentials' conflict
      if (!origin) return callback(null, true);
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders:
      'Content-Type,Accept,Authorization,X-Requested-With,Access-Control-Allow-Origin',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api');

  // Hardcoded to match your Railway Public Networking setup
  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Server is listening on port ${port}`);
  logger.log(`🔗 Routes are prefixed with /api`);
}
bootstrap();
