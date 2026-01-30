import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost and any subdomain of localhost
      const allowedPatterns = [
        /^http:\/\/localhost(:\d+)?$/,
        /^http:\/\/[\w-]+\.localhost(:\d+)?$/,
        /^http:\/\/[\w-]+\.127\.0\.0\.1\.nip\.io(:\d+)?$/,
      ];

      const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin));
      callback(null, isAllowed);
    },
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend is running on http://localhost:${port}`);
}

bootstrap();
