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
cp terraform.tfvars.example terraform.tfvars   # fill in account_id (`wrangler whoami`)
cp .env.example .env                           # fill in CLOUDFLARE_API_TOKEN (both gitignored)
source .env                                    # per-shell; re-run in new terminals
pnpm provision                                 # terraform init + apply (from repo root)
```

The token is a **scoped API token** (dash → My Profile → API Tokens → Create Custom Token),
not the legacy Global API Key. Current scopes: Account → Workers R2 Storage: Edit,
Account → D1: Edit. When `terraform/dns.tf` gets uncommented, add Zone → Workers Routes: Edit
and Zone → DNS: Edit scoped to godlevski.com.

Terraform state (`terraform.tfstate`) is local and gitignored; if this ever runs from a
second machine, move state to an R2 backend first (see comment in `terraform/main.tf`).

Then:

Resource ids flow from terraform automatically: apply writes
`infra/generated/cloudflare-ids.json` (tracked), and `pnpm infra:sync-ids` — chained onto
`pnpm provision` — patches worker `wrangler.jsonc` files from it. No hand-pasting.

Then:

```sh
pnpm db:migrate:remote          # apply infra/migrations/godlevski-db to remote D1
pnpm db:migrate:local           # same, against local/godlevski-db.sqlite (for dev)
```

Worker code always deploys via wrangler (not terraform); terraform additionally holds
commented-out route wiring in `terraform/dns.tf` for when the domains point at the workers.

## Deploys

```sh
pnpm deploy:all                 # everything below, in order (workers then frontends)

pnpm deploy:worker:api          # wrangler deploy godlevski-api
pnpm deploy:worker:files        # wrangler deploy godlevski-files
pnpm deploy:worker:r2           # wrangler deploy godlevski-r2
pnpm deploy:worker:art-r2       # wrangler deploy art-godlevski-r2
pnpm deploy:fe:godlevski        # rsbuild build + upload to r2://godlevski-web
pnpm deploy:fe:art-godlevski    # rsbuild build + upload to r2://art-godlevski-web
pnpm files:sync:remote          # push files/ + seeds/*/files to r2://godlevski-files
```

Data ops stay deliberate (not part of deploy:all): `db:migrate:remote`, `db:seed:remote`,
`files:sync:remote`.

(shell scripts live in `scripts/` at repo root)

## Migrations

D1 migrations live in `migrations/godlevski-db/` (numbered `NNNN_name.sql`), referenced by
`migrations_dir` in the api worker's `wrangler.jsonc`. Create the next one by hand or with
`wrangler d1 migrations create godlevski-db <name>` from `workers/godlevski-api/`.

## Notes

- Custom domains/routes are intentionally not configured yet (boilerplate stage). When pointing
  DNS: `godlevski.com/*` → `godlevski-r2`, `art.godlevski.com/*` → `art-godlevski-r2`, and
  `*/api/*` → `godlevski-api` (or give the api worker its own subdomain).
