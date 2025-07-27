# 1) deps stage: install all workspace deps
FROM node:20-slim AS deps

WORKDIR /workspace
COPY package.json package-lock.json nx.json tsconfig.json ./
COPY apps/nextjs-app/package.json apps/nextjs-app/
RUN npm ci --ignore-scripts

# debug: show top of workspace/node_modules
RUN echo "=== deps: workspace/node_modules snippet ===" \
  && ls -1R /workspace/node_modules | head -n 30

# 2) builder stage: build Next.js
FROM deps AS builder

WORKDIR /workspace
COPY . .
RUN npx nx build nextjs-app --configuration=production

# debug: show built standalone output
RUN echo "=== builder: .next/standalone tree ===" \
  && ls -R apps/nextjs-app/.next/standalone

# 3) standalone stage: prepare standalone server + its own node_modules
FROM node:20-slim AS standalone

WORKDIR /standalone
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone/package.json ./
COPY --from=builder /workspace/apps/nextjs-app/.next/standalone/server.js   ./

# install only prod deps (pulls in next, react, etc)
RUN echo "=== standalone: before npm install ===" \
  && ls -1 \
  && npm install --omit=dev --no-audit --no-fund \
  && echo "=== standalone: node_modules tree ===" \
  && ls -1 node_modules | head -n 30

# 4) final runner image
FROM node:20-slim AS runner

WORKDIR /app

# pull in standalone server + its deps
COPY --from=standalone /standalone/server.js    ./
COPY --from=standalone /standalone/package.json ./
COPY --from=standalone /standalone/node_modules ./node_modules

# critical: bring in the full build output
COPY --from=builder /workspace/apps/nextjs-app/.next     ./.next

# copy static assets
COPY --from=builder /workspace/apps/nextjs-app/public   public

# debug: final layout
RUN echo "=== runner: final /app tree ===" \
  && ls -R . | head -n 50 \
  && test -d .next && echo "✅ .next present" || (echo "❌ .next missing!" && exit 1)

ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
