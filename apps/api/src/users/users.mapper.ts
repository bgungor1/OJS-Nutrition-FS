import { Prisma, User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccountProfile } from './interfaces/account-profile.interface';

export class UsersMapper {
  static toAccountProfile(
    user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'phoneNumber'>,
  ): AccountProfile {
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone_number: user.phoneNumber,
    };
  }

  static toPrismaUpdateInput(dto: UpdateProfileDto): Prisma.UserUpdateInput {
    const data: Prisma.UserUpdateInput = {};

    if (dto.first_name !== undefined) {
      data.firstName = dto.first_name;
    }
    if (dto.last_name !== undefined) {
      data.lastName = dto.last_name;
    }
    if (dto.phone_number !== undefined) {
      data.phoneNumber = dto.phone_number;
    }

    return data;
  }
}
