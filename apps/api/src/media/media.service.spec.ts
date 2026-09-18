import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'node:fs';
import path from 'node:path';
import { AuditEvent } from '../common/audit/audit-event.enum';
import { SecurityAuditService } from '../common/audit/security-audit.service';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let service: MediaService;
  let auditService: {
    info: jest.Mock;
    warn: jest.Mock;
    alarm: jest.Mock;
    record: jest.Mock;
  };
  const testStoragePath = path.resolve(__dirname, '../../test-media-temp');

  const validJpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);

  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);

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
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'media') {
                return {
                  storagePath: testStoragePath,
                  baseUrl: 'http://localhost:3000/media',
                };
              }
              return null;
            }),
          },
        },
        {
          provide: SecurityAuditService,
          useValue: auditService,
        },
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
      const oversizedFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'large.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 5 * 1024 * 1024 + 1,
        buffer: Buffer.alloc(100),
        destination: '',
        filename: '',
        path: '',
        stream: null as never,
      };

      await expect(
        service.uploadFile(oversizedFile, '127.0.0.1', 'user-1'),
      ).rejects.toThrow(BadRequestException);

      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.MEDIA_REJECTED,
        expect.objectContaining({
          ip: '127.0.0.1',
          userId: 'user-1',
        }),
      );
      const callArgs1 = auditService.warn.mock.calls.at(-1) as [
        AuditEvent,
        { details?: { reason?: string } },
      ];
      expect(callArgs1[1]?.details?.reason).toBe(
        'Dosya boyutu 5MB sınırını aştı',
      );
    });

    it('should throw BadRequestException when file is SVG', async () => {
      const svgFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'exploit.svg',
        encoding: '7bit',
        mimetype: 'image/svg+xml',
        size: 200,
        buffer: Buffer.from('<svg><script>alert(1)</script></svg>'),
        destination: '',
        filename: '',
        path: '',
        stream: null as never,
      };

      await expect(
        service.uploadFile(svgFile, '127.0.0.1', 'user-1'),
      ).rejects.toThrow(BadRequestException);

      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.MEDIA_REJECTED,
        expect.objectContaining({
          ip: '127.0.0.1',
          userId: 'user-1',
        }),
      );
      const callArgs2 = auditService.warn.mock.calls.at(-1) as [
        AuditEvent,
        { details?: { reason?: string } },
      ];
      expect(callArgs2[1]?.details?.reason).toBe(
        'SVG formatı güvenlik gerekçesiyle engellendi',
      );
    });

    it('should throw BadRequestException when magic bytes do not match', async () => {
      const fakeImageFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'fake.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 100,
        buffer: Buffer.from(
          'This is a fake text file disguised as a JPEG image',
        ),
        destination: '',
        filename: '',
        path: '',
        stream: null as never,
      };

      await expect(
        service.uploadFile(fakeImageFile, '127.0.0.1', 'user-1'),
      ).rejects.toThrow(BadRequestException);

      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.MEDIA_REJECTED,
        expect.objectContaining({
          ip: '127.0.0.1',
          userId: 'user-1',
        }),
      );
      const callArgs3 = auditService.warn.mock.calls.at(-1) as [
        AuditEvent,
        { details?: { reason?: string } },
      ];
      expect(callArgs3[1]?.details?.reason).toBe(
        'Magic bytes MIME doğrulaması başarısız',
      );
    });

    it('should successfully upload valid JPEG image and write to disk', async () => {
      const validFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'avatar.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: validJpegBuffer.length,
        buffer: validJpegBuffer,
        destination: '',
        filename: '',
        path: '',
        stream: null as never,
      };

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

      // Verify file written to filesystem
      const writtenFilePath = path.join(
        testStoragePath,
        'uploads',
        result.filename,
      );
      expect(fs.existsSync(writtenFilePath)).toBe(true);
      const readContent = fs.readFileSync(writtenFilePath);
      expect(readContent.equals(validJpegBuffer)).toBe(true);

      // Verify security audit
      expect(auditService.info).toHaveBeenCalledWith(
        AuditEvent.MEDIA_UPLOADED,
        expect.objectContaining({
          ip: '192.168.1.1',
          userId: 'admin-uuid-123',
          resourceId: result.filename,
        }),
      );
      const uploadArgs = auditService.info.mock.calls.at(-1) as [
        AuditEvent,
        {
          details?: {
            originalName?: string;
            size?: number;
            mimeType?: string;
          };
        },
      ];
      expect(uploadArgs[1]?.details?.originalName).toBe('avatar.jpg');
      expect(uploadArgs[1]?.details?.size).toBe(validJpegBuffer.length);
      expect(uploadArgs[1]?.details?.mimeType).toBe('image/jpeg');
    });

    it('should successfully upload valid PNG image', async () => {
      const pngFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'logo.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: validPngBuffer.length,
        buffer: validPngBuffer,
        destination: '',
        filename: '',
        path: '',
        stream: null as never,
      };

      const result = await service.uploadFile(pngFile);
      expect(result.mimetype).toBe('image/png');
      expect(result.filename.endsWith('.png')).toBe(true);
    });
  });
});
