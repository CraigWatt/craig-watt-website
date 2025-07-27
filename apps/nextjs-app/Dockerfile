# ===========================
# Stage 1: deps
# ===========================
FROM node:20-slim AS deps
WORKDIR /workspace

# install all workspacesʼ dependencies (so NX can run)
COPY package.json package-lock.json nx.json tsconfig.json ./
COPY apps/nextjs-app/package.json apps/nextjs-app/
RUN npm ci --ignore-scripts

# ===========================
# Stage 2: builder
# ===========================
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

# copy the whole repo, build your Next app
COPY . .
RUN npx nx build nextjs-app --configuration=production

# pull out the standalone server bundle
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone

# ===========================
# Stage 3: runtime
# ===========================
FROM node:20-slim AS runner
WORKDIR /app

# 1) bring in server.js
COPY --from=builder /standalone/server.js .

# 2) bring in your real app’s package.json + lock (so `npm ci` will install
#    exactly your declared prod deps, including `next`)
COPY --from=builder /workspace/apps/nextjs-app/package.json .
COPY --from=builder /workspace/apps/nextjs-app/package-lock.json .

# 3) install prod deps
RUN npm ci --omit=dev

# 4) copy static files + public
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static/ .next/static/
COPY --from=builder /workspace/apps/nextjs-app/public/ public/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
