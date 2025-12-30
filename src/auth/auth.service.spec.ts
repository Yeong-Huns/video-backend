import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../role/enum/user-role';
import { Role } from '../role/entities/role.entity';
import { Response } from 'express';
import { DataSource } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { SocialUser } from './types/auth';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;
  let userRepository: any;
  let dataSource: any;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUserRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    existsBy: jest.fn(),
  };

  const mockAccountRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockEntityManager = {
    getRepository: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockUserRepoInTransaction = {
    existsBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleRepoInTransaction = {
    findOne: jest.fn(),
  };

  const mockAccountRepoInTransaction = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: DataSource, useValue: mockDataSource },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get(ConfigService);
    jwtService = module.get(JwtService);
    userRepository = module.get(getRepositoryToken(User));
    dataSource = module.get(DataSource);

    jest.clearAllMocks();

    mockDataSource.transaction.mockImplementation(
      (isolationLevel, callback) => {
        if (typeof isolationLevel === 'function') {
          return isolationLevel(mockEntityManager);
        }
        return callback(mockEntityManager);
      },
    );

    mockEntityManager.getRepository.mockImplementation((entity) => {
      if (entity === User) return mockUserRepoInTransaction;
      if (entity === Role) return mockRoleRepoInTransaction;
      if (entity === Account) return mockAccountRepoInTransaction;
      return {
        findOne: jest.fn(),
        save: jest.fn(),
      } as any;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto = {
      email: 'test@example.com',
      name: '홍길동',
      password: 'password123',
    };

    it('should successfully sign up a new user', async () => {
      mockUserRepoInTransaction.existsBy.mockResolvedValue(false);
      mockRoleRepoInTransaction.findOne.mockResolvedValue({
        id: 1,
        name: UserRole.USER,
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      configService.get.mockReturnValue(10);
      mockUserRepoInTransaction.save.mockResolvedValue({
        id: 1,
        ...signUpDto,
        hashedPassword: 'hashedPassword',
        role: { name: UserRole.USER },
      });

      const result = await service.signUp(signUpDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(signUpDto.email);
      expect(mockUserRepoInTransaction.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockUserRepoInTransaction.existsBy.mockResolvedValue(true);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        new BadRequestException('해당 이메일로 가입된 계정이 존재합니다.'),
      );
    });

    it('should throw BadRequestException if default role is missing', async () => {
      mockUserRepoInTransaction.existsBy.mockResolvedValue(false);
      mockRoleRepoInTransaction.findOne.mockResolvedValue(null);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        new BadRequestException('기본 권한 설정이 잘못되었습니다.'),
      );
    });
  });

  describe('signIn', () => {
    const signInDto = { email: 'test@example.com', password: 'password123' };
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      hashedPassword: 'hashedPassword',
      role: { name: UserRole.USER },
      image: 'profile.jpg',
    };
    const mockRes = {
      cookie: jest.fn(),
    } as unknown as Response;

    it('should successfully sign in', async () => {
      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');
      configService.get.mockReturnValue('secret');

      await service.signIn(signInDto, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException if user not found', async () => {
      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(service.signIn(signInDto, mockRes)).rejects.toThrow(
        new BadRequestException('아이디 혹은 비밀번호가 잘못되었습니다.'),
      );
    });

    it('should throw BadRequestException if password incorrect', async () => {
      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(signInDto, mockRes)).rejects.toThrow(
        new BadRequestException('아이디 혹은 비밀번호가 잘못되었습니다.'),
      );
    });
  });

  describe('signOut', () => {
    it('should clear cookies', () => {
      const mockRes = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      service.signOut(mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.any(Object),
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(Object),
      );
    });
  });

  describe('issueAccessToken', () => {
    it('should issue an access token', async () => {
      const mockUser = {
        id: 1,
        role: { name: UserRole.USER },
        image: 'img',
      } as any;
      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      jwtService.signAsync.mockResolvedValue('access_token');
      configService.get.mockReturnValue('secret');

      await service.issueAccessToken(mockUser, mockRes);

      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access_token',
        expect.any(Object),
      );
    });
  });

  describe('handleSocialLogin', () => {
    const socialUser: SocialUser = {
      provider: 'google',
      providerAccountId: '123456789',
      name: 'Social User',
      email: 'social@example.com',
      image: 'social.jpg',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    const mockRes = {
      cookie: jest.fn(),
    } as unknown as Response;

    const mockExistingUser = {
      id: 1,
      email: 'social@example.com',
      role: { name: UserRole.USER },
      image: 'social.jpg',
    };

    const mockAccount = {
      id: 1,
      provider: 'google',
      providerAccountId: '123456789',
      user: mockExistingUser,
    };

    it('should login if account exists', async () => {
      mockAccountRepoInTransaction.findOne.mockResolvedValue(mockAccount);
      jwtService.signAsync.mockResolvedValue('token');
      configService.get.mockReturnValue('secret');

      await service.handleSocialLogin(socialUser, mockRes);

      expect(mockAccountRepoInTransaction.findOne).toHaveBeenCalledWith({
        where: {
          provider: socialUser.provider,
          providerAccountId: socialUser.providerAccountId,
        },
        relations: { user: { role: true } },
      });

      expect(mockUserRepoInTransaction.findOne).not.toHaveBeenCalled();

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
    });

    it('should link account and login if user exists but account does not', async () => {
      mockAccountRepoInTransaction.findOne.mockResolvedValue(null);
      mockUserRepoInTransaction.findOne.mockResolvedValue(mockExistingUser);

      jwtService.signAsync.mockResolvedValue('token');
      configService.get.mockReturnValue('secret');

      await service.handleSocialLogin(socialUser, mockRes);

      expect(mockUserRepoInTransaction.findOne).toHaveBeenCalledWith({
        where: { email: socialUser.email },
        relations: { role: true },
      });

      expect(mockAccountRepoInTransaction.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockExistingUser,
          provider: socialUser.provider,
        }),
      );

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
    });

    it('should create new user and account if neither exists', async () => {
      mockAccountRepoInTransaction.findOne.mockResolvedValue(null);
      mockUserRepoInTransaction.findOne.mockResolvedValue(null);
      mockRoleRepoInTransaction.findOne.mockResolvedValue({
        id: 1,
        name: UserRole.USER,
      });

      const newUser = { ...mockExistingUser, id: 2 };
      mockUserRepoInTransaction.save.mockResolvedValue(newUser);

      jwtService.signAsync.mockResolvedValue('token');
      configService.get.mockReturnValue('secret');

      await service.handleSocialLogin(socialUser, mockRes);

      expect(mockUserRepoInTransaction.save).toHaveBeenCalledWith({
        email: socialUser.email,
        name: socialUser.name,
        image: socialUser.image,
        role: expect.objectContaining({ name: UserRole.USER }),
      });

      expect(mockAccountRepoInTransaction.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user: newUser,
          provider: socialUser.provider,
        }),
      );

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if default role is missing when creating new user', async () => {
      mockAccountRepoInTransaction.findOne.mockResolvedValue(null);
      mockUserRepoInTransaction.findOne.mockResolvedValue(null);
      mockRoleRepoInTransaction.findOne.mockResolvedValue(null);

      await expect(
        service.handleSocialLogin(socialUser, mockRes),
      ).rejects.toThrow(
        new NotFoundException('USER 권한이 존재하지 않습니다.'),
      );
    });
  });
});
