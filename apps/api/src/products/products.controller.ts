import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ErrorResponseDto } from '../common/dto';
import {
  ApiBestSellerProductDto,
  ApiPaginatedProductsDto,
  ApiProductDetailDto,
  ProductsQueryDto,
} from './dto';
import {
  ApiBestSellerProduct,
  ApiPaginatedProducts,
  ApiProductDetail,
} from './interfaces/product-response.interface';
import { ProductsService } from './products.service';

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
    type: ApiPaginatedProductsDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz sorgu parametresi veya sayfalama sınır aşımı',
    type: ErrorResponseDto,
  })
  async list(@Query() query: ProductsQueryDto): Promise<ApiPaginatedProducts> {
    return this.productsService.list(query);
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Çok satan ürünleri döner' })
  @ApiResponse({
    status: 200,
    description: 'Çok satan ürünler listesi',
    type: [ApiBestSellerProductDto],
  })
  async bestSellers(): Promise<ApiBestSellerProduct[]> {
    return this.productsService.bestSellers();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Slug değerine göre ürün detayını varyantları ile döner',
  })
  @ApiParam({
    name: 'slug',
    description: 'Ürünün URL dostu benzersiz tanıtıcısı',
    example: 'whey-protein',
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün detayı başarıyla getirildi',
    type: ApiProductDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün bulunamadı',
    type: ErrorResponseDto,
  })
  async getBySlug(@Param('slug') slug: string): Promise<ApiProductDetail> {
    return this.productsService.getBySlug(slug);
  }
}
