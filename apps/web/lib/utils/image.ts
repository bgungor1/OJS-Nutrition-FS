const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || 'http://localhost:3000';

/**
 * Ürün ve medya görsellerinin URL çözümlemesini gerçekleştirir.
 * Tam URL, data URI, /media/ statik yüklemeleri ve yerel public dosyaları destekler.
 */
export function getImageUrl(
  photoSrc?: string | null,
  fallback = '/placeholder-product.png',
): string {
  if (!photoSrc || photoSrc.trim() === '') {
    return fallback;
  }

  const trimmed = photoSrc.trim();

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  if (cleanPath.startsWith('/media/')) {
    const baseUrl = IMAGE_HOST.replace(/\/+$/, '');
    return `${baseUrl}${cleanPath}`;
  }

  return cleanPath;
}

