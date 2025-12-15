import { prisma } from "../../config/database.js";
import { CreateEventInput, UpdateEventInput } from "./events.schemas.js";
import { AppError } from "../../shared/middlewares/error.middleware.js";
import { EventStatus } from "@prisma/client";

export class EventsService {
  async create(adminId: string, data: CreateEventInput) {
    // Verifica se slug já existe
    const existingEvent = await prisma.event.findUnique({
      where: { slug: data.slug },
    });

    if (existingEvent) {
      throw new AppError("Slug já está em uso", 400);
    }

    return await prisma.event.create({
      data: {
        ...data,
        date: new Date(data.date),
        confirmationDeadline: data.confirmationDeadline
          ? new Date(data.confirmationDeadline)
          : undefined,
        adminId,
      },
    });
  }

  async findAll(adminId: string) {
    return await prisma.event.findMany({
      where: { adminId },
      orderBy: { date: "asc" },
      include: {
        _count: {
          select: {
            guests: true,
            receptionists: true,
          },
        },
      },
    });
  }

  async findById(id: string, adminId: string) {
    const event = await prisma.event.findFirst({
      where: { id, adminId },
      include: {
        receptionists: true,
        _count: {
          select: { guests: true },
        },
      },
    });

    if (!event) {
      throw new AppError("Evento não encontrado", 404);
    }

    return event;
  }

  async findBySlug(slug: string) {
    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        time: true,
        location: true,
        slug: true,
        status: true,
        confirmationDeadline: true,
        maxChildrenAge: true,
        maxChildrenPerGuest: true,
        maxCompanionsPerGuest: true,
      },
    });

    if (!event) {
      throw new AppError("Evento não encontrado", 404);
    }

    return event;
  }

  async findAsReceptionist(userEmail: string) {
  return await prisma.event.findMany({
    where: {
      receptionists: {
        some: { email: userEmail }
      }
    },
    orderBy: { date: 'asc' },
    include: {
      receptionists: true,
      _count: {
        select: { guests: true, receptionists: true },
      },
    },
  });
}

  async update(id: string, adminId: string, data: UpdateEventInput) {
    // Verifica se evento existe e pertence ao admin
    await this.findById(id, adminId);

    // Se está alterando slug, verifica se já existe
    if (data.slug) {
      const existingEvent = await prisma.event.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      if (existingEvent) {
        throw new AppError("Slug já está em uso", 400);
      }
    }

    return await prisma.event.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        confirmationDeadline: data.confirmationDeadline
          ? new Date(data.confirmationDeadline)
          : undefined,
      },
    });
  }

  async cancel(id: string, adminId: string) {
    // Verifica se evento existe e pertence ao admin
    await this.findById(id, adminId);

    return await prisma.event.update({
      where: { id },
      data: { status: EventStatus.cancelled },
    });
  }

  async delete(id: string, adminId: string) {
    // Verifica se evento existe e pertence ao admin
    await this.findById(id, adminId);

    await prisma.event.delete({
      where: { id },
    });

    return { message: "Evento removido com sucesso" };
  }

  async addReceptionist(eventId: string, adminId: string, email: string) {
    // Verifica se evento existe e pertence ao admin
    await this.findById(eventId, adminId);

    // Verifica se já existe
    const existing = await prisma.eventReceptionist.findFirst({
      where: {
        eventId,
        email,
      },
    });

    if (existing) {
      throw new AppError("Este email já é recepcionista deste evento", 400);
    }

    return await prisma.eventReceptionist.create({
      data: {
        eventId,
        email,
      },
    });
  }

  async removeReceptionist(receptionistId: string, adminId: string) {
    const receptionist = await prisma.eventReceptionist.findFirst({
      where: {
        id: receptionistId,
        event: { adminId },
      },
    });

    if (!receptionist) {
      throw new AppError("Recepcionista não encontrado", 404);
    }

    await prisma.eventReceptionist.delete({
      where: { id: receptionistId },
    });

    return { message: "Recepcionista removido com sucesso" };
  }
}
