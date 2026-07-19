# ============================================================
# BASE
# Digunakan oleh stage deps, builder, dan runner
# ============================================================
FROM node:20-alpine AS base

RUN apk add --no-cache \
    libc6-compat \
    openssl

WORKDIR /app


# ============================================================
# STAGE 1: INSTALL DEPENDENCIES
# ============================================================
FROM base AS deps

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate


# ============================================================
# STAGE 2: BUILD NEXT.JS
# ============================================================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Prisma Client sudah dibuat pada stage deps
RUN npm run build


# ============================================================
# STAGE 3: PRODUCTION RUNNER
# ============================================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Salin seluruh file yang dibutuhkan saat runtime
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/entrypoint.sh ./entrypoint.sh

# Mengatasi CRLF dari Windows dan memberikan izin eksekusi
RUN sed -i 's/\r$//' ./entrypoint.sh \
    && chmod +x ./entrypoint.sh \
    && chown node:node ./entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]