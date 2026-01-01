import { Test, TestingModule } from '@nestjs/testing';
import { LectureActivityController } from './lecture-activity.controller';
import { LectureActivityService } from './lecture-activity.service';

describe('LectureActivityController', () => {
  let controller: LectureActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LectureActivityController],
      providers: [LectureActivityService],
    }).compile();

    controller = module.get<LectureActivityController>(LectureActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
