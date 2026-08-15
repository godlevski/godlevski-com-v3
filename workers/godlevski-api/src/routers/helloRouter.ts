import { AgnosticEvent, AgnosticOutput } from '@godlevski/agnostic-lambda/event';
import { HttpError } from '@godlevski/agnostic-lambda/classes';
import { helloGetController, helloPostController } from '../controllers/helloController';

// method-level dispatch for /hello
export const helloRouter = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  switch (event.method) {
    case 'GET':
      return helloGetController(event);
    case 'POST':
      return helloPostController(event);
    default:
      throw new HttpError('method not allowed', {
        statusCode: 405
      });
  }
};
