import { Injectable } from '@nestjs/common';

/**
 * Faz 2 — BACKEND_PLAN §6. iyzico entegrasyonu.
 *  - charge(paymentToken, amount): frontend'in iyzico client-SDK'sından aldığı
 *    tek kullanımlık token'ı iyzico API'sine iletir.
 *  - Sonuç PaymentTransaction'a yazılır: sadece last4, cardType, providerRef,
 *    status. Ham PAN/CVV backend'e hiç ulaşmaz, loglanmaz.
 * Controller yok — yalnızca OrdersService tarafından çağrılır.
 */
@Injectable()
export class PaymentsService {}
