import { AgnosticEvent, AgnosticOutput } from '@godlevski/agnostic-lambda/event';
import { HttpError } from '@godlevski/agnostic-lambda/classes';
import {
  stringifyJsonOutput,
  getSqliteDatabase,
  getObjectBucket,
  getEnvVar,
  checkToken,
  log
} from '@godlevski/agnostic-lambda/helpers';
import { inquiryBodySchema, inquiryResponseSchema } from '@godlevski/schemas/controllers/inquiry';
import { EmailVerificationRow } from '@godlevski/schemas/database';
import { sendEmail } from '../helpers/sendEmail';

// port of v2.1 inquiryController.processInquiry — attachments land in R2
// (inquiries/<subfolder>/) instead of a disk folder, served by the files worker
const MAX_FILES = 10;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

// POST /api/inquiry (multipart)
export const inquiryPostController = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  const body = inquiryBodySchema.parse(event.body);
  const { email, token, name, company, website, description } = body;
  const db = getSqliteDatabase(event);

  // -- email must be verified, token must match, verification must be fresh
  const emailVer = await db
    .prepare('SELECT * FROM email_verifications WHERE email = ?')
    .bind(email)
    .first<EmailVerificationRow>();
  const jwtSecret = getEnvVar(event, 'JWT_SECRET') || 'dev-only-jwt-secret';
  const payload = await checkToken(token, jwtSecret);
  if (!payload || !emailVer || payload.email !== emailVer.email) {
    throw new HttpError('Unable to confirm email, request is not sent', { statusCode: 401 });
  }
  if (!emailVer.verified) {
    throw new HttpError('Email is not confirmed', { statusCode: 401 });
  }
  const verificationLifespanMs = Number(getEnvVar(event, 'EMAIL_VERIFICATION_LIFESPAN_MS')) || 86400000;
  if (Date.now() - new Date(emailVer.verified).getTime() > verificationLifespanMs) {
    throw new HttpError('Email verification expired', { statusCode: 408 });
  }

  // -- store attachments (v2.1 date-prefix naming, R2 key space)
  const files = event.files || [];
  if (files.length > MAX_FILES) {
    throw new HttpError(`Too many files (max ${MAX_FILES})`, { statusCode: 413 });
  }
  const subfolder = email.replace('@', '__').replace(/\./g, '_');
  const now = new Date();
  const prefix = [
    now.getFullYear(), now.getMonth(), now.getDate(),
    now.getHours(), now.getMinutes(), now.getSeconds(),
    Math.floor(Math.random() * 10)
  ].join('_');

  const filenames: string[] = [];
  if (files.length) {
    const bucket = getObjectBucket(event, 'FILES');
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        throw new HttpError(`File ${file.filename} is too big (max 10MB)`, { statusCode: 413 });
      }
      const filename = `${prefix}--${file.filename.replace(/\s+/g, '_')}`;
      await bucket.put(`inquiries/${subfolder}/${filename}`, file.data);
      filenames.push(filename);
    }
  }

  // -- compose + send the inquiry email
  const filesPublicBase = getEnvVar(event, 'CLIENT_FILES_PUBLIC') || 'https://files.godlevski.com/inquiries/';
  const webFolder = `${filesPublicBase}${subfolder}/`;
  const transpiled = Object.entries(body).map(([field, value]) => `${field} :\t${value}`).join('<br />');
  await sendEmail(event, {
    to: getEnvVar(event, 'INQUIRY_TO') || 'Dmitriy Godlevski <dmitriy@godlevski.com>',
    subject: `${name} Inquiry`,
    html: `
      Date Submitted:\t\t${new Date()}<br /><br />
      Email Created at:\t\t<b>${emailVer.created_at}</b><br />
      Email Updated at:\t\t<b>${emailVer.updated_at}</b><br />
      Number of inquiries:\t\t<b>${emailVer.number_of_inquiries + 1}</b><br /><br />
      <h3>User:</h3>
      Name:\t\t<b>${name}</b><br />
      Email:\t\t<b>${email}</b><br />
      Company:\t\t<b>${company || ''}</b><br />
      Website:\t\t<b>${website || ''}</b><br />
      <h3>Inquiry:</h3>
      <p>${description || ''}</p><br />
      <h3>Files:</h3>
      ${filenames.map(fname => `<a href="${webFolder}${fname}">${fname}</a><br />`).join('')}
      ----------------------------------------------------------<br />
      transpile:<br />
      <i>${transpiled}</i>
    `,
  });

  // -- count it
  await db
    .prepare("UPDATE email_verifications SET number_of_inquiries = number_of_inquiries + 1, updated_at = datetime('now') WHERE email = ?")
    .bind(email)
    .run();
  log(event, `[inquiry] processed from ${email} with ${filenames.length} file(s)`);

  return stringifyJsonOutput({
    statusCode: 200,
    json: inquiryResponseSchema.parse({
      status: 'successfully processed',
      data: { files: filenames },
    }),
  });
};
