# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1

# ── Dependencies ──────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
# Install ALL deps (dev included) so tailwindcss etc. are available for the build
RUN npm ci

# ── Builder ───────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next build needs DB_URL at build time for drizzle schema
ARG DB_URL
ENV DB_URL=$DB_URL
ENV NODE_ENV=production
RUN npm run build

# ── Runner ────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# App build output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy ALL node_modules (includes tsx)
COPY --from=deps /app/node_modules ./node_modules

# Copy migration + scripts folder
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/migrate.mjs ./migrate.mjs
COPY --from=builder /app/scripts ./scripts
# Ensure runtime has the library code required by scripts (seed, migrations)
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p .next/cache/images && chown -R nextjs:nodejs .next

USER nextjs
EXPOSE 3000
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]

