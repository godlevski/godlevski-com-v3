import { AgnosticOutput, mapWorkerToAgnostic, mapExpressToAgnostic } from '@godlevski/agnostic-lambda/event';
import { toWorkerResponse } from '@godlevski/agnostic-lambda/helpers';
import type { Request as ExpressRequest } from 'express';
import { agnosticHandler } from './src/agnosticHandler';
import { Env } from './src/env';

// *** ENTRIES
// export entries
export const workerEntryHandler = async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
  const mappedEvent = await mapWorkerToAgnostic(request, { env, ctx });
  return toWorkerResponse(await agnosticHandler(mappedEvent));
};
// kept for platform-agnostic parity — lets the same handler run under a plain
// node/express runner (no cloudflare bindings on event.runtime there)
export const expressEntryHandler = (request: ExpressRequest): Promise<AgnosticOutput> => {
  const mappedEvent = mapExpressToAgnostic(request);
  return agnosticHandler(mappedEvent);
};

// *** DEFAULT HANDLER
// cloudflare module worker entry
export default {
  fetch: workerEntryHandler
} satisfies ExportedHandler<Env>;
