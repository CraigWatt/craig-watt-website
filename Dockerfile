# (optional but recommended if you later use cache mounts/secrets)
# syntax=docker/dockerfile:1.7-labs

ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY
ARG T212_API_KEY
ARG FX_API_KEY

###############################################################################
# 1) deps stage: install everything for the workspace
###############################################################################
FROM node:22-slim AS deps
WORKDIR /workspace

# npm to v11
RUN npm install -g npm@11

# copy root manifests for full dependency install
COPY package.json package-lock.json nx.json tsconfig.json ./

# slightly more resilient install (keeps your logic)
RUN npm ci --ignore-scripts || (sleep 10 && npm ci --ignore-scripts)

# debug
RUN echo "=== deps: workspace/node_modules snippet ===" \
  && ls -1R node_modules | head -n50

###############################################################################
# 2) builder stage: compile the Next.js app
###############################################################################
FROM deps AS builder
WORKDIR /workspace

# Re-declare build args (kept for compatibility, but we'll clear them later)
ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY
ARG T212_API_KEY
ARG FX_API_KEY

# Expose as env only for build step (Next may read NEXT_PUBLIC_* at build)
ENV MAILERSEND_API_KEY=${MAILERSEND_API_KEY}
ENV CONTACT_EMAIL_TO=${CONTACT_EMAIL_TO}
ENV CONTACT_EMAIL_FROM=${CONTACT_EMAIL_FROM}
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
ENV RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY}
ENV T212_API_KEY=${T212_API_KEY}
ENV FX_API_KEY=${FX_API_KEY}

# bring in your source
COPY . .

RUN npx nx build nextjs-app --configuration=production

# make sure cache dirs exist and are world-writable
RUN mkdir -p apps/nextjs-app/.next/cache/images \
         apps/nextjs-app/.next/cache/fetch-cache \
 && chmod -R a+rwX apps/nextjs-app/.next

# inspect .next/standalone
RUN echo "=== builder: .next/standalone tree ===" \
  && ls -R apps/nextjs-app/.next/standalone

# prepare a flattened /standalone snapshot
RUN mkdir /standalone \
  && cp -r apps/nextjs-app/.next/standalone/* /standalone

# **NEW**: normalise server entrypoint to a stable path (/standalone/server.mjs)
RUN node -e "const fs=require('fs'); \
  const c=[ \
    '/standalone/server.mjs','/standalone/server.js', \
    '/standalone/apps/nextjs-app/server.mjs','/standalone/apps/nextjs-app/server.js' \
  ].find(fs.existsSync); \
  if(!c) throw new Error('No server.(m)js found in standalone output'); \
  try{fs.unlinkSync('/standalone/server.mjs')}catch{} \
  fs.symlinkSync(c, '/standalone/server.mjs'); \
  console.log('→ normalized server entry:', c, '→ /standalone/server.mjs');"

# debug
RUN echo "=== builder: /standalone listing ===" \
  && ls -l /standalone | sed -n '1,120p'

# Extra safe: clear all secrets from the builder stage's ENV
ENV MAILERSEND_API_KEY="" \
    CONTACT_EMAIL_TO="" \
    CONTACT_EMAIL_FROM="" \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY="" \
    RECAPTCHA_SECRET_KEY="" \
    T212_API_KEY="" \
    FX_API_KEY=""

###############################################################################
# 3) standalone stage: pull in *real* runtime deps
###############################################################################
FROM node:22-slim AS standalone
WORKDIR /standalone

# npm to v11
RUN npm install -g npm@11

# copy only what Next’s standalone build needs (use the normalised entry)
COPY --from=builder /standalone/server.mjs ./

# copy lockfile + manifest for runtime deps (if you insist on npm ci here)
COPY --from=deps /workspace/package.json      ./package.json
COPY --from=deps /workspace/package-lock.json ./package-lock.json

# You can skip this entirely because Next standalone already includes node_modules,
# but if you want the extra safety, keep it:
RUN npm ci --omit=dev --no-audit --no-fund || (sleep 10 && npm ci --omit=dev --no-audit --no-fund)

# debug
RUN echo "=== standalone: node_modules snippet ===" \
  && ls -1 node_modules | grep -E '^(next|react|react-dom)' || true

###############################################################################
# 4) final runner image (Distroless)
###############################################################################
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app

# copy the standalone server snapshot (normalised)
COPY --from=standalone /standalone/server.mjs   ./
COPY --from=standalone /standalone/package.json ./
COPY --from=standalone /standalone/node_modules ./node_modules

# copy the full Next.js build output & your public folder
COPY --from=builder /workspace/apps/nextjs-app/.next ./.next
COPY --from=builder /workspace/apps/nextjs-app/public  ./public

ENV PORT=3000
# EXPOSE 3000

# Distroless form (node runtime already provided by base image)
CMD ["server.mjs"]
