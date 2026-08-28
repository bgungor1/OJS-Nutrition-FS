import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';

/**
 * BACKEND_PLAN §5.3 — @Public():
 *  GET /products?limit=&offset=&category=  -> { count, next, previous, results }
 *  GET /products/best-sellers              -> ApiBestSellerProduct[]
 *  GET /products/:slug                     -> ApiProductDetail
 *  GET /categories                         -> Category[]   (ayrı controller path)
 *
 * Admin mutasyonları (POST/PUT/DELETE /products, /products/:id/variants/...)
 * aynı controller'a @Roles('admin') ile eklenir — BACKEND_PLAN §5.10.
 */
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
}
