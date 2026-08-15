# infra

Cloudflare resources for godlevski.com v3. All provisioning goes through `wrangler` (brew-installed).

## Resources

| resource | name | used by |
|---|---|---|
| R2 bucket | `godlevski-web` | react build for godlevski.com |
| R2 bucket | `art-godlevski-web` | react build for art.godlevski.com |
| D1 database | `godlevski-db` | `godlevski-api` worker (`DB` binding); sqlite locally via miniflare |
| Worker | `godlevski-api` | `/api/*` agnostic controllers |
| Worker | `godlevski-r2` | serves `godlevski-web` with SPA fallback |
| Worker | `art-godlevski-r2` | serves `art-godlevski-web` with SPA fallback; future image resizing |

## First-time setup

Provisioning is **terraform-exclusive** (`brew install terraform`) — wrangler never creates
resources, it only deploys code and data into what terraform made.

```sh
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # fill in account_id
export CLOUDFLARE_API_TOKEN=...                # token with R2:Edit + D1:Edit
pnpm provision                                 # terraform init + apply (from repo root)
```

Then:

```sh
# paste the godlevski_db_id output into workers/godlevski-api/wrangler.jsonc
pnpm db:migrate:remote          # apply infra/migrations/godlevski-db to remote D1
pnpm db:migrate:local           # same, against local/godlevski-db.sqlite (for dev)
```

Worker code always deploys via wrangler (not terraform); terraform additionally holds
commented-out route wiring in `terraform/dns.tf` for when the domains point at the workers.

## Deploys

```sh
pnpm deploy:worker:api          # wrangler deploy godlevski-api
pnpm deploy:worker:r2           # wrangler deploy godlevski-r2
pnpm deploy:worker:art-r2       # wrangler deploy art-godlevski-r2
pnpm deploy:fe:godlevski        # rsbuild build + upload to r2://godlevski-web
pnpm deploy:fe:art-godlevski    # rsbuild build + upload to r2://art-godlevski-web
pnpm files:sync:remote          # push files/ to r2://godlevski-files
```

(shell scripts live in `scripts/` at repo root)

## Migrations

D1 migrations live in `migrations/godlevski-db/` (numbered `NNNN_name.sql`), referenced by
`migrations_dir` in the api worker's `wrangler.jsonc`. Create the next one by hand or with
`wrangler d1 migrations create godlevski-db <name>` from `workers/godlevski-api/`.

## Notes

- Custom domains/routes are intentionally not configured yet (boilerplate stage). When pointing
  DNS: `godlevski.com/*` → `godlevski-r2`, `art.godlevski.com/*` → `art-godlevski-r2`, and
  `*/api/*` → `godlevski-api` (or give the api worker its own subdomain).
