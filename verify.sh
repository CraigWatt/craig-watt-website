#!/usr/bin/env bash
set -euo pipefail

# 1) Build (force local run so we generate the graph)
echo -e "\n→ npx nx build nextjs-app --skip-nx-cache"
npx nx build nextjs-app --skip-nx-cache
echo "✓ build"

# 2) Lint (force local run so it can read that graph)
echo -e "\n→ npx nx lint nextjs-app --skip-nx-cache"
npx nx lint nextjs-app --skip-nx-cache
echo "✓ lint"

# 3) Test
echo -e "\n→ npx nx test nextjs-app"
npx nx test nextjs-app
echo "✓ test"

# 4) Build Storybook
echo -e "\n→ npx nx run nextjs-app:build-storybook"
npx nx run nextjs-app:build-storybook
echo "✓ build-storybook"

# 5) Start production server (standalone bundle)
echo -e "\n→ npx nx start nextjs-app"
npx nx start nextjs-app

# 6) Dev server (next dev)
echo -e "\n→ npx nx serve nextjs-app"
npx nx serve nextjs-app

# 7) Storybook UI
echo -e "\n→ npx nx run nextjs-app:storybook"
npx nx run nextjs-app:storybook

echo -e "\n✅ All verifications completed."

# ps aux | grep 'nx/src' | grep -v grep | awk '{print $2}' | xargs kill
# is a big save with lint troubles, see here: https://github.com/nrwl/nx/issues/30668
