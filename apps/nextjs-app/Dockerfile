# ====================
# Stage 1: deps
# ====================
FROM node:20-alpine AS deps
WORKDIR /workspace

# Only copy monorepo manifests (maximizes layer‐caching)
COPY package.json package-lock.json nx.json tsconfig.json ./
COPY apps/nextjs-app/package.json apps/nextjs-app/

RUN npm ci --ignore-scripts

# ====================
# Stage 2: builder
# ====================
FROM deps AS builder
WORKDIR /workspace

ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY

ENV \
  MAILERSEND_API_KEY=$MAILERSEND_API_KEY \
  CONTACT_EMAIL_TO=$CONTACT_EMAIL_TO \
  CONTACT_EMAIL_FROM=$CONTACT_EMAIL_FROM \
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
  RECAPTCHA_SECRET_KEY=$RECAPTCHA_SECRET_KEY

# copy everything & build the Next app in‐place
COPY . .
RUN npx nx build nextjs-app --configuration=production

# ====================
# Stage 3: runner
# ====================
FROM node:20-alpine AS runner
WORKDIR /app

# 1) Pull in the standalone server bundle (with its own package.json + node_modules + server.js)
COPY --from=builder \
     /workspace/apps/nextjs-app/.next/standalone/apps/nextjs-app/ \
     ./

# 2) And its node_modules + package.json
COPY --from=builder \
     /workspace/apps/nextjs-app/.next/standalone/node_modules/ \
     ./node_modules/
COPY --from=builder \
     /workspace/apps/nextjs-app/.next/standalone/package.json \
     ./package.json

# 3) Next’s runtime static assets (_next/static)
RUN mkdir -p .next/static
COPY --from=builder \
     /workspace/apps/nextjs-app/.next/static/ \
     ./.next/static/

# 4) Your public folder (images, icons, etc)
COPY --from=builder \
     /workspace/apps/nextjs-app/public/ \
     ./public/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
