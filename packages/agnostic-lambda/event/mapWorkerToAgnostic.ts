import { AgnosticEvent, AgnosticFile } from './AgnosticEvent';
import { base64urlDecode } from '../helpers/base64url';

// minimal structural runtime carrier — keeps this package free of
// @cloudflare/workers-types; workers narrow Env on their side
export interface WorkerRuntime<Env = Record<string, any>> {
  env: Env,
  ctx: { waitUntil(promise: Promise<unknown>): void },
}

export interface MapWorkerOptions {
  // strip a routing prefix (e.g. '/api') before splitting paths
  omitPathPrefix?: string,
}

export const mapWorkerToAgnostic = async <Env = Record<string, any>>(
  request: Request,
  runtime?: WorkerRuntime<Env>,
  options?: MapWorkerOptions
): Promise<AgnosticEvent> => {
  const omitPathPrefix = options?.omitPathPrefix
    || (runtime?.env as Record<string, any> | undefined)?.OMIT_PATH_PREFIX
    || '';
  const url = new URL(request.url);

  // ip — cloudflare always sets cf-connecting-ip at the edge
  const ip = request.headers.get('cf-connecting-ip') || '';

  // headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, name) => { headers[name] = value; });

  // cookies
  const cookies: Record<string, string> = {};
  (request.headers.get('cookie') || '').split(/;\s*/).forEach(cookie => {
    const match = cookie.match(/^([^=]*?)=(.*)/);
    if (match) {
      cookies[match[1]] = match[2];
    }
  });

  // file & path
  const urlNoQuery = url.pathname;
  const filename = urlNoQuery.replace(/.*\/(.*\.[^?]*)/g, '$1');
  const paths = urlNoQuery.replace(omitPathPrefix, '').replace(/\/{1,}/g, '/').replace(/^\/|(\/[^/]*\.[^/]*$)/g, '').split('/');

  // query
  const mappedQuery: Record<string, string | string[]> = {};
  let b64Query: Record<string, any> | undefined;
  url.searchParams.forEach((_, name) => {
    if (name === '_b64') return;
    const all = url.searchParams.getAll(name);
    mappedQuery[name] = all.length > 1 ? all : all[0];
  });
  const b64Param = url.searchParams.get('_b64');
  if (typeof b64Param === 'string') {
    b64Query = base64urlDecode(b64Param);
  }

  // parse body — multipart/form-data (fields + files) or json/text
  let parsedBody: Record<string, any> | null = null;
  let files: Array<AgnosticFile> | undefined;
  const contentType = request.headers.get('content-type') || '';
  if (request.body && contentType.includes('multipart/form-data')) {
    parsedBody = {};
    files = [];
    const form = await request.formData();
    // structural file type — lib DOM and workers-types disagree on FormData
    type FormFile = { name: string; type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> };
    for (const [field, value] of form.entries() as Iterable<[string, string | FormFile]>) {
      if (typeof value === 'string') {
        parsedBody[field] = value;
      } else {
        files.push({
          field,
          filename: value.name,
          type: value.type,
          size: value.size,
          data: new Uint8Array(await value.arrayBuffer()),
        });
      }
    }
  } else if (request.body) {
    const raw = await request.text();
    try {
      parsedBody = raw ? JSON.parse(raw) : null;
    } catch {
      parsedBody = { raw };
    }
  }

  return {
    uid: crypto.randomUUID(),
    ip,
    method: request.method,
    headers,
    cookies,
    originalPath: urlNoQuery,
    filename,
    paths,
    query: mappedQuery,
    b64Query,
    body: parsedBody as Record<string, any>,
    files,
    runtime,
  };
};
