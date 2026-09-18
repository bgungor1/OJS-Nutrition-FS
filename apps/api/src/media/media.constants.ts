export const MEDIA_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const MEDIA_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedMimeType = (typeof MEDIA_ALLOWED_MIME_TYPES)[number];

export const MEDIA_RATE_LIMIT = {
  LIMIT: 10,
  TTL: 60000,
} as const;

export const MEDIA_UPLOADS_SUBDIR = 'uploads';

export const MEDIA_ERROR_MESSAGES = {
  NO_FILE: 'Yüklenecek dosya bulunamadı.',
  FILE_TOO_LARGE: 'Dosya boyutu maksimum 5MB olabilir.',
  INVALID_FORMAT:
    'Geçersiz dosya formatı. Yalnızca JPEG, PNG ve WEBP formatları desteklenmektedir.',
  SVG_PROHIBITED:
    'SVG formatındaki dosyalar güvenlik nedeniyle kabul edilmemektedir.',
  PATH_TRAVERSAL: 'Geçersiz dosya yolu tespit edildi.',
} as const;
