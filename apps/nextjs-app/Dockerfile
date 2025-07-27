# ===================================================================
# 1) deps stage: grab workspace deps so we can build everything
# ===================================================================
FROM node:20-slim AS deps
WORKDIR /workspace

COPY package.json        package-lock.json  nx.json   tsconfig.json ./
COPY apps/nextjs-app/package.json apps/nextjs-app/
RUN npm ci --ignore-scripts


# ===================================================================
# 2) builder stage: build your Next.js app and extract the standalone bundle
# ===================================================================
FROM deps AS builder
WORKDIR /workspace

# bring in build-time secrets
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

# debug: show what Next.js emitted here
RUN echo "=== DEBUG: .next/standalone tree ===" \
 && ls -R apps/nextjs-app/.next/standalone

# stage out only package.json + server.js into /standalone
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone

# debug: confirm standalone contents
RUN echo "=== DEBUG: /standalone tree ===" \
 && ls -R /standalone


# ===================================================================
# 3) runtime stage: pull in that minimal bundle + install prod deps
# ===================================================================
FROM node:20-slim AS runner
WORKDIR /app

# 1) copy the bare bundle
COPY --from=builder /standalone/ ./

# debug: before installing
RUN echo "=== DEBUG (pre-install): /app tree ===" \
 && ls -R /app

# 2) install production-only deps (will pull in `next` automatically)
RUN npm install --omit=dev

# debug: after installing
RUN echo "=== DEBUG (post-install): /app tree ===" \
 && ls -R /app

# 3) bring in static assets & public folder
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static/ .next/static
COPY --from=builder /workspace/apps/nextjs-app/public/    public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
