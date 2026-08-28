import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

/**
 * BACKEND_PLAN §5.2 — Bearer:
 *  GET /users/my-account   -> AccountProfile
 *  PUT /users/my-account   UpdateProfileDto -> AccountProfile
 */
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
