import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENV_VARIABLES } from './common/const/env.variables';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { VerificationTokenModule } from './verification-token/verification-token.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/access-token.guard';
import { RoleGuard } from './auth/guard/role.guard';
import { CourseModule } from './course/course.module';
import { SectionModule } from './section/section.module';
import { LectureModule } from './lecture/lecture.module';
import { CourseCategoryModule } from './course-category/course-category.module';
import { CourseEnrollmentModule } from './course-enrollment/course-enrollment.module';
import { CourseReviewModule } from './course-review/course-review.module';
import { CourseQuestionModule } from './course-question/course-question.module';
import { CourseCommentModule } from './course-comment/course-comment.module';
import { LectureActivityModule } from './lecture-activity/lecture-activity.module';
import { MediaModule } from './media/media.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('mariadb').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>(ENV_VARIABLES.dbType) as 'mariadb',
        host: configService.get<string>(ENV_VARIABLES.dbHost),
        port: configService.get<number>(ENV_VARIABLES.dbPort),
        username: configService.get<string>(ENV_VARIABLES.dbUsername),
        password: configService.get<string>(ENV_VARIABLES.dbPassword),
        database: configService.get<string>(ENV_VARIABLES.dbDatabase),
        /* 엔티티 자동 로드 설정 */
        autoLoadEntities: true,
        /* 데이터베이스 스키마 동기화 */
        synchronize: true,
        logging: true,
        logger: 'formatted-console',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RoleModule,
    UserModule,
    AccountModule,
    VerificationTokenModule,
    CourseModule,
    SectionModule,
    LectureModule,
    CourseCategoryModule,
    CourseEnrollmentModule,
    CourseReviewModule,
    CourseQuestionModule,
    CourseCommentModule,
    LectureActivityModule,
    MediaModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
