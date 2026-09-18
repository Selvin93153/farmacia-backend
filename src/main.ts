import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const allowedOrigins = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    throw new Error('Falta configurar FRONTEND_URL en el backend');
  }

  const port = Number(process.env.PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe ser un número entre 1 y 65535');
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);

  console.log(`API ejecutándose en el puerto ${port}`);
}

bootstrap();