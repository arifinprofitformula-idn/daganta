FROM node:20-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV DEBIAN_FRONTEND=noninteractive

ARG BUILD_DATABASE_URL="postgresql://daganta:daganta@localhost:5432/daganta?schema=public"
ARG BUILD_DIRECT_URL="postgresql://daganta:daganta@localhost:5432/daganta?schema=public"

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN DATABASE_URL="$BUILD_DATABASE_URL" DIRECT_URL="$BUILD_DIRECT_URL" npx prisma generate
RUN DATABASE_URL="$BUILD_DATABASE_URL" DIRECT_URL="$BUILD_DIRECT_URL" npm run build

ENV NODE_ENV=production

RUN chmod +x scripts/docker-start.sh

EXPOSE 3000

CMD ["sh", "scripts/docker-start.sh"]
