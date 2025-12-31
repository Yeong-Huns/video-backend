import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './public.decorator';

export function GithubAuth() {
  return applyDecorators(Public(), UseGuards(AuthGuard('github')));
}
