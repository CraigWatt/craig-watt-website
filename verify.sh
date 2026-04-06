#!/usr/bin/env bash
set -euo pipefail

# 0) Dedicated TypeScript check
npx tsc --noEmit
echo "✓ TypeScript check done"

# 1) Lint (force local run so it can read that graph)
echo -e "\n→ npx nx lint website --skip-nx-cache"
npx nx lint website --skip-nx-cache
echo "✓ lint"

# 2) Test
echo -e "\n→ npx nx test website"
npx nx test website
echo "✓ test"

# 3) Build (force local run so we generate the graph)
echo -e "\n→ npx nx build website --skip-nx-cache"
npx nx build website --skip-nx-cache
echo "✓ build"

# 4) Build Storybook
echo -e "\n→ npx nx run website:build-storybook"
npx nx run website:build-storybook
echo "✓ build-storybook"

# 5) Start production server (standalone bundle)
echo -e "\n→ npx nx start website"
npx nx start website

# 6) Dev server (next dev)
echo -e "\n→ npx nx serve website"
npx nx serve website

# 7) Storybook UI
echo -e "\n→ npx nx run website:storybook"
npx nx run website:storybook

echo -e "\n✅ All verifications completed."

# ps aux | grep 'nx/src' | grep -v grep | awk '{print $2}' | xargs kill
# is a big save with lint troubles, see here: https://github.com/nrwl/nx/issues/30668
