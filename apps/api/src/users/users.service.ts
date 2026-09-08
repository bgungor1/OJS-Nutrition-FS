import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccountProfile } from './interfaces/account-profile.interface';
import { UsersMapper } from './users.mapper';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  private static readonly SAFE_USER_SELECT = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  async getMyAccount(userId: string): Promise<AccountProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: UsersService.SAFE_USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı hesabı bulunamadı.');
    }

    return UsersMapper.toAccountProfile(user);
  }

  async updateMyAccount(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<AccountProfile> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      throw new NotFoundException('Kullanıcı hesabı bulunamadı.');
    }

    const updateData = UsersMapper.toPrismaUpdateInput(dto);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: UsersService.SAFE_USER_SELECT,
    });

    const updatedFields = Object.keys(updateData);
    if (updatedFields.length > 0) {
      this.logger.log(
        `[Audit] User ${userId} updated profile: ${updatedFields.join(', ')}`,
      );
    }

    return UsersMapper.toAccountProfile(updatedUser);
  }
}
