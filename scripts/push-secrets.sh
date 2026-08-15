#!/usr/bin/env bash
# pushes worker secrets to cloudflare from the environment — never from
# committed files. Sources, in order of precedence (later wins):
#   1. the current environment      (CI: github actions secrets land here)
#   2. workers/<worker>/.env.production        (gitignored local vault)
#   3. workers/<worker>/.env.production.local  (gitignored machine overrides)
# usage: push-secrets.sh [worker-dir]   (default: godlevski-api)
set -euo pipefail

WORKER="${1:-godlevski-api}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKER_DIR="$REPO_ROOT/workers/$WORKER"
cd "$WORKER_DIR"

# secrets each worker owns — extend per worker as they grow
case "$WORKER" in
  godlevski-api) SECRETS=(JWT_SECRET RESEND_API_KEY) ;;
  *) echo "no secrets defined for worker '$WORKER'" >&2; exit 1 ;;
esac

# remember values already present in the real environment (highest
# precedence) — macos bash 3.2, so prefixed vars instead of declare -A
for name in "${SECRETS[@]}"; do
  eval "FROM_ENV_$name=\"\${$name:-}\""
done

# env files fill the gaps
for file in .env.production .env.production.local; do
  if [ -f "$file" ]; then
    set -a; . "./$file"; set +a
  fi
done
for name in "${SECRETS[@]}"; do
  eval "env_value=\"\${FROM_ENV_$name}\""
  if [ -n "$env_value" ]; then
    eval "$name=\"\$env_value\""
  fi
done

echo "== pushing secrets to worker '$WORKER' =="
for name in "${SECRETS[@]}"; do
  value="${!name:-}"
  if [ -z "$value" ]; then
    echo "  !! $name not set anywhere — skipped"
    continue
  fi
  printf '%s' "$value" | wrangler secret put "$name" > /dev/null
  echo "  ✓ $name"
done
echo "== done (wrangler secret list to inspect) =="
