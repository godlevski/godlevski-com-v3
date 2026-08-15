import { AgnosticEvent, AgnosticOutput } from '@godlevski/agnostic-lambda/event';
import { stringifyJsonOutput } from '@godlevski/agnostic-lambda/helpers';
import { tagsIndexResponseSchema, TagsIndexResponse } from '@godlevski/schemas/controllers/tagsIndex';
import { tagsIndex } from '../data/tagsIndex';

// GET /api/tags-index — tag taxonomy for the folio index
export const tagsIndexGetController = async (_event: AgnosticEvent): Promise<AgnosticOutput> => {
  const json: TagsIndexResponse = tagsIndexResponseSchema.parse({
    status: 'success',
    data: tagsIndex,
  });

  return stringifyJsonOutput({
    statusCode: 200,
    // static payload — let browsers/edge reuse it for a bit
    headers: { 'cache-control': 'public, max-age=300' },
    json,
  });
};
