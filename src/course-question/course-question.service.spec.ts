import { Test, TestingModule } from '@nestjs/testing';
import { CourseQuestionService } from './course-question.service';

describe('CourseQuestionService', () => {
  let service: CourseQuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseQuestionService],
    }).compile();

    service = module.get<CourseQuestionService>(CourseQuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
