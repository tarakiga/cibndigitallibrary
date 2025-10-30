# Frontend Dockerfile for CIBN Digital Library
# Multi-stage build for optimized production image

# Stage 1: Dependencies (install ALL deps for build)
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package and npm config files
COPY package*.json .npmrc ./

# Install ALL dependencies (including dev) — required for Next.js build
# .npmrc contains network resilience settings
RUN npm ci --loglevel=verbose || npm ci --loglevel=verbose || npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time env var
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the app (now has access to tailwindcss, postcss, etc.)
RUN npm run build

# Stage 3: Runner (production-only)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Pass the build arg through to runtime
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy production-ready output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 0

CMD ["node", "server.js"]