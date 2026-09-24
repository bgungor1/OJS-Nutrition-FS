import { describe, it, expect, afterEach } from 'vitest';
import { getImageUrl } from './image';

describe('getImageUrl utility', () => {
  const originalEnv = process.env.NEXT_PUBLIC_IMAGE_HOST;

  afterEach(() => {
    process.env.NEXT_PUBLIC_IMAGE_HOST = originalEnv;
  });

  it('returns fallback image when photoSrc is null, undefined, or empty string', () => {
    expect(getImageUrl(null)).toBe('/placeholder-product.png');
    expect(getImageUrl(undefined)).toBe('/placeholder-product.png');
    expect(getImageUrl('')).toBe('/placeholder-product.png');
    expect(getImageUrl('   ')).toBe('/placeholder-product.png');
    expect(getImageUrl(null, '/custom-fallback.png')).toBe('/custom-fallback.png');
  });

  it('returns full URLs untouched', () => {
    expect(getImageUrl('https://example.com/product.jpg')).toBe('https://example.com/product.jpg');
    expect(getImageUrl('http://cdn.store.com/item.png')).toBe('http://cdn.store.com/item.png');
    expect(getImageUrl('data:image/png;base64,12345')).toBe('data:image/png;base64,12345');
    expect(getImageUrl('blob:http://localhost:3000/xyz')).toBe('blob:http://localhost:3000/xyz');
  });

  it('prefixes relative /media/ paths with IMAGE_HOST', () => {
    const result1 = getImageUrl('media/products/whey.jpg');
    expect(result1).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):3000\/media\/products\/whey\.jpg$/);

    const result2 = getImageUrl('/media/uploads/photo.png');
    expect(result2).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):3000\/media\/uploads\/photo\.png$/);
  });

  it('returns local static asset paths starting with / as local paths', () => {
    expect(getImageUrl('/protein.png')).toBe('/protein.png');
    expect(getImageUrl('/banner_slider.jpg')).toBe('/banner_slider.jpg');
    expect(getImageUrl('/about/iso.png')).toBe('/about/iso.png');
  });

  it('normalizes local static asset paths without leading slash', () => {
    expect(getImageUrl('protein.png')).toBe('/protein.png');
    expect(getImageUrl('protein-list/whey-isolate.jpg')).toBe('/protein-list/whey-isolate.jpg');
  });
});
