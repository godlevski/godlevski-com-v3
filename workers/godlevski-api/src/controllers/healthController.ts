import { AgnosticEvent, AgnosticOutput } from '@godlevski/agnostic-lambda/event';
import { stringifyJsonOutput } from '@godlevski/agnostic-lambda/helpers';
import { healthResponseSchema, HealthResponse } from '@godlevski/schemas/controllers/health';
import { getRuntime } from '../env';

// GET /api/health — liveness + D1 roundtrip
export const healthController = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  const { env } = getRuntime(event);

  let schemaVersion: string | null = null;
  try {
    const row = await env.DB
      .prepare("SELECT value FROM app_meta WHERE key = 'schema_version'")
      .first<{ value: string }>();
    schemaVersion = row?.value ?? null;
  } catch {
    // db not provisioned/migrated yet — health still answers
  }

  const json: HealthResponse = healthResponseSchema.parse({
    ok: true,
    service: env.SERVICE_NAME || 'godlevski',
    schemaVersion,
    timestamp: new Date().toISOString(),
  });

  return stringifyJsonOutput({ statusCode: 200, json });
};
