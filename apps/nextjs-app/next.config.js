// apps/nextjs-app/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  output: 'standalone',
};

module.exports = (async () => {
  // 1) Load all ESM-only modules via dynamic import
  const [
    { default: remarkFrontmatter },
    { default: remarkMdxFrontmatter },
    mdxMod,
    ccMod,
  ] = await Promise.all([
    import('remark-frontmatter'),
    import('remark-mdx-frontmatter'),
    import('@next/mdx'),
    import('@content-collections/next'),
  ]);

  // 2) Pull out the factories
  const createMDX = mdxMod.default || mdxMod;
  const withContentCollections = ccMod.withContentCollections || ccMod.default?.withContentCollections;
  if (typeof createMDX !== 'function' || typeof withContentCollections !== 'function') {
    throw new Error('Failed to load MDX or content-collections plugin');
  }

  // 3) Configure MDX
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

  // 4) Compose and return the final Next.js config
  return withContentCollections(withMDX(nextConfig));
})();
