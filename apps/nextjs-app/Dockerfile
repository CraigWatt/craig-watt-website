# --------------------
# Stage 1: deps
# --------------------
FROM node:20-slim AS deps
WORKDIR /workspace

# copy your monorepo root manifest + lock
COPY package.json        package-lock.json  nx.json   tsconfig.json ./

# copy the Next.js app’s own manifest + lock too
COPY apps/nextjs-app/package.json  apps/nextjs-app/package-lock.json  apps/nextjs-app/

# install workspace deps (no scripts, so build remains hermetic)
RUN npm ci --ignore-scripts

# --------------------
# Stage 2: builder
# --------------------
FROM deps AS builder
WORKDIR /workspace

# bring in secrets
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

# now switch into the app folder and install only prod deps
# this uses the lockfile we copied in Stage 1, so next@… will be pulled in
RUN cd apps/nextjs-app \
 && npm ci --omit=dev

# --------------------
# Stage 3: runtime
# --------------------
FROM node:20-slim AS runner
WORKDIR /app

# 1) copy the built standalone server bundle
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone/server.js    .
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone/package.json .

# 2) bring in the freshly pruned prod node_modules (includes next!)
COPY --from=builder /workspace/apps/nextjs-app/node_modules ./node_modules

# 3) static assets + public
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static .next/static
COPY --from=builder /workspace/apps/nextjs-app/public    public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
