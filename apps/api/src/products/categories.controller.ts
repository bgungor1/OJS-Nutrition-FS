import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheControl, HTTP_CACHE_DIRECTIVES, Public } from '../common';
import { CategoryTreeDto } from './dto';
import { CategoryTree } from './interfaces/product-response.interface';
import { ProductsService } from './products.service';

@ApiTags('categories')
@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @CacheControl(HTTP_CACHE_DIRECTIVES.CATEGORIES)
  @ApiOperation({
    summary: 'Alt kategorileriyle birlikte hiyerarşik kategori ağacını döner',
  })
  @ApiResponse({
    status: 200,
    description: 'Kategori listesi başarıyla getirildi',
    type: [CategoryTreeDto],
  })
  async categories(): Promise<CategoryTree[]> {
    return this.productsService.categories();
  }
}
