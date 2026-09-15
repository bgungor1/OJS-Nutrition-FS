import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsAdminController } from './reviews-admin.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsAdminController', () => {
  let controller: ReviewsAdminController;
  let service: {
    delete: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsAdminController],
      providers: [
        {
          provide: ReviewsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ReviewsAdminController>(ReviewsAdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('delete', () => {
    it('should call service.delete with id parameter on admin route', async () => {
      service.delete.mockResolvedValue({ id: 'rev-admin-1' });

      const result = await controller.delete('rev-admin-1');

      expect(service.delete).toHaveBeenCalledWith('rev-admin-1');
      expect(result).toEqual({ id: 'rev-admin-1' });
    });
  });
});
