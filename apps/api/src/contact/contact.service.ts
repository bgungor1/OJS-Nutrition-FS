import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CONTACT_PAGINATION } from './contact.constants';
import { ContactQueryDto, CreateContactDto, UpdateContactDto } from './dto';
import {
  ContactListResponse,
  ContactMessageResponse,
  ContactSubmitResponse,
} from './interfaces';
import { ContactMapper } from './contact.mapper';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly prisma: PrismaService) {}

  async submit(dto: CreateContactDto): Promise<ContactSubmitResponse> {
    const contactMessage = await this.prisma.contactMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        message: dto.message.trim(),
        handled: false,
      },
    });

    this.logger.log(
      `[CONTACT_SUBMITTED] ID: ${contactMessage.id} | Email: ${contactMessage.email}`,
    );

    return {
      id: contactMessage.id,
      message: 'Mesajınız alındı',
    };
  }

  async findAll(query?: ContactQueryDto): Promise<ContactListResponse> {
    const limit = query?.limit ?? CONTACT_PAGINATION.DEFAULT_LIMIT;
    const offset = query?.offset ?? CONTACT_PAGINATION.DEFAULT_OFFSET;

    const where: Prisma.ContactMessageWhereInput = {};
    if (query?.handled !== undefined) {
      where.handled = query.handled;
    }

    const [items, count] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return ContactMapper.toContactListResponse(count, items);
  }

  async findById(id: string): Promise<ContactMessageResponse> {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('İletişim mesajı bulunamadı.');
    }

    return ContactMapper.toContactMessageResponse(message);
  }

  async update(
    id: string,
    dto: UpdateContactDto,
  ): Promise<ContactMessageResponse> {
    const existing = await this.prisma.contactMessage.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('İletişim mesajı bulunamadı.');
    }

    const updated = await this.prisma.contactMessage.update({
      where: { id },
      data: {
        handled: dto.handled,
      },
    });

    this.logger.log(
      `[CONTACT_STATUS_UPDATED] ID: ${id} | Handled: ${dto.handled}`,
    );

    return ContactMapper.toContactMessageResponse(updated);
  }

  async delete(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.contactMessage.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('İletişim mesajı bulunamadı.');
    }

    await this.prisma.contactMessage.delete({
      where: { id },
    });

    this.logger.warn(`[CONTACT_DELETED] ID: ${id}`);

    return { id };
  }
}
