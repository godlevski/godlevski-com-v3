import { AgnosticEvent, AgnosticOutput } from '@godlevski/agnostic-lambda/event';
import { HttpError } from '@godlevski/agnostic-lambda/classes';
import {
  emailVerifyController,
  emailConfirmController,
  emailHookController
} from '../controllers/emailVerificationControllers';

// /email/verify | /email/verify/code | /email/verified/:hookId
export const emailRouter = async (event: AgnosticEvent): Promise<AgnosticOutput> => {
  const [, section, sub] = event.paths;

  if (section === 'verify' && sub === 'code' && (event.method === 'GET' || event.method === 'POST')) {
    return emailConfirmController(event);
  }
  if (section === 'verify' && !sub && event.method === 'POST') {
    return emailVerifyController(event);
  }
  if (section === 'verified' && event.method === 'GET') {
    return emailHookController(event);
  }

  throw new HttpError('not found', { statusCode: 404 });
};
