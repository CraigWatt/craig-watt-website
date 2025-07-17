# apps/nextjs-app/Dockerfile

# allow passing secrets in:
ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY

# 1) Install dependencies at the monorepo root
FROM node:20-alpine AS deps
WORKDIR /workspace

# only copy what we need to install
COPY package.json package-lock.json nx.json ./
# if you have tsconfig.base.json or other root config:
COPY tsconfig.base.json ./
# copy your libs and app package manifests so workspace deps resolve
COPY apps/nextjs-app/package.json apps/nextjs-app/
COPY libs libs/

RUN npm ci

# 2) Build your Next.js app
FROM deps AS builder
WORKDIR /workspace

# bring in _everything_ so nx can see your code + configs
COPY . .

# export secrets for build-time (so getServerSideProps / env-injected code works)
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

# produce the standalone output
RUN npx nx build nextjs-app --configuration=production

# 3) Package ONLY the standalone output into a minimal image
FROM node:20-alpine AS runner
WORKDIR /app

# copy just the built server + static assets
COPY --from=builder /workspace/dist/apps/nextjs-app/standalone ./
COPY --from=builder /workspace/dist/apps/nextjs-app/static ./static

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","server.js"]
