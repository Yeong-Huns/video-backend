import { Test, TestingModule } from '@nestjs/testing';
import { LectureActivityService } from './lecture-activity.service';

describe('LectureActivityService', () => {
  let service: LectureActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LectureActivityService],
    }).compile();

    service = module.get<LectureActivityService>(LectureActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
