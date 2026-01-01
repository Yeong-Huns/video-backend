import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { ENV_VARIABLES } from '../../common/const/env.variables';
import { SocialUser } from '../types/auth';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>(ENV_VARIABLES.githubClientId)!,
      clientSecret: configService.get<string>(
        ENV_VARIABLES.githubClientSecret,
      )!,
      callbackURL: configService.get<string>(ENV_VARIABLES.githubCallbackUrl)!,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<SocialUser> {
    const email = profile.emails?.[0].value || 'no-email@github.com';
    const photo = profile.photos?.[0]?.value;

    return {
      provider: 'github',
      providerAccountId: profile.id,
      email,
      name: profile.displayName || profile.username!,
      image: photo,
      accessToken,
      refreshToken,
    };
  }
}
