import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { IyzicoPaymentProvider } from './providers/iyzico-payment.provider';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { IyzicoWebhookGuard } from './guards/iyzico-webhook.guard';

@Module({
  controllers: [PaymentsWebhookController],
  providers: [
    PaymentsService,
    MockPaymentProvider,
    IyzicoPaymentProvider,
    IyzicoWebhookGuard,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
