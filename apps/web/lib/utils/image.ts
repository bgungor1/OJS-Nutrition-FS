const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || 'http://localhost:3000';

export function getImageUrl(
  photoSrc?: string | null,
  fallback = '/placeholder-product.png',
): string {
  if (!photoSrc || photoSrc.trim() === '') {
    return fallback;
  }

  if (
    photoSrc.startsWith('http://') ||
    photoSrc.startsWith('https://') ||
    photoSrc.startsWith('data:') ||
    photoSrc.startsWith('blob:')
  ) {
    return photoSrc;
  }

  const cleanPath = photoSrc.startsWith('/') ? photoSrc : `/${photoSrc}`;
  return `${IMAGE_HOST}${cleanPath}`;
}
