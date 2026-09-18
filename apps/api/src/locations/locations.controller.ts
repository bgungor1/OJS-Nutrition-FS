import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ErrorResponseDto } from '../common/dto';
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
  @ApiParam({
    name: 'countryId',
    description: 'Ülke ID (tam sayı)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'İl listesi başarıyla getirildi.',
    type: [RegionResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz ülke ID parametresi.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ülke bulunamadı.',
    type: ErrorResponseDto,
  })
  async getRegionsByCountry(
    @Param('countryId', ParseIntPipe) countryId: number,
  ): Promise<RegionResponseDto[]> {
    return this.locationsService.findRegionsByCountryId(countryId);
  }

  @Get('regions/:regionId/subregions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Belirli bir ile bağlı ilçeleri listeler' })
  @ApiParam({
    name: 'regionId',
    description: 'İl ID (tam sayı)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'İlçe listesi başarıyla getirildi.',
    type: [SubregionResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz il ID parametresi.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'İl bulunamadı.',
    type: ErrorResponseDto,
  })
  async getSubregionsByRegion(
    @Param('regionId', ParseIntPipe) regionId: number,
  ): Promise<SubregionResponseDto[]> {
    return this.locationsService.findSubregionsByRegionId(regionId);
  }
}
