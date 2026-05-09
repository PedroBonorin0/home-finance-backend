import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // Validação automática dos DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS para o frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Finanças API')
    .setDescription('API de controle financeiro pessoal')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📚 Documentação disponível em http://localhost:${port}/api/docs`);
}

bootstrap();
