import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { ENV_VARIABLES } from '../../common/const/env.variables';
import { SocialUser } from '../types/auth';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>(ENV_VARIABLES.googleClientId)!,
      clientSecret: configService.get<string>(
        ENV_VARIABLES.googleClientSecret,
      )!,
      callbackURL: configService.get<string>(
        ENV_VARIABLES.googleClientCallbackUrl,
      )!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<SocialUser> {
    return {
      provider: 'google',
      providerAccountId: profile.id,
      email: profile.emails?.[0].value || 'no-email@google.com',
      name:
        profile.displayName ||
        `${profile.name?.givenName} ${profile.name?.familyName}`,
      image: profile.photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
  }
}
