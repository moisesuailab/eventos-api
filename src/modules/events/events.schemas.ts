import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  date: z.string().datetime('Data inválida'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  location: z.string().min(3, 'Local deve ter no mínimo 3 caracteres'),
  slug: z.string()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  confirmationDeadline: z.string().datetime().optional(),
  maxChildrenAge: z.number().int().min(1).max(12).default(12),
  maxChildrenPerGuest: z.number().int().min(0).optional(),
  maxCompanionsPerGuest: z.number().int().min(0).optional(),
  defaultMessage: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventIdSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const eventSlugSchema = z.object({
  slug: z.string(),
});

export const addReceptionistSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type AddReceptionistInput = z.infer<typeof addReceptionistSchema>;