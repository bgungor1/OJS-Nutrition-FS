import { Injectable } from '@nestjs/common';

/**
 * Faz 2 — BACKEND_PLAN §5.5. Sepet hem kullanıcı hem misafir için server-side.
 * Misafir: guest_cart_id HttpOnly cookie. mergeGuestCart(userId, guestId):
 * login/register sonrası çağrılır, aynı varyantta pieces toplanır.
 * XOR (userId | guestSessionId) servis katmanında garanti edilir.
 */
@Injectable()
export class CartService {}
