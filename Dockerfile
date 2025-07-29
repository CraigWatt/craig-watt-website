# 0) declare build-time args…
ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY

###############################################################################
# 1) deps stage: install *all* your monorepo deps from the root lockfile
###############################################################################
FROM node:20-slim AS deps
WORKDIR /workspace

# immediately export the build-args inside this stage
ENV MAILERSEND_API_KEY=${MAILERSEND_API_KEY}
ENV CONTACT_EMAIL_TO=${CONTACT_EMAIL_TO}
ENV CONTACT_EMAIL_FROM=${CONTACT_EMAIL_FROM}
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
ENV RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY}

# 1.1) Copy your root manifests (including workspaces)
COPY package.json package-lock.json nx.json tsconfig.json ./

# 1.2) Install EVERYTHING (all apps + libs)
RUN npm ci --ignore-scripts

# debug: list a snippet of your workspace-wide node_modules
RUN echo "=== deps: workspace/node_modules snippet ===" \
  && ls -1R node_modules | head -n50

###############################################################################
# 2) builder stage: compile the Next.js app via Nx
###############################################################################
FROM deps AS builder
WORKDIR /workspace

# re-declare build args for this stage
ARG MAILERSEND_API_KEY
ARG CONTACT_EMAIL_TO
ARG CONTACT_EMAIL_FROM
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG RECAPTCHA_SECRET_KEY

# export them so Next can read process.env during build
ENV MAILERSEND_API_KEY=${MAILERSEND_API_KEY}
ENV CONTACT_EMAIL_TO=${CONTACT_EMAIL_TO}
ENV CONTACT_EMAIL_FROM=${CONTACT_EMAIL_FROM}
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
ENV RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY}

# 2.1) Bring in *all* your source
COPY . .

# 2.2) Build only the Next.js app
RUN npx nx build nextjs-app --configuration=production

# debug: inspect the standalone output directory
RUN echo "=== builder: .next/standalone tree ===" \
  && ls -R apps/nextjs-app/.next/standalone

# 2.3) Extract the standalone snapshot
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone

# debug: show what landed in /standalone
RUN echo "=== builder: /standalone before npm ci ===" \
  && ls -1 /standalone

###############################################################################
# 3) standalone stage: install *runtime* deps only
###############################################################################
FROM node:20-slim AS standalone
WORKDIR /standalone

# 3.1) Copy Next’s “standalone” artifacts
COPY --from=builder /standalone/package.json   ./package.json
COPY --from=builder /standalone/server.js      ./server.js

# 3.2) Copy your root lockfile+manifest so npm ci will install next/react/etc
COPY --from=deps /workspace/package.json       ./package.json
COPY --from=deps /workspace/package-lock.json  ./package-lock.json

# 3.3) Install only production deps
RUN npm ci --omit=dev --no-audit --no-fund

# debug: verify next & React are in node_modules
RUN echo "=== standalone: node_modules snippet ===" \
  && ls -1 node_modules | grep -E "^(next|react|react-dom)"

###############################################################################
# 4) final runner image
###############################################################################
FROM node:20-slim AS runner
WORKDIR /app

# 4.1) Copy the standalone server + runtime deps
COPY --from=standalone /standalone/server.js      ./
COPY --from=standalone /standalone/node_modules   ./node_modules

# flag package.json as ESM
RUN node -e "let p=require('./package.json'); p.type='module'; require('fs').writeFileSync('package.json', JSON.stringify(p,null,2));"

# 4.2) Copy built output and public/static assets
COPY --from=builder /workspace/apps/nextjs-app/.next   ./.next
COPY --from=builder /workspace/apps/nextjs-app/public ./public

# debug: final sanity check
RUN echo "=== runner: final /app tree ===" \
  && ls -R . | head -n50 \
  && test -d node_modules/next && echo "✅ next present" || (echo "❌ next missing!" && exit 1)

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
