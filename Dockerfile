# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install OS deps needed by Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install ALL deps (including dev)
RUN npm install

# Copy Prisma schema first (for caching)
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy rest of source
COPY . .

# Build NestJS (TypeScript -> JS)
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies to keep image small
RUN npm ci --only=production

COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

# Copy built JS
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main.js"]
