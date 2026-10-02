export function normalizeImageHost(host?: string): string {
  const fallback = 'http://localhost:3000';
  if (!host || host.trim() === '') {
    return fallback;
  }

  let normalized = host.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `http://${normalized}`;
  }

  normalized = normalized.replace(/\/+$/, '');

  if (normalized === 'http://localhost' || normalized === 'http://127.0.0.1') {
    normalized = `${normalized}:3000`;
  }

  return normalized;
}

export function getImageUrl(
  photoSrc?: string | null,
  fallback = '',
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
  const baseUrl = normalizeImageHost(process.env.NEXT_PUBLIC_IMAGE_HOST);

  if (cleanPath.startsWith('/media/')) {
    return `${baseUrl}${cleanPath}`;
  }

  if (cleanPath.startsWith('/uploads/')) {
    return `${baseUrl}/media${cleanPath}`;
  }

  return cleanPath;
}
