import { z } from 'zod';

// 1:1 with slides (infra/migrations/godlevski-db/0002_slides_tags.sql)
export const slideRowSchema = z.object({
  id: z.string(),
  public_id: z.string(),
  project: z.string(),
  client: z.string(),
  tools: z.string().nullable(),
  date: z.string(),
  image: z.string(),
  image_width: z.number().nullable(),
  image_height: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type SlideRow = z.infer<typeof slideRowSchema>;
