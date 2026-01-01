import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ description: '이메일', example: 'test@naver.com' })
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @ApiProperty({ description: '비밀번호', example: 'qwer1234' })
  @IsString()
  password: string;
}
