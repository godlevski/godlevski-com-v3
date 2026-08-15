# godlevski.com v3

Cloudflare-native monorepo: **R2** for react builds, **D1** (sqlite locally) for data, **Workers** for controllers. pnpm workspaces, point-o style local dev.

```
frontend/
  godlevski/        rsbuild react app — godlevski.com
  art-godlevski/    rsbuild react app — art.godlevski.com
workers/
  godlevski-api/      cloudflare worker: /api/* agnostic controllers over D1
  godlevski-r2/       cloudflare worker: serves godlevski-web build from R2 (SPA fallback)
  art-godlevski-r2/   cloudflare worker: serves art-godlevski-web from R2; image resizing lands here
packages/
  agnostic-lambda/  platform-agnostic request handling (worker + express mappers)
  schemas/          zod schema per controller — shared api contract (worker validates, FE infers types)
  r2-static/        shared R2 static serving (SPA fallback, content types, cache headers)
infra/              provisioning, R2 deploy script, D1 migrations
local-runner.ts     dev reverse proxy: one origin per site
```

## Worker pattern

Single entry (`workers/godlevski-api/index.ts`) → platform event mapped to `AgnosticEvent` → `agnosticHandler` switches on `paths[0]` → routers/controllers. Controllers parse input with their zod schema from `@godlevski/schemas` (ZodError → 400 via the global error handler). The same handler also exports an express entry, so it stays platform-portable.

## Local dev

```sh
pnpm install
pnpm db:migrate:local   # seed local sqlite (miniflare)
pnpm dev
```

| origin | site | api |
|---|---|---|
| http://localhost:8080 | godlevski (rsbuild :4100) | /api → wrangler dev :4300 |
| http://localhost:8081 | art-godlevski (rsbuild :4200) | /api → wrangler dev :4300 |

## Provision & deploy

See [infra/README.md](infra/README.md). Short version: `wrangler login`, `pnpm provision`, paste the D1 `database_id` into `workers/godlevski-api/wrangler.jsonc`, `pnpm db:migrate:remote`, then `pnpm deploy:worker:api` / `pnpm deploy:worker:r2` / `pnpm deploy:worker:art-r2` / `pnpm deploy:fe:godlevski` / `pnpm deploy:fe:art-godlevski`.

## Adding a controller

1. Schema in `packages/schemas/controllers/<name>.ts` (+ export from `index.ts`)
2. Controller in `workers/godlevski-api/src/controllers/<name>Controller.ts` — parse with the schema
3. Case in `src/agnosticHandler.ts` (or a router for method dispatch)
