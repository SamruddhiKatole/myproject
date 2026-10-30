# KaamSetu — Testing Strategy & Evidence

> Status: strategy **APPROVED** (2026-10-27, D‑014); no application tests exist yet (no code).
> Rule: record **exact commands and actual outcomes**. Never record a test as passing unless it was run in this repository and passed. Skipped / not‑run tests must be listed explicitly.

## 1. Test pyramid

| Layer | Tool | Scope | Runs |
|---|---|---|---|
| Static | `tsc --noEmit`, ESLint, Prettier check, i18n key checker | Types, lint, missing translations | Every commit (CI) |
| Unit | Vitest | Pure logic: validation schemas, phone normalisation, formatters, **status transition tables**, **policies**, flagging rules | Every commit |
| Integration | Vitest + real Postgres (Docker / CI service), fake SMS & storage adapters, fake clock | Services + route handlers end‑to‑end against DB: authz, constraints, transactions, concurrency, tick tasks | Every commit |
| E2E | Playwright, mobile viewport (Pixel 5) + one desktop project for admin | Critical journeys across browser contexts | Every PR (CI), before each phase sign‑off |
| Accessibility | @axe-core/playwright in E2E; manual TalkBack check (P13) | WCAG 2.1 AA serious/critical issues | E2E runs; manual in P13 |
| Performance | Lighthouse CI (mobile, throttled), Next build size report, synthetic DB benchmark | NFR‑1/2 budgets | P4, P7, P13, P14 |
| Security | Authz negative tests (IDOR), rate‑limit tests, header checks, `npm audit` | NFR‑5 | Every PR; scan in P14 |
| Manual / UAT | Real low‑end Android device, field usability sessions | Real‑world usability | P13, P14, P15 |

## 2. Principles
- Every endpoint has at least one **allowed** and one **forbidden** actor test.
- State machines are tested **exhaustively** (table‑driven: every status × actor × target).
- PII leak tests: serialise public payloads and assert absence of `phone`/`phoneE164`.
- Tests use reserved fake numbers (e.g. `+919999900001`) — never real numbers.
- Time‑dependent logic uses an injectable clock.
- Integration tests reset the DB per file (truncate) — no shared mutable state across files.
- External integrations (MSG91, object storage) have contract tests against fakes; real‑provider verification is recorded separately as **VERIFIED / NOT VERIFIED (reason)**.

## 3. Commands (available since P1, except `i18n:check` from P4)

Prerequisite for E2E: `npm run build`, and `npx playwright install chromium` once per machine.

```bash
docker compose up -d db          # start local Postgres
npm run lint                     # ESLint + Prettier check
npm run typecheck                # tsc --noEmit
npm test                         # Vitest unit + integration
npm run test:e2e                 # Playwright (starts app)
npm run build                    # Next.js production build
npm run i18n:check               # missing/TODO translation keys (P4+)
```

## 4. Per‑phase acceptance tests
Defined in `docs/IMPLEMENTATION_ROADMAP.md` under each phase, item 7.

## 5. Test execution log

| Date | Phase | Command | Result | Notes |
|---|---|---|---|---|
| 2026-10-27 | P0 | `ls -la`, `git status` (workspace inspection) | Workspace empty; not a git repository | Environment check only — not an application test |
| 2026-10-27 | P0 | `node --version`, `npm --version`, `docker --version`, `git --version` | Node v24.19.0, npm 11.17.0, Docker 29.7.2, git 2.20.1.windows.1 | `psql` not installed (not needed — Postgres will run in Docker) |

| 2026-10-27 | P1 | `npm install --no-fund --no-audit` | Exit 0; 403 packages | npm skipped `unrs-resolver@1.12.2` postinstall (not in allowScripts); lint works without it |
| 2026-10-27 | P1 | `npm run lint` | PASS (0 problems, `--max-warnings=0`) | |
| 2026-10-27 | P1 | `npm run format:check` | First run: FAIL (2 files: `eslint.config.mjs`, `src/app/page.tsx`); after `npx prettier --write` on them: PASS | `*.md` excluded from Prettier by design (D‑017) |
| 2026-10-27 | P1 | `npm run typecheck` | PASS | TypeScript 6.0.3 |
| 2026-10-27 | P1 | `npm test` | PASS — 2 files, 8 tests | First run warned that the Vite config loaded as CommonJS; fixed by renaming to `vitest.config.mts`, re-run clean |
| 2026-10-27 | P1 | `npm run build` | PASS — `/` static, `/api/health` dynamic | Re-run after adding `src/instrumentation.ts`: PASS |
| 2026-10-27 | P1 | `npx playwright install chromium` | Chrome Headless Shell 156.0.8078.4 downloaded | One‑time, 118 MiB |
| 2026-10-28 | P1 | `npm run test:e2e` | PASS — 3/3 (mobile‑chrome / Pixel 5) | Ran before and after the instrumentation change; both PASS |
| 2026-10-28 | P1 | `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities | |
| 2026-10-28 | P1 | `docker compose config --quiet` | PASS (exit 0) | File validated only; container **not started** |

| 2026-10-29 | P1 | `git push -u origin main` | FAIL: "could not read Username for 'https://github.com': terminal prompts disabled" | No GitHub credentials on this machine; the owner must push |
| 2026-10-29 | P1 | `git push -u origin main` (owner signed in; token without `workflow` scope) | FAIL: remote rejected `.github/workflows/ci.yml` (token lacks `workflow` scope) | Owner added the scope |
| 2026-10-29 | P1 | `git push -u origin main` | PASS: `origin/main` = `31757eb` | Pushed by the owner from the terminal tab |
| 2026-10-29 | P1 | GitHub Actions CI, run [40830903353](https://github.com/SamruddhiKatole/myproject/actions/runs/40830903353) on `31757eb` | **PASS** (success, ≈1m20s). Every step succeeded: npm ci, lint, format:check, typecheck, test, build, playwright install, test:e2e, npm audit | Clean checkout on ubuntu‑latest, Node 24, Postgres 16 service. Result read via GitHub REST API |

| 2026-10-30 | P2 (partial, before installs) | `npm test` | PASS — 3 files, 15 tests (8 P1 + 7 new seed‑data tests) | Seed JSON validated: ≈60 localities in bounds, unique slugs, Devanagari names, 17 categories |
| 2026-10-30 | P2 (partial) | `npm run format:check` | PASS (after `prettier --write` on new files) | |
| 2026-10-30 | P2 (partial) | `npm run lint` | PASS (0 warnings) | |
| 2026-10-30 | P2 (partial) | `npm run typecheck` | **FAIL — expected, 10 errors**: cannot find `prisma/config`, `@prisma/adapter-pg`, `src/generated/prisma/client`, plus implicit‑any errors that follow from them | Packages not installed yet (owner approval pending). Must pass before P2 is IMPLEMENTED |

| 2026-10-30 | P2 | `winget install --id PostgreSQL.PostgreSQL.16 --version 16.15-5 --exact --interactive` (owner‑approved, owner ran the wizard) | PASS: "Successfully installed"; service `postgresql-x64-16` Running; port 5432 open | D‑019 |
| 2026-10-30 | P2 | `psql -U postgres … CREATE ROLE kaamsetu … CREATEDB; CREATE DATABASE kaamsetu …` (owner typed the password) | PASS: `CREATE ROLE`, `CREATE DATABASE` | Owner‑confirmed |
| 2026-10-30 | P2 | `npx prisma migrate deploy` | PASS: applied `20261030000000_init`, `20261030000100_fts_generated_columns` | |
| 2026-10-30 | P2 | `npx prisma migrate status` | PASS: "Database schema is up to date!" | |
| 2026-10-30 | P2 | `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` | First run: 2 spurious `ALTER … "searchVector" DROP DEFAULT` lines. After the schema mirrored the generation expression with `@default(dbgenerated(…))`: "This is an empty migration." | Prevents a broken future migration |
| 2026-10-30 | P2 | `npx prisma migrate dev --create-only --name drift_check` (replays all migrations in a shadow DB) | PASS: generated migration was empty, then deleted | No drift between migrations and schema |
| 2026-10-30 | P2 | `npm run db:seed` ×2 | PASS: both runs `{cities: 1, localities: 59, categories: 17, admin: skipped}` | Idempotent |
| 2026-10-30 | P2 | `npm run db:seed:demo` | PASS: `{workers: 40, employers: 15, jobs: 40, applications: 30}` | Dev DB `kaamsetu` |
| 2026-10-30 | P2 | `npm run db:test:prepare` | PASS: created `kaamsetu_test`, applied both migrations | First attempt failed: top‑level `await` in a CJS `.ts` file; wrapped in `main()` |
| 2026-10-30 | P2 | `npm run test:integration` | **PASS — 1 file, 16 tests** (9.5 s) | Runs against `kaamsetu_test`. The earlier note said 18; the file has 16 |
| 2026-10-30 | P2 | Dev DB row counts after integration run | City 1, Locality 59, SkillCategory 17, User 55, Job 40, Application 30 | Confirms tests no longer touch the dev DB |
| 2026-10-30 | P2 | `npm test` | PASS — 3 files, 15 tests | |
| 2026-10-30 | P2 | `npm run lint`, `npm run typecheck`, `npx prettier --check .` | PASS | Re‑run after the health‑route change |
| 2026-10-30 | P2 | `npm run build` | PASS | `/api/health` is dynamic |
| 2026-10-30 | P2 | `npm run test:e2e` | PASS — 3/3 | Health test now also asserts `db: "ok"` |

### P2 checks NOT run
- CI on `phase/p2-database` (not pushed yet).
- Health route's 503 path with the database down (would need the Postgres service stopped, which needs admin rights).
- `npm run dev` (P1 deferred item).

### P1 tests that were NOT run
- **CI workflow on GitHub**: done. PASS (run 40830903353).
- **`npm run dev`** (development server): NOT RUN. The production server (`next start`) is exercised by E2E.
- **`docker compose up -d db`**: NOT RUN. Only the config was validated.
- **README quick start from a clean clone**: PARTLY covered. CI did a clean checkout plus `npm ci`, build and tests. Still not run: `docker compose up -d db` and `npm run dev`.
- **Server refuses to start when `DATABASE_URL` is missing** (live check): NOT RUN. The attempt was interrupted. It would have temporarily renamed `.env`, and that part ran, so `.env` was restored. Coverage today: `parseEnv` unit tests plus `src/instrumentation.ts`, which calls it at startup.

## 6. Known gaps
- CI runs on pushes to `main` and on PRs (first run green, 2026-10-29). The `gh` CLI isn't installed here, so CI results are read through the public GitHub API (the repo is public).
- Next.js anonymous telemetry is on by default. Consider `NEXT_TELEMETRY_DISABLED=1` in CI and production (owner choice).
- Real SMS delivery cannot be tested until DLT registration and provider credentials exist (P14).
- Native‑speaker translation review and real‑device testing are external dependencies (P13).
- Git 2.20 on this machine is old (2018); recommend upgrading before P1 (not blocking).
