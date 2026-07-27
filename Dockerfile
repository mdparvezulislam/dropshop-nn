# =============================================================================
# DropshopNN — Production Dockerfile
# =============================================================================
# Multi-stage build: install deps → build → run (distroless).
# pnpm is required because the lockfile is pnpm-only.

# ── Base (shared deps version) ──────────────────────────────────────────────
FROM node:22-alpine AS base
RUN npm install -g pnpm@9.15.9
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# ── Dependencies ────────────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY . .
RUN pnpm install --frozen-lockfile --prod

# ── Builder ─────────────────────────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache libc6-compat python3 make g++
COPY . .
RUN pnpm install --frozen-lockfile
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ── Runner ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN npm install -g pnpm@9.15.9
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/pnpm-lock.yaml ./

USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
