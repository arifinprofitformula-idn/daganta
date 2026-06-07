FROM node:20-bookworm-slim AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./
RUN NODE_ENV=development npm ci --include=dev

FROM base AS prod-deps

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
  && npm cache clean --force

FROM base AS builder

ARG BUILD_DATABASE_URL="postgresql://daganta:daganta@localhost:5432/daganta?schema=public"
ARG BUILD_DIRECT_URL="postgresql://daganta:daganta@localhost:5432/daganta?schema=public"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN DATABASE_URL="$BUILD_DATABASE_URL" DIRECT_URL="$BUILD_DIRECT_URL" npx prisma generate
RUN DATABASE_URL="$BUILD_DATABASE_URL" DIRECT_URL="$BUILD_DIRECT_URL" npm run build

FROM base AS runner

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts

RUN chmod +x scripts/docker-start.sh

EXPOSE 3000

CMD ["sh", "scripts/docker-start.sh"]
