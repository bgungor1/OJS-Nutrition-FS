import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PAYMENT_PROVIDERS,
  PAYMENT_STATUS,
  PaymentProviderName,
} from '../payment.constants';
import {
  PaymentChargeRequest,
  PaymentChargeResult,
  PaymentRefundRequest,
  PaymentRefundResult,
} from '../interfaces/payment-process.interface';
import { IPaymentProvider } from '../interfaces/payment-provider.interface';
import {
  generateIyzicoAuthHeaders,
  verifyIyzicoWebhookSignature,
} from '../helpers/iyzico-signature.helper';
import {
  buildIyzicoChargePayload,
  buildIyzicoRefundPayload,
  mapIyzicoChargeResponse,
  mapIyzicoRefundResponse,
  IyzicoRawResponse,
} from '../helpers/iyzico-request.builder';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class IyzicoPaymentProvider implements IPaymentProvider {
  readonly providerName: PaymentProviderName = PAYMENT_PROVIDERS.IYZICO;
  private readonly logger = new Logger(IyzicoPaymentProvider.name);

  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    this.apiKey =
      this.configService.get('iyzico.apiKey', { infer: true }) ?? '';
    this.secretKey =
      this.configService.get('iyzico.secretKey', { infer: true }) ?? '';
    this.baseUrl =
      this.configService.get('iyzico.baseUrl', { infer: true }) ??
      'https://sandbox-api.iyzipay.com';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.secretKey);
  }

  async charge(request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    if (!this.apiKey || !this.secretKey) {
      this.logger.warn(
        'iyzico API keys are missing. Cannot process live charge.',
      );
      return {
        success: false,
        provider: this.providerName,
        providerRef: '',
        cardType: '',
        last4: '',
        rawStatus: PAYMENT_STATUS.FAILED,
        errorCode: 'CONFIG_ERROR',
        errorMessage: 'iyzico credentials are not configured.',
      };
    }

    try {
      const payload = buildIyzicoChargePayload(request);
      const headers = generateIyzicoAuthHeaders(
        this.apiKey,
        this.secretKey,
        payload,
      );

      const response = await fetch(`${this.baseUrl}/payment/auth`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as IyzicoRawResponse;
      return mapIyzicoChargeResponse(data, request.orderNo);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Network error contacting iyzico.';
      this.logger.error(`iyzico charge request error: ${errorMsg}`);

      return {
        success: false,
        provider: this.providerName,
        providerRef: '',
        cardType: '',
        last4: '',
        rawStatus: PAYMENT_STATUS.FAILED,
        errorCode: 'GATEWAY_ERROR',
        errorMessage: errorMsg,
      };
    }
  }

  async refund(request: PaymentRefundRequest): Promise<PaymentRefundResult> {
    if (!this.apiKey || !this.secretKey) {
      return {
        success: false,
        refundId: '',
        rawStatus: PAYMENT_STATUS.FAILED,
        errorMessage: 'iyzico credentials are not configured.',
      };
    }

    try {
      const payload = buildIyzicoRefundPayload(request);
      const headers = generateIyzicoAuthHeaders(
        this.apiKey,
        this.secretKey,
        payload,
      );

      const response = await fetch(`${this.baseUrl}/payment/refund`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as IyzicoRawResponse;
      return mapIyzicoRefundResponse(data, request.providerRef);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Network error contacting iyzico.';
      this.logger.error(`iyzico refund request error: ${errorMsg}`);

      return {
        success: false,
        refundId: '',
        rawStatus: PAYMENT_STATUS.FAILED,
        errorMessage: errorMsg,
      };
    }
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp?: string,
  ): boolean {
    return verifyIyzicoWebhookSignature(
      this.secretKey,
      payload,
      signature,
      timestamp,
    );
  }
}
