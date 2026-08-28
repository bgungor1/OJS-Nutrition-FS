import { Injectable } from '@nestjs/common';

/**
 * Faz 2 — BACKEND_PLAN §5.6.
 *  - list/get: userId scope (IDOR)
 *  - paymentSettings(): { card_types, payment_types }
 *  - calculateShipmentFee(addressId): { fee, currency }
 *  - completeShopping(dto): prisma.$transaction içinde — atomik koşullu stok
 *    update (updateMany + where stockQuantity >= pieces, count === 0 -> rollback),
 *    Order + OrderItem + PaymentTransaction. Bkz. §5.6.1.
 * OrdersService orkestrasyon yapar; ödeme PaymentsService'e delege edilir
 * (god service değil — ENGINEERING_STANDARDS §1).
 */
@Injectable()
export class OrdersService {}
