# 1) deps stage: install everything for the workspace
# ---------------------------------------------------
FROM node:20-slim AS deps

WORKDIR /workspace

# copy root manifests for full dependency install
COPY package.json package-lock.json nx.json tsconfig.json ./
# copy just your app’s manifest so CI knows about workspaces
COPY apps/nextjs-app/package.json apps/nextjs-app/

# install *all* workspace deps (including next, react, react-dom)
RUN npm ci --ignore-scripts

# debug: show top-level node_modules
RUN echo "=== deps: workspace/node_modules snippet ===" \
 && ls -1R node_modules | head -n50

# 2) builder stage: compile the Next.js app
# ------------------------------------------
FROM deps AS builder

WORKDIR /workspace

# copy rest of the code
COPY . .

# build production output
RUN npx nx build nextjs-app --configuration=production

# debug: inspect the standalone output Next generated
RUN echo "=== builder: .next/standalone tree ===" \
 && ls -R apps/nextjs-app/.next/standalone

# prepare /standalone with the minimal Next standalone
RUN mkdir /standalone \
 && cp -r apps/nextjs-app/.next/standalone/* /standalone

# debug: verify standalone contents
RUN echo "=== builder: /standalone before npm ci ===" \
 && ls -1 /standalone

# 3) standalone stage: pull in *real* runtime deps
# -------------------------------------------------
FROM node:20-slim AS standalone

WORKDIR /standalone

# bring in Next’s own package.json + server.js
COPY --from=builder /standalone/package.json ./
COPY --from=builder /standalone/server.js    ./

# **critical**: also copy the **root** lockfile and package.json
# so npm will install next, react, react-dom, etc.
COPY --from=deps     /workspace/package.json       ./package.json
COPY --from=deps     /workspace/package-lock.json  ./package-lock.json

# install only prod deps (includes next because of the real lockfile)
RUN npm ci --omit=dev

# debug: verify next is present
RUN echo "=== standalone: node_modules snippet ===" \
 && ls -1 node_modules | grep -E "^(next|react|react-dom|@?[^/]+)"

# 4) final runner image
# ----------------------
FROM node:20-slim AS runner

WORKDIR /app

# copy built server + node_modules from standalone
COPY --from=standalone /standalone/server.js    ./
COPY --from=standalone /standalone/package.json ./
COPY --from=standalone /standalone/node_modules ./node_modules

# copy static assets + static build output
RUN mkdir -p .next/static
COPY --from=builder /workspace/apps/nextjs-app/.next/static .next/static
COPY --from=builder /workspace/apps/nextjs-app/public public

# debug: final check
RUN echo "=== runner: final /app tree ===" \
 && ls -R . | head -n50 \
 && test -d node_modules/next && echo "✅ next present" || (echo "❌ next missing!" && exit 1)

# finally, run
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
