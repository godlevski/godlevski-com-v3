// serves the react build out of R2 with SPA fallback to index.html
const CONTENT_TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript',
  css: 'text/css',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  ico: 'image/x-icon',
  txt: 'text/plain; charset=utf-8',
  woff: 'font/woff',
  woff2: 'font/woff2',
  map: 'application/json',
  webmanifest: 'application/manifest+json',
};

const guessContentType = (key: string): string => {
  const ext = key.replace(/.*\./, '').toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
};

export const serveR2Asset = async (bucket: R2Bucket, pathname: string): Promise<Response> => {
  let key = pathname.replace(/^\/+/, '') || 'index.html';

  let object = await bucket.get(key);
  // SPA fallback: extensionless path -> index.html (client router takes over)
  if (!object && !/\.[^/]+$/.test(key)) {
    key = 'index.html';
    object = await bucket.get(key);
  }
  if (!object) {
    return new Response('not found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  if (!headers.has('content-type')) {
    headers.set('content-type', guessContentType(key));
  }
  // hashed assets ride a long cache; index.html stays always-fresh
  headers.set(
    'cache-control',
    key === 'index.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
  );

  return new Response(object.body, { headers });
};
