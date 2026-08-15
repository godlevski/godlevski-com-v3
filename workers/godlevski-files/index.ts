import { Env, CORS_HEADERS } from './src/env';
import { slidesController } from './src/controllers/slidesController';
import { serveFileController } from './src/controllers/serveFileController';

// files.godlevski.com — public GET serving for both sites.
// locally the site proxies request as /files/<tree>/..., in prod the route is
// files.godlevski.com/<tree>/... — the optional /files prefix covers both.
const withCors = (response: Response): Response => {
  const headers = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([name, value]) => headers.set(name, value));
  return new Response(response.body, { status: response.status, headers });
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return withCors(new Response('method not allowed', { status: 405 }));
    }

    // edge cache — the successor of v2.1's cache/ dir: transformed
    // derivatives are served from cloudflare's cache on repeat requests
    // instead of re-reading R2 + re-transforming (also what keeps the
    // free-plan CPU budget comfortable)
    const cache = caches.default;
    if (request.method === 'GET') {
      const cached = await cache.match(request);
      if (cached) return cached;
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/files(?=\/)/, '');
    const [, tree, ...rest] = path.split('/');
    const filename = rest.join('/');

    // no traversal games in keys
    if (!filename || rest.includes('..')) {
      return withCors(new Response('not found', { status: 404 }));
    }

    let response: Response;
    switch (tree) {
      case 'slides':
        response = await slidesController(env, filename, url.searchParams);
        break;
      case 'shapefiles':
        response = await serveFileController(env, `shapefiles/${filename}`);
        break;
      case 'assorted':
        response = await serveFileController(env, `assorted/${filename}`);
        break;
      case 'inquiries':
        // inquiry attachments (uploaded via the api worker) — linked from
        // the inquiry email only
        response = await serveFileController(env, `inquiries/${filename}`);
        break;
      default:
        response = new Response('not found', { status: 404 });
    }

    if (request.method === 'HEAD') {
      response = new Response(null, { status: response.status, headers: response.headers });
    }
    response = withCors(response);
    if (request.method === 'GET' && response.status === 200) {
      ctx.waitUntil(cache.put(request, response.clone()));
    }
    return response;
  }
} satisfies ExportedHandler<Env>;
