import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { envConfig } from './config/environment/env.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.select(AppModule).get(ConfigModule);

  await app.listen(process.env.PORT ?? 3002);
}

await bootstrap();
