import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// .env < .env.local < .env.[mode] < .env.[mode].local — mode from ENV_MODE
// (root dev script / build:prod set it), falling back to NODE_ENV
const mode = process.env.ENV_MODE || process.env.NODE_ENV || 'development';
const { publicVars, rawPublicVars, parsed: { PORT, PROXY_PORT, PUBLIC_URL } } = loadEnv({ mode, prefixes: ['PUBLIC_'] });
const NODE_ENV = process.env.NODE_ENV || 'development';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './public/index.html'
  },
  server: {
    historyApiFallback: true,
    port: Number(PORT) || 4100,
    strictPort: true,
    open: false,
  },
  dev: {
    client: {
      protocol: 'ws',
      // HMR connects through the local-runner proxy origin
      port: Number(PROXY_PORT) || 8080,
      path: '/rsbuild-hmr',
    },
  },
  source: {
    define: {
      // most-specific define wins; PUBLIC_* vars ride in for backend.settings.js.
      // NO bare `process` define — it would poison library code (react 19
      // internals reference process.emit)
      ...publicVars,
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'process.env': JSON.stringify({ NODE_ENV, ...rawPublicVars }),
    },
    entry: {
      index: './src/index.js',
    },
  },
  output: {
    distPath: {
      root: 'build',
    },
    target: 'web',
    assetPrefix: PUBLIC_URL || '/',
  },
  tools: {
    // CRA allowed JSX inside .js — keep those files as-is (step 2 may rename)
    swc: {
      jsc: {
        parser: {
          syntax: 'ecmascript',
          jsx: true,
        },
      },
    },
  },
});
