# KaamSetu — Project Ledger

> **Authoritative project state.** Read this first in every session. Verify its claims against the repository before acting.
> Last updated: 2026-10-28 (session 1 — P1 implemented)
> Project location: `C:\Users\samruddhi.katole\New folder` (permanent folder chosen by the owner, 2026-10-27)

---

## 1. Project
**KaamSetu** — a hyperlocal, mobile‑first hiring marketplace for Nagpur (Maharashtra, India) connecting house helps, cooks, cleaners, tradespeople (carpenters, plumbers, electricians, painters), construction helpers and other workers with households, contractors, vendors, shops and small businesses. Priorities: simplicity, low‑end Android performance, privacy, trust and safety; Marathi/Hindi/English.

## 2. Current project status
**P1 IMPLEMENTED — committed locally on `main`, push to GitHub pending.** A runnable, linted, tested Next.js skeleton is committed on `main`. The push to `https://github.com/SamruddhiKatole/myproject` (public, owner‑approved 2026-10-29) **failed: this machine has no GitHub credentials.** The owner has to run `git push -u origin main` and sign in. Run `git status` to see whether it has happened since. All local checks pass. P1 is **not COMPLETE** until CI is confirmed green and the README quick start is verified from a clean clone. No product features exist yet. Those start in P2+.

## 3. Current phase
| Phase | Status |
|---|---|
| P0 — Planning & persistent documentation | **COMPLETE** (approved 2026-10-27) |
| P1 — Project foundation & tooling | **IMPLEMENTED** (2026-10-28). Remaining: CI run, clean‑clone quick start (§12) |
| P2 — Database schema, migrations & seed | NOT STARTED — next, needs owner go‑ahead |

## 4. Roadmap & progress
| ID | Phase | Status |
|---|---|---|
| P0 | Planning & documentation | COMPLETE |
| P1 | Project foundation & tooling | IMPLEMENTED |
| P2 | Database schema, migrations & seed | NOT STARTED |
| P3 | Phone‑OTP auth & sessions | NOT STARTED |
| P4 | App shell, i18n framework, onboarding entry | NOT STARTED |
| P5 | Worker profile & onboarding | NOT STARTED |
| P6 | Employer profile & job posting | NOT STARTED |
| P7 | Job discovery & search | NOT STARTED |
| P8 | Applications & hiring workflow | NOT STARTED |
| P9 | Worker search & invites | NOT STARTED |
| P10 | Notifications (in‑app + SMS outbox) | NOT STARTED |
| P11 | Trust & safety + admin dashboard | NOT STARTED |
| P12 | Reviews & ratings | NOT STARTED |
| P13 | Localisation, accessibility & performance pass | NOT STARTED |
| P14 | Production readiness & deployment | NOT STARTED |
| P15 | Nagpur pilot launch & validation | NOT STARTED |

Details, acceptance criteria and dependencies: `docs/IMPLEMENTATION_ROADMAP.md`.

## 5. Approved requirements & scope
**APPROVED 2026-10-27 (D‑014), amended by D‑015.** MVP scope is in `docs/PRODUCT_REQUIREMENTS.md §4`. It covers:
- phone‑OTP accounts; worker & employer profiles
- job posting with a lifecycle; locality‑based job discovery
- applications → shortlist → offer → hire → complete, with contact reveal at shortlist
- worker search & invites
- in‑app notifications + optional SMS
- reports, blocks, admin moderation, manual verification badge
- post‑hire reviews
- en/hi/mr; PWA

**Change on 2026-10-27 (D‑015):** jobs may set a gender requirement (Any / Women only / Men only). The worker's gender is optional, self‑declared and private, and is used only for eligibility. Restricted jobs stay visible to everyone with a badge.
Explicitly excluded from MVP: native app, chat, payments, Aadhaar/ID verification, WhatsApp bot, maps/GPS, AI matching, multi‑city UI.

## 6. Technology stack & key decisions (ACCEPTED)
Next.js 16.4.3 (App Router) + TypeScript 6.0.3 monolith, React 19.3.1, Tailwind 4.3.3, PostgreSQL 16 + Prisma (P2), Zod 4.6.7, custom phone‑OTP + DB sessions (P3), SMS provider interface (MSG91), S3‑compatible storage + sharp, Postgres FTS + locality‑centroid distance, DB outbox + cron script, next‑intl (P4), PWA, Vitest 5.0.5 + Playwright 1.64.1 + axe, pino 10.4.0, ESLint 9.39.5 + Prettier 3.9.10, GitHub Actions, Docker. Hosting: DigitalOcean BLR.
See `docs/ARCHITECTURE.md` and `docs/DECISIONS.md` (D‑000 … D‑017). D‑016 explains why TypeScript is 6.0, not 7.0: `typescript-eslint` supports only `<6.1`.

## 7. Completed work (actual files)
**Session 1, planning (2026-10-27):** all six docs created, then marked approved (D‑014). Project moved from the temporary session folder.

**Session 1, P1 (2026-10-27/29), committed on `main` (first commit). Push pending, see §2:**
- Docs updated: `docs/DECISIONS.md` (D‑015 gender requirement, D‑016 versions, D‑017 tooling), `docs/PRODUCT_REQUIREMENTS.md` (FR‑J1, FR‑W4/W5, FR‑S2, FR‑H1, §7, §9), `docs/ARCHITECTURE.md` (Job/WorkerProfile fields, permission rows, validation, index note), `docs/IMPLEMENTATION_ROADMAP.md` (P5–P9 gender criteria; P1 outcome), `docs/TESTING.md` (evidence)
- Tooling/config: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts` (security headers, no X‑Powered‑By), `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `vitest.config.mts`, `playwright.config.ts`, `.gitignore`, `.gitattributes`, `.nvmrc`, `.env.example`, `docker-compose.yml`, `.github/workflows/ci.yml`, `README.md`
- Source: `src/server/env.ts` (Zod env loader), `src/server/logger.ts` (pino, PII redaction), `src/instrumentation.ts` (validates env at server start), `src/app/layout.tsx`, `src/app/page.tsx` (placeholder), `src/app/globals.css`, `src/app/api/health/route.ts`
- Tests: `tests/unit/env.test.ts` (5), `tests/unit/logger.test.ts` (3), `tests/e2e/smoke.spec.ts` (3)
- Local only, git‑ignored: `.env` (copy of `.env.example`), `node_modules/`, `.next/`

## 8. Tests executed (actual results; full log in `docs/TESTING.md §5`)
| Check | Result |
|---|---|
| `npm run lint` | PASS (0 warnings) |
| `npm run format:check` | PASS, after formatting 2 files |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 8/8 |
| `npm run build` | PASS |
| `npm run test:e2e` | PASS — 3/3 (Pixel 5 viewport) |
| `npm audit --omit=dev --audit-level=high` | 0 vulnerabilities |
| `docker compose config --quiet` | PASS (container not started) |

**NOT RUN:**
- CI on GitHub
- `npm run dev`
- `docker compose up`
- clean‑clone quick start
- live "server refuses to start without `DATABASE_URL`" check (unit‑tested only)

## 9. Known bugs, limitations, technical debt
- npm skipped the `unrs-resolver@1.12.2` postinstall script (not in npm's allowScripts). Lint works without it. Run `npm approve-scripts unrs-resolver` if import‑resolution lint errors ever appear.
- Next.js telemetry is enabled by default. Decide whether to set `NEXT_TELEMETRY_DISABLED=1` (privacy posture).
- Home page strings are hardcoded English until P4 (i18n).
- Full CSP is deferred to P14.
- Nagpur locality list and centroid coordinates are not yet sourced (P2 task).
- Open sub‑question from D‑015: may workers who declare `OTHER` apply to restricted jobs? Default is no. Decide before P8.

## 10. Blockers & external dependencies
- **Owner review of P1** and go‑ahead for P2.
- GitHub remote `origin` = `https://github.com/SamruddhiKatole/myproject` (public). The owner chose to push P1 directly to `main` (no PR). The CI result must be checked on the repo's Actions tab, because the `gh` CLI isn't installed on this machine.
- External (not blocking until noted phase): TRAI DLT registration + MSG91 account (P14); hosting account & domain (P14); Hindi/Marathi translation review (P13); legal review incl. gender‑restricted listings (P14); field partners (P15).

## 11. Owner decisions (see D‑014, D‑015)
| # | Decision |
|---|---|
| Q1 | Permanent folder chosen; `git init` done in P1; private GitHub repo to be added |
| Q2 | MSG91; owner starts DLT registration |
| Q3 | One number may hold worker + employer profiles |
| Q4 | Contact revealed mutually at SHORTLISTED |
| Q5 | Worker must accept an offer before HIRED; accepted invite → SHORTLISTED |
| Q6 | **Superseded by D‑015**: jobs may be Women only / Men only |
| Q7 | In‑person verification by team; method recorded only |
| Q8 | DigitalOcean BLR, ≈ US$30–50/month pilot |
| Q9 | 3–5 localities, 5–6 categories (roadmap Appendix C) |
| Q10 | Stack approved; no third‑party analytics |

## 12. Pending tasks (priority order)
1. Owner: push `main` (`git push -u origin main`, then sign in to GitHub when prompted). Then confirm the first CI run is green (GitHub → Actions). If it fails, fix it and record the result in `docs/TESTING.md`.
2. Close P1: run `docker compose up -d db` and `npm run dev`, and follow the README from a clean clone of the GitHub repo. Then mark P1 COMPLETE.
3. P2 (after go‑ahead): Prisma schema incl. `genderRequirement` and `WorkerProfile.gender` (D‑015), migrations, Nagpur seed data.
4. Owner: start DLT registration + MSG91 account.
5. Optional: upgrade Git (2.20.1); decide on Next telemetry; rename folder to `kaamsetu` (needs a session move).

## 13. Exact next recommended action
**Owner**: push `main` to GitHub. **Then Claude/owner**: check the CI run for the P1 commit. **Then**: finish the clean‑clone check (§12.2), mark P1 COMPLETE, and start **P2 only** after an explicit go‑ahead. From P2 on, work happens on a `phase/…` branch with a PR into `main`, unless the owner says otherwise.

## 14. Commands to resume
```bash
cd "C:\Users\samruddhi.katole\New folder"
git status                      # expect branch main; "up to date with origin/main" once pushed
git log origin/main --oneline -1 # fails or is missing if the push never happened
npm install                     # if node_modules is missing
cp .env.example .env            # if .env is missing
docker compose up -d db         # local Postgres (used from P2)
npm run dev                     # http://localhost:3000
npm run check                   # lint + format + typecheck + tests + build
npx playwright install chromium # once per machine
npm run test:e2e                # after a build
```

## 15. Repository‑state warnings
- Git: `main` is the only branch. The `phase/p1-foundation` branch was chosen earlier but never received a commit; P1 went straight to `main` per the owner (2026-10-29). Remote: `origin` (public GitHub repo). Commit author (repo‑local config): Samruddhi Katole <samruddhikatole@gmail.com>, as given by the owner.
- `.env` exists locally and is git‑ignored (verified with `git check-ignore`). On 2026-10-28 an interrupted check had briefly renamed it to `.env.bak`; it was renamed back and verified.
- Local git version is 2.20.1 (old): no `git switch`, no `git init -b`. Upgrade recommended.

## 16. Session handoff — how to continue in a new Claude session
1. Open `C:\Users\samruddhi.katole\New folder` and tell Claude: "continue" / "resume" / "next phase".
2. Claude must: read this ledger → read the docs relevant to the next phase → run `git status` and inspect the actual files → compare ledger claims with reality (record discrepancies here) → report current state and proposed next action → proceed **only within approved scope**, one phase at a time.
3. Before implementing a phase: mark it IN PROGRESS here and in the roadmap.
4. After the phase: run lint/typecheck/tests/build/E2E, record exact commands and outcomes in `docs/TESTING.md`, update this ledger (sections 2–4, 7–15), review `git diff`, then stop and present results for approval.
5. Never mark anything IMPLEMENTED/TESTED/COMPLETE without evidence; never restart from scratch because a new conversation began.

### Session log
| Session | Date | Summary | Ledger updated |
|---|---|---|---|
| 1 | 2026-10-27 | Inspected empty workspace; produced all planning docs; P0 → AWAITING APPROVAL | Yes |
| 1 (cont.) | 2026-10-27 | Owner approved plan with Q1–Q10 defaults (D‑014); P0 COMPLETE; project moved to `New folder` | Yes |
| 1 (cont.) | 2026-10-27/28 | Gender requirement added (D‑015); git init on `phase/p1-foundation`; P1 scaffold, tests, CI file; all local checks pass; P1 IMPLEMENTED (CI + clean‑clone pending) | Yes |
| 1 (cont.) | 2026-10-29 | Owner supplied public repo `SamruddhiKatole/myproject`; P1 committed directly to `main`; push failed (no GitHub credentials on this machine), owner to push | Yes |
