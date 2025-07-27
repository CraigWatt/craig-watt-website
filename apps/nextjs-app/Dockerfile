# ====================
# Stage 1: deps
# ====================
FROM node:20-slim AS deps
WORKDIR /workspace

# Copy only the root manifest + your app’s package.json (for best cache hits)
COPY package.json package-lock.json nx.json tsconfig.json ./
COPY apps/nextjs-app/package.json apps/nextjs-app/

RUN npm ci --ignore-scripts

# ====================
# Stage 2: builder
# ====================
FROM deps AS builder
WORKDIR /workspace

# Bring in your secrets at build time
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

# Copy everything else & build
COPY . .
RUN npx nx build nextjs-app --configuration=production

# Re‐flatten the monorepo’s standalone bundle into .next/standalone
RUN mkdir -p .next/standalone \
 && cp -r apps/nextjs-app/.next/standalone/apps/nextjs-app/* .next/standalone/

# ====================
# Stage 3: runner
# ====================
FROM node:20-slim AS runner
WORKDIR /app

# 1) Copy in the standalone server bundle (includes server.js, package.json, node_modules)
COPY --from=builder /workspace/.next/standalone/ ./

# 2) Copy the static assets & public folder
COPY --from=builder /workspace/apps/nextjs-app/.next/static/ ./.next/static/
COPY --from=builder /workspace/apps/nextjs-app/public/ ./public/

ENV NODE_ENV=production
EXPOSE 3000

# Use the standalone server entrypoint
CMD ["node", "server.js"]
