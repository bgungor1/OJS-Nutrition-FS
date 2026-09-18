import { BadRequestException } from '@nestjs/common';
import path from 'node:path';
import { MediaValidatorHelper } from './media-validator.helper';

describe('MediaValidatorHelper', () => {
  describe('validateMagicBytes', () => {
    it('should validate JPEG buffer (FF D8 FF)', () => {
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ]);
      const result = MediaValidatorHelper.validateMagicBytes(jpegBuffer);

      expect(result).toEqual({
        mimeType: 'image/jpeg',
        extension: 'jpg',
      });
    });

    it('should validate PNG buffer (89 50 4E 47 0D 0A 1A 0A)', () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]);
      const result = MediaValidatorHelper.validateMagicBytes(pngBuffer);

      expect(result).toEqual({
        mimeType: 'image/png',
        extension: 'png',
      });
    });

    it('should validate WebP buffer (RIFF....WEBP)', () => {
      const webpBuffer = Buffer.from([
        0x52,
        0x49,
        0x46,
        0x46, // RIFF
        0x20,
        0x00,
        0x00,
        0x00, // Size
        0x57,
        0x45,
        0x42,
        0x50, // WEBP
      ]);
      const result = MediaValidatorHelper.validateMagicBytes(webpBuffer);

      expect(result).toEqual({
        mimeType: 'image/webp',
        extension: 'webp',
      });
    });

    it('should return null for non-image or corrupted buffer', () => {
      const textBuffer = Buffer.from('Hello world this is a text file not img');
      const result = MediaValidatorHelper.validateMagicBytes(textBuffer);

      expect(result).toBeNull();
    });

    it('should return null for buffer shorter than 12 bytes', () => {
      const shortBuffer = Buffer.from([0xff, 0xd8, 0xff]);
      const result = MediaValidatorHelper.validateMagicBytes(shortBuffer);

      expect(result).toBeNull();
    });

    it('should return null for empty or undefined buffer', () => {
      expect(
        MediaValidatorHelper.validateMagicBytes(Buffer.alloc(0)),
      ).toBeNull();
      expect(
        MediaValidatorHelper.validateMagicBytes(null as unknown as Buffer),
      ).toBeNull();
    });
  });

  describe('isSvg', () => {
    it('should detect SVG from declared mimeType', () => {
      const dummyBuffer = Buffer.from('test');
      expect(
        MediaValidatorHelper.isSvg(dummyBuffer, 'image.png', 'image/svg+xml'),
      ).toBe(true);
    });

    it('should detect SVG from file extension (case insensitive)', () => {
      const dummyBuffer = Buffer.from('test');
      expect(
        MediaValidatorHelper.isSvg(dummyBuffer, 'exploit.SVG', 'image/jpeg'),
      ).toBe(true);
      expect(
        MediaValidatorHelper.isSvg(
          dummyBuffer,
          'nested/vector.svg',
          'application/octet-stream',
        ),
      ).toBe(true);
    });

    it('should detect SVG from buffer content containing <svg tag', () => {
      const svgBuffer = Buffer.from(
        '<svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>',
      );
      expect(
        MediaValidatorHelper.isSvg(svgBuffer, 'masked.jpg', 'image/jpeg'),
      ).toBe(true);
    });

    it('should detect SVG with XML declaration in buffer', () => {
      const xmlSvgBuffer = Buffer.from(
        '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ...>',
      );
      expect(
        MediaValidatorHelper.isSvg(xmlSvgBuffer, 'photo.jpg', 'image/jpeg'),
      ).toBe(true);
    });

    it('should detect SVG with xmlns attribute in buffer', () => {
      const xmlBuffer = Buffer.from(
        '<root xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></root>',
      );
      expect(
        MediaValidatorHelper.isSvg(xmlBuffer, 'avatar.png', 'image/png'),
      ).toBe(true);
    });

    it('should return false for clean binary image buffer', () => {
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ]);
      expect(
        MediaValidatorHelper.isSvg(jpegBuffer, 'photo.jpg', 'image/jpeg'),
      ).toBe(false);
    });

    it('should return false for empty buffer without svg filename/mime', () => {
      expect(
        MediaValidatorHelper.isSvg(Buffer.alloc(0), 'photo.jpg', 'image/jpeg'),
      ).toBe(false);
    });
  });

  describe('generateSafeFilename', () => {
    it('should generate a UUID-based filename with clean extension', () => {
      const filename = MediaValidatorHelper.generateSafeFilename('jpg');
      expect(filename).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/,
      );
    });

    it('should sanitize extension containing dangerous characters', () => {
      const filename = MediaValidatorHelper.generateSafeFilename('../.png');
      expect(filename).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/,
      );
    });
  });

  describe('assertSafePath', () => {
    it('should allow paths strictly within storage root directory', () => {
      const baseDir = path.resolve('test-storage');
      const validPath = path.join(baseDir, 'uploads', 'safe.jpg');

      expect(() =>
        MediaValidatorHelper.assertSafePath(baseDir, validPath),
      ).not.toThrow();
    });

    it('should throw BadRequestException when path traverses outside storage root', () => {
      const baseDir = path.resolve('test-storage');
      const maliciousPath = path.resolve(baseDir, '../outside.jpg');

      expect(() =>
        MediaValidatorHelper.assertSafePath(baseDir, maliciousPath),
      ).toThrow(BadRequestException);
    });
  });
});
