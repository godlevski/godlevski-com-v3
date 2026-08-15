// applies seeds/godlevski/godlevski-db content to the repo-local sqlite — the one-time
// content bootstrap (slides rows etc.), separate from schema migrations.
// run manually: pnpm db:seed:local
import path from 'node:path';
import { applyMigrations } from '@godlevski/agnostic-lambda/d1Shim';

const repoRoot = path.resolve(__dirname, '..');
const sqlitePath = process.env.LOCAL_SQLITE_PATH
  ? path.resolve(repoRoot, process.env.LOCAL_SQLITE_PATH)
  : path.join(repoRoot, 'local/godlevski-db.sqlite');
const seedsDir = path.join(repoRoot, 'seeds/godlevski/godlevski-db');

applyMigrations(sqlitePath, seedsDir, '[local-seed]', 'seed_migrations');
console.log(`[local-seed] db: ${sqlitePath}`);
