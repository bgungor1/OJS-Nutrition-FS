import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'node:fs';
import path from 'node:path';
import { AuditEvent } from '../common/audit/audit-event.enum';
import { SecurityAuditService } from '../common/audit/security-audit.service';
import { MediaService } from './media.service';
import {
  createMockMulterFile,
  validJpegBuffer,
  validPngBuffer,
} from './test/media.fixtures';

describe('MediaService', () => {
  let service: MediaService;
  let auditService: {
    info: jest.Mock;
    warn: jest.Mock;
    alarm: jest.Mock;
    record: jest.Mock;
  };
  const testStoragePath = path.resolve(__dirname, '../../test-media-temp');

  beforeEach(async () => {
    auditService = {
      info: jest.fn(),
      warn: jest.fn(),
      alarm: jest.fn(),
      record: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) =>
              key === 'media'
                ? {
                    storagePath: testStoragePath,
                    baseUrl: 'http://localhost:3000/media',
                  }
                : null,
            ),
          },
        },
        { provide: SecurityAuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  afterEach(() => {
    if (fs.existsSync(testStoragePath)) {
      fs.rmSync(testStoragePath, { recursive: true, force: true });
    }
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should create uploads directory if it does not exist', () => {
      service.onModuleInit();
      const uploadDir = path.join(testStoragePath, 'uploads');
      expect(fs.existsSync(uploadDir)).toBe(true);
    });
  });

  describe('uploadFile', () => {
    it('should throw BadRequestException and log audit warn when file is missing', async () => {
      await expect(service.uploadFile(undefined, '127.0.0.1')).rejects.toThrow(
        BadRequestException,
      );

      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.MEDIA_REJECTED,
        expect.objectContaining({
          ip: '127.0.0.1',
          details: { reason: 'Eksik dosya gövdesi' },
        }),
      );
    });

    it('should throw BadRequestException when file size exceeds 5MB', async () => {
      const oversizedFile = createMockMulterFile({
        originalname: 'large.jpg',
        size: 5 * 1024 * 1024 + 1,
        buffer: Buffer.alloc(100),
      });

      await expect(
        service.uploadFile(oversizedFile, '127.0.0.1', 'user-1'),
      ).rejects.toThrow(BadRequestException);

      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.MEDIA_REJECTED,
        expect.objectContaining({
          ip: '127.0.0.1',
          userId: 'user-1',
          details: expect.objectContaining({
            reason: 'Dosya boyutu 5MB sınırını aştı',
          }) as unknown as Record<string, unknown>,
        }),
      );
    });

    it('should throw BadRequestException when file is SVG', async () => {
      const svgFile = createMockMulterFile({
        originalname: 'exploit.svg',
        mimetype: 'image/svg+xml',
        size: 200,
        buffer: Buffer.from('<svg><script>alert(1)</script></svg>'),
      });

      await expect(
        service.uploadFile(svgFile, '127.0.0.1', 'user-1'),
      ).rejects.toThrow(BadRequestException);

      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.MEDIA_REJECTED,
        expect.objectContaining({
          ip: '127.0.0.1',
          userId: 'user-1',
          details: expect.objectContaining({
            reason: 'SVG formatı güvenlik gerekçesiyle engellendi',
          }) as unknown as Record<string, unknown>,
        }),
      );
    });

    it('should throw BadRequestException when magic bytes do not match', async () => {
      const fakeImageFile = createMockMulterFile({
        originalname: 'fake.jpg',
        size: 100,
        buffer: Buffer.from(
          'This is a fake text file disguised as a JPEG image',
        ),
      });

      await expect(
        service.uploadFile(fakeImageFile, '127.0.0.1', 'user-1'),
      ).rejects.toThrow(BadRequestException);

      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.MEDIA_REJECTED,
        expect.objectContaining({
          ip: '127.0.0.1',
          userId: 'user-1',
          details: expect.objectContaining({
            reason: 'Magic bytes MIME doğrulaması başarısız',
          }) as unknown as Record<string, unknown>,
        }),
      );
    });

    it('should successfully upload valid JPEG image and write to disk', async () => {
      const validFile = createMockMulterFile({
        originalname: 'avatar.jpg',
        size: validJpegBuffer.length,
        buffer: validJpegBuffer,
      });

      const result = await service.uploadFile(
        validFile,
        '192.168.1.1',
        'admin-uuid-123',
      );

      expect(result).toHaveProperty('photo_src');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('filename');
      expect(result.size).toBe(validJpegBuffer.length);
      expect(result.mimetype).toBe('image/jpeg');

      expect(result.photo_src).toMatch(/^media\/uploads\/[a-f0-9-]+\.jpg$/);
      expect(result.url).toMatch(
        /^http:\/\/localhost:3000\/media\/uploads\/[a-f0-9-]+\.jpg$/,
      );

      const writtenFilePath = path.join(
        testStoragePath,
        'uploads',
        result.filename,
      );
      expect(fs.existsSync(writtenFilePath)).toBe(true);
      const readContent = fs.readFileSync(writtenFilePath);
      expect(readContent.equals(validJpegBuffer)).toBe(true);

      expect(auditService.info).toHaveBeenCalledWith(
        AuditEvent.MEDIA_UPLOADED,
        expect.objectContaining({
          ip: '192.168.1.1',
          userId: 'admin-uuid-123',
          resourceId: result.filename,
          details: expect.objectContaining({
            originalName: 'avatar.jpg',
            size: validJpegBuffer.length,
            mimeType: 'image/jpeg',
          }) as unknown as Record<string, unknown>,
        }),
      );
    });

    it('should successfully upload valid PNG image', async () => {
      const pngFile = createMockMulterFile({
        originalname: 'logo.png',
        mimetype: 'image/png',
        size: validPngBuffer.length,
        buffer: validPngBuffer,
      });

      const result = await service.uploadFile(pngFile);
      expect(result.mimetype).toBe('image/png');
      expect(result.filename.endsWith('.png')).toBe(true);
    });
  });
});
