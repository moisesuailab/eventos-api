import { prisma } from "../../config/database.js";
import { AppError } from "../../shared/middlewares/error.middleware.js";
import { GuestStatus } from "@prisma/client";

export class CheckinService {
  // Verifica se usuário é recepcionista do evento
  async verifyReceptionist(slug: string, userEmail: string) {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        admin: true,
        receptionists: true,
      },
    });

    if (!event) {
      throw new AppError("Evento não encontrado", 404);
    }

    // Verifica se é admin ou recepcionista
    const isAdmin = event.admin.email === userEmail;
    const isReceptionist = event.receptionists.some(
      (r) => r.email === userEmail
    );

    if (!isAdmin && !isReceptionist) {
      throw new AppError(
        "Você não tem permissão para acessar este evento",
        403
      );
    }

    return event;
  }

  // Lista todos os convidados do evento (para recepcionista)
  async listGuests(slug: string, userEmail: string) {
    const event = await this.verifyReceptionist(slug, userEmail);

    const guests = await prisma.guest.findMany({
      where: { eventId: event.id },
      include: {
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
        children: {
          orderBy: { name: "asc" },
        },
        confirmedBy: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return guests;
  }

  // Valida código e retorna dados do convidado
  async validateCode(slug: string, code: string, userEmail: string) {
    const event = await this.verifyReceptionist(slug, userEmail);

    const guest = await prisma.guest.findFirst({
      where: {
        eventId: event.id,
        code,
      },
      include: {
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
        children: {
          orderBy: { name: "asc" },
        },
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
      throw new AppError("Código inválido", 404);
    }

    // Permite status 'present' também, para possibilitar ajustes no check-in
    if (
      guest.status !== GuestStatus.confirmed &&
      guest.status !== GuestStatus.present
    ) {
      throw new AppError("Este convidado não confirmou presença", 400);
    }

    return guest;
  }

  // Marca presença do convidado
  async checkinGuest(slug: string, guestId: string, userEmail: string) {
    const event = await this.verifyReceptionist(slug, userEmail);

    const guest = await prisma.guest.findFirst({
      where: {
        id: guestId,
        eventId: event.id,
      },
    });

    if (!guest) {
      throw new AppError("Convidado não encontrado", 404);
    }

    if (guest.checkedIn) {
      throw new AppError("Check-in já realizado", 400);
    }

    if (
      guest.status !== GuestStatus.confirmed &&
      guest.status !== GuestStatus.present
    ) {
      throw new AppError(
        "Apenas convidados confirmados podem fazer check-in",
        400
      );
    }

    return await prisma.guest.update({
      where: { id: guestId },
      data: {
        status: GuestStatus.present,
        checkedIn: true,
        checkedInAt: new Date(),
      },
    });
  }

  // Reverte check-in do convidado
  async revertCheckin(slug: string, guestId: string, userEmail: string) {
    const event = await this.verifyReceptionist(slug, userEmail);

    const guest = await prisma.guest.findFirst({
      where: {
        id: guestId,
        eventId: event.id,
      },
    });

    if (!guest) {
      throw new AppError("Convidado não encontrado", 404);
    }

    if (!guest.checkedIn) {
      throw new AppError("Este convidado não fez check-in", 400);
    }

    return await prisma.guest.update({
      where: { id: guestId },
      data: {
        status: GuestStatus.confirmed,
        checkedIn: false,
        checkedInAt: null,
      },
    });
  }

  // Marca presença de criança
  async checkinChild(slug: string, childId: string, userEmail: string) {
    const event = await this.verifyReceptionist(slug, userEmail);

    const child = await prisma.guestChild.findFirst({
      where: {
        id: childId,
        guest: {
          eventId: event.id,
        },
      },
      include: {
        guest: true,
      },
    });

    if (!child) {
      throw new AppError("Criança não encontrada", 404);
    }

    if (
      child.guest.status !== GuestStatus.confirmed &&
      child.guest.status !== GuestStatus.present
    ) {
      throw new AppError("O responsável precisa estar confirmado", 400);
    }

    if (child.checkedIn) {
      throw new AppError("Check-in desta criança já foi realizado", 400);
    }

    return await prisma.guestChild.update({
      where: { id: childId },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    });
  }

  // Reverte check-in de criança
  async revertCheckinChild(slug: string, childId: string, userEmail: string) {
    const event = await this.verifyReceptionist(slug, userEmail);

    const child = await prisma.guestChild.findFirst({
      where: {
        id: childId,
        guest: {
          eventId: event.id,
        },
      },
    });

    if (!child) {
      throw new AppError("Criança não encontrada", 404);
    }

    if (!child.checkedIn) {
      throw new AppError("Esta criança não fez check-in", 400);
    }

    return await prisma.guestChild.update({
      where: { id: childId },
      data: {
        checkedIn: false,
        checkedInAt: null,
      },
    });
  }

  // Estatísticas do evento
  async getStats(slug: string, userEmail: string) {
    const event = await this.verifyReceptionist(slug, userEmail);

    // CORREÇÃO: "Confirmados" agora inclui quem já está "Presente"
    // CORREÇÃO: "Total Crianças" conta apenas filhos de pais confirmados ou presentes

    const [
      totalGuests,
      confirmedOnly, // Apenas status 'confirmed'
      present,       // Status 'present'
      declined,
      pending,
      childrenCheckedIn,
    ] = await Promise.all([
      prisma.guest.count({
        where: { eventId: event.id },
      }),
      prisma.guest.count({
        where: { eventId: event.id, status: GuestStatus.confirmed },
      }),
      prisma.guest.count({
        where: { eventId: event.id, status: GuestStatus.present },
      }),
      prisma.guest.count({
        where: { eventId: event.id, status: GuestStatus.declined },
      }),
      prisma.guest.count({
        where: { eventId: event.id, status: GuestStatus.pending },
      }),
      prisma.guestChild.count({
        where: {
          guest: { eventId: event.id },
          checkedIn: true,
        },
      }),
    ]);

    // Busca total de crianças apenas de convidados válidos (confirmados ou presentes)
    const totalChildren = await prisma.guestChild.count({
      where: {
        guest: {
          eventId: event.id,
          status: {
            in: [GuestStatus.confirmed, GuestStatus.present],
          },
        },
      },
    });

    // O total de confirmados para exibição é a soma de quem confirmou + quem já chegou
    const totalConfirmedDisplay = confirmedOnly + present;

    return {
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
        status: event.status,
      },
      stats: {
        totalGuests,
        confirmed: totalConfirmedDisplay,
        present,
        declined,
        pending,
        totalChildren,
        childrenCheckedIn,
      },
    };
  }
}