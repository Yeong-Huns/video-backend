import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/exception/filter/http-exception.filter';
import { TypeOrmExceptionFilter } from './common/exception/filter/typeorm-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:3000', 'https://app.hesil.cloud'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      /* 정의되지 않은 프로퍼티 받지 않음 */
      whitelist: true,
      /* 정의되지 않은 프로퍼티로 요청보내면 오류던짐 */
      forbidNonWhitelisted: false,
      /* 타입스크립트 타입을 보고 해당 타입으로 자동 변환 */
      transformOptions: { enableImplicitConversion: true },
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  /* Swagger 설정 */
  const config = new DocumentBuilder()
    .setTitle('nest template')
    .setDescription('temp description')
    .setVersion('1.0')
    .addTag('태그 입력')
    /* 쿠키검증(엑세스토큰)*/
    .addCookieAuth(
      'accessToken',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: '엑세스토큰',
      },
      'access-token',
    )
    /* 쿠키검증(리프레쉬)*/
    .addCookieAuth(
      'refreshToken',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: '리프레쉬토큰',
      },
      'refresh-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3009);
}
bootstrap();
