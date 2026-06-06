FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --include=dev

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma
COPY src ./src
COPY test ./test
COPY tsconfig*.json ./
COPY nest-cli.json ./
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ARG APP_VERSION=local
ENV NODE_ENV=production
ENV APP_VERSION=$APP_VERSION
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --include=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
