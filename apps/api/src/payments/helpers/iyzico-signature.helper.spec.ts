import { createHmac } from 'crypto';
import {
  generateIyzicoAuthHeaders,
  verifyIyzicoWebhookSignature,
} from './iyzico-signature.helper';
import { WEBHOOK_TIMESTAMP_TOLERANCE_MS } from '../payment.constants';

describe('IyzicoSignatureHelper', () => {
  const apiKey = 'test-api-key';
  const secretKey = 'test-secret-key';
  const samplePayload = JSON.stringify({
    status: 'SUCCESS',
    paymentId: '12345678',
  });

  describe('generateIyzicoAuthHeaders', () => {
    it('should generate valid authorization headers with IYZWS prefix and random string', () => {
      const headers = generateIyzicoAuthHeaders(
        apiKey,
        secretKey,
        samplePayload,
      );

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers.Accept).toBe('application/json');
      expect(headers.Authorization).toMatch(/^IYZWS test-api-key:.+/);
      expect(headers['x-iyzi-rnd']).toBeDefined();
      expect(typeof headers['x-iyzi-rnd']).toBe('string');
    });

    it('should correctly accept object body and serialize it', () => {
      const bodyObj = { status: 'SUCCESS', paymentId: '12345678' };
      const headers = generateIyzicoAuthHeaders(apiKey, secretKey, bodyObj);

      expect(headers.Authorization).toMatch(/^IYZWS test-api-key:.+/);
    });

    it('should generate unique random string and signatures on consecutive calls', () => {
      const headers1 = generateIyzicoAuthHeaders(
        apiKey,
        secretKey,
        samplePayload,
      );
      const headers2 = generateIyzicoAuthHeaders(
        apiKey,
        secretKey,
        samplePayload,
      );

      expect(headers1['x-iyzi-rnd']).not.toBe(headers2['x-iyzi-rnd']);
      expect(headers1.Authorization).not.toBe(headers2.Authorization);
    });
  });

  describe('verifyIyzicoWebhookSignature', () => {
    it('should return true when hex signature matches payload HMAC', () => {
      const validHexSignature = createHmac('sha256', secretKey)
        .update(samplePayload)
        .digest('hex');

      const isValid = verifyIyzicoWebhookSignature(
        secretKey,
        samplePayload,
        validHexSignature,
      );

      expect(isValid).toBe(true);
    });

    it('should return true when base64 signature matches payload HMAC', () => {
      const validBase64Signature = createHmac('sha256', secretKey)
        .update(samplePayload)
        .digest('base64');

      const isValid = verifyIyzicoWebhookSignature(
        secretKey,
        samplePayload,
        validBase64Signature,
      );

      expect(isValid).toBe(true);
    });

    it('should return false when signature is forged or invalid', () => {
      const isValid = verifyIyzicoWebhookSignature(
        secretKey,
        samplePayload,
        'forged_invalid_signature_hex_123456',
      );

      expect(isValid).toBe(false);
    });

    it('should return false when payload or secretKey is empty', () => {
      expect(verifyIyzicoWebhookSignature('', samplePayload, 'sig')).toBe(
        false,
      );
      expect(verifyIyzicoWebhookSignature(secretKey, '', 'sig')).toBe(false);
      expect(verifyIyzicoWebhookSignature(secretKey, samplePayload, '')).toBe(
        false,
      );
    });

    it('should return false when timestamp is older than tolerance (replay attack protection)', () => {
      const validHexSignature = createHmac('sha256', secretKey)
        .update(samplePayload)
        .digest('hex');

      const expiredTimestamp = (
        Date.now() -
        (WEBHOOK_TIMESTAMP_TOLERANCE_MS + 10_000)
      ).toString();

      const isValid = verifyIyzicoWebhookSignature(
        secretKey,
        samplePayload,
        validHexSignature,
        expiredTimestamp,
      );

      expect(isValid).toBe(false);
    });

    it('should return true when timestamp is within the tolerance window', () => {
      const validHexSignature = createHmac('sha256', secretKey)
        .update(samplePayload)
        .digest('hex');

      const recentTimestamp = (Date.now() - 5_000).toString();

      const isValid = verifyIyzicoWebhookSignature(
        secretKey,
        samplePayload,
        validHexSignature,
        recentTimestamp,
      );

      expect(isValid).toBe(true);
    });
  });
});
