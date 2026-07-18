# ============================================================
# BASE IMAGE
# ============================================================
FROM node:20-alpine AS base

# libc6-compat dan openssl diperlukan untuk kompatibilitas Prisma
RUN apk add --no-cache \
    libc6-compat \
    openssl

WORKDIR /app


# ============================================================
# STAGE 1: INSTALL DEPENDENCIES
# ============================================================
FROM base AS dependencies

COPY package.json package-lock.json ./
COPY prisma ./prisma

# Menggunakan npm ci agar instalasi mengikuti package-lock.json
RUN npm ci

# Membuat Prisma Client berdasarkan schema.prisma
RUN npx prisma generate


# ============================================================
# STAGE 2: BUILD NEXT.JS
# ============================================================
FROM base AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Prisma Client sudah dibuat pada stage dependencies
RUN npm run build


# ============================================================
# STAGE 3: PRODUCTION RUNNER
# ============================================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# netcat digunakan entrypoint untuk memeriksa database
RUN apk add --no-cache netcat-openbsd

# Salin hasil build dan file runtime
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/entrypoint.sh ./entrypoint.sh

# Menghapus karakter CRLF apabila file dibuat di Windows,
# kemudian memberikan permission execute.
RUN sed -i 's/\r$//' ./entrypoint.sh \
    && chmod +x ./entrypoint.sh \
    && chown node:node ./entrypoint.sh

# Menjalankan aplikasi sebagai user non-root bawaan image Node
USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]