import { Request, Response, NextFunction } from 'express';
import { GuestsService } from './guests.service.js';
import {
  createGuestSchema,
  updateGuestSchema,
  guestIdSchema,
  confirmGuestSchema,
  eventIdParamSchema,
  GuestBySlugAndCodeParams,
} from './guests.schemas.js';

const guestsService = new GuestsService();

export const createGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createGuestSchema.parse(req.body);
    const adminId = req.currentUser!.userId;

    const guest = await guestsService.create(adminId, data);

    res.status(201).json(guest);
  } catch (error) {
    next(error);
  }
};

export const listGuestsByEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const adminId = req.currentUser!.userId;

    const guests = await guestsService.findByEvent(eventId, adminId);

    res.json(guests);
  } catch (error) {
    next(error);
  }
};

export const getGuestBySlugAndCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug, code } = req.params as GuestBySlugAndCodeParams;
    const guest = await guestsService.findBySlugAndCode(slug, code);

    res.json(guest);
  } catch (error) {
    next(error);
  }
};

export const updateGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = guestIdSchema.parse(req.params);
    const data = updateGuestSchema.parse(req.body);
    const adminId = req.currentUser!.userId;

    const guest = await guestsService.update(id, adminId, data);

    res.json(guest);
  } catch (error) {
    next(error);
  }
};

export const deleteGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = guestIdSchema.parse(req.params);
    const adminId = req.currentUser!.userId;

    const result = await guestsService.delete(id, adminId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const confirmGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = confirmGuestSchema.parse(req.body);
    const guest = await guestsService.confirm(data);

    res.json(guest);
  } catch (error) {
    next(error);
  }
};