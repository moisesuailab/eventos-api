import { z } from 'zod';

export const eventSlugSchema = z.object({
  slug: z.string(),
});

export const checkinGuestSchema = z.object({
  slug: z.string(),
  guestId: z.string().uuid('ID do convidado inválido'),
});

export const checkinChildSchema = z.object({
  slug: z.string(),
  childId: z.string().uuid('ID da criança inválido'),
});

export const validateCodeSchema = z.object({
  slug: z.string(),
  code: z.string().length(6, 'Código deve ter 6 caracteres'),
});

export type EventSlugParams = z.infer<typeof eventSlugSchema>;
export type CheckinGuestInput = z.infer<typeof checkinGuestSchema>;
export type CheckinChildInput = z.infer<typeof checkinChildSchema>;
export type ValidateCodeInput = z.infer<typeof validateCodeSchema>;