import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './public.decorator';

export function GoogleAuth() {
  return applyDecorators(Public(), UseGuards(AuthGuard('google')));
}
