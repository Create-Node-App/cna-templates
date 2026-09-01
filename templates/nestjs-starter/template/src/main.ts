import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvConfig } from './config/env.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<EnvConfig, true>);

  app.enableCors({
    origin: configService.get('CORS_ORIGIN', { infer: true }) ?? true,
  });

  const appName = configService.get('APP_NAME', { infer: true });
  const swaggerConfig = new DocumentBuilder()
    .setTitle(appName)
    .setDescription('REST API scaffolded with create-awesome-node-app')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT', { infer: true });
  await app.listen(port);
}

bootstrap();
