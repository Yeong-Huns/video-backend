import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { SignUpDto } from './dto/request/sign-up.dto';
import { compare, hash } from 'bcrypt';
import { ENV_VARIABLES } from '../common/const/env.variables';
import { UserRole } from '../role/enum/user-role';
import { Role } from '../role/entities/role.entity';
import { UserResponseDto } from '../user/dto/response/user-response.dto';
import { CookieOptions, Response } from 'express';
import { SocialUser, UserWithRoleName } from './types/auth';
import { SignInDto } from './dto/request/sign-in.dto';
import { Account } from '../account/entities/account.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;
    return await this.dataSource.transaction(
      'READ COMMITTED',
      async (manager) => {
        const isExist = await manager.getRepository(User).existsBy({ email });
        if (isExist)
          throw new BadRequestException(
            '해당 이메일로 가입된 계정이 존재합니다.',
          );

        const defaultRoleName = UserRole.USER;
        const role = await manager
          .getRepository(Role)
          .findOne({ where: { name: defaultRoleName } });

        if (!role)
          throw new BadRequestException('기본 권한 설정이 잘못되었습니다.');

        const hashedPassword = await hash(
          password,
          this.configService.get<number>(ENV_VARIABLES.hashRounds)!,
        );

        const createdUser = await manager.getRepository(User).save({
          ...signUpDto,
          hashedPassword,
          role,
        });

        return UserResponseDto.from(createdUser);
      },
    );
  }

  async signIn(signInDto: SignInDto, res: Response) {
    const user: UserWithRoleName = await this.authenticate(signInDto);

    await Promise.all([
      this.issueAccessToken(user, res),
      this.issueRefreshToken(user, res),
    ]);
  }

  signOut(res: Response) {
    res.clearCookie('accessToken', {
      ...this.tokenOptions,
      path: '/',
      maxAge: 0,
    });
    res.clearCookie('refreshToken', {
      ...this.tokenOptions,
      path: '/auth/refresh-access',
      maxAge: 0,
    });
  }

  private tokenOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  private async authenticate({
    email,
    password,
  }: SignInDto): Promise<UserWithRoleName> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .getOne();

    if (!user)
      throw new BadRequestException('아이디 혹은 비밀번호가 잘못되었습니다.');

    const isValidPassword = await compare(password, user.hashedPassword ?? '');
    if (!isValidPassword)
      throw new BadRequestException('아이디 혹은 비밀번호가 잘못되었습니다.');

    return user;
  }

  async issueAccessToken({ id, role, image }: UserWithRoleName, res: Response) {
    const token = await this.jwtService.signAsync(
      { id, role: role.name, type: 'access', image },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET')!,
        expiresIn: '15m',
      },
    );

    res.cookie('accessToken', token, {
      ...this.tokenOptions,
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
  }

  private async issueRefreshToken(
    { id, role, image }: UserWithRoleName,
    res: Response,
  ) {
    const token = await this.jwtService.signAsync(
      { id, role: role.name, type: 'refresh', image },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')!,
        expiresIn: '7d',
      },
    );

    res.cookie('refreshToken', token, {
      ...this.tokenOptions,
      path: '/auth/refresh-access',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  async handleSocialLogin(socialUser: SocialUser, res: Response) {
    const {
      provider,
      providerAccountId,
      name,
      image,
      email,
      accessToken,
      refreshToken,
    } = socialUser;

    return this.dataSource.transaction('READ COMMITTED', async (manager) => {
      const existingAccount = await manager.getRepository(Account).findOne({
        where: { provider, providerAccountId },
        relations: { user: { role: true } },
      });

      if (existingAccount)
        return await Promise.all([
          this.issueAccessToken(existingAccount.user, res),
          this.issueRefreshToken(existingAccount.user, res),
        ]);

      let user = await manager.getRepository(User).findOne({
        where: { email },
        relations: { role: true },
      });

      if (!user) {
        const defaultRole = await manager.getRepository(Role).findOne({
          where: { name: UserRole.USER },
        });

        if (!defaultRole)
          throw new NotFoundException('USER 권한이 존재하지 않습니다.');

        user = await manager.getRepository(User).save({
          email,
          name,
          image,
          role: defaultRole,
        });
      }

      /* 소셜 계정 연결 */
      await manager.getRepository(Account).save({
        provider,
        providerAccountId,
        type: 'social',
        accessToken,
        refreshToken,
        user,
      });

      /* 토큰 발급 */
      return await Promise.all([
        this.issueAccessToken(user, res),
        this.issueRefreshToken(user, res),
      ]);
    });
  }
}
