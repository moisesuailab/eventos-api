import { z } from 'zod';

export const createGuestSchema = z.object({
  eventId: z.string().uuid('ID do evento inválido'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

export const updateGuestSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

export const guestIdSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const guestBySlugAndCodeSchema = z.object({
  slug: z.string(),
  code: z.string().length(6, 'Código deve ter 6 caracteres'),
});

export const confirmGuestSchema = z.object({
  slug: z.string(),
  code: z.string().length(6, 'Código deve ter 6 caracteres'),
  action: z.enum(['confirm', 'decline'], {
    errorMap: () => ({ message: 'Ação deve ser "confirm" ou "decline"' }),
  }),
  companions: z.array(z.string().length(6)).optional(),
  children: z
    .array(
      z.object({
        name: z.string().min(2, 'Nome da criança deve ter no mínimo 2 caracteres'),
        age: z.number().int().min(0).max(12),
      })
    )
    .optional(),
});

export const eventIdParamSchema = z.object({
  eventId: z.string().uuid('ID do evento inválido'),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type ConfirmGuestInput = z.infer<typeof confirmGuestSchema>;
export type GuestBySlugAndCodeParams = z.infer<typeof guestBySlugAndCodeSchema>;