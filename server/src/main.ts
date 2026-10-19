import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('PawtyServer');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for web frontend (localhost:5173 & LAN) and Mobile Expo clients
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API route prefix
  app.setGlobalPrefix('api');

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, '0.0.0.0');

  logger.log(`🐾 Pawty Fullstack Backend is running on: http://localhost:${PORT}/api`);
  logger.log(`📱 LAN Access for Mobile Expo: http://192.168.21.100:${PORT}/api`);
  logger.log(`⚡ WebSocket Gateway listening on ws://localhost:${PORT}`);
}

bootstrap();
