# --------------------
# Stage 1: deps
# --------------------
FROM node:20-slim AS deps
WORKDIR /workspace

# install your monorepo deps so that 'nx build' works
COPY package.json        package-lock.json  nx.json   tsconfig.json ./
COPY apps/nextjs-app/package.json  apps/nextjs-app/
RUN npm ci --ignore-scripts

# --------------------
# Stage 2: builder
# --------------------
FROM deps AS builder
WORKDIR /workspace

# inject secrets
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

# copy all source & build
COPY . .
RUN npx nx build nextjs-app --configuration=production

# the standalone folder now contains server.js + package.json + a full prod node_modules/next
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone

# --------------------
# Stage 3: runtime
# --------------------
FROM node:20-slim AS runner
WORKDIR /app

# 1) copy the entire standalone bundle (has server.js + package.json + node_modules/next etc)
COPY --from=builder /standalone/ ./

# 2) static assets & public
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static/ .next/static
COPY --from=builder /workspace/apps/nextjs-app/public/    public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
