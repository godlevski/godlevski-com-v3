#!/usr/bin/env bash
# one-time cloudflare resource provisioning (idempotent-ish; requires `wrangler login`)
set -uo pipefail
cd "$(dirname "$0")"

echo "== R2 buckets =="
wrangler r2 bucket create godlevski-web || echo "  (godlevski-web already exists?)"
wrangler r2 bucket create art-godlevski-web || echo "  (art-godlevski-web already exists?)"

echo ""
echo "== D1 database =="
wrangler d1 create godlevski-db || echo "  (godlevski-db already exists?)"
echo ""
echo "!! ACTION: copy the database_id printed above into workers/godlevski/wrangler.jsonc"
echo "   (replace REPLACE_AFTER_PROVISION), then run:"
echo "   pnpm db:migrate:remote"
