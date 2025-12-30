import { Request } from 'express';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role/entities/role.entity';

export type TokenPayload = {
  id: string;
  role: Pick<Role, 'name'>;
  type: 'access' | 'refresh';
  image: string | null;
  iat: number;
  exp: number;
};

export interface RequestWithToken extends Request {
  cookies: { refreshToken?: string; accessToken?: string };
  user: TokenPayload;
}

export type UserWithRoleName = Pick<User, 'id' | 'image'> & {
  role: Pick<Role, 'name'>;
};

export interface SocialUser {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  image?: string;
  accessToken?: string;
  refreshToken?: string;
}
