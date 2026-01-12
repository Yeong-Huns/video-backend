import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { CourseCategory } from '../src/course-category/entities/course-category.entity';
import cookieParser from 'cookie-parser';

describe('CourseCategoryController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdCategoryIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
        transform: true,
      }),
    );

    await app.init();

    dataSource = app.get(DataSource);
    const categoryRepo = dataSource.getRepository(CourseCategory);

    const categoriesToCreate = [
      { name: 'E2E Cat 1', slug: `e2e-cat-1-${Date.now()}` },
      { name: 'E2E Cat 2', slug: `e2e-cat-2-${Date.now()}` },
    ];

    for (const catData of categoriesToCreate) {
      const cat = await categoryRepo.save(catData);
      createdCategoryIds.push(cat.id);
    }
  });

  afterAll(async () => {
    if (dataSource) {
      const categoryRepo = dataSource.getRepository(CourseCategory);
      if (createdCategoryIds.length > 0) {
        await categoryRepo.delete(createdCategoryIds);
      }
      await dataSource.destroy();
    }
    await app.close();
  });

  it('/course-category (GET) - Public access', async () => {
    const response = await request(app.getHttpServer())
      .get('/course-category')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);

    const ids = response.body.map((c: CourseCategory) => c.id);
    expect(ids).toEqual(expect.arrayContaining(createdCategoryIds));
  });
});
