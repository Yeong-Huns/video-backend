import { Injectable } from '@nestjs/common';
import { CreateCourseQuestionDto } from './dto/create-course-question.dto';
import { UpdateCourseQuestionDto } from './dto/update-course-question.dto';

@Injectable()
export class CourseQuestionService {
  create(createCourseQuestionDto: CreateCourseQuestionDto) {
    return 'This action adds a new courseQuestion';
  }

  findAll() {
    return `This action returns all courseQuestion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseQuestion`;
  }

  update(id: number, updateCourseQuestionDto: UpdateCourseQuestionDto) {
    return `This action updates a #${id} courseQuestion`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseQuestion`;
  }
}
