# --------------------
# Stage 1: deps
# --------------------
FROM node:20-slim AS deps
WORKDIR /workspace

# install workspace deps so we can build
COPY package.json package-lock.json nx.json tsconfig.json ./
COPY apps/nextjs-app/package.json apps/nextjs-app/
RUN npm ci --ignore-scripts

# --------------------
# Stage 2: builder
# --------------------
FROM deps AS builder
WORKDIR /workspace

# build-time secrets
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

# copy all sources & build
COPY . .
RUN npx nx build nextjs-app --configuration=production

# debug: show exactly what Next.js produced  
RUN echo "=== DEBUG: .next/standalone tree ===" \
 && ls -R apps/nextjs-app/.next/standalone

# extract only the standalone server bundle (server.js + package.json)
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone

# debug: contents of our standalone staging area  
RUN echo "=== DEBUG: /standalone tree ===" \
 && ls -R /standalone

# --------------------
# Stage 3: runtime
# --------------------
FROM node:20-slim AS runner
WORKDIR /app

# 1) copy the minimal standalone bundle
COPY --from=builder /standalone/ ./

# debug: before installing any deps  
RUN echo "=== DEBUG (pre-npm): /app tree ===" \
 && ls -R /app

# 2) install prod-only deps for the standalone server (this pulls in `next`)
RUN npm ci --omit=dev

# debug: after npm ci  
RUN echo "=== DEBUG (post-npm): /app tree ===" \
 && ls -R /app

# 3) copy static assets & public for the server
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static/ .next/static
COPY --from=builder /workspace/apps/nextjs-app/public/ public

# final settings
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
