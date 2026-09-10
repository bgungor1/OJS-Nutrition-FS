import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaymentWebhookDto } from './payment-webhook.dto';

describe('PaymentWebhookDto', () => {
  it('should pass validation when required fields (status, paymentId) are provided', async () => {
    const payload = {
      status: 'SUCCESS',
      paymentId: '12345678',
    };
    const dto = plainToInstance(PaymentWebhookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation when all optional fields are provided', async () => {
    const payload = {
      status: 'SUCCESS',
      paymentId: '12345678',
      conversationId: 'ORD-2026-000001',
      iyziEventType: 'THREEDS_AUTH',
      iyziReferenceCode: 'REF-999',
      token: 'tok_sandbox_123',
    };
    const dto = plainToInstance(PaymentWebhookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation when status is missing or empty', async () => {
    const payload = {
      paymentId: '12345678',
    };
    const dto = plainToInstance(PaymentWebhookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const statusError = errors.find((e) => e.property === 'status');
    expect(statusError).toBeDefined();
    expect(statusError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when paymentId is missing or empty', async () => {
    const payload = {
      status: 'SUCCESS',
      paymentId: '',
    };
    const dto = plainToInstance(PaymentWebhookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const paymentIdError = errors.find((e) => e.property === 'paymentId');
    expect(paymentIdError).toBeDefined();
    expect(paymentIdError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when properties are not of string type', async () => {
    const payload = {
      status: 12345,
      paymentId: true,
    };
    const dto = plainToInstance(PaymentWebhookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const statusError = errors.find((e) => e.property === 'status');
    const paymentIdError = errors.find((e) => e.property === 'paymentId');
    expect(statusError?.constraints).toHaveProperty('isString');
    expect(paymentIdError?.constraints).toHaveProperty('isString');
  });
});
