import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import {
  clearGuestCartCookie,
  GUEST_CART_COOKIE,
  resolveCartSession,
} from './cart-session.helper';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { CartItemResponseDto } from './interfaces/cart-item-response.interface';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Public()
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sepeti getir (kullanıcı veya misafir)' })
  @ApiResponse({
    status: 200,
    description: 'Sepet kalemleri başarıyla getirildi.',
    type: [CartItemResponseDto],
  })
  async getCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CartItemResponseDto[]> {
    const session = resolveCartSession(req, res, user);
    return this.cartService.getCart(session);
  }

  @Post()
  @Public()
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sepete ürün ekle veya adedini artır' })
  @ApiResponse({
    status: 200,
    description: 'Ürün sepete eklendi, güncel sepet listesi döndürüldü.',
    type: [CartItemResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Yetersiz stok veya satışa kapalı ürün.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün veya varyant bulunamadı.',
  })
  async addToCart(
    @Body() dto: AddToCartDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CartItemResponseDto[]> {
    const session = resolveCartSession(req, res, user);
    return this.cartService.addToCart(session, dto);
  }

  @Delete()
  @Public()
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sepetten ürün eksilt veya sil' })
  @ApiResponse({
    status: 200,
    description:
      'Ürün sepetten eksiltildi/silindi, güncel sepet listesi döndürüldü.',
    type: [CartItemResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün sepette bulunamadı.',
  })
  async removeFromCart(
    @Body() dto: RemoveFromCartDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CartItemResponseDto[]> {
    const session = resolveCartSession(req, res, user);
    return this.cartService.removeFromCart(session, dto);
  }

  @Delete('clear')
  @Public()
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sepeti tamamen temizle' })
  @ApiResponse({
    status: 200,
    description: 'Sepet temizlendi, boş liste döndürüldü.',
    type: [CartItemResponseDto],
  })
  async clearCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<CartItemResponseDto[]> {
    const session = resolveCartSession(req, res, user);
    return this.cartService.clearCart(session);
  }

  @Post('merge')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Misafir sepetini oturum açmış kullanıcı sepetiyle birleştir',
  })
  @ApiResponse({
    status: 200,
    description: 'Sepet başarıyla birleştirildi ve misafir çerezi temizlendi.',
    type: [CartItemResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token zorunludur.',
  })
  async mergeGuestCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CartItemResponseDto[]> {
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const rawGuestId = cookies?.[GUEST_CART_COOKIE];
    const guestSessionId =
      typeof rawGuestId === 'string' && rawGuestId.trim().length > 0
        ? rawGuestId.trim()
        : undefined;

    const mergedCart = await this.cartService.mergeGuestCart(
      user.id,
      guestSessionId,
    );

    clearGuestCartCookie(res);

    return mergedCart;
  }
}
