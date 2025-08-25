# syntax=docker/dockerfile:1.7-labs

ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY
ARG T212_API_KEY
ARG FX_API_KEY

###############################################################################
# 1) deps stage: install workspace deps
###############################################################################
FROM node:22-slim AS deps
WORKDIR /workspace
RUN npm install -g npm@11

# Cache-friendly install
COPY package.json package-lock.json nx.json tsconfig.json ./
RUN npm ci --ignore-scripts || (sleep 10 && npm ci --ignore-scripts)

###############################################################################
# 2) builder stage: build Next.js
###############################################################################
FROM deps AS builder
WORKDIR /workspace

# Build-time env (only what's needed at build)
ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY
ARG T212_API_KEY
ARG FX_API_KEY

ENV MAILERSEND_API_KEY="${MAILERSEND_API_KEY}"
ENV CONTACT_EMAIL_TO="${CONTACT_EMAIL_TO}"
ENV CONTACT_EMAIL_FROM="${CONTACT_EMAIL_FROM}"
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY="${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}"
ENV RECAPTCHA_SECRET_KEY="${RECAPTCHA_SECRET_KEY}"
ENV T212_API_KEY="${T212_API_KEY}"
ENV FX_API_KEY="${FX_API_KEY}"

# Source -> build
COPY . .
RUN npx nx build nextjs-app --configuration=production

# (Optional harden) ensure cache dirs exist & writable in the built output
RUN mkdir -p apps/nextjs-app/.next/cache/images \
           apps/nextjs-app/.next/cache/fetch-cache \
 && chmod -R a+rwX apps/nextjs-app/.next

# Purge secrets from this layer
ENV MAILERSEND_API_KEY="" \
    CONTACT_EMAIL_TO="" \
    CONTACT_EMAIL_FROM="" \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY="" \
    RECAPTCHA_SECRET_KEY="" \
    T212_API_KEY="" \
    FX_API_KEY=""

###############################################################################
# 3) final runner (distroless, nonroot)
#    🚨 IMPORTANT: launch the **root** standalone server ONLY.
#    We copy *exactly* what Next's standalone expects:
#      - server.js, package.json, node_modules  (from .next/standalone root)
#      - .next/static and .next/BUILD_ID       (asset map)
#      - public/                               (your images, etc.)
###############################################################################
# FROM node:22-bullseye AS runner
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app

# --- standalone server runtime (root-level) ---
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone/server.js ./server.js
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone/package.json ./package.json
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone/node_modules ./node_modules

# --- Next static assets + BUILD_ID (power CSS/JS) ---
COPY --from=builder /workspace/apps/nextjs-app/.next/BUILD_ID ./.next/BUILD_ID
COPY --from=builder /workspace/apps/nextjs-app/.next/static   ./.next/static

# --- Public assets (served at /) ---
COPY --from=builder /workspace/apps/nextjs-app/public ./public

# Writable caches for next/image when running as nonroot
ENV NEXT_CACHE_DIR=/tmp/next/cache
ENV NEXT_IMAGE_CACHE_DIR=/tmp/next/image-cache

# Runtime env
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
# Optional: disable telemetry in containers
# ENV NEXT_TELEMETRY_DISABLED=1

# Distroless entrypoint: run the root server directly
CMD ["server.js"]
