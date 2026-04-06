const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

module.exports = (async () => {
  // ESM-only modules via dynamic import
  const [
    { default: remarkFrontmatter },
    { default: remarkMdxFrontmatter },
    mdxMod,
    ccMod,
  ] = await Promise.all([
    import("remark-frontmatter"),
    import("remark-mdx-frontmatter"),
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
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontMatter" }],
      ],
      rehypePlugins: [],
    },
  });

  return withContentCollections(withMDX(nextConfig));
})();
