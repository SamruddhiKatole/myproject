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

### P1 tests that were NOT run
- **CI workflow on GitHub**: NOT RUN. The remote is set, but the push hasn't happened yet.
- **`npm run dev`** (development server): NOT RUN. The production server (`next start`) is exercised by E2E.
- **`docker compose up -d db`**: NOT RUN. Only the config was validated.
- **README quick start from a clean clone**: NOT RUN.
- **Server refuses to start when `DATABASE_URL` is missing** (live check): NOT RUN. The attempt was interrupted. It would have temporarily renamed `.env`, and that part ran, so `.env` was restored. Coverage today: `parseEnv` unit tests plus `src/instrumentation.ts`, which calls it at startup.

## 6. Known gaps
- Git repository exists (since P1) but has no GitHub remote. CI (`.github/workflows/ci.yml`) has never run.
- Next.js anonymous telemetry is on by default. Consider `NEXT_TELEMETRY_DISABLED=1` in CI and production (owner choice).
- Real SMS delivery cannot be tested until DLT registration and provider credentials exist (P14).
- Native‑speaker translation review and real‑device testing are external dependencies (P13).
- Git 2.20 on this machine is old (2018); recommend upgrading before P1 (not blocking).
