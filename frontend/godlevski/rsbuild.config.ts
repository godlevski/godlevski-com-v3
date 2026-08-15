import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const { parsed: { PORT, PROXY_PORT, PUBLIC_URL } } = loadEnv({ prefixes: ['PUBLIC_'] });
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
      // CRA-era code references bare `process` (process && process.env?.NODE_ENV);
      // most-specific define wins, the bare one backstops the rest
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'process.env': JSON.stringify({ NODE_ENV }),
      'process': JSON.stringify({ env: { NODE_ENV } }),
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
