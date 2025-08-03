// content-collections.ts (at repo root)

import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'

export const projects = defineCollection({
  name:      'projects',
  directory: 'content/projects',
  include:   ['**/*.mdx'],
  schema: z.object({
    title:        z.string(),
    slug:         z.string(),
    summary:      z.string(),
    hero:         z.string(),
    heroWidth:    z.number(),
    heroHeight:   z.number(),
    screens:      z.array(
                    z.object({
                      src:    z.string(),
                      width:  z.number(),
                      height: z.number(),
                    })
                  ).optional(),
  }),
})

export const posts = defineCollection({
  name:      'posts',
  directory: 'content/blog',
  include:   ['**/*.mdx'],
  schema: z.object({
    title:       z.string(),
    date:        z.string(),
    summary:     z.string(),
    tags:        z.array(z.string()).optional(),
  }),
})

export default defineConfig({
  collections: [projects, posts],
})
