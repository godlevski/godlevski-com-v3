import { AgnosticEvent, AgnosticOutput } from '@godlevski/agnostic-lambda/event';
import { stringifyJsonOutput } from '@godlevski/agnostic-lambda/helpers';
import { introDataResponseSchema, IntroDataResponse } from '@godlevski/schemas/controllers/introData';
import { introData } from '../data/introData';

// GET /api/introData — intro slides for the frontend (shapefile refs + copy)
export const introDataController = async (_event: AgnosticEvent): Promise<AgnosticOutput> => {
  const json: IntroDataResponse = introDataResponseSchema.parse({
    status: 'success',
    data: introData,
  });

  return stringifyJsonOutput({
    statusCode: 200,
    // static payload — let browsers/edge reuse it for a bit
    headers: { 'cache-control': 'public, max-age=300' },
    json,
  });
};
