#!/usr/bin/env bash
set -euo pipefail

# 0) Dedicated TypeScript check
npx tsc --noEmit
echo "✓ TypeScript check done"

# 1) Lint (force local run so it can read that graph)
echo -e "\n→ npm run lint"
npm run lint
echo "✓ lint"

# 2) Test
echo -e "\n→ npm run test"
npm run test
echo "✓ test"

# 3) Build (force local run so we generate the graph)
echo -e "\n→ npm run build"
npm run build
echo "✓ build"

echo -e "\n✅ All mini verifications completed."
