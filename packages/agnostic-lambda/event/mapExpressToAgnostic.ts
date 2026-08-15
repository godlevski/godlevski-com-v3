import type { Request } from 'express';
import { AgnosticEvent, AgnosticFile } from './AgnosticEvent';
import { base64urlDecode } from '../helpers/base64url';

/*
  Currently express expects following setup:

  app.use(cookieParser());
  app.use(express.json()); // for parsing application/json
  app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  TODO: consider multipart form data support
*/
export const mapExpressToAgnostic = (req: Request, runtime?: unknown): AgnosticEvent => {
  const { OMIT_PATH_PREFIX } = process.env;
  const originalUrl = req.originalUrl || '/';
  const urlNoQuery = String(originalUrl).replace(/\?.*/g, '');
  const filename = urlNoQuery.replace(/.*\/(.*\.[^?]*)/g, '$1');
  const paths = urlNoQuery.replace(OMIT_PATH_PREFIX || '', '').replace(/\/{1,}/g, '/').replace(/^\/|(\/[^/]*\.[^/]*$)/g, '').split('/');
  const mappedQuery: Record<string, string | string[]> = {};
  let b64Query: Record<string, any> | undefined;
  const parsedBody: Record<string, any> = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  Object.entries(req.query).forEach(([name, value]) => {
    if (name === '_b64') return;
    mappedQuery[name] = Array.isArray(value) ? value.map(v => String(v)) : String(value);
  });
  if (typeof req.query._b64 === 'string') {
    b64Query = base64urlDecode(req.query._b64 as string);
  }

  const headers: Record<string, string> = {};

  Object.entries(req.headers).forEach(([name, value]) => {
    headers[name] = Array.isArray(value) ? value.join(',') : (value || '');
  });

  // multer (memoryStorage, .any()) leaves uploads on req.files
  const multerFiles = (req as any).files;
  const files: Array<AgnosticFile> | undefined = Array.isArray(multerFiles)
    ? multerFiles.map((file: any) => ({
        field: file.fieldname,
        filename: file.originalname,
        type: file.mimetype,
        size: file.size,
        data: new Uint8Array(file.buffer),
      }))
    : undefined;

  return {
    uid: crypto.randomUUID(),
    ip: req.ip || '',
    method: req.method,
    headers,
    cookies: req.cookies,
    originalPath: urlNoQuery,
    filename,
    paths,
    query: mappedQuery,
    b64Query,
    body: parsedBody,
    files,
    runtime,
  };
};
