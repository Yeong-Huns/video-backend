import { Test, TestingModule } from '@nestjs/testing';
import { CourseCommentService } from './course-comment.service';

describe('CourseCommentService', () => {
  let service: CourseCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseCommentService],
    }).compile();

    service = module.get<CourseCommentService>(CourseCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
