import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CountryResponseDto,
  RegionResponseDto,
  SubregionResponseDto,
} from './interfaces/locations-response.interface';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCountries(): Promise<CountryResponseDto[]> {
    const countries = await this.prisma.country.findMany({
      orderBy: { name: 'asc' },
    });
    return countries.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  }

  async findRegionsByCountryId(
    countryId: number,
  ): Promise<RegionResponseDto[]> {
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

    return regions.map((r) => ({
      id: r.id,
      name: r.name,
      country_id: r.countryId,
    }));
  }

  async findSubregionsByRegionId(
    regionId: number,
  ): Promise<SubregionResponseDto[]> {
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

    return subregions.map((s) => ({
      id: s.id,
      name: s.name,
      region_id: s.regionId,
    }));
  }
}
