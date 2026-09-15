import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactQueryDto, CreateContactDto, UpdateContactDto } from './dto';
import {
  ContactListResponse,
  ContactMessageResponse,
  ContactSubmitResponse,
} from './interfaces';

describe('ContactController', () => {
  let controller: ContactController;
  let service: {
    submit: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockMessageResponse: ContactMessageResponse = {
    id: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    message: 'Kargo durumu hakkında bilgi almak istiyorum.',
    handled: false,
    created_at: '2026-09-15T12:00:00.000Z',
  };

  beforeEach(async () => {
    service = {
      submit: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

  describe('findAll', () => {
    it('should delegate to contactService.findAll with query parameters', async () => {
      const query: ContactQueryDto = { handled: false, limit: 10, offset: 0 };
      const expectedResponse: ContactListResponse = {
        count: 1,
        results: [mockMessageResponse],
      };

      service.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResponse);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findById', () => {
    it('should delegate to contactService.findById with id parameter', async () => {
      service.findById.mockResolvedValue(mockMessageResponse);

      const result = await controller.findById(mockMessageResponse.id);

      expect(result).toEqual(mockMessageResponse);
      expect(service.findById).toHaveBeenCalledWith(mockMessageResponse.id);
    });
  });

  describe('update', () => {
    it('should delegate to contactService.update with id and dto', async () => {
      const dto: UpdateContactDto = { handled: true };
      const updatedResponse = { ...mockMessageResponse, handled: true };

      service.update.mockResolvedValue(updatedResponse);

      const result = await controller.update(mockMessageResponse.id, dto);

      expect(result).toEqual(updatedResponse);
      expect(service.update).toHaveBeenCalledWith(mockMessageResponse.id, dto);
    });
  });

  describe('delete', () => {
    it('should delegate to contactService.delete with id', async () => {
      service.delete.mockResolvedValue({ id: mockMessageResponse.id });

      const result = await controller.delete(mockMessageResponse.id);

      expect(result).toEqual({ id: mockMessageResponse.id });
      expect(service.delete).toHaveBeenCalledWith(mockMessageResponse.id);
    });
  });
});
