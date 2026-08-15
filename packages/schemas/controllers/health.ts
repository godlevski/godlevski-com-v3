import { z } from 'zod';

// GET /api/health
export const healthResponseSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  schemaVersion: z.string().nullable(),
  timestamp: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
