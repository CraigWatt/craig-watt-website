# ====================
# Stage 1: deps
# ====================
FROM node:20-slim AS deps
WORKDIR /workspace

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

# collect the standalone server bundle
# (server.js + package.json + list of prod deps)
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone \
 && cd /standalone \
 && npm ci --omit=dev

# ====================
# Stage 3: runtime
# ====================
FROM node:20-slim AS runner
WORKDIR /app

COPY --from=builder /standalone/ ./

RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static/ .next/static/
COPY --from=builder /workspace/apps/nextjs-app/public/ public/

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
