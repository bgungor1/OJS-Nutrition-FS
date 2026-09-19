import { z } from 'zod';

export const ORDER_STATUS_VALUES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES, {
    message: 'Lütfen geçerli bir sipariş durumu seçiniz.',
  }),
});

export type UpdateOrderStatusFormValues = z.infer<typeof updateOrderStatusSchema>;
