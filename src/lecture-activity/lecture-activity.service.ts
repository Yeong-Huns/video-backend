import { Injectable } from '@nestjs/common';
import { CreateLectureActivityDto } from './dto/create-lecture-activity.dto';
import { UpdateLectureActivityDto } from './dto/update-lecture-activity.dto';

@Injectable()
export class LectureActivityService {
  create(createLectureActivityDto: CreateLectureActivityDto) {
    return 'This action adds a new lectureActivity';
  }

  findAll() {
    return `This action returns all lectureActivity`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lectureActivity`;
  }

  update(id: number, updateLectureActivityDto: UpdateLectureActivityDto) {
    return `This action updates a #${id} lectureActivity`;
  }

  remove(id: number) {
    return `This action removes a #${id} lectureActivity`;
  }
}
