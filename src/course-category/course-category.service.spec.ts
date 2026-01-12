import { Test, TestingModule } from '@nestjs/testing';
import { CourseCategoryService } from './course-category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseCategory } from './entities/course-category.entity';
import { Repository } from 'typeorm';

const mockCourseCategoryRepository = {
  find: jest.fn(),
};

describe('CourseCategoryService', () => {
  let service: CourseCategoryService;
  let repository: Repository<CourseCategory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseCategoryService,
        {
          provide: getRepositoryToken(CourseCategory),
          useValue: mockCourseCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CourseCategoryService>(CourseCategoryService);
    repository = module.get<Repository<CourseCategory>>(
      getRepositoryToken(CourseCategory),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of course categories', async () => {
      const result = [
        {
          id: 'uuid',
          name: 'category',
          slug: 'slug',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as CourseCategory[];

      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'asc' },
      });
    });
  });
});
