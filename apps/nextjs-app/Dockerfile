# ====================
# Stage 1: deps
# ====================
FROM node:20-slim AS deps
WORKDIR /workspace

# only copy the minimal files needed to install deps
COPY package.json package-lock.json nx.json tsconfig.json ./
COPY apps/nextjs-app/package.json apps/nextjs-app/
RUN npm ci --ignore-scripts

# ====================
# Stage 2: builder
# ====================
FROM deps AS builder
WORKDIR /workspace

# pass your secrets in as build-args
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

# copy everything & build
COPY . .
RUN npx nx build nextjs-app --configuration=production

# copy the standalone bundle out to a fixed location
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone

# ====================
# Stage 3: runtime
# ====================
FROM node:20-slim AS runner
WORKDIR /app

# 1) bring in the standalone bundle
COPY --from=builder /standalone/ ./

# 2) bring in your static assets
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static/ .next/static/

# 3) bring in your public folder
COPY --from=builder /workspace/apps/nextjs-app/public/ public/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
