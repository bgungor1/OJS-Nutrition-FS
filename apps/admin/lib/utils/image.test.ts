import { describe, it, expect, afterEach } from 'vitest';
import { getImageUrl, normalizeImageHost } from './image';

describe('apps/admin/lib/utils/image', () => {
  const originalEnv = process.env.NEXT_PUBLIC_IMAGE_HOST;

  afterEach(() => {
    process.env.NEXT_PUBLIC_IMAGE_HOST = originalEnv;
  });

  describe('normalizeImageHost', () => {
    it('returns default fallback when host is undefined, empty, or whitespace', () => {
      expect(normalizeImageHost(undefined)).toBe('http://localhost:3000');
      expect(normalizeImageHost('')).toBe('http://localhost:3000');
      expect(normalizeImageHost('   ')).toBe('http://localhost:3000');
    });

    it('adds http:// protocol if missing', () => {
      expect(normalizeImageHost('localhost:3000')).toBe('http://localhost:3000');
      expect(normalizeImageHost('api.example.com')).toBe('http://api.example.com');
    });

    it('defaults port to 3000 when host is bare localhost or 127.0.0.1', () => {
      expect(normalizeImageHost('localhost')).toBe('http://localhost:3000');
      expect(normalizeImageHost('http://localhost')).toBe('http://localhost:3000');
      expect(normalizeImageHost('127.0.0.1')).toBe('http://127.0.0.1:3000');
      expect(normalizeImageHost('http://127.0.0.1')).toBe('http://127.0.0.1:3000');
    });

    it('strips trailing slashes cleanly', () => {
      expect(normalizeImageHost('http://localhost:3000/')).toBe('http://localhost:3000');
      expect(normalizeImageHost('https://cdn.ojsnutrition.com///')).toBe('https://cdn.ojsnutrition.com');
    });
  });

  describe('getImageUrl', () => {
    it('returns fallback value when photoSrc is null, undefined, or empty', () => {
      expect(getImageUrl(null)).toBe('');
      expect(getImageUrl(undefined)).toBe('');
      expect(getImageUrl('')).toBe('');
      expect(getImageUrl('   ')).toBe('');
      expect(getImageUrl(null, '/placeholder.png')).toBe('/placeholder.png');
    });

    it('returns absolute and special URLs untouched', () => {
      expect(getImageUrl('https://example.com/item.jpg')).toBe('https://example.com/item.jpg');
      expect(getImageUrl('http://storage.com/photo.png')).toBe('http://storage.com/photo.png');
      expect(getImageUrl('data:image/png;base64,abc123')).toBe('data:image/png;base64,abc123');
      expect(getImageUrl('blob:http://localhost:3002/uuid')).toBe('blob:http://localhost:3002/uuid');
    });

    it('resolves relative media paths with the API image host', () => {
      process.env.NEXT_PUBLIC_IMAGE_HOST = 'http://localhost:3000';

      expect(getImageUrl('media/products/whey.jpg')).toBe(
        'http://localhost:3000/media/products/whey.jpg',
      );
      expect(getImageUrl('/media/uploads/photo.png')).toBe(
        'http://localhost:3000/media/uploads/photo.png',
      );
    });

    it('handles uploads/ paths by prepending /media', () => {
      process.env.NEXT_PUBLIC_IMAGE_HOST = 'http://localhost:3000';

      expect(getImageUrl('uploads/avatar.jpg')).toBe(
        'http://localhost:3000/media/uploads/avatar.jpg',
      );
    });

    it('respects custom NEXT_PUBLIC_IMAGE_HOST environment variable', () => {
      process.env.NEXT_PUBLIC_IMAGE_HOST = 'https://assets.store.com';

      expect(getImageUrl('media/banner.jpg')).toBe(
        'https://assets.store.com/media/banner.jpg',
      );
    });

    it('preserves non-media relative paths as clean paths', () => {
      expect(getImageUrl('/icons/package.svg')).toBe('/icons/package.svg');
    });
  });
});
