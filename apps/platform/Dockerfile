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

# Build the Frontend platform
RUN pnpm --filter platform build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from the builder (flattened node_modules)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/platform/node_modules ./apps/platform/node_modules
COPY --from=builder /app/apps/platform/dist ./dist
COPY --from=builder /app/apps/platform/package.json ./package.json

EXPOSE 3000

# Jalankan preview dari folder platform
CMD ["npm", "run", "preview", "--prefix", "apps/platform", "--", "--host", "0.0.0.0", "--port", "3000"]
