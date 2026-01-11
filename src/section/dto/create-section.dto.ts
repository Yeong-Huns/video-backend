import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ description: '색션 제목' })
  @IsString()
  title: string;
}
