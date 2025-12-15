# Backend - Sistema de Convites de Eventos

API RESTful independente para gerenciamento de eventos e convites.

## 🚀 Quick Start
```bash
# Instalar dependências
npm install

# Subir containers (PostgreSQL + Backend)
npm run docker:up

# Ver logs
npm run docker:logs

# Parar containers
npm run docker:down
```

## 📚 Documentação

Acesse: http://localhost:3000/api-docs

## 🔧 Desenvolvimento Local
```bash
# Sem Docker
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## 🌐 Endpoints Principais

- `GET /health` - Health check
- `POST /auth/dev/token` - Gerar token (DEV)
- `GET /events` - Listar eventos
- `POST /guests/confirm` - Confirmar presença

## 🐳 Docker

- Backend: http://localhost:3000
- PostgreSQL: localhost:5432
- Prisma Studio: `npm run prisma:studio`