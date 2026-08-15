# godlevski.com v3

Cloudflare-native monorepo: **R2** for react builds, **D1** (sqlite locally) for data, **Workers** for controllers. pnpm workspaces, point-o style local dev.

```
frontend/
  godlevski/        rsbuild react app — godlevski.com
  art-godlevski/    rsbuild react app — art.godlevski.com
workers/
  godlevski-api/      cloudflare worker: /api/* agnostic controllers over D1
  godlevski-files/    cloudflare worker: files.godlevski.com — public files for both sites,
                      slide resizing via Images binding (works locally through wrangler dev)
  godlevski-r2/       cloudflare worker: serves godlevski-web build from R2 (SPA fallback)
  art-godlevski-r2/   cloudflare worker: serves art-godlevski-web from R2
packages/
  agnostic-lambda/  platform-agnostic request handling (worker + express mappers)
  schemas/          zod schema per controller — shared api contract (worker validates, FE infers types)
  r2-static/        shared R2 static serving (SPA fallback, content types, cache headers)
infra/              terraform (exclusive provisioning path) + D1 schema migrations
seeds/              per-site content bootstrap: db prefill SQL (tracked) + slide
                    originals (gitignored — the bucket is their home)
scripts/            deploy/sync/migrate scripts
local/              local dev databases (gitignored; regenerate via migrate+seed)
local-runner.ts     dev reverse proxy: one origin per site
```

## Worker pattern

Single entry (`workers/godlevski-api/index.ts`) → platform event mapped to `AgnosticEvent` → `agnosticHandler` switches on `paths[0]` → routers/controllers. Controllers parse input with their zod schema from `@godlevski/schemas` (ZodError → 400 via the global error handler).

Locally the api runs on **express** (`test-runner.ts` — proves the agnostic pattern), with a D1-shaped shim over node:sqlite pointed at the same miniflare sqlite file wrangler uses; `pnpm dev:wrangler` in `workers/godlevski-api` runs the workerd path for parity checks. Deployed, it's the cloudflare fetch entry.

## Local dev

```sh
pnpm install
pnpm db:migrate:local     # schema -> local/godlevski-db.sqlite
pnpm db:seed:local        # content bootstrap (slides rows)
pnpm files:sync:local     # files/ + seeds/godlevski/files/ -> local R2
pnpm dev
```

Migrations are schema only; content lives in `seeds/` and is applied separately
(`db:seed:local` / `db:seed:remote`). Slide original images are gitignored seed
content — on a fresh machine they come from the bucket or the v2.1 archive.

| origin | site | workers |
|---|---|---|
| http://localhost:8080 | godlevski (rsbuild :4100) | /api → :4300, /files → :4600 |
| http://localhost:8081 | art-godlevski (rsbuild :4200) | /api → :4300, /files → :4600 |

`files/` (slides originals, shapefiles, assorted) is the repo-local source of truth —
`pnpm files:sync:local` seeds miniflare's R2, `pnpm files:sync:remote` pushes to real R2.
URL contract preserved from v2.1: `/files/slides/<file>?h=600&p=true`, `/files/shapefiles/<name>`.

## Provision & deploy

See [infra/README.md](infra/README.md). Short version: `wrangler login`, `pnpm provision`, paste the D1 `database_id` into `workers/godlevski-api/wrangler.jsonc`, `pnpm db:migrate:remote`, then `pnpm deploy:worker:api` / `pnpm deploy:worker:r2` / `pnpm deploy:worker:art-r2` / `pnpm deploy:fe:godlevski` / `pnpm deploy:fe:art-godlevski`.

## Adding a controller

1. Schema in `packages/schemas/controllers/<name>.ts` (+ export from `index.ts`)
2. Controller in `workers/godlevski-api/src/controllers/<name>Controller.ts` — parse with the schema
3. Case in `src/agnosticHandler.ts` (or a router for method dispatch)
