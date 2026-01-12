import { Test, TestingModule } from '@nestjs/testing';
import { SectionService } from './section.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { DataSource } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Course } from '../course/entities/course.entity';

describe('SectionService', () => {
  let service: SectionService;
  let dataSource: DataSource;
  let sectionRepository: any;

  const mockSectionRepository = {
    findOne: jest.fn(),
  };

  const mockEntityManager = {
    getRepository: jest.fn().mockReturnThis(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionService,
        {
          provide: getRepositoryToken(Section),
          useValue: mockSectionRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SectionService>(SectionService);
    dataSource = module.get<DataSource>(DataSource);
    sectionRepository = module.get(getRepositoryToken(Section));

    jest.clearAllMocks();

    mockDataSource.transaction.mockImplementation(async (callback) => {
      return await callback(mockEntityManager);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const courseId = 'course-uuid';
    const userId = 'user-uuid';
    const createSectionDto: CreateSectionDto = {
      title: 'New Section',
    };

    it('should create a section successfully', async () => {
      const existCourse = { id: courseId, instructorId: userId };
      const lastSection = { id: 'last-section-uuid', order: 1 };
      const savedSection = {
        id: 'new-section-uuid',
        ...createSectionDto,
        courseId,
        order: 2,
      };

      mockEntityManager.getRepository.mockImplementation((entity) => {
        if (entity === Course) {
          return { findOneBy: jest.fn().mockResolvedValue(existCourse) };
        }
        if (entity === Section) {
          return {
            findOne: jest.fn().mockResolvedValue(lastSection),
            save: jest.fn().mockResolvedValue(savedSection),
          };
        }
      });

      const result = await service.create(courseId, createSectionDto, userId);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result).toEqual(savedSection);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockEntityManager.getRepository.mockImplementation((entity) => {
        if (entity === Course) {
          return { findOneBy: jest.fn().mockResolvedValue(null) };
        }
      });

      await expect(
        service.create(courseId, createSectionDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user is not instructor', async () => {
      const existCourse = { id: courseId, instructorId: 'other-user' };
      mockEntityManager.getRepository.mockImplementation((entity) => {
        if (entity === Course) {
          return { findOneBy: jest.fn().mockResolvedValue(existCourse) };
        }
      });

      await expect(
        service.create(courseId, createSectionDto, userId),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should set order to 0 if no sections exist', async () => {
      const existCourse = { id: courseId, instructorId: userId };
      const savedSection = {
        id: 'new-section-uuid',
        ...createSectionDto,
        courseId,
        order: 0,
      };

      mockEntityManager.getRepository.mockImplementation((entity) => {
        if (entity === Course) {
          return { findOneBy: jest.fn().mockResolvedValue(existCourse) };
        }
        if (entity === Section) {
          return {
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue(savedSection),
          };
        }
      });

      const result = await service.create(courseId, createSectionDto, userId);

      expect(result.order).toBe(0);
    });
  });

  describe('findOne', () => {
    const sectionId = 'section-uuid';
    const userId = 'user-uuid';

    it('should return a section successfully', async () => {
      const expectedSection = {
        id: sectionId,
        course: { id: 'course-uuid', instructorId: userId },
        lectures: [],
      };
      mockSectionRepository.findOne.mockResolvedValue(expectedSection);

      const result = await service.findOne(sectionId, userId);

      expect(mockSectionRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(expectedSection);
    });

    it('should throw NotFoundException if section not found', async () => {
      mockSectionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(sectionId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not instructor', async () => {
      const section = {
        id: sectionId,
        course: { id: 'course-uuid', instructorId: 'other-user' },
      };
      mockSectionRepository.findOne.mockResolvedValue(section);

      await expect(service.findOne(sectionId, userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('update', () => {
    const sectionId = 'section-uuid';
    const userId = 'user-uuid';
    const updateSectionDto: UpdateSectionDto = {
      title: 'Updated Title',
    };

    it('should update a section successfully', async () => {
      const section = {
        id: sectionId,
        course: { instructorId: userId },
      };
      const updatedSection = { ...section, ...updateSectionDto };

      const mockSectionRepo = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(section)
          .mockResolvedValueOnce(updatedSection),
        update: jest.fn().mockResolvedValue(undefined),
      };

      mockEntityManager.getRepository.mockReturnValue(mockSectionRepo);

      const result = await service.update(sectionId, updateSectionDto, userId);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockSectionRepo.update).toHaveBeenCalledWith(
        sectionId,
        updateSectionDto,
      );
      expect(mockSectionRepo.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual(updatedSection);
    });

    it('should throw NotFoundException if section not found', async () => {
      mockEntityManager.getRepository.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(sectionId, updateSectionDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user is not instructor', async () => {
      const section = {
        id: sectionId,
        course: { instructorId: 'other-user' },
      };
      mockEntityManager.getRepository.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(section),
      });

      await expect(
        service.update(sectionId, updateSectionDto, userId),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    const sectionId = 'section-uuid';
    const userId = 'user-uuid';

    it('should remove a section successfully', async () => {
      const section = {
        id: sectionId,
        course: { instructorId: userId },
      };

      const mockSectionRepo = {
        findOne: jest.fn().mockResolvedValue(section),
        remove: jest.fn().mockResolvedValue(section),
      };

      mockEntityManager.getRepository.mockReturnValue(mockSectionRepo);

      const result = await service.remove(sectionId, userId);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockSectionRepo.remove).toHaveBeenCalledWith(section);
      expect(result).toEqual(section);
    });

    it('should throw NotFoundException if section not found', async () => {
      mockEntityManager.getRepository.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(sectionId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not instructor', async () => {
      const section = {
        id: sectionId,
        course: { instructorId: 'other-user' },
      };
      mockEntityManager.getRepository.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(section),
      });

      await expect(service.remove(sectionId, userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
