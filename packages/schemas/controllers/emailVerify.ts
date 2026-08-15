import { z } from 'zod';

// POST /api/email/verify — start (or re-check) a verification
export const emailVerifyBodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  // returning visitors send their jwt to skip re-verification
  token: z.string().optional(),
});

// GET|POST /api/email/verify/code — confirm via emailed code/link
export const emailConfirmSchema = z.object({
  email: z.string().email(),
  code: z.union([z.string(), z.number()]).transform(String),
});

// 200/202 — a code email is out, poll the hook
export const requestSentResponseSchema = z.object({
  status: z.literal('request sent'),
  data: z.object({ hook: z.string() }),
});

// 201 — verified; token lets the visitor skip next time
export const emailVerifiedResponseSchema = z.object({
  status: z.literal('email verified'),
  data: z.object({
    verified: z.string(),
    token: z.string(),
  }),
});

export type EmailVerifyBody = z.infer<typeof emailVerifyBodySchema>;
export type EmailConfirm = z.infer<typeof emailConfirmSchema>;
export type RequestSentResponse = z.infer<typeof requestSentResponseSchema>;
export type EmailVerifiedResponse = z.infer<typeof emailVerifiedResponseSchema>;
