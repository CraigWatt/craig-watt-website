//apps/nextjs-app/next.config.js
const createMDX = require('@next/mdx');
const remarkFrontmatter    = require('remark-frontmatter').default || require('remark-frontmatter');
const remarkMdxFrontmatter = require('remark-mdx-frontmatter').default || require('remark-mdx-frontmatter');
const { withContentCollections } = require('@content-collections/next');

/** @type {import('next').NextConfig} */
let nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  output: 'standalone',
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: 'frontMatter' }],
    ],
    rehypePlugins: [],
  },
});

module.exports = withContentCollections(
  withMDX(nextConfig)
);
