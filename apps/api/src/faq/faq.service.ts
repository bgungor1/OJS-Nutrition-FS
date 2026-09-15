import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateFaqDto, FaqQueryDto, UpdateFaqDto } from './dto';
import { ApiFaqItem } from './interfaces';
import { FaqMapper } from './faq.mapper';

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: FaqQueryDto): Promise<ApiFaqItem[]> {
    const where = query?.category ? { category: query.category } : {};

    const items = await this.prisma.faqItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return FaqMapper.toApiFaqList(items);
  }

  async findById(id: string): Promise<ApiFaqItem> {
    const item = await this.prisma.faqItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('SSS maddesi bulunamadı.');
    }

    return FaqMapper.toApiFaqItem(item);
  }

  async create(dto: CreateFaqDto): Promise<ApiFaqItem> {
    const item = await this.prisma.faqItem.create({
      data: {
        question: dto.question.trim(),
        answer: dto.answer.trim(),
        category: dto.category,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    this.logger.log(
      `[FAQ_CREATED] ID: ${item.id} | Category: ${item.category}`,
    );

    return FaqMapper.toApiFaqItem(item);
  }

  async update(id: string, dto: UpdateFaqDto): Promise<ApiFaqItem> {
    const existing = await this.prisma.faqItem.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('SSS maddesi bulunamadı.');
    }

    const data: Prisma.FaqItemUpdateInput = {};
    if (dto.question !== undefined) data.question = dto.question.trim();
    if (dto.answer !== undefined) data.answer = dto.answer.trim();
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    const item = await this.prisma.faqItem.update({
      where: { id },
      data,
    });

    this.logger.log(`[FAQ_UPDATED] ID: ${id}`);

    return FaqMapper.toApiFaqItem(item);
  }

  async delete(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.faqItem.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('SSS maddesi bulunamadı.');
    }

    await this.prisma.faqItem.delete({
      where: { id },
    });

    this.logger.warn(`[FAQ_DELETED] ID: ${id}`);

    return { id };
  }
}
