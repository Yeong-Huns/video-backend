import { Test, TestingModule } from '@nestjs/testing';
import { CourseQuestionController } from './course-question.controller';
import { CourseQuestionService } from './course-question.service';

describe('CourseQuestionController', () => {
  let controller: CourseQuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseQuestionController],
      providers: [CourseQuestionService],
    }).compile();

    controller = module.get<CourseQuestionController>(CourseQuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
