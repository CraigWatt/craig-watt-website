#!/usr/bin/env bash
set -euo pipefail

# 1) Dev server (next dev)
echo -e "\n→ npx nx serve website"
npx nx serve website

echo -e "\n✅ serve concluded."
