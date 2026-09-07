import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ProductsQueryDto } from './dto/products-query.dto';
import {
  ApiBestSellerProduct,
  ApiPaginatedProducts,
  ApiProductDetail,
} from './interfaces/product-response.interface';
import { ProductsService } from './products.service';

/**
 * BACKEND_PLAN §5.3 — Katalog ve Ürün Rotaları (@Public).
 * Controller yalnızca HTTP isteğini karşılar ve servise delege eder;
 * sıfır iş mantığı kuralı (ENGINEERING_STANDARDS §2).
 */
@ApiTags('products')
@Public()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Sayfalanmış, filtrelenmiş ve sıralanmış ürün listesini döner',
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün listesi başarıyla getirildi',
  })
  async list(@Query() query: ProductsQueryDto): Promise<ApiPaginatedProducts> {
    return this.productsService.list(query);
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Çok satan ürünleri döner' })
  @ApiResponse({
    status: 200,
    description: 'Çok satan ürünler listesi',
  })
  async bestSellers(): Promise<ApiBestSellerProduct[]> {
    return this.productsService.bestSellers();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Slug değerine göre ürün detayını varyantları ile döner',
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün detayı başarıyla getirildi',
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün bulunamadı',
  })
  async getBySlug(@Param('slug') slug: string): Promise<ApiProductDetail> {
    return this.productsService.getBySlug(slug);
  }
}
