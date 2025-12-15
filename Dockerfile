# ============================================
# Stage 1: Build
# ============================================
FROM node:20.18.0-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS as dependências (incluindo dev para build)
RUN npm ci

# Copiar Prisma schema e gerar client
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20.18.0-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar APENAS dependências de produção
RUN npm ci --only=production

# Copiar Prisma schema e gerar client
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar código compilado do stage anterior
COPY --from=builder /app/dist ./dist

# Expor porta
EXPOSE 3000

# Rodar migrations e iniciar app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
