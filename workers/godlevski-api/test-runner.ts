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
const env: AgnosticEnv = {
  DB: createLocalD1(sqlitePath),
  OMIT_PATH_PREFIX: process.env.OMIT_PATH_PREFIX || '/api',
  SERVICE_NAME: process.env.SERVICE_NAME || 'godlevski-api (express)',
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
