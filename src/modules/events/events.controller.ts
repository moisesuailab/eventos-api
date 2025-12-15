import { Request, Response, NextFunction } from 'express';
import { EventsService } from './events.service.js';
import {
  createEventSchema,
  updateEventSchema,
  eventIdSchema,
  eventSlugSchema,
  addReceptionistSchema,
} from './events.schemas.js';

const eventsService = new EventsService();

export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createEventSchema.parse(req.body);
    const adminId = req.currentUser!.userId;

    const event = await eventsService.create(adminId, data);

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const listEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = req.currentUser!.userId;
    const events = await eventsService.findAll(adminId);

    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const listEventsAsReceptionist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userEmail = req.currentUser!.email;
    const events = await eventsService.findAsReceptionist(userEmail);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = eventIdSchema.parse(req.params);
    const adminId = req.currentUser!.userId;

    const event = await eventsService.findById(id, adminId);

    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const getEventBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = eventSlugSchema.parse(req.params);
    const event = await eventsService.findBySlug(slug);

    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = eventIdSchema.parse(req.params);
    const data = updateEventSchema.parse(req.body);
    const adminId = req.currentUser!.userId;

    const event = await eventsService.update(id, adminId, data);

    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const cancelEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = eventIdSchema.parse(req.params);
    const adminId = req.currentUser!.userId;

    const event = await eventsService.cancel(id, adminId);

    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = eventIdSchema.parse(req.params);
    const adminId = req.currentUser!.userId;

    const result = await eventsService.delete(id, adminId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const addReceptionist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = eventIdSchema.parse(req.params);
    const { email } = addReceptionistSchema.parse(req.body);
    const adminId = req.currentUser!.userId;

    const receptionist = await eventsService.addReceptionist(id, adminId, email);

    res.status(201).json(receptionist);
  } catch (error) {
    next(error);
  }
};

export const removeReceptionist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { receptionistId } = req.params;
    const adminId = req.currentUser!.userId;

    const result = await eventsService.removeReceptionist(receptionistId, adminId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};