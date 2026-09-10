import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PaymentsService } from '../src/payments/payments.service';
import { MOCK_VALID_WEBHOOK_SIGNATURE } from '../src/payments/providers/mock-payment.provider';
import { PaymentChargeRequest } from '../src/payments/interfaces/payment-process.interface';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ApiErrorResponse {
  status: 'error';
  message?: string;
  reason?: Record<string, string[]>;
}

describe('Payments E2E Test Suite (/api/v1/payments)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let paymentsService: PaymentsService;

  const sampleChargeRequest: PaymentChargeRequest = {
    paymentToken: 'tok_default',
    amount: 1250,
    currency: 'TRY',
    orderNo: 'ORD-E2E-1001',
    buyer: {
      id: 'usr-e2e-1',
      name: 'Berk',
      surname: 'Güngör',
      email: 'berk@example.com',
      registrationAddress: 'Bağdat Caddesi No: 100',
      city: 'Istanbul',
      country: 'Turkey',
      ip: '127.0.0.1',
    },
    shippingAddress: {
      contactName: 'Berk Güngör',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Bağdat Caddesi No: 100',
    },
    billingAddress: {
      contactName: 'Berk Güngör',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Bağdat Caddesi No: 100',
    },
    items: [
      {
        id: 'item-101',
        name: 'Whey Isolate Protein',
        category: 'Protein',
        price: 1250,
      },
    ],
  };

  beforeAll(async () => {
    const mockPrisma = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
    server = app.getHttpServer() as Parameters<typeof request>[0];
    paymentsService = app.get<PaymentsService>(PaymentsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/payments/webhook', () => {
    it('should return 401 when webhook signature header is missing', async () => {
      const response: SupertestResponse = await request(server)
        .post('/api/v1/payments/webhook')
        .send({
          status: 'SUCCESS',
          paymentId: 'iyz_pay_123',
        })
        .expect(401);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toBe('Missing payment webhook signature.');
    });

    it('should return 401 when webhook signature is invalid', async () => {
      const response: SupertestResponse = await request(server)
        .post('/api/v1/payments/webhook')
        .set('x-iyzico-signature', 'invalid_signature_hash')
        .send({
          status: 'SUCCESS',
          paymentId: 'iyz_pay_123',
        })
        .expect(401);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.message).toBe('Invalid payment webhook signature.');
    });

    it('should return 400 when signature is valid but body fails validation', async () => {
      const response: SupertestResponse = await request(server)
        .post('/api/v1/payments/webhook')
        .set('x-iyzico-signature', MOCK_VALID_WEBHOOK_SIGNATURE)
        .send({
          status: '',
          paymentId: '',
        })
        .expect(400);

      const body = response.body as ApiErrorResponse;
      expect(body.status).toBe('error');
      expect(body.reason).toBeDefined();
    });

    it('should return 200 and acknowledge valid webhook event', async () => {
      const payload = {
        status: 'SUCCESS',
        paymentId: 'iyz_pay_987654',
        conversationId: 'ORD-E2E-1001',
        iyziEventType: 'CHECKOUT_FORM_AUTH',
      };

      const response: SupertestResponse = await request(server)
        .post('/api/v1/payments/webhook')
        .set('x-iyzico-signature', MOCK_VALID_WEBHOOK_SIGNATURE)
        .send(payload)
        .expect(200);

      const body = response.body as ApiSuccessResponse<{
        received: boolean;
        status: string;
      }>;
      expect(body.status).toBe('success');
      expect(body.data).toEqual({
        received: true,
        status: 'SUCCESS',
      });
    });

    it('should accept alternative signature header x-iyzi-signature', async () => {
      const response: SupertestResponse = await request(server)
        .post('/api/v1/payments/webhook')
        .set('x-iyzi-signature', MOCK_VALID_WEBHOOK_SIGNATURE)
        .send({
          status: 'FAILURE',
          paymentId: 'iyz_pay_failed_1',
        })
        .expect(200);

      const body = response.body as ApiSuccessResponse<{
        received: boolean;
        status: string;
      }>;
      expect(body.status).toBe('success');
      expect(body.data.received).toBe(true);
    });
  });

  describe('PaymentsService Integration Lifecycle', () => {
    it('should retrieve payment settings with supported card types', () => {
      const settings = paymentsService.getPaymentSettings();

      expect(settings).toEqual({
        card_types: ['visa', 'mastercard', 'troy'],
        payment_types: ['credit_card', 'debit_card'],
        currency: 'TRY',
      });
    });

    it('should execute a successful charge using default mock token', async () => {
      const result = await paymentsService.charge(sampleChargeRequest);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('mock');
      expect(result.last4).toBe('4242');
      expect(result.rawStatus).toBe('succeeded');
      expect(result.providerRef).toContain('mock_pay_');
    });

    it('should simulate card decline when declined token is used', async () => {
      const result = await paymentsService.charge({
        ...sampleChargeRequest,
        paymentToken: 'tok_fail_declined',
      });

      expect(result.success).toBe(false);
      expect(result.rawStatus).toBe('failed');
      expect(result.errorCode).toBe('CARD_DECLINED');
      expect(result.errorMessage).toBe('The card was declined by the bank.');
    });

    it('should simulate insufficient funds when insufficient token is used', async () => {
      const result = await paymentsService.charge({
        ...sampleChargeRequest,
        paymentToken: 'tok_fail_insufficient',
      });

      expect(result.success).toBe(false);
      expect(result.rawStatus).toBe('failed');
      expect(result.errorCode).toBe('INSUFFICIENT_FUNDS');
      expect(result.errorMessage).toBe('Insufficient funds on the card.');
    });

    it('should gracefully handle timeout scenario without throwing unhandled exception', async () => {
      const result = await paymentsService.charge({
        ...sampleChargeRequest,
        paymentToken: 'tok_fail_timeout',
      });

      expect(result.success).toBe(false);
      expect(result.rawStatus).toBe('failed');
      expect(result.errorCode).toBe('PAYMENT_PROCESSING_ERROR');
      expect(result.errorMessage).toContain('Payment gateway timed out');
    });

    it('should process a successful refund for valid provider reference', async () => {
      const refundResult = await paymentsService.refund({
        providerRef: 'mock_pay_valid_tx',
        amount: 1250,
        currency: 'TRY',
      });

      expect(refundResult.success).toBe(true);
      expect(refundResult.rawStatus).toBe('refunded');
      expect(refundResult.refundId).toContain('mock_ref_');
    });

    it('should reject refund when provider reference indicates failure', async () => {
      const refundResult = await paymentsService.refund({
        providerRef: 'mock_fail_tx',
        amount: 1250,
        currency: 'TRY',
      });

      expect(refundResult.success).toBe(false);
      expect(refundResult.rawStatus).toBe('failed');
      expect(refundResult.errorMessage).toBe(
        'The refund operation was rejected by the provider.',
      );
    });
  });
});
