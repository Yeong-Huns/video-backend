import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { type RequestWithToken } from '../auth/types/auth';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '프로필 조회' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '프로필 조회 성공',
    type: User,
  })
  @Get('profile')
  getProfile(@Req() req: RequestWithToken) {}

  @ApiOperation({ summary: '프로필 수정' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '프로필 업데이트 성공',
    type: User,
  })
  @Patch('profile')
  updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithToken,
  ) {}
}
