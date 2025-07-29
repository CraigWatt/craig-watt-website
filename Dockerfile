ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY

###############################################################################
# 1) deps stage: install everything for the workspace
###############################################################################
FROM node:20-slim AS deps
WORKDIR /workspace

# copy root manifests for full dependency install
COPY package.json        package-lock.json  nx.json  tsconfig.json ./

RUN npm ci --ignore-scripts

# debug: just to be sure
RUN echo "=== deps: workspace/node_modules snippet ===" \
  && ls -1R node_modules | head -n50

###############################################################################
# 2) builder stage: compile the Next.js app
###############################################################################
FROM deps AS builder
WORKDIR /workspace

# Re-declare and export the args for this stage
ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY

ENV MAILERSEND_API_KEY=${MAILERSEND_API_KEY}
ENV CONTACT_EMAIL_TO=${CONTACT_EMAIL_TO}
ENV CONTACT_EMAIL_FROM=${CONTACT_EMAIL_FROM}
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
ENV RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY}

# bring in your source
COPY . .

RUN npx nx build nextjs-app --configuration=production

# debug: inspect .next/standalone
RUN echo "=== builder: .next/standalone tree ===" \
  && ls -R apps/nextjs-app/.next/standalone

# prepare a flattened /standalone snapshot
RUN mkdir /standalone \
  && cp -r apps/nextjs-app/.next/standalone/* /standalone

# debug:
RUN echo "=== builder: /standalone before npm ci ===" \
  && ls -1 /standalone

# Extra safe: clear all secrets from the builder stage's ENV
ENV MAILERSEND_API_KEY="" \
    CONTACT_EMAIL_TO="" \
    CONTACT_EMAIL_FROM="" \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY="" \
    RECAPTCHA_SECRET_KEY=""

###############################################################################
# 3) standalone stage: pull in *real* runtime deps
###############################################################################
FROM node:20-slim AS standalone
WORKDIR /standalone

# copy only what Next’s standalone build needs
COPY --from=builder /standalone/server.js ./

# copy _your_ lockfile+manifest so npm ci will pull in next/react/etc
COPY --from=deps     /workspace/package.json       ./package.json
COPY --from=deps     /workspace/package-lock.json  ./package-lock.json

RUN npm ci --omit=dev --no-audit --no-fund

# debug: verify next is truly here
RUN echo "=== standalone: node_modules snippet ===" \
  && ls -1 node_modules | grep -E "^(next|react|react-dom)"

###############################################################################
# 4) final runner image
###############################################################################
FROM node:20-slim AS runner
WORKDIR /app

# give us jq for json edits
RUN apt-get update \
 && apt-get install -y --no-install-recommends jq \
 && rm -rf /var/lib/apt/lists/*

# copy the standalone server snapshot
COPY --from=standalone /standalone/server.js    ./
COPY --from=standalone /standalone/package.json ./
COPY --from=standalone /standalone/node_modules ./node_modules

# copy the full Next.js build output & your public folder
COPY --from=builder /workspace/apps/nextjs-app/.next ./.next
COPY --from=builder /workspace/apps/nextjs-app/public  public

# sanity check
RUN echo "=== runner: final /app tree ===" \
 && ls -R . | head -n50 \
 && test -d node_modules/next && echo "✅ next present" || (echo "❌ next missing!" && exit 1)

# flag package.json as ES module
RUN jq '. + {"type":"module"}' package.json > package.tmp.json \
 && mv package.tmp.json package.json

ENV PORT=3000
EXPOSE 3000

CMD ["node","server.js"]

