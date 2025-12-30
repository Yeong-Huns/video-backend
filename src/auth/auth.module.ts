import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { GithubStrategy } from './strategy/github.strategy';
import { Account } from '../account/entities/account.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Account, Role]), JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    GithubStrategy,
  ],
})
export class AuthModule {}
