import { AgnosticOutput, mapWorkerToAgnostic, mapExpressToAgnostic } from '@godlevski/agnostic-lambda/event';
import { toWorkerResponse, AgnosticEnv } from '@godlevski/agnostic-lambda/helpers';
import type { Request as ExpressRequest } from 'express';
import { agnosticHandler } from './src/agnosticHandler';

// *** ENTRIES
// export entries
export const workerEntryHandler = async (request: Request, env: AgnosticEnv, ctx: ExecutionContext): Promise<Response> => {
  const mappedEvent = await mapWorkerToAgnostic(request, { env, ctx });
  return toWorkerResponse(await agnosticHandler(mappedEvent));
};
// platform-agnostic parity — the same handler under a plain node/express
// runner (see test-runner.ts); runtime carries locally-backed bindings
export const expressEntryHandler = (request: ExpressRequest, runtime?: unknown): Promise<AgnosticOutput> => {
  const mappedEvent = mapExpressToAgnostic(request, runtime);
  return agnosticHandler(mappedEvent);
};

// *** DEFAULT HANDLER
// cloudflare module worker entry
export default {
  fetch: workerEntryHandler
} satisfies ExportedHandler<AgnosticEnv>;
