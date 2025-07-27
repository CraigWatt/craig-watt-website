# --------------------
# Stage 1: deps
# --------------------
FROM node:20-slim AS deps
WORKDIR /workspace

# install workspace deps so we can build
COPY package.json   package-lock.json  nx.json   tsconfig.json ./
COPY apps/nextjs-app/package.json        apps/nextjs-app/
RUN npm ci --ignore-scripts

# --------------------
# Stage 2: builder
# --------------------
FROM deps AS builder
WORKDIR /workspace

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

# bring in all sources & build
COPY . .
RUN npx nx build nextjs-app --configuration=production

# prune dev deps for the app (this installs only prod deps into apps/nextjs-app/node_modules)
RUN cd apps/nextjs-app \
 && npm install --omit=dev

# --------------------
# Stage 3: runtime
# --------------------
FROM node:20-slim AS runner
WORKDIR /app

# 1) copy the built server bundle
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone/server.js      .
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone/package.json   .

# 2) copy the pruned prod node_modules (this will include 'next')
COPY --from=builder /workspace/apps/nextjs-app/node_modules   ./node_modules

# 3) static assets + public
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static/  .next/static/
COPY --from=builder /workspace/apps/nextjs-app/public/       public/

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
