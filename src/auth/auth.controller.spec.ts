import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/request/sign-up.dto';
import { SignInDto } from './dto/request/sign-in.dto';
import { Response } from 'express';
import { UserResponseDto } from '../user/dto/response/user-response.dto';
import { UserRole } from '../role/enum/user-role';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    issueAccessToken: jest.fn(),
    handleSocialLogin: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.signUp and return the result', async () => {
      const signUpDto: SignUpDto = {
        email: 'test@test.com',
        name: 'test',
        password: 'password',
      };
      const expectedResult = {
        id: 1,
        name: 'test',
        email: 'test@test.com',
      } as unknown as UserResponseDto;
      service.signUp.mockResolvedValue(expectedResult);

      const result = await controller.signUp(signUpDto);

      expect(service.signUp).toHaveBeenCalledWith(signUpDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn', async () => {
      const signInDto: SignInDto = {
        email: 'test@test.com',
        password: 'password',
      };

      await controller.signIn(signInDto, mockResponse);

      expect(service.signIn).toHaveBeenCalledWith(signInDto, mockResponse);
    });
  });

  describe('signOut', () => {
    it('should call authService.signOut', () => {
      controller.signOut(mockResponse);

      expect(service.signOut).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('refreshAccessToken', () => {
    it('should call authService.issueAccessToken with user info from request', async () => {
      const mockReq = {
        user: { id: 1, role: { name: UserRole.USER } },
      } as any;

      await controller.refreshAccessToken(mockReq, mockResponse);

      expect(service.issueAccessToken).toHaveBeenCalledWith(
        mockReq.user,
        mockResponse,
      );
    });
  });

  describe('social login', () => {
    it('should define googleLogin', async () => {
      expect(controller.googleLogin).toBeDefined();
      await controller.googleLogin();
    });

    it('should define githubLogin', async () => {
      expect(controller.githubLogin).toBeDefined();
      await controller.githubLogin();
    });

    describe('googleCallback', () => {
      it('should handle social login and redirect to frontend URL', async () => {
        const mockSocialUser = { email: 'google@test.com' };
        const mockReq = { user: mockSocialUser } as any;
        const frontendUrl = 'http://frontend.com';
        configService.get.mockReturnValue(frontendUrl);

        await controller.googleCallback(mockReq, mockResponse);

        expect(service.handleSocialLogin).toHaveBeenCalledWith(
          mockSocialUser,
          mockResponse,
        );
        expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
        expect(mockResponse.redirect).toHaveBeenCalledWith(frontendUrl);
      });

      it('should redirect to localhost if frontend URL is not configured', async () => {
        const mockReq = { user: {} } as any;
        configService.get.mockReturnValue(undefined);

        await controller.googleCallback(mockReq, mockResponse);

        expect(mockResponse.redirect).toHaveBeenCalledWith(
          'http://localhost:3000',
        );
      });
    });

    describe('githubCallback', () => {
      it('should handle social login and redirect to frontend URL', async () => {
        const mockSocialUser = { email: 'github@test.com' };
        const mockReq = { user: mockSocialUser } as any;
        const frontendUrl = 'http://frontend.com';
        configService.get.mockReturnValue(frontendUrl);

        await controller.githubCallback(mockReq, mockResponse);

        expect(service.handleSocialLogin).toHaveBeenCalledWith(
          mockSocialUser,
          mockResponse,
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(frontendUrl);
      });
    });
  });
});
