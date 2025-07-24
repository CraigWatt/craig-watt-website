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

  // ⚠️
  typescript: {
  },

  // ⚠️
  eslint: {
  },
};

export default composePlugins(withNx)(nextConfig);
