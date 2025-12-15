import { Request, Response } from 'express';
import { CheckinService } from './checkin.service.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.js';
import {
  eventSlugSchema,
  checkinGuestSchema,
  checkinChildSchema,
  validateCodeSchema,
} from './checkin.schemas.js';

const checkinService = new CheckinService();

export const listGuests = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = eventSlugSchema.parse(req.params);
  const userEmail = req.currentUser!.email;
  const guests = await checkinService.listGuests(slug, userEmail);
  res.json(guests);
});

export const validateCode = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = eventSlugSchema.parse(req.params);
  const { code } = validateCodeSchema.parse({ ...req.params, ...req.body });
  const userEmail = req.currentUser!.email;
  const guest = await checkinService.validateCode(slug, code, userEmail);
  res.json(guest);
});

export const checkinGuest = asyncHandler(async (req: Request, res: Response) => {
  const data = checkinGuestSchema.parse({ ...req.params, ...req.body });
  const userEmail = req.currentUser!.email;
  const guest = await checkinService.checkinGuest(data.slug, data.guestId, userEmail);
  res.json(guest);
});

export const revertCheckin = asyncHandler(async (req: Request, res: Response) => {
  const data = checkinGuestSchema.parse({ ...req.params, ...req.body });
  const userEmail = req.currentUser!.email;
  const guest = await checkinService.revertCheckin(data.slug, data.guestId, userEmail);
  res.json(guest);
});

export const checkinChild = asyncHandler(async (req: Request, res: Response) => {
  const data = checkinChildSchema.parse({ ...req.params, ...req.body });
  const userEmail = req.currentUser!.email;
  const child = await checkinService.checkinChild(data.slug, data.childId, userEmail);
  res.json(child);
});

export const revertCheckinChild = asyncHandler(async (req: Request, res: Response) => {
  const data = checkinChildSchema.parse({ ...req.params, ...req.body });
  const userEmail = req.currentUser!.email;
  const child = await checkinService.revertCheckinChild(data.slug, data.childId, userEmail);
  res.json(child);
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = eventSlugSchema.parse(req.params);
  const userEmail = req.currentUser!.email;
  const stats = await checkinService.getStats(slug, userEmail);
  res.json(stats);
});