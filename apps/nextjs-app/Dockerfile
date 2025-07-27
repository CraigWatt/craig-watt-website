# ─────────────────────────────────────────────────────────────────────────────
# 1) deps stage: install ALL workspace deps so Next can produce its own standalone
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS deps
WORKDIR /workspace

# copy only workspace root manifests
COPY package.json package-lock.json nx.json tsconfig.json ./

# copy the Next app’s own package.json (only for workspace install)
COPY apps/nextjs-app/package.json apps/nextjs-app/

# install everything in the monorepo (so /workspace/node_modules has next, react, etc)
RUN npm ci --ignore-scripts

# debug: show a snippet of workspace/node_modules
RUN echo "=== deps: workspace/node_modules snippet ===" && \
    ls -1R /workspace/node_modules | head -n50

# ─────────────────────────────────────────────────────────────────────────────
# 2) builder stage: build Next and extract its standalone bundle
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /workspace

# copy all source
COPY . .

# build with Nx -> this generates .next in apps/nextjs-app/.next
RUN npx nx build nextjs-app --configuration=production

# debug: show the standalone output tree
RUN echo "=== builder: .next/standalone tree ===" && \
    ls -R apps/nextjs-app/.next/standalone

# copy the standalone server bundle + its package.json into /standalone
RUN mkdir /standalone && \
    cp -r apps/nextjs-app/.next/standalone/* /standalone

# ─────────────────────────────────────────────────────────────────────────────
# 3) standalone stage: install ONLY the runtime deps that Next declared
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS standalone
WORKDIR /standalone

# bring in Next’s standalone package.json + server.js
COPY --from=builder /standalone/package.json .
COPY --from=builder /standalone/server.js .

# run install (not ci, because there is no lockfile here)
RUN echo "=== standalone: before npm install ===" && ls -1 && \
    npm install --omit=dev && \
    echo "=== standalone: node_modules tree ===" && ls -1 node_modules

# ─────────────────────────────────────────────────────────────────────────────
# 4) runner stage: assemble the final minimal image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app

# copy the server.js + runtime node_modules
COPY --from=standalone /standalone/server.js .
COPY --from=standalone /standalone/node_modules ./node_modules
COPY --from=standalone /standalone/package.json .

# copy the static assets
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static .next/static
COPY --from=builder /workspace/apps/nextjs-app/public public

# debug final layout
RUN echo "=== runner: final /app tree ===" && ls -R . | head -n50 && \
    test -d node_modules/next && echo "✅ next present" || (echo "❌ next missing!" && exit 1)

# tell Docker which port to expose and how to run
EXPOSE 3000
CMD ["node", "server.js"]
