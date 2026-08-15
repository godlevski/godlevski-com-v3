// local-dev only: an ObjectBucket-shaped adapter writing plain files to disk
// (helpers/runtime.ts declares the surface; R2Bucket satisfies it in prod).
// NEVER import from worker bundle code — node-side runners only, via
// '@godlevski/agnostic-lambda/r2Shim'.
import fs from 'node:fs';
import path from 'node:path';
import { ObjectBucket } from '../helpers/runtime';

export const createLocalR2 = (rootDir: string): ObjectBucket => ({
  async put(key: string, value: Uint8Array | ArrayBuffer | string): Promise<void> {
    // keys are forward-slash namespaced; refuse traversal
    const safeKey = key.replace(/\.\./g, '_');
    const filePath = path.join(rootDir, safeKey);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const bytes = typeof value === 'string'
      ? value
      : value instanceof ArrayBuffer ? new Uint8Array(value) : value;
    fs.writeFileSync(filePath, bytes);
  },
});
