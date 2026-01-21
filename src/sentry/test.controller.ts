import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorator/public.decorator';

@Controller('/debug-sentry')
export class TestController {
  constructor() {}

  @Public()
  @Get()
  getError() {
    throw new Error('test error');
  }
}
