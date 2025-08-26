# syntax=docker/dockerfile:1.7-labs

ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY
ARG T212_API_KEY
ARG FX_API_KEY

############################
# deps
############################
FROM node:22-slim AS deps
WORKDIR /workspace
RUN npm install -g npm@11
COPY package.json package-lock.json nx.json tsconfig.json ./
RUN npm ci --ignore-scripts || (sleep 10 && npm ci --ignore-scripts)

############################
# builder
############################
FROM deps AS builder
WORKDIR /workspace

# build-time env (only NEXT_PUBLIC_* matters for client)
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

COPY . .
RUN npx nx build nextjs-app --configuration=production

# (optional) make build caches writable if you ever run the builder image
RUN mkdir -p apps/nextjs-app/.next/cache/images apps/nextjs-app/.next/cache/fetch-cache \
 && chmod -R a+rwX apps/nextjs-app/.next

# scrub secrets from later layers
ENV MAILERSEND_API_KEY="" \
    CONTACT_EMAIL_TO="" \
    CONTACT_EMAIL_FROM="" \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY="" \
    RECAPTCHA_SECRET_KEY="" \
    T212_API_KEY="" \
    FX_API_KEY=""

############################
# runner  (distroless node)
############################
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
# FROM node:22-bullseye AS runner

# IMPORTANT: Next standalone expects a specific layout
# Copy the ENTIRE standalone tree to /app
WORKDIR /app
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone/ ./

# Now place the build artefacts where the nested server will read them:
# they belong under ./apps/nextjs-app/.next/
COPY --from=builder /workspace/apps/nextjs-app/.next/BUILD_ID ./apps/nextjs-app/.next/BUILD_ID
COPY --from=builder /workspace/apps/nextjs-app/.next/static   ./apps/nextjs-app/.next/static

# Public assets alongside the app
COPY --from=builder /workspace/apps/nextjs-app/public ./apps/nextjs-app/public

# Runtime env
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NEXT_CACHE_DIR=/tmp/next/cache \
    NEXT_IMAGE_CACHE_DIR=/tmp/next/image-cache \
    NEXT_TELEMETRY_DISABLED=1

# CRITICAL: run from the nested app dir so relative lookups resolve
WORKDIR /app/apps/nextjs-app

# Distroless node image uses 'node' as entrypoint; give it the script
CMD ["server.js"]
