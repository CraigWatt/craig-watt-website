# ------------------------------------------------------
# Stage 1: Install all workspace deps so that we get
#           `next`, `react`, etc. under apps/nextjs-app/node_modules
# ------------------------------------------------------
FROM node:20-slim AS deps
WORKDIR /workspace

# Copy only lockfiles & manifest for workspace
COPY package.json        package-lock.json  nx.json  tsconfig.json ./
COPY apps/nextjs-app/package.json  apps/nextjs-app/
# install everything (including `next`) into node_modules/
RUN npm ci --ignore-scripts

# debug
RUN echo "=== deps stage: workspace node_modules tree ===" \
 && ls -1R /workspace/node_modules | head -n 50

# ------------------------------------------------------
# Stage 2: Build & prune
# ------------------------------------------------------
FROM deps AS builder
WORKDIR /workspace

# Bring in all source & env secrets
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

# Copy full repo & build
COPY . .
RUN npx nx build nextjs-app --configuration=production

# Dump tree of standalone output
RUN echo "=== builder: .next/standalone tree ===" \
 && ls -R apps/nextjs-app/.next/standalone

# Prune to only prod deps inside the app folder
# This writes apps/nextjs-app/node_modules with only prod deps,
# including next, react, react-dom, etc.
RUN cd apps/nextjs-app \
 && npm install --omit=dev

# Debug what got pruned
RUN echo "=== builder: apps/nextjs-app/node_modules tree ===" \
 && ls -1R apps/nextjs-app/node_modules | head -n 50

# Copy standalone bundle + prod node_modules into one flat place
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone \
 && cp -r apps/nextjs-app/node_modules /standalone/node_modules

# Verify /standalone contents
RUN echo "=== builder: /standalone tree ===" \
 && ls -1R /standalone | head -n 50

# ------------------------------------------------------
# Stage 3: Runtime image
# ------------------------------------------------------
FROM node:20-slim AS runner
WORKDIR /app

# 1) bring in just the standalone server and its deps
COPY --from=builder /standalone/server.js   .
COPY --from=builder /standalone/package.json .
COPY --from=builder /standalone/node_modules ./node_modules

# Debug before any install
RUN echo "=== runner (pre-install): /app tree ===" \
 && ls -1R /app | head -n 50

# 2) ensure prod deps are there—no further install needed
#    (node_modules already includes next & friends)
#    If you prefer `npm ci`, make sure package-lock.json is in sync
#    otherwise plain `npm install --omit=dev` works too.
RUN npm install --omit=dev --no-audit --no-fund

# Debug after npm install
RUN echo "=== runner (post-install): /app tree ===" \
 && ls -1R /app | head -n 50 \
 && test -d node_modules/next && echo "✅ next present" || (echo "❌ next missing!" && exit 1)

# 3) copy over static assets & public
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static/ .next/static/
COPY --from=builder /workspace/apps/nextjs-app/public/    public/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
