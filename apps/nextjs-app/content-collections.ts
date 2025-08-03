import {
  defineCollection,
  defineConfig,
  createDefaultImport,
} from '@content-collections/core'
import { z } from 'zod'
import type { MDXContent } from 'mdx/types'

const projects = defineCollection({
  name: 'projects',
  directory: 'content/projects',
  include: ['**/*.mdx'],
  parser: 'frontmatter-only',
  schema: z.object({
    slug:       z.string(),
    title:      z.string(),
    summary:    z.string(),
    github:     z.string().url().optional(),
    hero:       z.string(),
    heroWidth:  z.number(),
    heroHeight: z.number(),

    // ── NEW FIELDS ─────────────────────────────────────
    thumbLg:     z.string().optional(),
    thumbLgWidth:  z.number().optional(),
    thumbLgHeight: z.number().optional(),

    thumb:       z.string().optional(),
    thumbWidth:  z.number().optional(),
    thumbHeight: z.number().optional(),

    screens:     z.array(
                    z.object({
                      src:    z.string(),
                      width:  z.number(),
                      height: z.number(),
                    })
                  ).optional(),

    og:        z.string().optional(),
    ogWidth:  z.number().optional(),
    ogHeight: z.number().optional(),

    badges:   z.array(z.string()).optional(),
    // ───────────────────────────────────────────────────
  }),
  transform: ({ _meta, ...frontmatter }) => {
    const mdxContent = createDefaultImport<MDXContent>(
      `/content/projects/${_meta.filePath}`
    )

    return {
      ...frontmatter,
      slug:     _meta.path,
      filePath: _meta.filePath,
      mdxContent,
    }
  },
})

const posts = defineCollection({
  name: 'posts',
  directory: 'content/blog',
  include: ['**/*.mdx'],
  parser: 'frontmatter-only',
  schema: z.object({
    title:        z.string(),
    date:         z.string(),             // or z.date() if you parse dates
    summary:      z.string(),
    github:       z.string().url().optional(),
    tags:         z.array(z.string()).optional(),

    // mirror the same media fields if you need them in posts…
    hero:         z.string().optional(),
    heroWidth:    z.number().optional(),
    heroHeight:   z.number().optional(),

    thumb:        z.string().optional(),
    thumbWidth:   z.number().optional(),
    thumbHeight:  z.number().optional(),

    og:           z.string().optional(),
    ogWidth:      z.number().optional(),
    ogHeight:     z.number().optional(),
  }),
  transform: ({ _meta, ...frontmatter }) => {
    const mdxContent = createDefaultImport<MDXContent>(
      `/content/blog/${_meta.filePath}`
    )

    return {
      ...frontmatter,
      slug:     _meta.path,
      filePath: _meta.filePath,
      mdxContent,
    }
  },
})

export default defineConfig({
  collections: [projects, posts],
})
