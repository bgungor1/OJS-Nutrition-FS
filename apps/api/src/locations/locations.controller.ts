import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

/**
 * BACKEND_PLAN §5.4 — @Public():
 *  GET /locations/countries                        -> Country[]
 *  GET /locations/countries/:countryId/regions     -> Region[]
 *  GET /locations/regions/:regionId/subregions     -> Subregion[]
 */
@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}
}
