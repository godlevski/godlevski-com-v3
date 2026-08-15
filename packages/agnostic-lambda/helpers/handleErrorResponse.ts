import { ZodError } from 'zod';
import { HttpError } from '../classes';
import { AgnosticOutput } from '../event/AgnosticOutput';

export const handleErrorResponse = async (e: unknown): Promise<AgnosticOutput> => {
  if (e instanceof HttpError && e.isUserFacing) {
    return {
      statusCode: e.statusCode,
      body: String(e.message)
    };
  } else if ((e as any)?.isUserFacing) {
    const handledError = e as any;
    return {
      statusCode: handledError.errorCode || 500,
      body: String(handledError.message)
    };
  } else if (e instanceof ZodError || (e as ZodError)?.name === 'ZodError') {
    // schema validation failure -> 400 with per-path issue summary
    const zodError = e as ZodError;
    return {
      statusCode: 400,
      body: zodError.issues
        .map(issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join(', ')
    };
  } else {
    return {
      statusCode: 500
    };
  }
};
