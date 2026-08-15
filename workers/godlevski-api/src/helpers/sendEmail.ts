import { AgnosticEvent } from '@godlevski/agnostic-lambda/event';
import { HttpError } from '@godlevski/agnostic-lambda/classes';
import { getEnvVar, log } from '@godlevski/agnostic-lambda/helpers';

export interface EmailMessage {
  to: string;      // "Name <addr@host>" or bare address
  subject: string;
  html: string;
}

// provider-neutral email sending. Implementation: Resend HTTP API (workers
// can't SMTP). Without RESEND_API_KEY the message is logged instead — the
// local dev fallback that keeps the whole flow testable (the code is in
// the logged html).
export const sendEmail = async (event: AgnosticEvent, message: EmailMessage): Promise<void> => {
  const apiKey = getEnvVar(event, 'RESEND_API_KEY');
  const from = getEnvVar(event, 'EMAIL_FROM') || 'Godlevski Automatic Message <dmitriy@godlevski.com>';

  if (!apiKey) {
    log(event, `[sendEmail] NO RESEND_API_KEY — dev fallback, logging instead of sending`);
    log(event, `[sendEmail] to: ${message.to} | subject: ${message.subject}`);
    log(event, `[sendEmail] html: ${message.html.replace(/\s+/g, ' ').slice(0, 600)}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ from, to: message.to, subject: message.subject, html: message.html }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error(`[sendEmail] resend responded ${response.status}: ${detail.slice(0, 300)}`);
    throw new HttpError('Could not send the verification email, please try again later', {
      statusCode: 502,
    });
  }
};
