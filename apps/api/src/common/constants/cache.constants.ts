export const CACHE_TTL = {
  LOCATIONS_MS: 24 * 60 * 60 * 1000,
  CATEGORIES_MS: 60 * 60 * 1000,
  FAQ_MS: 30 * 60 * 1000,
  BEST_SELLERS_MS: 5 * 60 * 1000,
} as const;

export const CACHE_KEYS = {
  LOCATIONS_COUNTRIES: 'locations:countries',
  LOCATIONS_REGIONS: (countryId: number | string) =>
    `locations:regions:${countryId}`,
  LOCATIONS_SUBREGIONS: (regionId: number | string) =>
    `locations:subregions:${regionId}`,
  CATEGORIES_TREE: 'products:categories',
  BEST_SELLERS: 'products:best-sellers',
  FAQ_LIST: (category?: string) =>
    category ? `faq:list:${category}` : 'faq:list:all',
  FAQ_ITEM: (id: string) => `faq:item:${id}`,
} as const;

export const HTTP_CACHE_DIRECTIVES = {
  LOCATIONS: {
    maxAge: 86400,
    staleWhileRevalidate: 3600,
    scope: 'public' as const,
  },
  CATEGORIES: {
    maxAge: 3600,
    staleWhileRevalidate: 600,
    scope: 'public' as const,
  },
  FAQ: {
    maxAge: 1800,
    staleWhileRevalidate: 300,
    scope: 'public' as const,
  },
  BEST_SELLERS: {
    maxAge: 300,
    staleWhileRevalidate: 60,
    scope: 'public' as const,
  },
} as const;
