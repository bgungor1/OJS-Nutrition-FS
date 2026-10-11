import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const CACHE_CONTROL_METADATA_KEY = 'CACHE_CONTROL_METADATA';

export interface CacheControlOptions {
  maxAge: number;
  scope?: 'public' | 'private';
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  mustRevalidate?: boolean;
}

export const CacheControl = (
  options: CacheControlOptions,
): CustomDecorator<string> => SetMetadata(CACHE_CONTROL_METADATA_KEY, options);
