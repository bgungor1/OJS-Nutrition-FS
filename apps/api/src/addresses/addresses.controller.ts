import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';

/**
 * BACKEND_PLAN §5.4 — Bearer:
 *  GET    /users/addresses?limit=&offset=  -> { count, results: Address[] }
 *  GET    /users/addresses/:id             -> Address
 *  POST   /users/addresses                 CreateAddressDto -> Address
 *  PUT    /users/addresses/:id             UpdateAddressDto -> Address
 *  DELETE /users/addresses/:id             -> { id }
 */
@ApiTags('addresses')
@ApiBearerAuth()
@Controller('users/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}
}
