import { applyDecorators, UseGuards } from '@nestjs/common';
import { Public } from './public.decorator';
import { AuthGuard } from '@nestjs/passport';

export function KakaoAuth() {
  return applyDecorators(Public(), UseGuards(AuthGuard('kakao')));
}
