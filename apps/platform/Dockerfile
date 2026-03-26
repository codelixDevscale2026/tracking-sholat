FROM node:24-slim AS base

# Install dependencies for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable

FROM base AS builder
WORKDIR /app

# Copy root config files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY apps/platform ./apps/platform

# Install dependencies (frozen lockfile)
RUN pnpm config set only-built-dependencies prisma,@prisma/engines esbuild
RUN pnpm config set node-linker hoisted
RUN pnpm install --frozen-lockfile

# Generate Prisma client for shared types to resolve
RUN cd apps/api && pnpm prisma generate

# Terima build arg untuk API URL
ARG VITE_API_BASE_URL=http://103.172.204.124:8001
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the Frontend platform
RUN pnpm --filter platform build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Salin konfigurasi root dan depepndensi yang sudah flat (hoisted)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Salin sub-folder platform (termasuk .output atau dist)
COPY --from=builder /app/apps/platform ./apps/platform

EXPOSE 3000

# TanStack Start (SSR) biasanya menghasilkan output di folder .output/server/index.mjs
# Kita coba jalankan server-nya langsung jika ada, atau fallback ke preview jika file tidak ditemukan.
CMD ["sh", "-c", "if [ -f apps/platform/.output/server/index.mjs ]; then node apps/platform/.output/server/index.mjs; else npm run preview --prefix apps/platform -- --host 0.0.0.0 --port 3000; fi"]
