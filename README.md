# KaamSetu

A hyperlocal hiring marketplace for Nagpur. It connects house helps, cooks, cleaners, tradespeople and
construction helpers with households, contractors, shops and small businesses.

> **Start here:** [`PROJECT_LEDGER.md`](PROJECT_LEDGER.md) is the authoritative project state.
> Product scope: [`docs/PRODUCT_REQUIREMENTS.md`](docs/PRODUCT_REQUIREMENTS.md) ·
> Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
> Roadmap: [`docs/IMPLEMENTATION_ROADMAP.md`](docs/IMPLEMENTATION_ROADMAP.md) ·
> Decisions: [`docs/DECISIONS.md`](docs/DECISIONS.md) · Testing: [`docs/TESTING.md`](docs/TESTING.md)

## Requirements

- Node.js 24 (see `.nvmrc`)
- PostgreSQL 16: either a native install, or Docker (`docker compose up -d db`)

## Quick start (local development)

With native PostgreSQL 16, create the dev role and database once. You'll be asked for your `postgres` password:

```bash
psql -U postgres -h localhost -c "CREATE ROLE kaamsetu LOGIN PASSWORD 'kaamsetu_dev' CREATEDB;" -c "CREATE DATABASE kaamsetu OWNER kaamsetu;"
```

(With Docker, `docker compose up -d db` creates both instead.) Then:

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm run db:seed          # Nagpur localities + categories (safe to re-run)
npm run db:seed:demo     # optional fake demo data
npm run dev
```

Open http://localhost:3000. Health check (includes a database ping): http://localhost:3000/api/health.

Integration tests empty every table, so they use a separate database. Prepare it once with `npm run db:test:prepare`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint (zero warnings allowed) |
| `npm run format` / `format:check` | Prettier write / check |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest unit tests (no database) |
| `npm run test:integration` | Postgres‑backed tests against `TEST_DATABASE_URL` |
| `npm run db:seed` / `db:seed:demo` | Reference data / fake demo data |
| `npm run test:e2e` | Playwright on a mobile viewport. Run `npm run build` first; installs need `npx playwright install chromium` once |
| `npm run check` | lint + format + typecheck + tests + build |

## Project layout

```
src/app/          Next.js routes (pages + API route handlers)
src/server/       Server-only code: env config, logger; services/policies/adapters from P3 on
tests/unit/       Vitest unit tests
tests/e2e/        Playwright end-to-end tests
docs/             Requirements, architecture, roadmap, decisions, testing
```

## Local demo vs production

This setup is for **local development only**: dev database credentials, no real SMS, no backups.
See `docs/ARCHITECTURE.md §9` and roadmap phase P14 for the production requirements.
