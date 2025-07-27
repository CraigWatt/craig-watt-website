# ===========================
# Stage 1: deps
# ===========================
FROM node:20-slim AS deps
WORKDIR /workspace

COPY package.json package-lock.json nx.json tsconfig.json ./
COPY apps/nextjs-app/package.json apps/nextjs-app/
RUN npm ci --ignore-scripts

# ===========================
# Stage 2: builder
# ===========================
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

# extract the standalone server bundle (contains server.js + its own package.json)
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone

# ===========================
# Stage 3: runtime
# ===========================
FROM node:20-slim AS runner
WORKDIR /app

# 1) bring in server.js + standalone package.json
COPY --from=builder /standalone/server.js .
COPY --from=builder /standalone/package.json .

# 2) install production deps (will pull in `next` etc. based on standalone's package.json)
RUN npm install --omit=dev

# 3) copy the static assets & public folder
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static/ .next/static/
COPY --from=builder /workspace/apps/nextjs-app/public/ public/

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
