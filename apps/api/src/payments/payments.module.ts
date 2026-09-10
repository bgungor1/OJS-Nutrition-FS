import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { IyzicoPaymentProvider } from './providers/iyzico-payment.provider';

@Module({
  providers: [PaymentsService, MockPaymentProvider, IyzicoPaymentProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
