import { z } from 'zod';

// 1:1 with email_verifications (infra/migrations/godlevski-db/0003_email_verifications.sql)
export const emailVerificationRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  code: z.string().nullable(),
  verified: z.string().nullable(),
  request_sent: z.string().nullable(),
  hook_id: z.string().nullable(),
  hook_created_at: z.string().nullable(),
  number_of_inquiries: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EmailVerificationRow = z.infer<typeof emailVerificationRowSchema>;
