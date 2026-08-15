// applies infra/migrations to the repo-local sqlite (local/godlevski-db.sqlite).
// run manually: pnpm db:migrate:local
// (the express runner does NOT auto-migrate — migrations are a deliberate act)
import path from 'node:path';
import { applyMigrations } from '@godlevski/agnostic-lambda/d1Shim';

const repoRoot = path.resolve(__dirname, '..');
const sqlitePath = process.env.LOCAL_SQLITE_PATH
  ? path.resolve(repoRoot, process.env.LOCAL_SQLITE_PATH)
  : path.join(repoRoot, 'local/godlevski-db.sqlite');
const migrationsDir = path.join(repoRoot, 'infra/migrations/godlevski-db');

applyMigrations(sqlitePath, migrationsDir, '[local-migrate]');
console.log(`[local-migrate] db: ${sqlitePath}`);
