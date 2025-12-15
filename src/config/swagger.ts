import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sistema de Convites de Eventos - API",
      version: "1.0.0",
      description: `
Sistema completo para gerenciamento de convites de eventos com confirmação online e check-in.

## Funcionalidades Principais

- 🔐 Autenticação via Google OAuth
- 🎉 Gerenciamento de eventos
- 👥 Cadastro e confirmação de convidados
- ✅ Sistema de check-in com QR Code
- 📊 Estatísticas em tempo real

## Ambiente

Servidor rodando em: **${env.NODE_ENV}**
      `,
      contact: {
        name: "API Support",
        email: "support@convitecriativo.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Servidor de Desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT obtido após autenticação",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Mensagem de erro",
            },
            details: {
              type: "array",
              items: {
                type: "object",
              },
            },
          },
        },
        Event: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Aniversário do Levi" },
            description: { type: "string", example: "Festa de 1 ano" },
            date: { type: "string", format: "date-time" },
            time: { type: "string", example: "14:00" },
            location: { type: "string", example: "Salão de Festas ABC" },
            slug: { type: "string", example: "aniversario-do-levi" },
            confirmationDeadline: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            maxChildrenAge: { type: "integer", default: 12 },
            maxChildrenPerGuest: { type: "integer", nullable: true },
            maxCompanionsPerGuest: { type: "integer", nullable: true },
            defaultMessage: { type: "string", nullable: true },
            status: { type: "string", enum: ["active", "cancelled"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Guest: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            eventId: { type: "string", format: "uuid" },
            name: { type: "string", example: "João Silva" },
            email: { type: "string", format: "email", nullable: true },
            phone: { type: "string", nullable: true },
            code: { type: "string", example: "ABC123" },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "declined", "present"],
            },
            confirmedByGuestId: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
            respondedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            checkedIn: { type: "boolean", default: false },
            checkedInAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Autenticação e autorização" },
      { name: "Events", description: "Gerenciamento de eventos" },
      { name: "Guests", description: "Gerenciamento de convidados" },
      { name: "Checkin", description: "Sistema de check-in" },
    ],
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/server.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
