import { z } from 'zod';

// GET /api/tags-index — tag taxonomy: category -> tag names
// (contract preserved from v2.1: { status: 'success', data: {...} })
export const tagsIndexResponseSchema = z.object({
  status: z.literal('success'),
  data: z.record(z.string(), z.array(z.string())),
});

export type TagsIndexResponse = z.infer<typeof tagsIndexResponseSchema>;
