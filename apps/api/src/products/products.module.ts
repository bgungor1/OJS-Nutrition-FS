import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { ProductVariantsAdminController } from './product-variants-admin.controller';
import { ProductVariantsAdminService } from './product-variants-admin.service';
import { ProductsAdminController } from './products-admin.controller';
import { ProductsAdminService } from './products-admin.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [
    ProductsController,
    ProductsAdminController,
    ProductVariantsAdminController,
    CategoriesController,
  ],
  providers: [
    ProductsService,
    ProductsAdminService,
    ProductVariantsAdminService,
  ],
  exports: [ProductsService, ProductsAdminService, ProductVariantsAdminService],
})
export class ProductsModule {}
