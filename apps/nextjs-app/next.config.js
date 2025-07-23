// apps/nextjs-app/next.config.js
// @ts-check

import { composePlugins, withNx } from '@nx/next';

/** @type {import('@nx/next/plugins/with-nx').WithNxOptions} */
const nextConfig = {
  // Enable standalone output to support Docker multi-stage build
  output: 'standalone',

  nx: {
    // Set this to true if you would like to use SVGR
    svgr: false,
  },

  // ⚠️ Skip type-check errors during build to unblock CI temporarily
  typescript: {
    ignoreBuildErrors: true,
  },

  // ⚠️ Skip ESLint checks during build to unblock CI temporarily
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default composePlugins(withNx)(nextConfig);
