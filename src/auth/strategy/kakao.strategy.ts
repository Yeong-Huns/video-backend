import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { ENV_VARIABLES } from '../../common/const/env.variables';
import { SocialUser } from '../types/auth';

interface KakaoAccount {
  email?: string;
  profile?: {
    nickname?: string;
    profile_image_url?: string;
    thumbnail_image_url?: string;
  };
}

interface KakaoProfile {
  id: number | string;
  username?: string;
  displayName?: string;
  _json: {
    id: number;
    properties?: {
      nickname?: string;
      profile_image?: string;
      thumbnail_image?: string;
    };
    kakao_account?: KakaoAccount;
  };
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>(ENV_VARIABLES.kakaoClientId)!,
      clientSecret: configService.get<string>(ENV_VARIABLES.kakaoClientSecret)!,
      callbackURL: configService.get<string>(ENV_VARIABLES.kakaoCallbackUrl)!,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: KakaoProfile,
  ): Promise<SocialUser> {
    const kakaoAccount = profile._json.kakao_account;
    const properties = profile._json.properties;

    return {
      provider: 'kakao',
      providerAccountId: String(profile.id),
      email: kakaoAccount?.email || `kakao_${profile.id}@no-email.com`,
      name:
        properties?.nickname || kakaoAccount?.profile?.nickname || 'Kakao User',
      image:
        properties?.profile_image || kakaoAccount?.profile?.profile_image_url,
      accessToken,
      refreshToken,
    };
  }
}
