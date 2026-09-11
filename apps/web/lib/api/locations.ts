import { clientFetch, serverFetch } from '../api-client';
import type { Country, Region, Subregion } from '@/types';

function getFetcher() {
  return typeof window === 'undefined' ? serverFetch : clientFetch;
}

export async function getCountries(): Promise<Country[]> {
  return getFetcher()<Country[]>('/locations/countries', {
    next: { revalidate: 86400, tags: ['locations-countries'] },
  });
}

export async function getRegions(countryId: number): Promise<Region[]> {
  return getFetcher()<Region[]>(`/locations/countries/${countryId}/regions`, {
    next: { revalidate: 86400, tags: [`locations-regions-${countryId}`] },
  });
}

export async function getSubregions(regionId: number): Promise<Subregion[]> {
  return getFetcher()<Subregion[]>(`/locations/regions/${regionId}/subregions`, {
    next: { revalidate: 86400, tags: [`locations-subregions-${regionId}`] },
  });
}
