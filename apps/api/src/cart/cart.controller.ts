import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';

/**
 * BACKEND_PLAN §5.5 — OptionalAuthGuard (POST /cart/merge Bearer):
 *  GET    /cart          -> CartItem[]
 *  POST   /cart          { product_id, product_variant_id, pieces } -> CartItem[]
 *  DELETE /cart          { product_id, product_variant_id, pieces } -> CartItem[]
 *  POST   /cart/merge    -> CartItem[]
 * product_id her yerde string.
 */
@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
}
