import { AgnosticEvent, AgnosticOutput } from '@godlevski/agnostic-lambda/event';
import { stringifyJsonOutput, getEnvVar, getSqliteDatabase } from '@godlevski/agnostic-lambda/helpers';
import { healthResponseSchema, HealthResponse } from '@godlevski/schemas/controllers/health';
import { AppMetaRow } from '@godlevski/schemas/database';

// GET /api/health — liveness + database roundtrip
export const healthController = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  let schemaVersion: string | null = null;
  try {
    const row = await getSqliteDatabase(event)
      .prepare("SELECT value FROM app_meta WHERE key = 'schema_version'")
      .first<Pick<AppMetaRow, 'value'>>();
    schemaVersion = row?.value ?? null;
  } catch {
    // db not provisioned/migrated yet — health still answers
  }

  const json: HealthResponse = healthResponseSchema.parse({
    ok: true,
    service: getEnvVar(event, 'SERVICE_NAME') || 'godlevski',
    schemaVersion,
    timestamp: new Date().toISOString(),
  });

  return stringifyJsonOutput({ statusCode: 200, json });
};
