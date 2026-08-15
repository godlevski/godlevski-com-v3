#!/usr/bin/env bash
# deploys a worker with its plain vars injected from the environment —
# wrangler.jsonc stays bindings-only, no committed values.
# Sources (later fills gaps, real environment wins — CI-friendly):
#   1. current environment (github actions vars/secrets)
#   2. workers/<worker>/.env.production
#   3. workers/<worker>/.env.production.local
# usage: deploy-worker.sh <worker-dir>
set -euo pipefail

WORKER="${1:?usage: deploy-worker.sh <worker-dir>}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT/workers/$WORKER"

# plain (non-secret) vars each worker ships with — extend per worker
case "$WORKER" in
  godlevski-api)
    VARS=(OMIT_PATH_PREFIX SERVICE_NAME EMAIL_FROM EMAIL_LINK_BASE
      TOKEN_EXPIRATION_MS EMAIL_VERIFICATION_LIFESPAN_MS
      EMAIL_VERIFICATION_REQUEST_LIFESPAN_MS EMAIL_HOOK_LIFESPAN_MS
      CLIENT_FILES_PUBLIC INQUIRY_TO) ;;
  godlevski-files|godlevski-r2|art-godlevski-r2)
    VARS=() ;;
  *) echo "unknown worker '$WORKER'" >&2; exit 1 ;;
esac

# real environment has highest precedence (bash 3.2 — no declare -A)
for name in "${VARS[@]}"; do
  eval "FROM_ENV_$name=\"\${$name:-}\""
done
for file in .env.production .env.production.local; do
  [ -f "$file" ] && { set -a; . "./$file"; set +a; }
done
for name in "${VARS[@]}"; do
  eval "env_value=\"\${FROM_ENV_$name}\""
  [ -n "$env_value" ] && eval "$name=\"\$env_value\""
done

ARGS=()
MISSING=0
for name in "${VARS[@]}"; do
  value="$(eval "printf '%s' \"\${$name:-}\"")"
  if [ -z "$value" ]; then
    echo "  !! var $name has no value — deploy would ship without it" >&2
    MISSING=1
    continue
  fi
  ARGS+=(--var "$name:$value")
done
[ "$MISSING" = "1" ] && { echo "aborting: fill the missing vars in .env.production" >&2; exit 1; }

echo "== deploying $WORKER with ${#VARS[@]} vars from env =="
wrangler deploy "${ARGS[@]+"${ARGS[@]}"}"
