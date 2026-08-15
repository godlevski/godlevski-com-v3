# godlevski.com v3

Cloudflare monorepo (R2 + D1 + Workers, pnpm). Architecture and dev setup: see [README.md](README.md); infra/provisioning: [infra/README.md](infra/README.md).

## Casing conventions

- **Frontend / TypeScript code**: camelCase (variables, functions, file names like `introDataGetController.ts`)
- **Database**: snake_case (table and column names: `public_id`, `slide_id`, `created_at`)
- **API routes** and similar public identifiers (URL paths, query params): kebab-case (`/api/intro-data`, `/api/tags-index`)

The seams where these meet are deliberate: controllers map snake_case rows (`@godlevski/schemas/database`) to camelCase/legacy wire shapes (`@godlevski/schemas/controllers`), and the `agnosticHandler` switch keys are the kebab-case route segments.
