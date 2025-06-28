# apps/nextjs-app/Dockerfile

# Allow passing secrets into the build
ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY

# 1) Install deps
FROM node:20-alpine AS deps
WORKDIR /app
# copy only lockfiles for cache
COPY package.json package-lock.json ./
RUN npm ci

# 2) Build with secrets available
FROM deps AS builder
WORKDIR /app
# re-declare build args in this stage
ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY
# export to env for build-time
ENV MAILERSEND_API_KEY=$MAILERSEND_API_KEY \
    CONTACT_EMAIL_TO=$CONTACT_EMAIL_TO \
    CONTACT_EMAIL_FROM=$CONTACT_EMAIL_FROM \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
    RECAPTCHA_SECRET_KEY=$RECAPTCHA_SECRET_KEY

# copy all sources
COPY . .
# run your Nx production build
RUN npx nx build nextjs-app --configuration=production

# 3) Run the standalone build
FROM node:20-alpine AS runner
WORKDIR /app
# copy the standalone output
COPY --from=builder /app/apps/nextjs-app/.next/standalone ./
COPY --from=builder /app/apps/nextjs-app/.next/static ./.next/static
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
