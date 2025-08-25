#!/usr/bin/env bash
set -euo pipefail

# 1) Dev server (next dev)
echo -e "\n→ npx nx serve nextjs-app"
npx nx serve nextjs-app

echo -e "\n✅ serve concluded."
