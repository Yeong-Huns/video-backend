import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { DataSource } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { UpdateCourseDto } from './dto/request/update-course.dto';
import { FindCourseDto } from './dto/request/find-course.dto';

jest.mock('slug', () => {
  return jest.fn((title) => `slug-${title}`);
});

describe('CourseService', () => {
  let service: CourseService;
  let dataSource: DataSource;
  let courseRepository: any;

  const mockCourseRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEntityManager = {
    getRepository: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockRepoInTransaction = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    dataSource = module.get<DataSource>(DataSource);
    courseRepository = module.get(getRepositoryToken(Course));

    jest.clearAllMocks();

    mockDataSource.transaction.mockImplementation(async (callback) => {
      return await callback(mockEntityManager);
    });

    mockEntityManager.getRepository.mockReturnValue(mockRepoInTransaction);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user-uuid';
    const createCourseDto: CreateCourseDto = {
      title: 'Test Course',
      slug: 'test-course',
      price: 10000,
      categoryIds: ['cat-1', 'cat-2'],
    };

    it('should create a course successfully', async () => {
      const savedCourse = {
        id: 'course-uuid',
        ...createCourseDto,
        instructorId: userId,
      };

      mockRepoInTransaction.save.mockResolvedValue(savedCourse);

      const result = await service.create(userId, createCourseDto);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.getRepository).toHaveBeenCalledWith(Course);
      expect(mockRepoInTransaction.save).toHaveBeenCalledWith({
        title: createCourseDto.title,
        price: createCourseDto.price,
        slug: 'slug-Test Course',
        status: 'DRAFT',
        instructorId: userId,
        courseCategories: [{ id: 'cat-1' }, { id: 'cat-2' }],
      });
      expect(result).toEqual(savedCourse);
    });

    it('should create a course without categories', async () => {
      const dtoWithoutCategories = {
        ...createCourseDto,
        categoryIds: undefined,
      };
      const savedCourse = {
        id: 'course-uuid',
        ...dtoWithoutCategories,
        instructorId: userId,
      };

      mockRepoInTransaction.save.mockResolvedValue(savedCourse);

      const result = await service.create(userId, dtoWithoutCategories);

      expect(mockRepoInTransaction.save).toHaveBeenCalledWith({
        title: dtoWithoutCategories.title,
        price: dtoWithoutCategories.price,
        slug: 'slug-Test Course',
        status: 'DRAFT',
        instructorId: userId,
        courseCategories: [],
      });
      expect(result).toEqual(savedCourse);
    });
  });

  describe('findAll', () => {
    const findCourseDto: FindCourseDto = {
      title: 'Test',
      level: 'BEGINNER',
      categoryId: 'cat-1',
      skip: 5,
      take: 10,
    };

    const mockQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    it('should return an array of courses with filters', async () => {
      const expectedCourses = [{ id: 'course-1' }, { id: 'course-2' }];
      mockCourseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(expectedCourses);

      const result = await service.findAll(findCourseDto);

      expect(mockCourseRepository.createQueryBuilder).toHaveBeenCalledWith(
        'course',
      );
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'course.courseCategories',
        'category',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'course.title LIKE :title',
        { title: '%Test%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'course.level = :level',
        { level: 'BEGINNER' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'category.id = :categoryId',
        { categoryId: 'cat-1' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'course.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(result).toEqual(expectedCourses);
    });

    it('should return an array of courses without filters', async () => {
      mockCourseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({});

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(mockQueryBuilder.take).not.toHaveBeenCalled();
      expect(mockQueryBuilder.skip).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const courseId = 'course-uuid';

    it('should return a course', async () => {
      const expectedCourse = { id: courseId, title: 'Test Course' };
      mockCourseRepository.findOne.mockResolvedValue(expectedCourse);

      const result = await service.findOne(courseId);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
        where: { id: courseId },
        relations: [],
        relationLoadStrategy: 'query',
      });
      expect(result).toEqual(expectedCourse);
    });

    it('should return a course with relations', async () => {
      const include = ['sections', 'lectures'];
      const expectedCourse = { id: courseId, sections: [], lectures: [] };
      mockCourseRepository.findOne.mockResolvedValue(expectedCourse);

      const result = await service.findOne(courseId, include);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({
        where: { id: courseId },
        relations: include,
        relationLoadStrategy: 'query',
      });
      expect(result).toEqual(expectedCourse);
    });
  });

  describe('update', () => {
    const courseId = 'course-uuid';
    const userId = 'user-uuid';
    const updateCourseDto: UpdateCourseDto = {
      title: 'Updated Title',
      categoryIds: ['cat-3'],
    };

    it('should update a course successfully', async () => {
      const existingCourse = {
        id: courseId,
        instructorId: userId,
        title: 'Old Title',
      };
      const updatedCourse = {
        ...existingCourse,
        title: 'Updated Title',
        courseCategories: [{ id: 'cat-3' }],
      };

      mockRepoInTransaction.findOneBy.mockResolvedValue(existingCourse);
      mockRepoInTransaction.save.mockResolvedValue(updatedCourse);

      const result = await service.update(courseId, userId, updateCourseDto);

      expect(mockRepoInTransaction.findOneBy).toHaveBeenCalledWith({
        id: courseId,
      });
      expect(mockRepoInTransaction.merge).toHaveBeenCalledWith(existingCourse, {
        title: 'Updated Title',
      });
      expect(mockRepoInTransaction.save).toHaveBeenCalled();
      expect(result).toEqual(updatedCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockRepoInTransaction.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(courseId, userId, updateCourseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user is not instructor', async () => {
      const existingCourse = {
        id: courseId,
        instructorId: 'other-user',
      };
      mockRepoInTransaction.findOneBy.mockResolvedValue(existingCourse);

      await expect(
        service.update(courseId, userId, updateCourseDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('delete', () => {
    const courseId = 'course-uuid';
    const userId = 'user-uuid';

    it('should delete a course successfully', async () => {
      const existingCourse = {
        id: courseId,
        instructorId: userId,
      };

      mockRepoInTransaction.findOneBy.mockResolvedValue(existingCourse);

      const result = await service.delete(courseId, userId);

      expect(mockRepoInTransaction.findOneBy).toHaveBeenCalledWith({
        id: courseId,
      });
      expect(mockRepoInTransaction.delete).toHaveBeenCalledWith(courseId);
      expect(result).toEqual(existingCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockRepoInTransaction.findOneBy.mockResolvedValue(null);

      await expect(service.delete(courseId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not instructor', async () => {
      const existingCourse = {
        id: courseId,
        instructorId: 'other-user',
      };
      mockRepoInTransaction.findOneBy.mockResolvedValue(existingCourse);

      await expect(service.delete(courseId, userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('searchCourses', () => {
    const searchCourseDto = {
      page: 1,
      pageSize: 10,
      q: 'test',
      category: 'cat-1',
      priceRange: { min: 1000, max: 20000 },
      sortBy: 'price',
      order: 'ASC',
    };

    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    beforeEach(() => {
      mockCourseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should search courses with all filters', async () => {
      const expectedCourses = [
        {
          id: 'course-1',
          title: 'test course',
          enrollmentCount: 5,
          reviewCount: 3,
        },
      ];
      const totalItems = 1;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        expectedCourses,
        totalItems,
      ]);

      const result = await service.searchCourses(searchCourseDto as any);

      expect(mockCourseRepository.createQueryBuilder).toHaveBeenCalledWith(
        'course',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'course.instructor',
        'instructor',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'course.courseCategories',
        'courseCategories',
      );
      expect(mockQueryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith(
        'course.enrollmentCount',
        'course.courseEnrollments',
      );
      expect(mockQueryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith(
        'course.reviewCount',
        'course.courseReviews',
      );
      // Check for search term (q)
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(Object), // Brackets object
      );
      // Check for category
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'courseCategories.id = :categoryId',
        { categoryId: 'cat-1' },
      );
      // Check for price range
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'course.price BETWEEN :min AND :max',
        { min: 1000, max: 20000 },
      );
      // Check for sorting
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'course.price',
        'ASC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);

      expect(result).toEqual({
        success: true,
        data: {
          courses: expectedCourses,
          pagination: {
            currentPage: 1,
            totalPage: 1,
            totalItems: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    });

    it('should search courses with default parameters', async () => {
      const expectedCourses = [];
      const totalItems = 0;
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        expectedCourses,
        totalItems,
      ]);

      const result = await service.searchCourses({});

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20); // Default pageSize
      expect(result.data.courses).toEqual([]);
      expect(result.data.pagination.totalItems).toEqual(0);
    });
  });
});
