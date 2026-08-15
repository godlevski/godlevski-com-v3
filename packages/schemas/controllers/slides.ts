import { z } from 'zod';

// GET /api/slides — folio slides with populated area tags
// (contract preserved from v2.1 mongo populate: tags as embedded objects,
// select 'exp eyp sxp syp tagname' + _id)
export const folioTagSchema = z.object({
  _id: z.string(),
  tagname: z.string(),
  // area box, % of image dimensions
  sxp: z.number(),
  syp: z.number(),
  exp: z.number(),
  eyp: z.number(),
});

export const folioSlideSchema = z.object({
  _id: z.string(),
  publicId: z.string(),
  project: z.string(),
  client: z.string(),
  tools: z.string().nullish(),
  date: z.string(),
  image: z.string(),
  image_width: z.number().nullish(),
  image_height: z.number().nullish(),
  tags: z.array(folioTagSchema),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});

export const slidesResponseSchema = z.object({
  status: z.literal('success'),
  data: z.array(folioSlideSchema),
});

export type FolioTag = z.infer<typeof folioTagSchema>;
export type FolioSlide = z.infer<typeof folioSlideSchema>;
export type SlidesResponse = z.infer<typeof slidesResponseSchema>;
