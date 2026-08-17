/** @type {import('next').NextConfig} */
module.exports = (async () => {
  const path = await import("node:path");
  const [
    mdxMod,
    ccMod,
  ] = await Promise.all([
    import("@next/mdx"),
    import("@content-collections/next"),
  ]);

  const createMDX = mdxMod.default || mdxMod;
  const withContentCollections =
    ccMod.withContentCollections || ccMod.default?.withContentCollections;

  if (typeof createMDX !== "function" || typeof withContentCollections !== "function") {
    throw new Error("Failed to load MDX or content-collections plugin");
  }

  const withMDX = createMDX({
    extension: /\.mdx?$/,
    options: {
      remarkPlugins: [
        'remark-frontmatter',
        ['remark-mdx-frontmatter', { name: 'frontMatter' }],
      ],
      rehypePlugins: [],
    },
  });

  const nextConfig = {
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    output: "export",
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
    outputFileTracingRoot: path.join(__dirname, "../.."),
    webpack: (config) => {
      config.cache = false;
      return config;
    },
  };

  return withContentCollections(withMDX(nextConfig));
})();
