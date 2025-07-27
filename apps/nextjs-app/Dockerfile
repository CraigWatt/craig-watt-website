# ------------------------------------------------------
# Stage 1: Install all workspace deps (so `next` ends up in /workspace/node_modules)
# ------------------------------------------------------
FROM node:20-slim AS deps
WORKDIR /workspace

COPY package.json        package-lock.json  nx.json  tsconfig.json ./
COPY apps/nextjs-app/package.json  apps/nextjs-app/
RUN npm ci --ignore-scripts

RUN echo "=== deps stage: workspace node_modules tree ===" \
 && ls -1R /workspace/node_modules | head -n 50

# ------------------------------------------------------
# Stage 2: Build & prune
# ------------------------------------------------------
FROM deps AS builder
WORKDIR /workspace

ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY
ENV MAILERSEND_API_KEY=$MAILERSEND_API_KEY \
    CONTACT_EMAIL_TO=$CONTACT_EMAIL_TO \
    CONTACT_EMAIL_FROM=$CONTACT_EMAIL_FROM \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
    RECAPTCHA_SECRET_KEY=$RECAPTCHA_SECRET_KEY

COPY . .
RUN npx nx build nextjs-app --configuration=production

RUN echo "=== builder: .next/standalone tree ===" \
 && ls -R apps/nextjs-app/.next/standalone

# Prune dev-deps inside your app folder
RUN cd apps/nextjs-app \
 && npm install --omit=dev

RUN echo "=== builder: apps/nextjs-app/node_modules tree ===" \
 && ls -1R apps/nextjs-app/node_modules | head -n 50

# Bundle standalone server + its full prod node_modules
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone \
 && cp -r apps/nextjs-app/node_modules /standalone/node_modules

RUN echo "=== builder: /standalone tree ===" \
 && ls -1R /standalone | head -n 50

# ------------------------------------------------------
# Stage 3: Runtime (no extra install)
# ------------------------------------------------------
FROM node:20-slim AS runner
WORKDIR /app

# Copy in the fully-populated standalone bundle + node_modules
COPY --from=builder /standalone/server.js    .
COPY --from=builder /standalone/package.json .
COPY --from=builder /standalone/node_modules ./node_modules

RUN echo "=== runner (final): /app tree ===" \
 && ls -1R /app | head -n 50 \
 && test -d node_modules/next && echo "✅ next present" || (echo "❌ next missing!" && exit 1)

# Copy over static assets & public
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static/ .next/static/
COPY --from=builder /workspace/apps/nextjs-app/public/    public/

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
