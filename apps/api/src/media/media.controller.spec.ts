import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { MediaUploadResponse } from './interfaces/media-upload-response.interface';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

describe('MediaController', () => {
  let controller: MediaController;
  let mediaService: {
    uploadFile: jest.Mock;
  };

  const mockResponse: MediaUploadResponse = {
    photo_src: 'media/uploads/mock-uuid.jpg',
    url: 'http://localhost:3000/media/uploads/mock-uuid.jpg',
    filename: 'mock-uuid.jpg',
    size: 1024,
    mimetype: 'image/jpeg',
  };

  beforeEach(async () => {
    mediaService = {
      uploadFile: jest.fn().mockResolvedValue(mockResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mediaService,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should delegate upload to MediaService with client IP and user id', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
        destination: '',
        filename: '',
        path: '',
        stream: null as never,
      };

      const mockRequest = {
        ip: '10.0.0.1',
        socket: { remoteAddress: '10.0.0.1' },
      } as unknown as Request;

      const mockUser: AuthenticatedUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin',
      };

      const result = await controller.upload(mockFile, mockRequest, mockUser);

      expect(result).toEqual(mockResponse);
      expect(mediaService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        '10.0.0.1',
        'admin-1',
      );
    });

    it('should handle undefined user gracefully', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
        destination: '',
        filename: '',
        path: '',
        stream: null as never,
      };

      const mockRequest = {
        ip: '10.0.0.2',
        socket: {},
      } as unknown as Request;

      const result = await controller.upload(mockFile, mockRequest, undefined);

      expect(result).toEqual(mockResponse);
      expect(mediaService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        '10.0.0.2',
        undefined,
      );
    });
  });
});
