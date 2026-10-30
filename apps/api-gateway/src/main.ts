import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // .env file is optional or provided by runtime environment
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Configure CORS to only allow configured frontend origin
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`TaskFlow API Gateway is running on port ${port}`);
}
await bootstrap();
