import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import {
  CountryResponseDto,
  RegionResponseDto,
  SubregionResponseDto,
} from './interfaces/locations-response.interface';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Public()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('countries')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kayıtlı tüm ülkeleri alfabetik sırayla listeler' })
  @ApiResponse({
    status: 200,
    description: 'Ülke listesi başarıyla getirildi.',
    type: [CountryResponseDto],
  })
  async getCountries(): Promise<CountryResponseDto[]> {
    return this.locationsService.findCountries();
  }

  @Get('countries/:countryId/regions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Belirli bir ülkeye bağlı illeri listeler' })
  @ApiResponse({
    status: 200,
    description: 'İl listesi başarıyla getirildi.',
    type: [RegionResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Ülke bulunamadı.',
  })
  async getRegionsByCountry(
    @Param('countryId', ParseIntPipe) countryId: number,
  ): Promise<RegionResponseDto[]> {
    return this.locationsService.findRegionsByCountryId(countryId);
  }

  @Get('regions/:regionId/subregions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Belirli bir ile bağlı ilçeleri listeler' })
  @ApiResponse({
    status: 200,
    description: 'İlçe listesi başarıyla getirildi.',
    type: [SubregionResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'İl bulunamadı.',
  })
  async getSubregionsByRegion(
    @Param('regionId', ParseIntPipe) regionId: number,
  ): Promise<SubregionResponseDto[]> {
    return this.locationsService.findSubregionsByRegionId(regionId);
  }
}
