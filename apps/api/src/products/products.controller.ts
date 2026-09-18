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
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Sayfalanmış, filtrelenmiş ve sıralanmış ürün listesi',
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün listesi başarıyla getirildi.',
    type: ApiPaginatedProductsDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz sorgu parametresi.',
    type: ErrorResponseDto,
  })
  async list(@Query() query: ProductsQueryDto): Promise<ApiPaginatedProducts> {
    return this.productsService.list(query);
  }

  @Public()
  @Get('best-sellers')
  @ApiOperation({ summary: 'En çok satan ürünler listesi' })
  @ApiResponse({
    status: 200,
    description: 'En çok satanlar listesi getirildi.',
    type: [ApiBestSellerProductDto],
  })
  async bestSellers(): Promise<ApiBestSellerProduct[]> {
    return this.productsService.bestSellers();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({
    summary: 'Slug ile tekil ürün detayı ve varyantları',
  })
  @ApiParam({
    name: 'slug',
    description: 'Benzersiz ürün URL tanımlayıcısı',
    example: 'whey-protein',
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün detayı getirildi.',
    type: ApiProductDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün bulunamadı.',
    type: ErrorResponseDto,
  })
  async getBySlug(@Param('slug') slug: string): Promise<ApiProductDetail> {
    return this.productsService.getBySlug(slug);
  }
}
