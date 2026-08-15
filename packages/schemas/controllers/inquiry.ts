import { z } from 'zod';

// POST /api/inquiry — multipart form; fields below + file attachments ride
// event.files. Extra form fields pass through (the email dumps all entries,
// v2.1 behavior).
export const inquiryBodySchema = z.looseObject({
  email: z.string().email(),
  token: z.string().min(1),
  name: z.string().min(1).max(200),
  company: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

export const inquiryResponseSchema = z.object({
  status: z.literal('successfully processed'),
  data: z.object({
    files: z.array(z.string()),
  }),
});

export type InquiryBody = z.infer<typeof inquiryBodySchema>;
export type InquiryResponse = z.infer<typeof inquiryResponseSchema>;
