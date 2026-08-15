import { AgnosticEvent, AgnosticOutput } from '@godlevski/agnostic-lambda/event';
import { stringifyJsonOutput } from '@godlevski/agnostic-lambda/helpers';
import {
  helloQuerySchema,
  helloBodySchema,
  helloResponseSchema,
  HelloResponse
} from '@godlevski/schemas/controllers/hello';

// GET /api/hello?name=... — schema-parsed query
export const helloGetController = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  const query = helloQuerySchema.parse(event.query);

  const json: HelloResponse = helloResponseSchema.parse({
    greeting: `hello, ${query.name || 'world'}`,
  });

  return stringifyJsonOutput({ statusCode: 200, json });
};

// POST /api/hello — schema-parsed body (invalid -> ZodError -> 400 via global handler)
export const helloPostController = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  const body = helloBodySchema.parse(event.body);

  const json: HelloResponse = helloResponseSchema.parse({
    greeting: `hello, ${body.name}`,
    echo: body,
  });

  return stringifyJsonOutput({ statusCode: 200, json });
};
