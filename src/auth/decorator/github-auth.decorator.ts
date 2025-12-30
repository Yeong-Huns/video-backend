import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export function GithubAuth() {
  return applyDecorators(UseGuards(AuthGuard('github')));
}
