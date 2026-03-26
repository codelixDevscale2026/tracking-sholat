FROM node:24-slim AS base

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable

FROM base AS builder
WORKDIR /app

# Copy lockfile and package configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies (frozen lockfile)
RUN pnpm config set only-built-dependencies prisma,@prisma/engines esbuild
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN cd apps/api && pnpm prisma generate

# VERIFIKASI: Pastikan file index.js benar-benar ada di folder target
RUN [ -f apps/api/src/generated/prisma/index.js ] || exit 1

# Build the API
RUN pnpm --filter api build

# Pastikan Prisma yang digenerate ikut disalin ke folder dist agar runtime (node apps/api/dist/src/index.js) bisa menemukannya.
RUN mkdir -p apps/api/dist/src/generated/prisma && cp -r apps/api/src/generated/prisma/* apps/api/dist/src/generated/prisma/ || true

# --- TAHAP DEPLOY: Meratakan dependensi ---
RUN pnpm --filter api --prod deploy /app/out --legacy

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Menyalin hasil deploy (hanya source & deps produksi)
COPY --from=builder /app/out ./apps/api
# Salin hasil build (dist) yang kita butuhkan untuk runtime
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 8000

# Jalankan aplikasi dari folder internalnya
WORKDIR /app/apps/api
CMD ["node", "dist/src/index.js"]
