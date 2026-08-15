// local-dev only: a minimal D1-shaped adapter over node's built-in sqlite.
// NEVER import from worker bundle code (node builtins) — node-side runners
// and scripts only, via '@godlevski/agnostic-lambda/d1Shim'.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { SqliteDatabase } from '../helpers/runtime';

// implements the agnostic SqliteDatabase surface (helpers/runtime.ts) that
// D1 bindings also satisfy: prepare().bind().first/all/run
export const createLocalD1 = (sqlitePath: string): SqliteDatabase => {
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  const db = new DatabaseSync(sqlitePath);

  const makeStatement = (sql: string, params: unknown[] = []): any => ({
    bind: (...bound: unknown[]) => makeStatement(sql, bound),
    first: async <T>(): Promise<T | null> =>
      (db.prepare(sql).get(...(params as any[])) as T | undefined) ?? null,
    all: async <T>(): Promise<{ results: T[]; success: true; meta: Record<string, unknown> }> => ({
      results: db.prepare(sql).all(...(params as any[])) as T[],
      success: true,
      meta: {},
    }),
    run: async (): Promise<{ success: true; meta: Record<string, unknown> }> => {
      const info = db.prepare(sql).run(...(params as any[]));
      return { success: true, meta: { changes: info.changes, last_row_id: info.lastInsertRowid } };
    },
  });

  return {
    prepare: (sql: string) => makeStatement(sql),
    batch: async (statements: Array<ReturnType<typeof makeStatement>>) => {
      const results = [];
      for (const statement of statements) results.push(await statement.all());
      return results;
    },
  };
};

export type LocalD1 = ReturnType<typeof createLocalD1>;
