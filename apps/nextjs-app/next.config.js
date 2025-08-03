// apps/nextjs-app/next.config.js

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/
})

/** @type {import('next').NextConfig} */
module.exports = withMDX({
  // keep your standalone output
  output: 'standalone',

  // tell Next to treat .md and .mdx as pages
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // any other custom Next.js config you already have…
})
