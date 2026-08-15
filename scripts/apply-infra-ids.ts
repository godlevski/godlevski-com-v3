// patches worker wrangler.jsonc files with resource ids from terraform's
// generated manifest (infra/generated/cloudflare-ids.json, written on apply).
// run: pnpm infra:sync-ids  (chained onto pnpm provision)
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, 'infra/generated/cloudflare-ids.json');

if (!fs.existsSync(manifestPath)) {
  console.error(`[infra:sync-ids] no manifest at ${manifestPath} — run \`pnpm provision\` first`);
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { d1?: Record<string, string> };

const workerConfigs = fs.readdirSync(path.join(repoRoot, 'workers'))
  .map(dir => path.join(repoRoot, 'workers', dir, 'wrangler.jsonc'))
  .filter(fs.existsSync);

let patched = 0;
for (const configPath of workerConfigs) {
  let source = fs.readFileSync(configPath, 'utf8');
  const original = source;

  // for each known database, rewrite the database_id that follows its
  // database_name (jsonc with comments — targeted text patch, not a re-emit)
  for (const [dbName, dbId] of Object.entries(manifest.d1 || {})) {
    const pattern = new RegExp(`("database_name":\\s*"${dbName}"[\\s\\S]*?"database_id":\\s*)"[^"]*"`);
    source = source.replace(pattern, `$1"${dbId}"`);
    // also handles id-before-name ordering
    const patternReversed = new RegExp(`("database_id":\\s*)"[^"]*"([\\s\\S]{0,200}?"database_name":\\s*"${dbName}")`);
    source = source.replace(patternReversed, `$1"${dbId}"$2`);
  }

  if (source !== original) {
    fs.writeFileSync(configPath, source);
    console.log(`[infra:sync-ids] patched ${path.relative(repoRoot, configPath)}`);
    patched++;
  }
}
console.log(`[infra:sync-ids] done — ${patched} file(s) changed, ${workerConfigs.length} checked`);
