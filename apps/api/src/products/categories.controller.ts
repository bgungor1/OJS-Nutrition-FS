import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CategoryTree } from './interfaces/product-response.interface';
import { ProductsService } from './products.service';

/**
 * BACKEND_PLAN §5.3 — Kategori Rotaları (@Public).
 * Frontend Next.js dinamik route generateStaticParams ve kategori menüsü için kullanılır.
 */
@ApiTags('categories')
@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Alt kategorileriyle birlikte hiyerarşik kategori ağacını döner',
  })
  @ApiResponse({
    status: 200,
    description: 'Kategori listesi başarıyla getirildi',
  })
  async categories(): Promise<CategoryTree[]> {
    return this.productsService.categories();
  }
}
