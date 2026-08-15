import { serveR2Asset } from '@godlevski/r2-static';

export interface Env {
  ASSETS: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // future: /img/* — on-the-fly artwork resizing before falling back to
    // plain asset serving. Options when the time comes:
    //   - Cloudflare Images transformations: fetch(originalUrl, { cf: { image:
    //     { width, height, fit, format } } }) — zone needs transformations enabled
    //   - or a wasm codec (e.g. @cf-wasm/photon) resizing R2 bytes in-worker,
    //     writing derivatives back to R2 as a cache
    // if (url.pathname.startsWith('/img/')) { ... }

    return serveR2Asset(env.ASSETS, url.pathname);
  }
} satisfies ExportedHandler<Env>;
