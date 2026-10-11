import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Prisma } from '@prisma/client';
import { CACHE_KEYS, CACHE_TTL } from '../common/constants';
import { PrismaService } from '../prisma';
import { CreateFaqDto, FaqQueryDto, UpdateFaqDto } from './dto';
import { ApiFaqItem } from './interfaces';
import { FaqMapper } from './faq.mapper';

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(CACHE_MANAGER)
    private readonly cacheManager?: Cache,
  ) {}

  async findAll(query?: FaqQueryDto): Promise<ApiFaqItem[]> {
    const cacheKey = CACHE_KEYS.FAQ_LIST(query?.category);
    if (this.cacheManager) {
      try {
        const cached = await this.cacheManager.get<ApiFaqItem[]>(cacheKey);
        if (cached) {
          return cached;
        }
      } catch {}
    }

    const where = query?.category ? { category: query.category } : {};

    const items = await this.prisma.faqItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    const result = FaqMapper.toApiFaqList(items);

    if (this.cacheManager) {
      try {
        await this.cacheManager.set(cacheKey, result, CACHE_TTL.FAQ_MS);
      } catch {}
    }

    return result;
  }

  async findById(id: string): Promise<ApiFaqItem> {
    const cacheKey = CACHE_KEYS.FAQ_ITEM(id);
    if (this.cacheManager) {
      try {
        const cached = await this.cacheManager.get<ApiFaqItem>(cacheKey);
        if (cached) {
          return cached;
        }
      } catch {}
    }

    const item = await this.prisma.faqItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('SSS maddesi bulunamadı.');
    }

    const result = FaqMapper.toApiFaqItem(item);

    if (this.cacheManager) {
      try {
        await this.cacheManager.set(cacheKey, result, CACHE_TTL.FAQ_MS);
      } catch {}
    }

    return result;
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

    await this.invalidateCache();

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

    await this.invalidateCache(id);

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

    await this.invalidateCache(id);

    this.logger.warn(`[FAQ_DELETED] ID: ${id}`);

    return { id };
  }

  async invalidateCache(id?: string): Promise<void> {
    if (!this.cacheManager) return;
    try {
      const keys = [
        CACHE_KEYS.FAQ_LIST(),
        CACHE_KEYS.FAQ_LIST('genel'),
        CACHE_KEYS.FAQ_LIST('urunler'),
        CACHE_KEYS.FAQ_LIST('kargo'),
      ];
      if (id) {
        keys.push(CACHE_KEYS.FAQ_ITEM(id));
      }
      await Promise.allSettled(keys.map((k) => this.cacheManager!.del(k)));
    } catch {}
  }
}
