import { z } from 'zod';

// GET /api/hello?name=...
export const helloQuerySchema = z.object({
  name: z.string().min(1).max(120).optional(),
});

// POST /api/hello
export const helloBodySchema = z.object({
  name: z.string().min(1).max(120),
  message: z.string().max(2000).optional(),
});

export const helloResponseSchema = z.object({
  greeting: z.string(),
  echo: z.record(z.string(), z.any()).optional(),
});

export type HelloQuery = z.infer<typeof helloQuerySchema>;
export type HelloBody = z.infer<typeof helloBodySchema>;
export type HelloResponse = z.infer<typeof helloResponseSchema>;
