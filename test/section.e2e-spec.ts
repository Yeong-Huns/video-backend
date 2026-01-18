import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateSectionDto } from '../src/section/dto/create-section.dto';
import { UpdateSectionDto } from '../src/section/dto/update-section.dto';
import { DataSource } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { Role } from '../src/role/entities/role.entity';
import { UserRole } from '../src/role/enum/user-role';
import { Course } from '../src/course/entities/course.entity';
import { CourseCategory } from '../src/course-category/entities/course-category.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

describe('SectionController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let testUser: User;
  let accessToken: string;
  let testCourse: Course;
  let createdSectionId: string;

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
    jwtService = app.get(JwtService);

    const roleRepo = dataSource.getRepository(Role);
    const userRepo = dataSource.getRepository(User);

    let role = await roleRepo.findOne({ where: { name: UserRole.USER } });
    if (!role) {
      try {
        role = await roleRepo.save({ name: UserRole.USER });
      } catch {
        role = await roleRepo.findOne({ where: { name: UserRole.USER } });
      }
    }

    testUser = await userRepo.save({
      email: `test-section-e2e-${Date.now()}@example.com`,
      name: 'Section E2E Tester',
      role: role,
    });

    const payload = {
      id: testUser.id,
      role: { name: role?.name },
      type: 'access',
    };
    accessToken = jwtService.sign(payload);

    const categoryRepo = dataSource.getRepository(CourseCategory);
    let category = await categoryRepo.findOne({ where: {} });
    if (!category) {
      category = await categoryRepo.save({
        name: 'Section E2E Cat',
        slug: 'section-e2e-cat-' + Date.now(),
      });
    }

    const courseRepo = dataSource.getRepository(Course);
    testCourse = await courseRepo.save({
      title: 'Section E2E Course',
      slug: 'section-e2e-course-' + Date.now(),
      instructor: testUser,
      price: 0,
      courseCategories: [category],
    });
  });

  afterAll(async () => {
    if (dataSource) {
      if (testCourse) {
        await dataSource.getRepository(Course).delete(testCourse.id);
      }
      if (testUser) {
        await dataSource.getRepository(User).delete(testUser.id);
      }
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('POST /section/courses/:courseId/sections', () => {
    it('should create a section', async () => {
      const createDto: CreateSectionDto = {
        title: 'E2E Test Section',
      };

      const response = await request(app.getHttpServer())
        .post(`/section/courses/${testCourse.id}/sections`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toEqual(createDto.title);
      expect(response.body.courseId).toEqual(testCourse.id);

      createdSectionId = response.body.id;
    });

    it('should fail if course not found (invalid UUID)', async () => {
      const createDto: CreateSectionDto = {
        title: 'E2E Test Section',
      };

      await request(app.getHttpServer())
        .post(`/section/courses/invalid-uuid/sections`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(createDto)
        .expect(400);
    });

    it('should fail if course not found (valid UUID but non-existent)', async () => {
      const createDto: CreateSectionDto = {
        title: 'E2E Test Section',
      };
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .post(`/section/courses/${nonExistentId}/sections`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(createDto)
        .expect(404);
    });
  });

  describe('GET /section/sections/:sectionId', () => {
    it('should get a section by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/section/sections/${createdSectionId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body.id).toEqual(createdSectionId);
      expect(response.body.title).toEqual('E2E Test Section');
    });

    it('should fail if section not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/section/sections/${nonExistentId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(404);
    });
  });

  describe('PATCH /section/:sectionId', () => {
    it('should update a section', async () => {
      const updateDto: UpdateSectionDto = {
        title: 'Updated Section Title',
        description: 'Updated Description',
        order: 5,
      };

      const response = await request(app.getHttpServer())
        .patch(`/section/${createdSectionId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toEqual(updateDto.title);
      expect(response.body.description).toEqual(updateDto.description);
      expect(response.body.order).toEqual(updateDto.order);
    });
  });

  describe('DELETE /section/:sectionId', () => {
    it('should delete a section', async () => {
      await request(app.getHttpServer())
        .delete(`/section/${createdSectionId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      await request(app.getHttpServer())
        .get(`/section/sections/${createdSectionId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(404);
    });
  });
});
