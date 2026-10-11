import {
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { CACHE_KEYS, CACHE_TTL } from '../common/constants';
import { PrismaService } from '../prisma/prisma.service';
import {
  CountryResponseDto,
  RegionResponseDto,
  SubregionResponseDto,
} from './interfaces/locations-response.interface';

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(CACHE_MANAGER)
    private readonly cacheManager?: Cache,
  ) {}

  async findCountries(): Promise<CountryResponseDto[]> {
    const cacheKey = CACHE_KEYS.LOCATIONS_COUNTRIES;
    if (this.cacheManager) {
      try {
        const cached =
          await this.cacheManager.get<CountryResponseDto[]>(cacheKey);
        if (cached) {
          return cached;
        }
      } catch {}
    }

    const countries = await this.prisma.country.findMany({
      orderBy: { name: 'asc' },
    });
    const result = countries.map((c) => ({
      id: c.id,
      name: c.name,
    }));

    if (this.cacheManager) {
      try {
        await this.cacheManager.set(cacheKey, result, CACHE_TTL.LOCATIONS_MS);
      } catch {}
    }

    return result;
  }

  async findRegionsByCountryId(
    countryId: number,
  ): Promise<RegionResponseDto[]> {
    const cacheKey = CACHE_KEYS.LOCATIONS_REGIONS(countryId);
    if (this.cacheManager) {
      try {
        const cached =
          await this.cacheManager.get<RegionResponseDto[]>(cacheKey);
        if (cached) {
          return cached;
        }
      } catch {}
    }

    const country = await this.prisma.country.findUnique({
      where: { id: countryId },
    });
    if (!country) {
      throw new NotFoundException('Ülke bulunamadı.');
    }

    const regions = await this.prisma.region.findMany({
      where: { countryId },
      orderBy: { name: 'asc' },
    });

    const result = regions.map((r) => ({
      id: r.id,
      name: r.name,
      country_id: r.countryId,
    }));

    if (this.cacheManager) {
      try {
        await this.cacheManager.set(cacheKey, result, CACHE_TTL.LOCATIONS_MS);
      } catch {}
    }

    return result;
  }

  async findSubregionsByRegionId(
    regionId: number,
  ): Promise<SubregionResponseDto[]> {
    const cacheKey = CACHE_KEYS.LOCATIONS_SUBREGIONS(regionId);
    if (this.cacheManager) {
      try {
        const cached =
          await this.cacheManager.get<SubregionResponseDto[]>(cacheKey);
        if (cached) {
          return cached;
        }
      } catch {}
    }

    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
    });
    if (!region) {
      throw new NotFoundException('İl bulunamadı.');
    }

    const subregions = await this.prisma.subregion.findMany({
      where: { regionId },
      orderBy: { name: 'asc' },
    });

    const result = subregions.map((s) => ({
      id: s.id,
      name: s.name,
      region_id: s.regionId,
    }));

    if (this.cacheManager) {
      try {
        await this.cacheManager.set(cacheKey, result, CACHE_TTL.LOCATIONS_MS);
      } catch {}
    }

    return result;
  }
}
