# ============================================================
# BASE IMAGE
# Debian slim dipilih agar Prisma dan OpenSSL lebih stabil
# ============================================================
FROM node:20-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates \
       openssl \
    && rm -rf /var/lib/apt/lists/*

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

# Variabel NEXT_PUBLIC harus tersedia saat build
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ============================================================
# STAGE 3: PRODUCTION RUNNER
# ============================================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/entrypoint.sh ./entrypoint.sh

# Folder persistent untuk file aplikasi atau upload
RUN mkdir -p /app/public/uploads \
    && chown -R node:node /app/public/uploads \
    && sed -i 's/\r$//' ./entrypoint.sh \
    && chmod +x ./entrypoint.sh \
    && chown node:node ./entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]