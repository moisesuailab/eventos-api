FROM node:20.18.0-alpine

WORKDIR /app

# Copiar apenas package files primeiro (cache layer)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar prisma schema
COPY prisma ./prisma/

# Gerar Prisma Client
RUN npx prisma generate

# Copiar resto do código
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
