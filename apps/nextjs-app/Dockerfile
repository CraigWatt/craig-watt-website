# ====================
# Stage 1: deps
# ====================
FROM node:20-alpine AS deps
WORKDIR /workspace

# Copy monorepo manifests
COPY package.json package-lock.json nx.json tsconfig.json ./
COPY apps/nextjs-app/package.json apps/nextjs-app/

# Install dependencies but skip postinstall scripts
RUN npm ci --ignore-scripts

# ====================
# Stage 2: builder
# ====================
FROM deps AS builder
WORKDIR /workspace

# Pass secrets at build time
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

# Copy everything and build
COPY . .
RUN npx nx build nextjs-app --configuration=production

# ====================
# Stage 3: runner
# ====================
FROM node:20-alpine AS runner
WORKDIR /app

# Bring in standalone server (includes its node_modules) + static assets
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone ./
COPY --from=builder /workspace/apps/nextjs-app/.next/static ./.next/static

# Copy public folder so images and other assets are served
COPY --from=builder /workspace/apps/nextjs-app/public ./public

ENV NODE_ENV=production
EXPOSE 3000

# Debugging: List contents of public/images to verify assets
RUN ls -lR ./public/images

CMD ["node", "server.js"]
