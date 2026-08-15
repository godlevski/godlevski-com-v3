import { AgnosticEvent, WorkerRuntime } from '@godlevski/agnostic-lambda/event';

export interface Env {
  DB: D1Database;
  OMIT_PATH_PREFIX?: string;
  SERVICE_NAME?: string;
}

// narrows the agnostic runtime carrier back to this worker's bindings
export const getRuntime = (event: AgnosticEvent): WorkerRuntime<Env> =>
  event.runtime as WorkerRuntime<Env>;
