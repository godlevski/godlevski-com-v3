import { Env } from '../env';

// plain passthrough for non-image trees (shapefiles, assorted):
// stream the R2 object with etag + moderate cache
const CONTENT_TYPES: Record<string, string> = {
  json: 'application/json',
  svg: 'image/svg+xml',
  js: 'text/javascript',
  txt: 'text/plain; charset=utf-8',
  vcf: 'text/vcard',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

export const guessContentType = (key: string): string => {
  const ext = key.replace(/.*\./, '').toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
};

export const serveFileController = async (
  env: Env,
  key: string,
  cacheControl = 'public, max-age=3600'
): Promise<Response> => {
  const object = await env.FILES.get(key);
  if (!object) {
    return new Response('not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  if (!headers.has('content-type')) {
    headers.set('content-type', guessContentType(key));
  }
  headers.set('cache-control', cacheControl);

  return new Response(object.body, { headers });
};
