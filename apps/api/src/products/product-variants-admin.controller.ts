import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { ApiProductDetailDto, CreateVariantDto, UpdateVariantDto } from './dto';
import { ApiProductDetail } from './interfaces/product-response.interface';
import { ProductVariantsAdminService } from './product-variants-admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('products')
export class ProductVariantsAdminController {
  constructor(
    private readonly variantsAdminService: ProductVariantsAdminService,
  ) {}

  @Post(':id/variants')
  @ApiOperation({
    summary: '[Admin] Ürüne varyant ekle',
  })
  @ApiParam({ name: 'id', description: 'Ürün UUID' })
  @ApiResponse({
    status: 201,
    description: 'Varyant oluşturuldu.',
    type: ApiProductDetailDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Fiyat tutarsızlığı veya geçersiz payload.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün bulunamadı.',
    type: ErrorResponseDto,
  })
  async createVariant(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: CreateVariantDto,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ): Promise<ApiProductDetail> {
    return this.variantsAdminService.createVariant(productId, dto, user.id, ip);
  }

  @Patch(':id/variants/:variantId')
  @ApiOperation({
    summary: '[Admin] Varyantı kısmi güncelle',
  })
  @ApiParam({ name: 'id', description: 'Ürün UUID' })
  @ApiParam({ name: 'variantId', description: 'Varyant UUID' })
  @ApiResponse({
    status: 200,
    description: 'Varyant güncellendi.',
    type: ApiProductDetailDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Fiyat tutarsızlığı veya geçersiz payload.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün veya varyant bulunamadı.',
    type: ErrorResponseDto,
  })
  async updateVariant(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateVariantDto,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ): Promise<ApiProductDetail> {
    return this.variantsAdminService.updateVariant(
      productId,
      variantId,
      dto,
      user.id,
      ip,
    );
  }

  @Delete(':id/variants/:variantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '[Admin] Ürün varyantını sil',
  })
  @ApiParam({ name: 'id', description: 'Ürün UUID' })
  @ApiParam({ name: 'variantId', description: 'Varyant UUID' })
  @ApiResponse({ status: 204, description: 'Varyant silindi.' })
  @ApiResponse({
    status: 400,
    description: 'Siparişlerde referanslanan varyant silinemez.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün veya varyant bulunamadı.',
    type: ErrorResponseDto,
  })
  async deleteVariant(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ): Promise<void> {
    return this.variantsAdminService.deleteVariant(
      productId,
      variantId,
      user.id,
      ip,
    );
  }
}
