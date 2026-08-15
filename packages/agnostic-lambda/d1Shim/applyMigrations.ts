// local-dev only: applies wrangler-style .sql migrations to a local sqlite
// file, tracked in the same d1_migrations table wrangler uses remotely —
// one set of migration files, two appliers.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export const applyMigrations = (
  sqlitePath: string,
  migrationsDir: string,
  logPrefix = '[applyMigrations]',
  // seeds reuse this runner with their own ledger (e.g. 'seed_migrations')
  trackingTable = 'd1_migrations'
): string[] => {
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  const db = new DatabaseSync(sqlitePath);
  db.exec(`CREATE TABLE IF NOT EXISTS ${trackingTable} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  const appliedRows = db.prepare(`SELECT name FROM ${trackingTable}`).all() as Array<{ name: string }>;
  const alreadyApplied = new Set(appliedRows.map(row => row.name));

  const pending = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && !alreadyApplied.has(file))
    .sort();

  for (const file of pending) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec('BEGIN');
    try {
      db.exec(sql);
      db.prepare(`INSERT INTO ${trackingTable} (name) VALUES (?)`).run(file);
      db.exec('COMMIT');
      console.log(`${logPrefix} applied ${file}`);
    } catch (e) {
      db.exec('ROLLBACK');
      throw new Error(`migration ${file} failed: ${String((e as Error).message)}`);
    }
  }

  if (!pending.length) {
    console.log(`${logPrefix} up to date (${alreadyApplied.size} applied)`);
  }
  db.close();
  return pending;
};
