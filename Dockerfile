# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN NODE_ENV=development npm ci

FROM deps AS builder
WORKDIR /app
ARG DB_URL
ENV DB_URL=$DB_URL
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ARG DB_URL
ENV DB_URL=$DB_URL

# Install sharp for image optimization
RUN npm install --os=linux --cpu=arm64 sharp@0.33.2 2>/dev/null || npm install sharp@0.33.2

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create cache directory with correct permissions
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next/cache

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
