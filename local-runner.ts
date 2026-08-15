import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ServerResponse } from 'http';
import chalk from 'chalk';

// one unified origin per site — /api rides the api worker, /files the files
// worker, everything else the rsbuild dev server (ws for HMR)
const WORKER_PORT = 4300;
const FILES_WORKER_PORT = 4600;
const SITES = [
  { name: 'godlevski', port: 8080, frontendPort: 4100 },
  { name: 'art-godlevski', port: 8081, frontendPort: 4200 },
];

const proxyErrorHandler = (label: string) => (err: Error, req: unknown, res: unknown) => {
  console.error(chalk.red.bold(`Proxy error for ${label}: ${err.message}`));
  if (res instanceof ServerResponse) {
    res.statusCode = 500;
    res.end('Proxy error');
  }
};

for (const site of SITES) {
  const app = express();

  // /api/* -> wrangler dev (keeps /api prefix; worker strips it via OMIT_PATH_PREFIX)
  app.use('/api', createProxyMiddleware({
    target: `http://localhost:${WORKER_PORT}/api`,
    changeOrigin: true,
    on: { error: proxyErrorHandler(`${site.name}:/api`) }
  }));

  // /files/* -> files worker (keeps /files prefix; worker strips it)
  app.use('/files', createProxyMiddleware({
    target: `http://localhost:${FILES_WORKER_PORT}/files`,
    changeOrigin: true,
    on: { error: proxyErrorHandler(`${site.name}:/files`) }
  }));

  // everything else -> rsbuild dev server
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${site.frontendPort}`,
    changeOrigin: true,
    ws: true, // HMR websocket
    on: { error: proxyErrorHandler(`${site.name}:/`) }
  }));

  app.listen(site.port, () => {
    console.log(chalk.green.bold(`🚀 ${site.name} on http://localhost:${site.port}`));
    console.log(chalk.cyan(`  📡 /api/*   → http://localhost:${WORKER_PORT}/api/*`));
    console.log(chalk.cyan(`  📡 /files/* → http://localhost:${FILES_WORKER_PORT}/files/*`));
    console.log(chalk.cyan(`  📡 /*    → http://localhost:${site.frontendPort}/*`));
  });
}
