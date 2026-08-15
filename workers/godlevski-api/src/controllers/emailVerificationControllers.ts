import { AgnosticEvent, AgnosticOutput } from '@godlevski/agnostic-lambda/event';
import { HttpError } from '@godlevski/agnostic-lambda/classes';
import {
  stringifyJsonOutput,
  getSqliteDatabase,
  getEnvVar,
  signToken,
  checkToken,
  log
} from '@godlevski/agnostic-lambda/helpers';
import {
  emailVerifyBodySchema,
  emailConfirmSchema,
  requestSentResponseSchema,
  emailVerifiedResponseSchema
} from '@godlevski/schemas/controllers/emailVerify';
import { EmailVerificationRow } from '@godlevski/schemas/database';
import { sendEmail } from '../helpers/sendEmail';
import { emailConfirmedPage, confirmationFailedPage } from '../templates/emailPages';

// port of v2.1 emailsVerificationController — same wire contract, two
// platform redesigns: hooks live on the row (stateless workers), email goes
// out via HTTP api instead of smtp. One faithful-bug fix: resent emails now
// store their new code (v2.1 emailed a fresh code but never saved it).

// -- config off the bindings (wrangler vars / express env cascade)
const envNumber = (event: AgnosticEvent, name: string, fallback: number): number =>
  Number(getEnvVar(event, name)) || fallback;

const getConfig = (event: AgnosticEvent) => ({
  jwtSecret: getEnvVar(event, 'JWT_SECRET') || 'dev-only-jwt-secret',
  linkBase: getEnvVar(event, 'EMAIL_LINK_BASE') || 'http://localhost:8080/api',
  tokenExpirationMs: envNumber(event, 'TOKEN_EXPIRATION_MS', 259200000),                       // 3d
  verificationLifespanMs: envNumber(event, 'EMAIL_VERIFICATION_LIFESPAN_MS', 86400000),        // 24h
  requestLifespanMs: envNumber(event, 'EMAIL_VERIFICATION_REQUEST_LIFESPAN_MS', 54000000),     // 15h
  hookLifespanMs: envNumber(event, 'EMAIL_HOOK_LIFESPAN_MS', 7200000),                         // 2h
});

// v2.1 generateCode(5): digits collapsed through a number (leading zero drops)
const generateCode = (digits = 5): string => {
  let code = '';
  for (let i = 0; i < digits; i++) code += Math.floor(10 * Math.random());
  return String(Number(code));
};

const findByEmail = (event: AgnosticEvent, email: string) =>
  getSqliteDatabase(event)
    .prepare('SELECT * FROM email_verifications WHERE email = ?')
    .bind(email)
    .first<EmailVerificationRow>();

// -- responses
const respondVerified = async (event: AgnosticEvent, email: string, verified: string): Promise<AgnosticOutput> => {
  const { jwtSecret, tokenExpirationMs } = getConfig(event);
  const token = await signToken({ email }, jwtSecret, tokenExpirationMs);
  return stringifyJsonOutput({
    statusCode: 201,
    json: emailVerifiedResponseSchema.parse({
      status: 'email verified',
      data: { verified, token },
    }),
  });
};

const respondRequestSent = async (event: AgnosticEvent, row: Pick<EmailVerificationRow, 'email'>, statusCode = 200): Promise<AgnosticOutput> => {
  // stateless hook: id lives on the row, pollers look it up by id
  const hook = crypto.randomUUID();
  await getSqliteDatabase(event)
    .prepare("UPDATE email_verifications SET hook_id = ?, hook_created_at = datetime('now'), updated_at = datetime('now') WHERE email = ?")
    .bind(hook, row.email)
    .run();
  return stringifyJsonOutput({
    statusCode,
    json: requestSentResponseSchema.parse({ status: 'request sent', data: { hook } }),
  });
};

const htmlOutput = (statusCode: number, body: string): AgnosticOutput => ({
  statusCode,
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'content-security-policy': "script-src 'unsafe-inline'",
  },
  body,
});

// -- send + persist one verification code email
const sendVerificationRequest = async (event: AgnosticEvent, name: string, email: string): Promise<void> => {
  const { linkBase } = getConfig(event);
  const code = generateCode(5);
  const href = `${linkBase}/email/verify/code?email=${encodeURIComponent(email)}&code=${code}`;
  await sendEmail(event, {
    to: `${name} <${email}>`,
    subject: 'Email Verification',
    html: `Dear ${name}, <br /><br />
      <div>
        <p>Please verify your email by following the</p>
        <a style="display:inline-block;background-color:blue;color:white; width: 300px; height:50px; line-height: 50px; font-size: 18px; text-align:center;"
          href="${href}">Verification Link</a><br />
          (${href})<br />
        <p>Request source page will update automatically; optionally, you may use the following code:</p>
        <span style="display:inline-block;background-color:#e7e7e7;color:black; width: 300px; height:50px; line-height: 50px; font-size: 18px; text-align:center;">${code}</span>
        <p>Should you have any questions or concerns, feel free to reply to this email</p>
        <p>Sincerely yours,<br /> Dmitriy</p>
      </div>`,
  });
  await getSqliteDatabase(event)
    .prepare("UPDATE email_verifications SET code = ?, request_sent = datetime('now'), updated_at = datetime('now') WHERE email = ?")
    .bind(code, email)
    .run();
};

// POST /api/email/verify
export const emailVerifyController = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  const { name, email, token } = emailVerifyBodySchema.parse(event.body);
  const { jwtSecret, verificationLifespanMs, requestLifespanMs } = getConfig(event);
  const db = getSqliteDatabase(event);

  let row = await findByEmail(event, email);

  // new email -> create record + send request
  if (!row) {
    await db
      .prepare('INSERT INTO email_verifications (id, name, email) VALUES (?, ?, ?)')
      .bind(crypto.randomUUID(), name, email)
      .run();
    await sendVerificationRequest(event, name, email);
    row = (await findByEmail(event, email))!;
    return respondRequestSent(event, row);
  }

  // recently verified + valid token -> instant success
  if (row.verified && token) {
    const payload = await checkToken(token, jwtSecret);
    if (payload && payload.email === row.email) {
      const verifiedElapsed = Date.now() - new Date(row.verified).getTime();
      if (verifiedElapsed < verificationLifespanMs) {
        return respondVerified(event, row.email, row.verified);
      }
    }
  }

  // forced resend, or the previous request grew stale -> send a fresh code
  const requestElapsed = row.request_sent ? Date.now() - new Date(row.request_sent).getTime() : Infinity;
  if (event.query['resend'] !== undefined || requestElapsed > requestLifespanMs) {
    await sendVerificationRequest(event, row.name, row.email);
    return respondRequestSent(event, row);
  }

  // current request still fresh -> keep it (202)
  log(event, `[emailVerify] keeping existing request for ${row.email}`);
  return respondRequestSent(event, row, 202);
};

// GET|POST /api/email/verify/code — link click (GET, html) or typed code (POST, json)
export const emailConfirmController = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  const source = event.method === 'GET' ? Object.fromEntries(Object.entries(event.query)) : event.body;
  const { email, code } = emailConfirmSchema.parse(source);
  const db = getSqliteDatabase(event);

  const row = await findByEmail(event, email);
  if (!row) throw new HttpError('Email request not found', { statusCode: 404 });

  if (String(row.code) !== code) {
    return event.method === 'GET'
      ? htmlOutput(422, confirmationFailedPage)
      : stringifyJsonOutput({ statusCode: 422, json: { status: 'fail', data: null } });
  }

  await db
    .prepare("UPDATE email_verifications SET verified = datetime('now'), updated_at = datetime('now') WHERE email = ?")
    .bind(email)
    .run();
  const updated = (await findByEmail(event, email))!;

  return event.method === 'GET'
    ? htmlOutput(200, emailConfirmedPage)
    : respondVerified(event, updated.email, updated.verified!);
};

// GET /api/email/verified/:hookId — the frontend polls this
export const emailHookController = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  const hookId = event.paths[2];
  if (!hookId) throw new HttpError('Incorrect request', { statusCode: 418 });
  const { hookLifespanMs, verificationLifespanMs } = getConfig(event);

  const row = await getSqliteDatabase(event)
    .prepare('SELECT * FROM email_verifications WHERE hook_id = ?')
    .bind(hookId)
    .first<EmailVerificationRow>();

  const hookAge = row?.hook_created_at ? Date.now() - new Date(row.hook_created_at).getTime() : Infinity;
  if (!row || hookAge > hookLifespanMs) {
    throw new HttpError('Hook has expired, please resubmit request', { statusCode: 408 });
  }

  if (row.verified) {
    const verifiedElapsed = Date.now() - new Date(row.verified).getTime();
    if (verifiedElapsed < verificationLifespanMs) {
      return respondVerified(event, row.email, row.verified);
    }
  }

  // pending — keep polling
  return { statusCode: 404 };
};
