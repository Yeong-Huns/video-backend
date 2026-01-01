import { Injectable } from '@nestjs/common';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { UpdateCourseEnrollmentDto } from './dto/update-course-enrollment.dto';

@Injectable()
export class CourseEnrollmentService {
  create(createCourseEnrollmentDto: CreateCourseEnrollmentDto) {
    return 'This action adds a new courseEnrollment';
  }

  findAll() {
    return `This action returns all courseEnrollment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseEnrollment`;
  }

  update(id: number, updateCourseEnrollmentDto: UpdateCourseEnrollmentDto) {
    return `This action updates a #${id} courseEnrollment`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseEnrollment`;
  }
}
