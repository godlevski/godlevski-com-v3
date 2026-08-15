#!/usr/bin/env bash
# syncs the repo files/ tree into the godlevski-files R2 bucket
# usage: sync-files.sh <local|remote>
#   local  -> miniflare state used by `wrangler dev` (run before local dev)
#   remote -> real R2 (after provisioning)
set -euo pipefail

MODE="${1:?usage: sync-files.sh <local|remote>}"
[ "$MODE" = "local" ] || [ "$MODE" = "remote" ] || { echo "mode must be local|remote" >&2; exit 1; }

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILES_DIR="$REPO_ROOT/files"
# run from the files worker dir so --local state lands where `wrangler dev` reads it
WORKER_DIR="$REPO_ROOT/workers/godlevski-files"
BUCKET="godlevski-files"

content_type() {
  case "${1##*.}" in
    json) echo "application/json" ;;
    svg) echo "image/svg+xml" ;;
    js) echo "text/javascript" ;;
    txt) echo "text/plain; charset=utf-8" ;;
    vcf) echo "text/vcard" ;;
    png) echo "image/png" ;;
    jpg|jpeg) echo "image/jpeg" ;;
    gif) echo "image/gif" ;;
    webp) echo "image/webp" ;;
    pdf) echo "application/pdf" ;;
    *) echo "application/octet-stream" ;;
  esac
}

cd "$WORKER_DIR"

# two content roots, same bucket key-space:
#   files/                 hand-authored site assets (shapefiles, assorted)
#   seeds/godlevski/files/ seed content (slide originals; gitignored, bucket is home)
sync_tree() {
  local root="$1"
  [ -d "$root" ] || { echo "  (skip $root — not present on this machine)"; return; }
  find "$root" -type f ! -name ".DS_Store" | while read -r file; do
    key="${file#"$root"/}"
    ct="$(content_type "$file")"
    echo "  put $key ($ct)"
    wrangler r2 object put "$BUCKET/$key" --file "$file" --content-type "$ct" "--$MODE" > /dev/null 2>&1
  done
}

echo "== syncing files/ + seeds/files/ -> r2://$BUCKET ($MODE) =="
sync_tree "$FILES_DIR"
sync_tree "$REPO_ROOT/seeds/godlevski/files"
echo "== done =="
