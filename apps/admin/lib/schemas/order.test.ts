import { describe, it, expect } from 'vitest';
import { updateOrderStatusSchema, ORDER_STATUS_VALUES } from './order';

describe('updateOrderStatusSchema', () => {
  it('accepts all valid order statuses', () => {
    for (const status of ORDER_STATUS_VALUES) {
      const result = updateOrderStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(status);
      }
    }
  });

  it('rejects invalid status', () => {
    const result = updateOrderStatusSchema.safeParse({ status: 'invalid_status' });
    expect(result.success).toBe(false);
  });

  it('rejects missing status', () => {
    const result = updateOrderStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
