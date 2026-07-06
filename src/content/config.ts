import { defineCollection, z } from "astro:content";

const areas = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      shortTitle: z.string(),
      description: z.string(),
      lang: z.enum(["sr", "en"]),
      order: z.number(),
      illustration: image().optional(),
      keywords: z.array(z.string()).optional(),
      relatedAreas: z.array(z.string()).optional(),
      qa: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    author: z.string().default("Miroslav Jovanović"),
    lang: z.enum(["sr", "en"]),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { areas, blog };
