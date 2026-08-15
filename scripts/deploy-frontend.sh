#!/usr/bin/env bash
# uploads a frontend build to its R2 bucket
# usage: deploy-frontend.sh <godlevski|art-godlevski>
set -euo pipefail

SITE="${1:?usage: deploy-frontend.sh <godlevski|art-godlevski>}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$REPO_ROOT/frontend/$SITE/build"
BUCKET="$SITE-web"

if [ ! -d "$BUILD_DIR" ]; then
  echo "no build at $BUILD_DIR — run: cd frontend/$SITE && pnpm build" >&2
  exit 1
fi

content_type() {
  case "${1##*.}" in
    html) echo "text/html; charset=utf-8" ;;
    js) echo "text/javascript" ;;
    css) echo "text/css" ;;
    json|map) echo "application/json" ;;
    svg) echo "image/svg+xml" ;;
    png) echo "image/png" ;;
    jpg|jpeg) echo "image/jpeg" ;;
    gif) echo "image/gif" ;;
    webp) echo "image/webp" ;;
    ico) echo "image/x-icon" ;;
    txt) echo "text/plain; charset=utf-8" ;;
    woff) echo "font/woff" ;;
    woff2) echo "font/woff2" ;;
    webmanifest) echo "application/manifest+json" ;;
    *) echo "application/octet-stream" ;;
  esac
}

echo "== uploading $BUILD_DIR -> r2://$BUCKET =="
find "$BUILD_DIR" -type f | while read -r file; do
  key="${file#"$BUILD_DIR"/}"
  ct="$(content_type "$file")"
  echo "  put $key ($ct)"
  wrangler r2 object put "$BUCKET/$key" --file "$file" --content-type "$ct" --remote
done
echo "== done =="
