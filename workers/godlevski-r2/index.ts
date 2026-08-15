import { serveR2Asset } from '@godlevski/r2-static';

export interface Env {
  ASSETS: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    return serveR2Asset(env.ASSETS, url.pathname);
  }
} satisfies ExportedHandler<Env>;
