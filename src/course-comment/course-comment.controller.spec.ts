import { Test, TestingModule } from '@nestjs/testing';
import { CourseCommentController } from './course-comment.controller';
import { CourseCommentService } from './course-comment.service';

describe('CourseCommentController', () => {
  let controller: CourseCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseCommentController],
      providers: [CourseCommentService],
    }).compile();

    controller = module.get<CourseCommentController>(CourseCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
