// local express runner — proves the handler is platform-agnostic (point-o
// pattern): same agnosticHandler, express mapping instead of workerd, local
// sqlite standing in for the D1 binding.
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import cookieParser from 'cookie-parser';
import { loadEnv } from '@godlevski/agnostic-lambda/helpers/loadEnv';
import { AgnosticEnv } from '@godlevski/agnostic-lambda/helpers';
import { createLocalD1 } from '@godlevski/agnostic-lambda/d1Shim';
import { expressEntryHandler } from './index';

// *** ENVIRONMENT
// .env < .env.local < .env.[ENV_MODE] < .env.[ENV_MODE].local
loadEnv(__dirname, '[godlevski-api]');

const PORT = Number(process.env.PORT) || 4300;
const HOST = process.env.HOST || '127.0.0.1';

// same bindings shape the worker gets, backed locally; plain vars ride in
// from the env cascade (deployed, they come from wrangler vars/secrets)
const sqlitePath = path.resolve(__dirname, process.env.LOCAL_SQLITE_PATH || '../../local/godlevski-db.sqlite');
if (!fs.existsSync(sqlitePath)) {
  console.warn(`[test-runner] no local db at ${sqlitePath} — run \`pnpm db:migrate:local\` (migrations are manual)`);
}
console.log(`[test-runner] local D1 -> ${sqlitePath}`);
// all plain vars from the env cascade ride into the bindings object, so
// controllers see the same names the deployed worker gets from wrangler vars
const CARRIED_VARS = [
  'OMIT_PATH_PREFIX', 'SERVICE_NAME',
  'EMAIL_FROM', 'EMAIL_LINK_BASE', 'JWT_SECRET', 'RESEND_API_KEY',
  'TOKEN_EXPIRATION_MS', 'EMAIL_VERIFICATION_LIFESPAN_MS',
  'EMAIL_VERIFICATION_REQUEST_LIFESPAN_MS', 'EMAIL_HOOK_LIFESPAN_MS',
];
const env: AgnosticEnv = {
  DB: createLocalD1(sqlitePath),
  ...Object.fromEntries(CARRIED_VARS.filter(name => process.env[name] !== undefined).map(name => [name, process.env[name]])),
};
const ctx = { waitUntil: (_promise: Promise<unknown>) => {} };

const app = express();
app.use(cookieParser());
app.use(express.text());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res) => {
  const processedResponse = await expressEntryHandler(req, { env, ctx });
  res
    .set(processedResponse.headers)
    .status(processedResponse.statusCode)
    .send(processedResponse.body);
});

app.listen(PORT, HOST, () => {
  console.log(`[test-runner] express api running on http://${HOST}:${PORT}`);
});
