import { randomUUID, createHmac, timingSafeEqual } from 'crypto';
import {
  IYZICO_AUTH_HEADER_PREFIX,
  WEBHOOK_TIMESTAMP_TOLERANCE_MS,
} from '../payment.constants';

export interface IyzicoAuthHeaders {
  [key: string]: string;
  'Content-Type': string;
  Accept: string;
  Authorization: string;
  'x-iyzi-rnd': string;
}

export function generateIyzicoAuthHeaders(
  apiKey: string,
  secretKey: string,
  body: unknown,
): IyzicoAuthHeaders {
  const randomString = randomUUID();
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  const signatureData = apiKey + randomString + secretKey + bodyString;

  const hash = createHmac('sha256', secretKey)
    .update(signatureData)
    .digest('base64');

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `${IYZICO_AUTH_HEADER_PREFIX} ${apiKey}:${hash}`,
    'x-iyzi-rnd': randomString,
  };
}

export function verifyIyzicoWebhookSignature(
  secretKey: string,
  rawPayload: string,
  signature: string,
  timestamp?: string,
): boolean {
  if (!secretKey || !rawPayload || !signature) {
    return false;
  }

  if (timestamp) {
    const parsedTimestamp = parseInt(timestamp, 10);
    if (!isNaN(parsedTimestamp)) {
      const now = Date.now();
      if (Math.abs(now - parsedTimestamp) > WEBHOOK_TIMESTAMP_TOLERANCE_MS) {
        return false;
      }
    }
  }

  try {
    const expectedHex = createHmac('sha256', secretKey)
      .update(rawPayload)
      .digest('hex');
    const expectedBase64 = createHmac('sha256', secretKey)
      .update(rawPayload)
      .digest('base64');

    const signatureBuffer = Buffer.from(signature);
    const expectedHexBuffer = Buffer.from(expectedHex);
    const expectedBase64Buffer = Buffer.from(expectedBase64);

    const matchesHex =
      signatureBuffer.length === expectedHexBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedHexBuffer);

    const matchesBase64 =
      signatureBuffer.length === expectedBase64Buffer.length &&
      timingSafeEqual(signatureBuffer, expectedBase64Buffer);

    return matchesHex || matchesBase64;
  } catch {
    return false;
  }
}
