import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateCourseDto } from '../src/course/dto/request/create-course.dto';
import { UpdateCourseDto } from '../src/course/dto/request/update-course.dto';
import { DataSource } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { Role } from '../src/role/entities/role.entity';
import { UserRole } from '../src/role/enum/user-role';
import { CourseCategory } from '../src/course-category/entities/course-category.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

describe('CourseController (e2e)', () => {
  let app: INestApplication;
  let createdCourseId: string;
  let dataSource: DataSource;
  let testUser: User;
  let accessToken: string;
  let testCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
            signOptions: { expiresIn: '1h' },
          }),
        }),
      ],
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
    const jwtService = app.get(JwtService);

    const roleRepo = dataSource.getRepository(Role);
    const userRepo = dataSource.getRepository(User);
    const categoryRepo = dataSource.getRepository(CourseCategory);

    let role = await roleRepo.findOne({ where: { name: UserRole.USER } });
    if (!role) {
      try {
        role = await roleRepo.save({ name: UserRole.USER });
      } catch {
        role = await roleRepo.findOne({ where: { name: UserRole.USER } });
      }
    }
    if (!role) throw new Error('Role not found');

    testUser = await userRepo.save({
      email: `test-e2e-${Date.now()}@example.com`,
      name: 'E2E Tester',
      role: role,
      roleId: role.id,
    });

    let category = await categoryRepo.findOne({ where: {} });
    if (!category) {
      category = await categoryRepo.save({
        name: 'E2E Category',
        slug: 'e2e-cat-' + Date.now(),
      });
    }
    testCategoryId = category.id;

    const payload = {
      id: testUser.id,
      role: { name: role.name },
      type: 'access',
    };
    accessToken = jwtService.sign(payload);
  });

  afterAll(async () => {
    if (dataSource) {
      if (createdCourseId) {
        await dataSource.query('DELETE FROM course WHERE id = ?', [
          createdCourseId,
        ]);
      }
      if (testUser) {
        await dataSource.getRepository(User).delete(testUser.id);
      }
      await dataSource.destroy();
    }
    await app.close();
  });

  it('/course (POST)', async () => {
    const createDto: CreateCourseDto = {
      title: 'E2E Test Course',
      slug: 'e2e-test-course-' + Date.now(),
      price: 10000,
      shortDescription: 'Short desc',
      description: 'Long description',
      categoryIds: [testCategoryId],
    };

    const response = await request(app.getHttpServer())
      .post('/course')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(createDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toEqual(createDto.title);
    expect(response.body.instructorId).toEqual(testUser.id);

    createdCourseId = response.body.id;
  });

  it('/course (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/course')
      .set('Cookie', [`accessToken=${accessToken}`])
      .query({ title: 'E2E Test Course' })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const found = response.body.find((c: any) => c.id === createdCourseId);
    expect(found).toBeDefined();
  });

  it('/course/:id (GET)', () => {
    return request(app.getHttpServer())
      .get(`/course/${createdCourseId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toEqual(createdCourseId);
      });
  });

  it('/course/:id (PATCH)', async () => {
    const updateDto: UpdateCourseDto = {
      title: 'Updated E2E Course',
    };

    const response = await request(app.getHttpServer())
      .patch(`/course/${createdCourseId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send(updateDto)
      .expect(200);

    expect(response.body.title).toEqual(updateDto.title);
  });

  it('/course/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete(`/course/${createdCourseId}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .expect(200);
  });
});
