import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //cors
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  //  Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 📘 Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Debt Manager API')
    .setDescription('API para gestión de deudas entre usuarios')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(4001);
}
bootstrap();
