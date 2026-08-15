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

// the object-storage surface controllers may assume — structurally satisfied
// by cloudflare's R2Bucket binding and the local filesystem shim
export interface ObjectBucket {
  put(key: string, value: Uint8Array | ArrayBuffer | string): Promise<unknown>;
}

// the baseline bindings shape every platform entry injects — cloudflare
// bindings (D1Database satisfies SqliteDatabase structurally) or the express
// runner's locally-backed equivalents; anything extra rides the index signature
export interface AgnosticEnv {
  DB?: SqliteDatabase;
  OMIT_PATH_PREFIX?: string;
  SERVICE_NAME?: string;
  [key: string]: unknown;
}

// narrows the agnostic runtime carrier back to the platform's bindings
export const getRuntime = <Env = AgnosticEnv>(event: AgnosticEvent): WorkerRuntime<Env> =>
  event.runtime as WorkerRuntime<Env>;

// an object bucket binding by name, platform-blind (R2 or local shim)
export const getObjectBucket = (event: AgnosticEvent, name: string): ObjectBucket => {
  const bucket = (getRuntime<Record<string, unknown>>(event)?.env || {})[name] as ObjectBucket | undefined;
  if (!bucket || typeof bucket.put !== 'function') {
    throw new Error(`no bucket '${name}' on event.runtime.env — the platform entry must inject an R2 binding or shim`);
  }
  return bucket;
};

// plain string var off the bindings, platform-blind
export const getEnvVar = (event: AgnosticEvent, name: string): string | undefined => {
  const value = (getRuntime<AgnosticEnv>(event)?.env || {})[name];
  return typeof value === 'string' ? value : undefined;
};

// the database, wherever it came from: D1 binding (workerd) or local sqlite
// shim (express test-runner) — both ride in as runtime.env.DB
export const getSqliteDatabase = (event: AgnosticEvent): SqliteDatabase => {
  const db = getRuntime<{ DB?: SqliteDatabase }>(event)?.env?.DB;
  if (!db) {
    throw new Error('no DB on event.runtime.env — the platform entry must inject a D1 binding or sqlite shim');
  }
  return db;
};
