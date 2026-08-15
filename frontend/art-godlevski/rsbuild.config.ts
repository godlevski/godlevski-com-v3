import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// .env < .env.local < .env.[mode] < .env.[mode].local — mode from ENV_MODE
const mode = process.env.ENV_MODE || process.env.NODE_ENV || 'development';
const { publicVars, rawPublicVars, parsed: { PORT, PROXY_PORT, PUBLIC_URL } } = loadEnv({ mode, prefixes: ['PUBLIC_'] });
const NODE_ENV = process.env.NODE_ENV || 'development';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'Intraverses — Dmitriy Godlevski',
  },
  server: {
    historyApiFallback: true,
    port: Number(PORT) || 4200,
    strictPort: true,
    open: false,
  },
  dev: {
    client: {
      protocol: 'ws',
      // HMR connects through the local-runner proxy origin
      port: Number(PROXY_PORT) || 8081,
      path: '/rsbuild-hmr',
    },
  },
  source: {
    define: {
      ...publicVars,
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'process.env': JSON.stringify({ NODE_ENV, ...rawPublicVars }),
    },
    entry: {
      index: './src/index.tsx',
    },
  },
  output: {
    distPath: {
      root: 'build',
    },
    target: 'web',
    assetPrefix: PUBLIC_URL || '/',
  },
});
