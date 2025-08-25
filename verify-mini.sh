#!/usr/bin/env bash
set -euo pipefail

# 0) Dedicated TypeScript check
npx tsc --noEmit
echo "✓ TypeScript check done"

# 1) Lint (force local run so it can read that graph)
echo -e "\n→ npx nx lint nextjs-app --skip-nx-cache"
npx nx lint nextjs-app --skip-nx-cache
echo "✓ lint"

# 2) Test
echo -e "\n→ npx nx test nextjs-app"
npx nx test nextjs-app
echo "✓ test"

# 3) Build (force local run so we generate the graph)
echo -e "\n→ npx nx build nextjs-app --skip-nx-cache"
npx nx build nextjs-app --skip-nx-cache
echo "✓ build"

echo -e "\n✅ All mini verifications completed."
