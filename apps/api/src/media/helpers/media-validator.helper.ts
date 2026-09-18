import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { AllowedMimeType, MEDIA_ERROR_MESSAGES } from '../media.constants';

export interface ValidatedMediaInfo {
  mimeType: AllowedMimeType;
  extension: 'jpg' | 'png' | 'webp';
}

export class MediaValidatorHelper {
  static validateMagicBytes(buffer: Buffer): ValidatedMediaInfo | null {
    if (!buffer || buffer.length < 12) {
      return null;
    }

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { mimeType: 'image/jpeg', extension: 'jpg' };
    }
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { mimeType: 'image/png', extension: 'png' };
    }

    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;

    const isWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    if (isRiff && isWebp) {
      return { mimeType: 'image/webp', extension: 'webp' };
    }

    return null;
  }

  static isSvg(
    buffer: Buffer,
    originalName?: string,
    declaredMime?: string,
  ): boolean {
    if (declaredMime?.toLowerCase().includes('image/svg')) {
      return true;
    }

    if (originalName && /\.svg$/i.test(originalName.trim())) {
      return true;
    }

    if (!buffer || buffer.length === 0) {
      return false;
    }

    const sampleSize = Math.min(buffer.length, 2048);
    const sample = buffer.toString('utf8', 0, sampleSize).toLowerCase();

    return (
      sample.includes('<svg') ||
      sample.includes('<?xml') ||
      sample.includes('<!doctype svg') ||
      sample.includes('xmlns="http://www.w3.org/2000/svg"')
    );
  }

  static generateSafeFilename(extension: string): string {
    const sanitizedExt = extension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${randomUUID()}.${sanitizedExt}`;
  }

  static assertSafePath(baseDir: string, fullPath: string): void {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(fullPath);

    if (
      !resolvedTarget.startsWith(resolvedBase + path.sep) &&
      resolvedTarget !== resolvedBase
    ) {
      throw new BadRequestException(MEDIA_ERROR_MESSAGES.PATH_TRAVERSAL);
    }
  }
}
