import { Injectable } from '@nestjs/common';

/**
 * Faz 1 — BACKEND_PLAN §5.3.
 *  - list({ limit, offset, category }): { count, next, previous, results }
 *  - getBySlug(slug): ApiProductDetail (variants dahil, tek sorgu — include)
 *  - bestSellers(): ApiBestSellerProduct[]
 *  - categories(): Category[] (subCategories dahil)
 * price_info (total_price, discounted_price, discount_percentage, profit,
 * price_per_servings) BACKEND'DE hesaplanır. is_available = isAvailable &&
 * stockQuantity > 0.
 */
@Injectable()
export class ProductsService {}
