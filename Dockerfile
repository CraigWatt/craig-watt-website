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

# copy minimal manifests for cacheable install
COPY package.json package-lock.json nx.json tsconfig.json ./
RUN npm ci --ignore-scripts || (sleep 10 && npm ci --ignore-scripts)

###############################################################################
# 2) builder stage: build Next.js
###############################################################################
FROM deps AS builder
WORKDIR /workspace

# Build-time env (NEXT_PUBLIC_* may be needed at build; pass private secrets at runtime)
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

# source -> build
COPY . .
RUN npx nx build nextjs-app --configuration=production

# flatten Next standalone to /standalone (pruned node_modules + package.json + server.*)
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone

# robust launcher: runs server.mjs (ESM) or server.js (CJS), top-level or nested
RUN mkdir -p /standalone \
 && cat > /standalone/launch.cjs <<'EOF'
(async () => {
  const fs = require('fs');
  const path = require('path');
  const { pathToFileURL } = require('url');
  const candidates = [
    './server.mjs',
    './server.js',
    './apps/nextjs-app/server.mjs',
    './apps/nextjs-app/server.js',
  ];
  for (const rel of candidates) {
    if (fs.existsSync(rel)) {
      const abs = path.resolve(rel);
      if (rel.endsWith('.mjs')) {
        await import(pathToFileURL(abs).href);
      } else {
        require(abs);
      }
      return;
    }
  }
  throw new Error('No server.(js|mjs) found in /app');
})();
EOF

# scrub secrets from this layer
ENV MAILERSEND_API_KEY="" \
    CONTACT_EMAIL_TO="" \
    CONTACT_EMAIL_FROM="" \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY="" \
    RECAPTCHA_SECRET_KEY="" \
    T212_API_KEY="" \
    FX_API_KEY=""

###############################################################################
# 3) final runner (distroless, nonroot)
###############################################################################
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
# FROM node:22-slim AS runner
WORKDIR /app

# Copy ONLY what runtime needs:
# - standalone runtime (pruned node_modules + server entry + launch.cjs)
COPY --from=builder /standalone ./
# - Next static assets + BUILD_ID (do NOT copy entire .next)
COPY --from=builder /workspace/apps/nextjs-app/.next/static ./.next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/BUILD_ID ./.next/BUILD_ID
# - Public assets
COPY --from=builder /workspace/apps/nextjs-app/public ./public

# Writable caches for Next/Image (fixes "received null" + EACCES on .next/cache)
ENV NEXT_CACHE_DIR=/tmp/next/cache
ENV NEXT_IMAGE_CACHE_DIR=/tmp/next/image-cache

ENV NODE_ENV=production
ENV PORT=3000
# EXPOSE is optional for ECS
# EXPOSE 3000

# Distroless already provides "node" entrypoint
CMD ["launch.cjs"]
