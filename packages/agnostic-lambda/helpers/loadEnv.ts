import fs from 'node:fs';
import path from 'node:path';

// node-side env cascade (express runner, scripts) — the deployed worker gets
// its values from wrangler vars/secrets instead, env files never ship there.
//
// precedence, low to high: .env < .env.local < .env.[mode] < .env.[mode].local
// values already present in the real environment always win.
const parseEnvFile = (filePath: string): Record<string, string> => {
  const parsed: Record<string, string> = {};
  fs.readFileSync(filePath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^\s*(?:export\s+)?([\w.]+)\s*=\s*(.*)?\s*$/);
    if (!match || match[1].startsWith('#')) return;
    let value = (match[2] || '').trim();
    // strip surrounding quotes, drop inline comments on bare values
    if (/^(['"]).*\1$/.test(value)) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '');
    }
    parsed[match[1]] = value;
  });
  return parsed;
};

export const loadEnv = (cwd: string = process.cwd(), logPrefix = '[loadEnv]'): Record<string, string> => {
  const mode = process.env.ENV_MODE || process.env.NODE_ENV || 'development';
  const files = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`];

  const merged: Record<string, string> = {};
  const loaded: string[] = [];
  for (const file of files) {
    const filePath = path.join(cwd, file);
    if (!fs.existsSync(filePath)) continue;
    Object.assign(merged, parseEnvFile(filePath));
    loaded.push(file);
  }

  // files never override the real environment
  for (const [key, value] of Object.entries(merged)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  console.log(`${logPrefix} mode=${mode} loaded: ${loaded.join(', ') || '(no env files found)'}`);
  return merged;
};
