import {
  AgnosticEvent,
  AgnosticOutput
} from '@godlevski/agnostic-lambda/event';
import { HttpError } from '@godlevski/agnostic-lambda/classes';
import { handleErrorResponse, log, logError } from '@godlevski/agnostic-lambda/helpers';
import { healthController } from './controllers/healthController';
import { introDataGetController } from './controllers/introDataGetController';
import { tagsIndexGetController } from './controllers/tagsIndexGetController';
import { slidesGetController } from './controllers/slidesGetController';
import { helloRouter } from './routers/helloRouter';

// this is a platform agnostic handler entry point
// all events are mapped from the corresponding platform
// expected responses are defined in generic way

export const agnosticHandler = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  log(event, `[agnosticHandler] new event ${event.ip} ${event.method} /${event.paths.join('/')}`);
  try {
    let response: AgnosticOutput;
    // switch first item of the path
    switch (event.paths[0]) {
      case 'health':
        response = await healthController(event);
        break;
      // api routes are kebab-case
      case 'intro-data':
        response = await introDataGetController(event);
        break;
      case 'tags-index':
        response = await tagsIndexGetController(event);
        break;
      case 'slides':
        response = await slidesGetController(event);
        break;
      case 'hello':
        response = await helloRouter(event);
        break;
      default:
        throw new HttpError('not found', {
          statusCode: 404
        });
    }
    response.headers = {
      'content-type': 'application/json',
      ...(response.headers || {})
    };
    return response;
  }
  // global error handler
  catch (e) {
    logError(event, `[agnosticHandler] got an Error in godlevski-api: ${String((e as Error).message)}`);
    // handle error response
    return await handleErrorResponse(e);
  }
};
