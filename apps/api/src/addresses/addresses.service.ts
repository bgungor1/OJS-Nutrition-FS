import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  toAddressResponse,
  toPaginatedAddressesResponse,
} from './addresses.mapper';
import { AddressesQueryDto } from './dto/addresses-query.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import {
  AddressResponseDto,
  PaginatedAddressesResponseDto,
} from './interfaces/address-response.interface';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async validateLocationHierarchy(
    countryId: number,
    regionId: number,
    subregionId: number,
  ): Promise<void> {
    const valid = await this.prisma.subregion.findFirst({
      where: {
        id: subregionId,
        regionId,
        region: {
          countryId,
        },
      },
    });

    if (!valid) {
      throw new BadRequestException(
        'Seçilen ilçe, il ve ülke hiyerarşisi birbiriyle eşleşmiyor.',
      );
    }
  }

  async list(
    userId: string,
    query: AddressesQueryDto,
  ): Promise<PaginatedAddressesResponseDto> {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const [addresses, count] = await Promise.all([
      this.prisma.address.findMany({
        where: { userId },
        include: { country: true, region: true, subregion: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.address.count({
        where: { userId },
      }),
    ]);

    return toPaginatedAddressesResponse(addresses, count);
  }

  async getById(userId: string, id: string): Promise<AddressResponseDto> {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
      include: { country: true, region: true, subregion: true },
    });

    if (!address) {
      throw new NotFoundException('Adres bulunamadı.');
    }

    return toAddressResponse(address);
  }

  async create(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    await this.validateLocationHierarchy(
      dto.country_id,
      dto.region_id,
      dto.subregion_id,
    );

    const address = await this.prisma.address.create({
      data: {
        userId,
        title: dto.title,
        firstName: dto.first_name,
        lastName: dto.last_name,
        countryId: dto.country_id,
        regionId: dto.region_id,
        subregionId: dto.subregion_id,
        fullAddress: dto.full_address,
        phoneNumber: dto.phone_number,
      },
      include: { country: true, region: true, subregion: true },
    });

    return toAddressResponse(address);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const existing = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Adres bulunamadı.');
    }

    if (
      dto.country_id !== undefined ||
      dto.region_id !== undefined ||
      dto.subregion_id !== undefined
    ) {
      const countryId = dto.country_id ?? existing.countryId;
      const regionId = dto.region_id ?? existing.regionId;
      const subregionId = dto.subregion_id ?? existing.subregionId;

      await this.validateLocationHierarchy(countryId, regionId, subregionId);
    }

    const data: Prisma.AddressUncheckedUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.first_name !== undefined) data.firstName = dto.first_name;
    if (dto.last_name !== undefined) data.lastName = dto.last_name;
    if (dto.country_id !== undefined) data.countryId = dto.country_id;
    if (dto.region_id !== undefined) data.regionId = dto.region_id;
    if (dto.subregion_id !== undefined) data.subregionId = dto.subregion_id;
    if (dto.full_address !== undefined) data.fullAddress = dto.full_address;
    if (dto.phone_number !== undefined) data.phoneNumber = dto.phone_number;

    const updated = await this.prisma.address.update({
      where: { id },
      data,
      include: { country: true, region: true, subregion: true },
    });

    return toAddressResponse(updated);
  }

  async delete(userId: string, id: string): Promise<{ id: string }> {
    const existing = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Adres bulunamadı.');
    }

    await this.prisma.address.delete({
      where: { id },
    });

    return { id };
  }
}
