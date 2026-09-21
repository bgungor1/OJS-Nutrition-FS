import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ErrorResponseDto } from '../common/dto';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { ApiProductDetailDto, CreateProductDto, UpdateProductDto } from './dto';
import { ApiProductDetail } from './interfaces/product-response.interface';
import { ProductsAdminService } from './products-admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('products')
export class ProductsAdminController {
  constructor(private readonly adminService: ProductsAdminService) {}

  @Post()
  @ApiOperation({
    summary: '[Admin] Yeni ürün oluştur',
    description: 'Varyantsız ürün oluşturur. Varyantlar ayrı uçtan eklenir.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ürün başarıyla oluşturuldu.',
    type: ApiProductDetailDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Bu slug ile kayıtlı ürün zaten mevcut.',
    type: ErrorResponseDto,
  })
  async createProduct(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ): Promise<ApiProductDetail> {
    return this.adminService.createProduct(dto, user.id, ip);
  }

  @Put(':id')
  @ApiOperation({
    summary: '[Admin] Ürün alanlarını güncelle (kısmi)',
  })
  @ApiParam({ name: 'id', description: 'Ürün UUID' })
  @ApiResponse({
    status: 200,
    description: 'Ürün güncellendi.',
    type: ApiProductDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün bulunamadı.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'İstenen slug zaten kullanımda.',
    type: ErrorResponseDto,
  })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ): Promise<ApiProductDetail> {
    return this.adminService.updateProduct(id, dto, user.id, ip);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '[Admin] Ürün ve varyantlarını sil',
    description:
      'Referential integrity guard: Sipariş geçmişinde yer alan ürünler silinemez.',
  })
  @ApiParam({ name: 'id', description: 'Ürün UUID' })
  @ApiResponse({ status: 204, description: 'Ürün başarıyla silindi.' })
  @ApiResponse({
    status: 400,
    description: 'Siparişlerde referanslanan ürün silinemez.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün bulunamadı.',
    type: ErrorResponseDto,
  })
  async deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ): Promise<void> {
    return this.adminService.deleteProduct(id, user.id, ip);
  }
}
