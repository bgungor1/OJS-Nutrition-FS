import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_CURRENCY,
  PAYMENT_STATUS,
  PaymentProviderName,
  SUPPORTED_CARD_TYPES,
  SUPPORTED_PAYMENT_TYPES,
} from './payment.constants';
import {
  PaymentChargeRequest,
  PaymentChargeResult,
  PaymentRefundRequest,
  PaymentRefundResult,
  PaymentSettingsResponse,
} from './interfaces/payment-process.interface';
import { IPaymentProvider } from './interfaces/payment-provider.interface';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { IyzicoPaymentProvider } from './providers/iyzico-payment.provider';
import { AppConfig } from '../config/configuration';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

export type ProviderOverride = 'mock' | 'iyzico';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly mockProvider: MockPaymentProvider,
    private readonly iyzicoProvider: IyzicoPaymentProvider,
  ) {}

  getProvider(override?: ProviderOverride): IPaymentProvider {
    if (override === 'mock') return this.mockProvider;
    if (override === 'iyzico') return this.iyzicoProvider;

    const nodeEnv =
      this.configService.get('nodeEnv', { infer: true }) ??
      process.env.NODE_ENV;

    if (nodeEnv === 'test') return this.mockProvider;

    return this.iyzicoProvider.isConfigured()
      ? this.iyzicoProvider
      : this.mockProvider;
  }

  getPaymentSettings(): PaymentSettingsResponse {
    return {
      card_types: [...SUPPORTED_CARD_TYPES],
      payment_types: [...SUPPORTED_PAYMENT_TYPES],
      currency: DEFAULT_CURRENCY,
    };
  }

  async charge(
    request: PaymentChargeRequest,
    providerOverride?: ProviderOverride,
  ): Promise<PaymentChargeResult> {
    const provider = this.getProvider(providerOverride);
    const start = performance.now();

    try {
      const result = await provider.charge(request);
      this.logAudit('CHARGE', start, {
        provider: provider.providerName,
        orderNo: request.orderNo,
        amount: request.amount,
        currency: request.currency || DEFAULT_CURRENCY,
        status: result.rawStatus,
        last4: result.last4,
        cardType: result.cardType,
        errorMessage: result.errorMessage,
      });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown charge error';
      this.logAudit('CHARGE', start, {
        provider: provider.providerName,
        orderNo: request.orderNo,
        amount: request.amount,
        currency: request.currency || DEFAULT_CURRENCY,
        status: PAYMENT_STATUS.FAILED,
        errorMessage,
      });
      return this.buildChargeFailure(provider.providerName, errorMessage);
    }
  }

  async refund(
    request: PaymentRefundRequest,
    providerOverride?: ProviderOverride,
  ): Promise<PaymentRefundResult> {
    const provider = this.getProvider(providerOverride);
    const start = performance.now();

    try {
      const result = await provider.refund(request);
      this.logAudit('REFUND', start, {
        provider: provider.providerName,
        providerRef: request.providerRef,
        amount: request.amount,
        status: result.rawStatus,
        errorMessage: result.errorMessage,
      });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown refund error';
      this.logAudit('REFUND', start, {
        provider: provider.providerName,
        providerRef: request.providerRef,
        amount: request.amount,
        status: PAYMENT_STATUS.FAILED,
        errorMessage,
      });
      return {
        success: false,
        refundId: '',
        rawStatus: PAYMENT_STATUS.FAILED,
        errorMessage,
      };
    }
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp?: string,
  ): boolean {
    return this.getProvider().verifyWebhookSignature(
      payload,
      signature,
      timestamp,
    );
  }

  handleWebhook(dto: PaymentWebhookDto): {
    received: boolean;
    status: string;
  } {
    this.logger.log(
      `[PAYMENT_WEBHOOK] Acknowledged webhook notification: paymentId=${dto.paymentId} status=${dto.status} eventType=${dto.iyziEventType ?? 'DEFAULT'}`,
    );
    return {
      received: true,
      status: dto.status,
    };
  }

  private buildChargeFailure(
    provider: PaymentProviderName,
    errorMessage: string,
  ): PaymentChargeResult {
    return {
      success: false,
      provider,
      providerRef: '',
      cardType: 'unknown',
      last4: '****',
      rawStatus: PAYMENT_STATUS.FAILED,
      errorCode: 'PAYMENT_PROCESSING_ERROR',
      errorMessage,
    };
  }

  private logAudit(
    action: 'CHARGE' | 'REFUND',
    start: number,
    details: Record<string, unknown>,
  ): void {
    const durationMs = Math.round(performance.now() - start);
    const payload = JSON.stringify({ action, ...details, durationMs });
    if (details.status === PAYMENT_STATUS.SUCCEEDED) {
      this.logger.log(`[PAYMENT_AUDIT] ${payload}`);
    } else {
      this.logger.warn(`[PAYMENT_AUDIT] ${payload}`);
    }
  }
}
