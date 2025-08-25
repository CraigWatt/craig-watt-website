// apps/nextjs-app/next.config.js

const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  output: "standalone",

  // ↓↓↓ Key bits for smaller runtime images ↓↓↓
  experimental: {
    // trace from the monorepo root so Next grabs the right node_modules
    outputFileTracingRoot: path.join(__dirname, "../.."),
    // drop dev/test/build toolchains from the traced runtime
    outputFileTracingExcludes: {
      "*": [
        "**/@types/**",
        "**/eslint*/**",
        "**/jest*/**",
        "**/typescript/**",
        "**/ts-node/**",
        "**/@storybook/**",
        "**/storybook/**",
        "**/@playwright/**",
        "**/playwright*/**",
        "**/@nx/**",
        // build-only toolchains commonly pulled in
        "**/@swc/**",
        "**/swc*/**",
        "**/@rspack/**",
        // if you don't use headless Chrome at runtime:
        "**/puppeteer*/**",
        "**/chrome-aws-lambda*/**",
      ],
    },
  },
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
