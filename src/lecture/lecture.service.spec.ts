import { Test, TestingModule } from '@nestjs/testing';
import { LectureService } from './lecture.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lecture } from './entities/lecture.entity';
import { DataSource } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { Section } from '../section/entities/section.entity';

describe('LectureService', () => {
  let service: LectureService;
  let dataSource: DataSource;
  let lectureRepository: any;

  const mockLectureRepository = {
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
        LectureService,
        {
          provide: getRepositoryToken(Lecture),
          useValue: mockLectureRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<LectureService>(LectureService);
    dataSource = module.get<DataSource>(DataSource);
    lectureRepository = module.get(getRepositoryToken(Lecture));

    jest.clearAllMocks();

    mockDataSource.transaction.mockImplementation(async (callback) => {
      return await callback(mockEntityManager);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const sectionId = 'section-uuid';
    const userId = 'user-uuid';
    const createLectureDto: CreateLectureDto = {
      title: 'New Lecture',
    };

    it('should create a lecture successfully', async () => {
      const existSection = {
        id: sectionId,
        courseId: 'course-uuid',
        course: { instructorId: userId },
      };
      const lastLecture = { id: 'last-lecture-uuid', order: 1 };
      const savedLecture = {
        id: 'new-lecture-uuid',
        ...createLectureDto,
        sectionId,
        courseId: 'course-uuid',
        order: 2,
      };

      mockEntityManager.getRepository.mockImplementation((entity) => {
        if (entity === Section) {
          return { findOne: jest.fn().mockResolvedValue(existSection) };
        }
        if (entity === Lecture) {
          return {
            findOne: jest.fn().mockResolvedValue(lastLecture),
            save: jest.fn().mockResolvedValue(savedLecture),
          };
        }
      });

      const result = await service.create(sectionId, createLectureDto, userId);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result).toEqual(savedLecture);
    });

    it('should throw NotFoundException if section not found', async () => {
      mockEntityManager.getRepository.mockImplementation((entity) => {
        if (entity === Section) {
          return { findOne: jest.fn().mockResolvedValue(null) };
        }
      });

      await expect(
        service.create(sectionId, createLectureDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user is not instructor', async () => {
      const existSection = {
        id: sectionId,
        course: { instructorId: 'other-user' },
      };
      mockEntityManager.getRepository.mockImplementation((entity) => {
        if (entity === Section) {
          return { findOne: jest.fn().mockResolvedValue(existSection) };
        }
      });

      await expect(
        service.create(sectionId, createLectureDto, userId),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should set order to 0 if no lectures exist', async () => {
      const existSection = {
        id: sectionId,
        courseId: 'course-uuid',
        course: { instructorId: userId },
      };
      const savedLecture = {
        id: 'new-lecture-uuid',
        ...createLectureDto,
        sectionId,
        courseId: 'course-uuid',
        order: 0,
      };

      mockEntityManager.getRepository.mockImplementation((entity) => {
        if (entity === Section) {
          return { findOne: jest.fn().mockResolvedValue(existSection) };
        }
        if (entity === Lecture) {
          return {
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue(savedLecture),
          };
        }
      });

      const result = await service.create(sectionId, createLectureDto, userId);

      expect(result.order).toBe(0);
    });
  });

  describe('findOne', () => {
    const lectureId = 'lecture-uuid';
    const userId = 'user-uuid';

    it('should return a lecture successfully', async () => {
      const expectedLecture = {
        id: lectureId,
        course: { instructorId: userId },
      };
      mockLectureRepository.findOne.mockResolvedValue(expectedLecture);

      const result = await service.findOne(lectureId, userId);

      expect(mockLectureRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(expectedLecture);
    });

    it('should throw NotFoundException if lecture not found', async () => {
      mockLectureRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(lectureId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not instructor', async () => {
      const lecture = {
        id: lectureId,
        course: { instructorId: 'other-user' },
      };
      mockLectureRepository.findOne.mockResolvedValue(lecture);

      await expect(service.findOne(lectureId, userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('update', () => {
    const lectureId = 'lecture-uuid';
    const userId = 'user-uuid';
    const updateLectureDto: UpdateLectureDto = {
      title: 'Updated Title',
    };

    it('should update a lecture successfully', async () => {
      const lecture = {
        id: lectureId,
        course: { instructorId: userId },
      };
      const updatedLecture = { ...lecture, ...updateLectureDto };

      const mockLectureRepo = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(lecture)
          .mockResolvedValueOnce(updatedLecture),
        update: jest.fn().mockResolvedValue(undefined),
      };

      mockEntityManager.getRepository.mockReturnValue(mockLectureRepo);

      const result = await service.update(lectureId, updateLectureDto, userId);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockLectureRepo.update).toHaveBeenCalledWith(
        lectureId,
        updateLectureDto,
      );

      expect(mockLectureRepo.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual(updatedLecture);
    });

    it('should throw NotFoundException if lecture not found', async () => {
      mockEntityManager.getRepository.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(lectureId, updateLectureDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user is not instructor', async () => {
      const lecture = {
        id: lectureId,
        course: { instructorId: 'other-user' },
      };
      mockEntityManager.getRepository.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(lecture),
      });

      await expect(
        service.update(lectureId, updateLectureDto, userId),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    const lectureId = 'lecture-uuid';
    const userId = 'user-uuid';

    it('should remove a lecture successfully', async () => {
      const lecture = {
        id: lectureId,
        course: { instructorId: userId },
      };

      const mockLectureRepo = {
        findOne: jest.fn().mockResolvedValue(lecture),
        remove: jest.fn().mockResolvedValue(lecture),
      };

      mockEntityManager.getRepository.mockReturnValue(mockLectureRepo);

      const result = await service.remove(lectureId, userId);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockLectureRepo.remove).toHaveBeenCalledWith(lecture);
      expect(result).toEqual(lecture);
    });

    it('should throw NotFoundException if lecture not found', async () => {
      mockEntityManager.getRepository.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(lectureId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not instructor', async () => {
      const lecture = {
        id: lectureId,
        course: { instructorId: 'other-user' },
      };
      mockEntityManager.getRepository.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(lecture),
      });

      await expect(service.remove(lectureId, userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
