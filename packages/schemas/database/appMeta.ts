import { z } from 'zod';

// 1:1 with app_meta (infra/migrations/godlevski-db/0001_init.sql)
export const appMetaRowSchema = z.object({
  key: z.string(),
  value: z.string(),
  updated_at: z.string(),
});

export type AppMetaRow = z.infer<typeof appMetaRowSchema>;
