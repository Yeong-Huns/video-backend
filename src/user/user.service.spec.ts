import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/response/user-response.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    preload: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    const userId = 'user-uuid';
    const roleName = 'USER';

    it('should return a user profile', async () => {
      const mockUserEntity = {
        id: userId,
        role: { name: roleName },
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUserEntity);

      const expectedDto = UserResponseDto.from(mockUserEntity);

      const result = await service.getProfile(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: { role: true },
      });
      expect(result).toEqual(expectedDto);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    const userId = 'user-uuid';
    const updateUserDto: UpdateUserDto = {
      name: 'new-name',
    };

    it('should update a user profile successfully', async () => {
      const mergedUserEntity = {
        id: userId,
        name: updateUserDto.name,
        role: { name: 'USER' },
      } as User;

      const savedUserEntity = { ...mergedUserEntity };

      mockUserRepository.preload.mockResolvedValue(mergedUserEntity);
      mockUserRepository.save.mockResolvedValue(savedUserEntity);

      const expectedDto = UserResponseDto.from(savedUserEntity);

      const result = await service.updateProfile(updateUserDto, userId);

      expect(userRepository.preload).toHaveBeenCalledWith({
        id: userId,
        ...updateUserDto,
      });

      expect(userRepository.save).toHaveBeenCalledWith(mergedUserEntity);
      expect(result).toEqual(expectedDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.preload.mockResolvedValue(null);

      await expect(
        service.updateProfile(updateUserDto, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
