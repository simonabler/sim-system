import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


import { ErrorFilter } from './common/filters/errors.filter';
import { AppConfigService } from './config/app/config.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';



async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  });
  //await app.init();
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ErrorFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const appConfig: AppConfigService = app.get<AppConfigService>(AppConfigService);


  bootstrapSwagger(app, appConfig);

  await app.listen(appConfig.port);
}

function bootstrapSwagger(app: INestApplication, appConfig: AppConfigService) {
  const config = new DocumentBuilder()
    .setTitle('ematric')
    .setDescription('The Adler API description')
    .setVersion('1.0')
    .addServer(appConfig.url + '/api/v1/', 'v1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
    deepScanRoutes: true,
    include: [AppModule],

  });

  SwaggerModule.setup('api/v1/doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'API Docs',
  });

  bootstrapSwaggerUniversall(app, appConfig);
}

function bootstrapSwaggerUniversall(
  app: INestApplication,
  appConfig: AppConfigService,
) {
  const config = new DocumentBuilder()
    .setTitle('Allgemein')
    .setDescription('The Adler API Beschreibung Produktionsmanagement System')
    .setVersion('1.0')
    .addServer(appConfig.url + '/api/v1/', 'v1')
    .addBearerAuth()
    .setContact('ematric', 'www.ematric.com', 'ematric@ematric.com')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
    deepScanRoutes: false,
   // include: [AuditLogModule, AuthModule],
  });

  SwaggerModule.setup('api/v1/doc/univ', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    explorer: true,
    customSiteTitle: 'Allgemeine API Docs',
    ...getSwaggerOptions(),
  });
}


function getSwaggerOptions() {
  return {
    customCss: ".swagger-ui img { content:url('/api/assets/ematric.svg'); }",
    customfavIcon: '/api/assets/favicon-96x96.ico',
  };
}

bootstrap();
