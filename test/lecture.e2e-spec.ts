import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateLectureDto } from '../src/lecture/dto/create-lecture.dto';
import { UpdateLectureDto } from '../src/lecture/dto/update-lecture.dto';
import { DataSource } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { Role } from '../src/role/entities/role.entity';
import { UserRole } from '../src/role/enum/user-role';
import { Course } from '../src/course/entities/course.entity';
import { Section } from '../src/section/entities/section.entity';
import { CourseCategory } from '../src/course-category/entities/course-category.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

describe('LectureController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let testUser: User;
  let accessToken: string;
  let testCourse: Course;
  let testSection: Section;
  let createdLectureId: string;

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
      email: `test-lecture-e2e-${Date.now()}@example.com`,
      name: 'Lecture E2E Tester',
      role: role,
    });

    const payload = {
      id: testUser.id,
      role: { name: role.name },
      type: 'access',
    };
    accessToken = jwtService.sign(payload);

    const categoryRepo = dataSource.getRepository(CourseCategory);
    let category = await categoryRepo.findOne({ where: {} });
    if (!category) {
      category = await categoryRepo.save({
        name: 'Lecture E2E Cat',
        slug: 'lecture-e2e-cat-' + Date.now(),
      });
    }

    const courseRepo = dataSource.getRepository(Course);
    testCourse = await courseRepo.save({
      title: 'Lecture E2E Course',
      slug: 'lecture-e2e-course-' + Date.now(),
      instructor: testUser,
      price: 0,
      courseCategories: [category],
    });

    const sectionRepo = dataSource.getRepository(Section);
    testSection = await sectionRepo.save({
      title: 'Lecture E2E Section',
      order: 1,
      course: testCourse,
    });
  });

  afterAll(async () => {
    if (dataSource) {
      if (testSection) {
        await dataSource.getRepository(Section).delete(testSection.id);
      }
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

  describe('POST /lecture/sections/:sectionId/lectures', () => {
    it('should create a lecture', async () => {
      const createDto: CreateLectureDto = {
        title: 'E2E Test Lecture',
      };

      const response = await request(app.getHttpServer())
        .post(`/lecture/sections/${testSection.id}/lectures`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toEqual(createDto.title);
      expect(response.body.sectionId).toEqual(testSection.id);

      createdLectureId = response.body.id;
    });

    it('should fail if section not found (invalid UUID)', async () => {
      const createDto: CreateLectureDto = {
        title: 'E2E Test Lecture',
      };

      await request(app.getHttpServer())
        .post(`/lecture/sections/invalid-uuid/lectures`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(createDto)
        .expect(400);
    });

    it('should fail if section not found (valid UUID but non-existent)', async () => {
      const createDto: CreateLectureDto = {
        title: 'E2E Test Lecture',
      };
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .post(`/lecture/sections/${nonExistentId}/lectures`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(createDto)
        .expect(404);
    });
  });

  describe('GET /lecture/:lectureId', () => {
    it('should get a lecture by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/lecture/${createdLectureId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body.id).toEqual(createdLectureId);
      expect(response.body.title).toEqual('E2E Test Lecture');
    });

    it('should fail if lecture not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/lecture/${nonExistentId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(404);
    });
  });

  describe('PATCH /lecture/:lectureId', () => {
    it('should update a lecture', async () => {
      const updateDto: UpdateLectureDto = {
        title: 'Updated Lecture Title',
        description: 'Updated Description',
        order: 5,
        duration: 120,
        isPreview: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/lecture/${createdLectureId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toEqual(updateDto.title);
      expect(response.body.description).toEqual(updateDto.description);
      expect(response.body.order).toEqual(updateDto.order);
      expect(response.body.duration).toEqual(updateDto.duration);
      expect(response.body.isPreview).toEqual(updateDto.isPreview);
    });
  });

  describe('DELETE /lecture/:lectureId', () => {
    it('should delete a lecture', async () => {
      await request(app.getHttpServer())
        .delete(`/lecture/${createdLectureId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      await request(app.getHttpServer())
        .get(`/lecture/${createdLectureId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(404);
    });
  });
});
