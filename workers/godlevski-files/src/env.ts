export interface Env {
  FILES: R2Bucket;
  IMAGES: ImagesBinding;
}

// public files, no cookies -> wildcard is safe and keeps edge caching
// single-copy (no Vary: Origin fragmentation)
export const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': '*',
  'access-control-expose-headers': 'etag, content-length, content-type',
};
