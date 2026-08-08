import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const modules = defineCollection({
  loader: glob({
    base: './src/content/modules',
    pattern: '**/*.json',
  }),
  schema: z.object({
    id: z.string(),
    type: z.enum(['hero', 'profile', 'skill', 'project', 'experience', 'post', 'trusted']),
    group: z.string(),
    title: z.string(),
    order: z.number().int().nonnegative(),
    visible: z.boolean().default(true),
    sourceId: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const collections = { blog, modules };
