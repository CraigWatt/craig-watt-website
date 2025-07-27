# ====================
# Stage 1: deps
# ====================
FROM node:20-alpine AS deps
WORKDIR /workspace

# Copy monorepo manifests
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

COPY . .
RUN npx nx build nextjs-app --configuration=production

# ====================
# Stage 3: runner
# ====================
FROM node:20-alpine AS runner
WORKDIR /app

# 1) Copy the standalone build (with its own node_modules + package.json + server.js)
COPY --from=builder /workspace/dist/apps/nextjs-app/.next/standalone/ ./

# 2) Copy Next’s static files so images/CSS/etc get served
#    This must go into .next/static relative to server.js
RUN mkdir -p .next/static
COPY --from=builder /workspace/dist/apps/nextjs-app/.next/static/ .next/static/

# 3) Copy your public folder (for image imports, favicons, etc)
COPY --from=builder /workspace/apps/nextjs-app/public/ public/

ENV NODE_ENV=production
EXPOSE 3000

# sanity-check: list your images
RUN ls -lR public/images

CMD ["node", "server.js"]
