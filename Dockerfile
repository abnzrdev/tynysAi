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

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy standalone output (includes node_modules with sharp)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy sharp native binaries from the deps stage (standalone sometimes misses them)
COPY --from=deps /app/node_modules/sharp ./node_modules/sharp
COPY --from=deps /app/node_modules/@img  ./node_modules/@img

# Writable cache directory for image optimisation
RUN mkdir -p .next/cache/images && chown -R nextjs:nodejs .next

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
