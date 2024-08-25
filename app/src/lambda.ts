import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import serverless, { Handler } from 'serverless-http';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { validationExceptionFactory } from './common/factories/validation-exception.factory';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      validateCustomDecorators: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('Link resolver API')
    .setDescription('The link resolver API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Initiate the NestJS application
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  // Wrap the Express app in the Serverless handler
  return serverless(expressApp);
}

// Lambda handler function to bootstrap NestJS application
export const handler = async (event: any, context: any) => {
  server = server ?? (await bootstrap());

  return server(event, context);
};
