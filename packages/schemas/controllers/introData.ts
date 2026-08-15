import { z } from 'zod';

// GET /api/introData — intro slides: copy + shapefile reference per slide
// (contract preserved from v2.1: { status: 'success', data: [...] })
export const introSlideSchema = z.object({
  title: z.string(),
  text: z.string(),
  shapefile: z.string(),
  tags: z.array(z.string()).optional(),
  icons: z.array(z.string()).optional(),
});

export const introDataResponseSchema = z.object({
  status: z.literal('success'),
  data: z.array(introSlideSchema),
});

export type IntroSlide = z.infer<typeof introSlideSchema>;
export type IntroDataResponse = z.infer<typeof introDataResponseSchema>;
