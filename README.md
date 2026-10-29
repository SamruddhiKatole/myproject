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
- Docker (for local PostgreSQL)

## Quick start (local development)

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run dev
```

Open http://localhost:3000. Health check: http://localhost:3000/api/health.

The database isn't used until Phase 2. P1 only validates that `DATABASE_URL` is well formed.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint (zero warnings allowed) |
| `npm run format` / `format:check` | Prettier write / check |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest unit + integration tests |
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
