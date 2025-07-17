# ====================
# Stage 1: deps
# ====================
FROM node:20-alpine AS deps
WORKDIR /workspace

# Copy just the manifests & monorepo config to maximize npm-ci cache hits
COPY   package.json       package-lock.json  nx.json     tsconfig.base.json ./
COPY   apps/nextjs-app/package.json apps/nextjs-app/
COPY   libs                     libs/

RUN npm ci

# ====================
# Stage 2: builder
# ====================
FROM deps AS builder
WORKDIR /workspace

# Build-time secrets (for e.g. MailerSend, reCAPTCHA)
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

# Now copy the rest of the repo
COPY . .

# Run your production build
RUN npx nx build nextjs-app --configuration=production

# ====================
# Stage 3: runner
# ====================
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only the standalone server + static assets
COPY --from=builder /workspace/dist/apps/nextjs-app/standalone ./
COPY --from=builder /workspace/dist/apps/nextjs-app/static    ./.next/static

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
