import { prisma } from "../../config/database.js";
import {
  CreateGuestInput,
  UpdateGuestInput,
  ConfirmGuestInput,
} from "./guests.schemas.js";
import { AppError } from "../../shared/middlewares/error.middleware.js";
import { generateUniqueCode } from "../../shared/utils/code-generator.util.js";
import { GuestStatus, EventStatus } from "@prisma/client";

export class GuestsService {
  async create(adminId: string, data: CreateGuestInput) {
    // Verifica se evento existe e pertence ao admin
    const event = await prisma.event.findFirst({
      where: {
        id: data.eventId,
        adminId,
      },
    });

    if (!event) {
      throw new AppError("Evento não encontrado", 404);
    }

    // Gera código único DENTRO DO EVENTO
    const code = await generateUniqueCode(async (code) => {
      const existing = await prisma.guest.findFirst({
        where: {
          eventId: data.eventId,
          code,
        },
      });
      return !!existing;
    });

    return await prisma.guest.create({
      data: {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        code,
      },
    });
  }

  async findByEvent(eventId: string, adminId: string) {
    // Verifica se evento existe e pertence ao admin
    const event = await prisma.event.findFirst({
      where: { id: eventId, adminId },
    });

    if (!event) {
      throw new AppError("Evento não encontrado", 404);
    }

    return await prisma.guest.findMany({
      where: { eventId },
      include: {
        // Correção: Incluindo dados do evento necessários para o modal
        event: {
          select: {
            name: true,
            slug: true,
            defaultMessage: true,
          },
        },
        companions: {
          include: {
            companion: {
              select: {
                id: true,
                name: true,
                code: true,
                status: true,
              },
            },
          },
        },
        children: true,
        confirmedBy: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findBySlugAndCode(slug: string, code: string) {
    // Busca evento pelo slug
    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!event) {
      throw new AppError("Evento não encontrado", 404);
    }

    // Busca convidado por eventId + code
    const guest = await prisma.guest.findFirst({
      where: {
        eventId: event.id,
        code,
      },
      include: {
        event: {
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
        },
        companions: {
          include: {
            companion: {
              select: {
                id: true,
                name: true,
                code: true,
                status: true,
              },
            },
          },
        },
        children: true,
        confirmedBy: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!guest) {
      throw new AppError("Código de convite inválido", 404);
    }

    return guest;
  }

  async update(id: string, adminId: string, data: UpdateGuestInput) {
    // Verifica se convidado existe e se evento pertence ao admin
    const guest = await prisma.guest.findFirst({
      where: {
        id,
        event: { adminId },
      },
    });

    if (!guest) {
      throw new AppError("Convidado não encontrado", 404);
    }

    return await prisma.guest.update({
      where: { id },
      data: {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
      },
    });
  }

  async delete(id: string, adminId: string) {
    // Verifica se convidado existe e se evento pertence ao admin
    const guest = await prisma.guest.findFirst({
      where: {
        id,
        event: { adminId },
      },
      include: {
        companions: true,
        confirmedGuests: true, // Quem foi confirmado por este convidado
      },
    });

    if (!guest) {
      throw new AppError("Convidado não encontrado", 404);
    }

    // Reseta status de quem foi confirmado por este convidado
    if (guest.confirmedGuests.length > 0) {
      await prisma.guest.updateMany({
        where: {
          id: { in: guest.confirmedGuests.map((g) => g.id) },
          confirmedByGuestId: id,
        },
        data: {
          status: GuestStatus.pending,
          confirmedByGuestId: null,
        },
      });
    }

    // Remove convidado (cascade remove vínculos e crianças)
    await prisma.guest.delete({ where: { id } });

    return { message: "Convidado removido com sucesso" };
  }

  async confirm(data: ConfirmGuestInput) {
    const guest = await this.findBySlugAndCode(data.slug, data.code);

    // Verifica se evento foi cancelado
    if (guest.event.status === EventStatus.cancelled) {
      throw new AppError("Este evento foi cancelado pelo organizador", 400);
    }

    // Verifica prazo de confirmação
    if (guest.event.confirmationDeadline) {
      const deadline = new Date(guest.event.confirmationDeadline);
      if (new Date() > deadline) {
        throw new AppError("O prazo para confirmação expirou", 400);
      }
    }

    // Verifica se já respondeu
    if (guest.status !== GuestStatus.pending) {
      throw new AppError("Você já respondeu a este convite", 400);
    }

    // Se está recusando, apenas atualiza status
    if (data.action === "decline") {
      return await prisma.guest.update({
        where: { id: guest.id },
        data: { status: GuestStatus.declined, respondedAt: new Date() },
      });
    }

    // Validações para confirmação
    const companions = data.companions || [];
    const children = data.children || [];

    // Valida limite de acompanhantes
    if (
      guest.event.maxCompanionsPerGuest !== null &&
      companions.length > guest.event.maxCompanionsPerGuest
    ) {
      throw new AppError(
        `Limite de acompanhantes excedido. Máximo: ${guest.event.maxCompanionsPerGuest}`,
        400
      );
    }

    // Valida limite de crianças
    if (
      guest.event.maxChildrenPerGuest !== null &&
      children.length > guest.event.maxChildrenPerGuest
    ) {
      throw new AppError(
        `Limite de crianças excedido. Máximo: ${guest.event.maxChildrenPerGuest}`,
        400
      );
    }

    // Valida idade das crianças
    const invalidChildren = children.filter(
      (c) => c.age > guest.event.maxChildrenAge
    );
    if (invalidChildren.length > 0) {
      throw new AppError(
        `Idade máxima permitida para crianças: ${guest.event.maxChildrenAge} anos`,
        400
      );
    }

    // Valida acompanhantes
    if (companions.length > 0) {
      const companionGuests = await prisma.guest.findMany({
        where: {
          eventId: guest.eventId,
          code: { in: companions },
        },
      });

      // Verifica se todos os códigos são válidos
      if (companionGuests.length !== companions.length) {
        throw new AppError(
          "Um ou mais códigos de acompanhantes são inválidos",
          400
        );
      }

      // Verifica se está tentando se adicionar
      const selfCompanion = companionGuests.find((c) => c.id === guest.id);
      if (selfCompanion) {
        throw new AppError("Você não pode se adicionar como acompanhante", 400);
      }

      // Verifica se algum acompanhante recusou
      const declinedCompanions = companionGuests.filter(
        (c) => c.status === GuestStatus.declined
      );
      if (declinedCompanions.length > 0) {
        throw new AppError(
          `Não é possível adicionar convidados que recusaram o convite`,
          400
        );
      }

      // Atualiza status dos acompanhantes que estão pendentes
      await prisma.guest.updateMany({
        where: {
          id: {
            in: companionGuests
              .filter((c) => c.status === GuestStatus.pending)
              .map((c) => c.id),
          },
        },
        data: {
          status: GuestStatus.confirmed,
          confirmedByGuestId: guest.id,
          respondedAt: new Date(),
        },
      });

      // Cria vínculos
      await prisma.guestCompanion.createMany({
        data: companionGuests.map((c) => ({
          guestId: guest.id,
          companionGuestId: c.id,
        })),
        skipDuplicates: true,
      });
    }

    // Cria crianças
    if (children.length > 0) {
      await prisma.guestChild.createMany({
        data: children.map((child) => ({
          guestId: guest.id,
          name: child.name,
          age: child.age,
        })),
      });
    }

    // Atualiza status do convidado principal
    return await prisma.guest.update({
      where: { id: guest.id },
      data: { status: GuestStatus.confirmed, respondedAt: new Date(), },
      include: {
        companions: {
          include: {
            companion: true,
          },
        },
        children: true,
      },
    });
  }
}