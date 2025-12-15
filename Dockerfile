# ============================================
# Stage 1: Build
# ============================================
FROM node:20.18.0-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS as dependências
RUN npm ci

# Copiar Prisma e gerar client
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar código
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

# Instalar APENAS produção
RUN npm ci --omit=dev

# Copiar Prisma e gerar client
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar código compilado
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Rodar migrations e iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
