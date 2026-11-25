import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const bolumler = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/bolumler' }),
  schema: z.object({
    unit: z.string(),
    part: z.enum(['onsozler', 'bilinemez', 'bilinebilir', 'ekler']),
    order: z.number(),
    number: z.string(),
    slug: z.string(),
    title: z.string(),
    titleEn: z.string(),
    description: z.string(),
    summary: z.string(),
    pages: z.tuple([z.number().nullable(), z.number().nullable()]),
    sections: z.array(z.string()),
    words: z.number(),
    terms: z.array(z.string()),
    termOverrides: z.record(z.string(), z.object({ tr: z.string(), explanation: z.string() })).default({}),
  }),
});

export const collections = { bolumler };
