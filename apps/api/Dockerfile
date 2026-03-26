FROM node:24-alpine AS base

# Install OpenSSL for Prisma
RUN sed -i 's/dl-cdn.alpinelinux.org/dl-cdn.alpinelinux.org/g' /etc/apk/repositories || true
# Retry apk add to handle transient DNS errors
RUN apk update && apk add --no-cache openssl || (sleep 2 && apk update && apk add --no-cache openssl) || (sleep 5 && apk update && apk add --no-cache openssl)
RUN corepack enable

FROM base AS builder
WORKDIR /app

# Copy lockfile and package configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies (frozen lockfile)
RUN pnpm install --frozen-lockfile --only-built-dependencies

# Generate Prisma Client
RUN cd apps/api && pnpm db:generate

# Build the API
RUN pnpm --filter api build

# Since `tsc` ignores `.node` binaries, copy them from src to dist manually
RUN mkdir -p apps/api/dist/generated/prisma && cp -r apps/api/src/generated/prisma/*.node apps/api/dist/generated/prisma/ || true

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

EXPOSE 8000

CMD ["node", "apps/api/dist/src/index.js"]
