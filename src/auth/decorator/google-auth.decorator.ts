import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export function GoogleAuth() {
  return applyDecorators(UseGuards(AuthGuard('google')));
}
