import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const { publicVars, rawPublicVars, parsed: { PORT, PROXY_PORT, PUBLIC_URL } } = loadEnv({ prefixes: ['PUBLIC_'] });

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
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars),
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
