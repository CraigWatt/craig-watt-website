# apps/nextjs-app/Dockerfile

# 1) Install deps
FROM node:20-alpine AS deps
WORKDIR /app
# copy only lockfiles for cache
COPY package.json package-lock.json ./
RUN npm ci

# 2) Build
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npx nx build nextjs-app --configuration=production

# 3) Run
FROM node:20-alpine AS runner
WORKDIR /app
# copy the standalone Next.js output
COPY --from=builder /app/apps/nextjs-app/.next/standalone ./
COPY --from=builder /app/apps/nextjs-app/.next/static ./.next/static
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
