import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    if (!user) throw new NotFoundException('프로필 정보를 조회할 수 없습니다.');

    return UserResponseDto.from(user);
  }

  async updateProfile(updateUserDto: UpdateUserDto, userId: string) {
    const user = await this.userRepository.preload({
      id: userId,
      ...updateUserDto,
    });

    if (!user) throw new NotFoundException('프로필 정보를 조회할 수 없습니다.');

    const updatedUser = await this.userRepository.save(user);

    return UserResponseDto.from(updatedUser);
  }
}
