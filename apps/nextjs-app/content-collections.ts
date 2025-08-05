import {
  defineCollection,
  defineConfig,
} from '@content-collections/core'
import { z } from 'zod'
// import type { MDXContent } from 'mdx/types'

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
    thumbLg:     z.string(),
    thumbLgWidth:  z.number(),
    thumbLgHeight: z.number(),

    thumb:       z.string(),
    thumbWidth:  z.number(),
    thumbHeight: z.number(),

    screens:     z.array(
                    z.object({
                      src:    z.string(),
                      width:  z.number(),
                      height: z.number(),
                    })
                  ).optional(),

    og:        z.string(),
    ogWidth:  z.number(),
    ogHeight: z.number(),

    badges:   z.array(z.string()).optional(),
    // ───────────────────────────────────────────────────
  }),
  transform: ({ _meta, ...frontmatter }) => ({
    ...frontmatter,
    slug:     _meta.path,
    filePath: _meta.filePath, // You already lazy-import this in `ProjectClient`
  }),
})

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: ['**/*.mdx'],
  parser: 'frontmatter-only',
  schema: z.object({
    title:        z.string(),
    date:         z.string(), // optionally use z.date() if you want date parsing
    summary:      z.string(),
    excerpt:      z.string().optional(), // optional override
    github:       z.string().url().optional(),
    tags:         z.array(z.string()).optional(),
    category:     z.string(),
    author:       z.string(),
    readingTime:  z.string(),

    hero:         z.string(),
    heroWidth:    z.number(),
    heroHeight:   z.number(),

    thumb:        z.string(),
    thumbLg:      z.string(),
    thumbWidth:   z.number(),
    thumbHeight:  z.number(),

    og:           z.string(),
    ogWidth:      z.number(),
    ogHeight:     z.number(),
    badges:   z.array(z.string()).optional(),
  }),
  transform: ({ _meta, ...frontmatter }) => ({
    ...frontmatter,
    slug:     _meta.path,
    filePath: _meta.filePath, // Will be used in BlogClient to dynamic-import
  }),
})

export default defineConfig({
  collections: [projects, posts], // <- this must be present and correct
});
