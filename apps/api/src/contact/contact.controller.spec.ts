import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto';
import { ContactSubmitResponse } from './interfaces';

describe('ContactController', () => {
  let controller: ContactController;
  let service: {
    submit: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      submit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submit', () => {
    it('should delegate to contactService.submit and return success response', async () => {
      const dto: CreateContactDto = {
        name: 'Ahmet Yılmaz',
        email: 'ahmet.yilmaz@example.com',
        message: 'Kargo durumu hakkında bilgi almak istiyorum.',
      };

      const expectedResponse: ContactSubmitResponse = {
        id: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
        message: 'Mesajınız alındı',
      };

      service.submit.mockResolvedValue(expectedResponse);

      const result = await controller.submit(dto);

      expect(result).toEqual(expectedResponse);
      expect(service.submit).toHaveBeenCalledWith(dto);
    });
  });
});
