import { z } from 'zod';

// 1:1 with tags (infra/migrations/godlevski-db/0002_slides_tags.sql)
export const tagRowSchema = z.object({
  id: z.string(),
  slide_id: z.string(),
  tagname: z.string(),
  sxp: z.number(),
  syp: z.number(),
  exp: z.number(),
  eyp: z.number(),
  position: z.number(),
});

export type TagRow = z.infer<typeof tagRowSchema>;
