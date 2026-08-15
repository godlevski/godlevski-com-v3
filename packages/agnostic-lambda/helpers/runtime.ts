import { AgnosticEvent } from '../event/AgnosticEvent';
import { WorkerRuntime } from '../event/mapWorkerToAgnostic';

// the sql surface controllers are allowed to assume — structurally satisfied
// by BOTH cloudflare's D1Database binding and the d1Shim over node:sqlite,
// so a controller never knows which platform it's running on
export interface SqlStatement {
  bind(...params: unknown[]): SqlStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean; meta: Record<string, unknown> }>;
  run(): Promise<{ success: boolean; meta: Record<string, unknown> }>;
}

export interface SqliteDatabase {
  prepare(sql: string): SqlStatement;
  batch?(statements: SqlStatement[]): Promise<unknown[]>;
}

// narrows the agnostic runtime carrier back to the platform's bindings
export const getRuntime = <Env = Record<string, unknown>>(event: AgnosticEvent): WorkerRuntime<Env> =>
  event.runtime as WorkerRuntime<Env>;

// the database, wherever it came from: D1 binding (workerd) or local sqlite
// shim (express test-runner) — both ride in as runtime.env.DB
export const getSqliteDatabase = (event: AgnosticEvent): SqliteDatabase => {
  const db = getRuntime<{ DB?: SqliteDatabase }>(event)?.env?.DB;
  if (!db) {
    throw new Error('no DB on event.runtime.env — the platform entry must inject a D1 binding or sqlite shim');
  }
  return db;
};
