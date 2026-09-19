import { z } from 'zod';

export const ROLE_VALUES = ['customer', 'admin'] as const;

export const updateUserRoleSchema = z.object({
  role: z.enum(ROLE_VALUES, {
    message: 'Lütfen geçerli bir rol seçiniz.',
  }),
});

export type UpdateUserRoleFormValues = z.infer<typeof updateUserRoleSchema>;
