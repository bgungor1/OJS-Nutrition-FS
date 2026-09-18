import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { ProductsAdminController } from './products-admin.controller';
import { ProductsAdminService } from './products-admin.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [
    ProductsController,
    ProductsAdminController,
    CategoriesController,
  ],
  providers: [ProductsService, ProductsAdminService],
  exports: [ProductsService, ProductsAdminService],
})
export class ProductsModule {}
