# KaamSetu — Implementation Roadmap

> Roadmap status: **APPROVED** (v1.0, 2026-10-27 — D‑014). P1 is ready to start and awaits an explicit go‑ahead.
> Rule: implement **one approved phase at a time**. A phase is COMPLETE only when every acceptance criterion has recorded evidence in `docs/TESTING.md` and `PROJECT_LEDGER.md`.

## Progress overview

| ID | Phase | Status | Depends on |
|---|---|---|---|
| P0 | Planning & persistent documentation | COMPLETE (approved 2026-10-27) | — |
| P1 | Project foundation & tooling | IMPLEMENTED (2026-10-28; on `main`, CI green 2026-10-29). Not COMPLETE: local `docker compose up` + `npm run dev` check pending | P0 approved ✓ |
| P2 | Database schema, migrations & seed data | IMPLEMENTED locally (2026-10-30); CI + owner review pending | P1 |
| P3 | Phone‑OTP authentication & sessions | NOT STARTED | P2 |
| P4 | App shell, i18n framework & onboarding entry | NOT STARTED | P3 |
| P5 | Worker profile & onboarding | NOT STARTED | P4 |
| P6 | Employer profile & job posting | NOT STARTED | P4 |
| P7 | Job discovery & search (worker side) | NOT STARTED | P5, P6 |
| P8 | Applications & hiring workflow | NOT STARTED | P7 |
| P9 | Worker search & invites (employer side) | NOT STARTED | P8 |
| P10 | Notifications (in‑app + SMS outbox) | NOT STARTED | P8 |
| P11 | Trust & safety + admin dashboard | NOT STARTED | P8 |
| P12 | Reviews & ratings | NOT STARTED | P8, P11 |
| P13 | Localisation content, accessibility & performance pass | NOT STARTED | P5–P12 |
| P14 | Production readiness & deployment | NOT STARTED | P13 |
| P15 | Nagpur pilot launch & validation | NOT STARTED | P14 |

P5 and P6 are independent of each other; P9/P10/P11 can be done in any order after P8.

Estimated effort (1 developer, rough): P1–P4 ≈ 1.5 weeks; P5–P8 ≈ 3 weeks; P9–P12 ≈ 2.5 weeks; P13–P14 ≈ 1.5 weeks. Total ≈ 8–9 weeks to pilot‑ready, excluding external dependencies (DLT, translations, legal).

---

## Common rules for every phase

- **Before**: read ledger + relevant docs; `git status`; confirm scope; mark phase IN PROGRESS in ledger and this file.
- **During**: tests alongside code; no work outside the phase's "Included" list; minor decisions recorded in `DECISIONS.md`.
- **After**: run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` (+ `npm run test:e2e` once P4 exists); record exact commands & results in `TESTING.md`; review `git diff`; update ledger.
- **Standard regression gate** (from P3 onward): all previous tests pass; no endpoint returns another user's PII; authorisation negative tests pass.
- **Rollback**: each phase lands as its own branch/PR (or commit series) so it can be reverted; schema changes use forward‑only Prisma migrations, and destructive migrations require a documented backup step.

---

## P0 — Planning & persistent documentation
1. **Objective**: Agree on product scope, architecture, roadmap; establish ledger & docs.
2. **Included**: `PROJECT_LEDGER.md`, `docs/PRODUCT_REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_ROADMAP.md`, `docs/DECISIONS.md`, `docs/TESTING.md`.
3. **Excluded**: any application code, dependencies, scaffolding.
4. **Dependencies**: none.
5. **Files**: the six docs above.
6. **Tasks**: inspect workspace → draft requirements → architecture → roadmap → decisions → testing → ledger → present for approval.
7. **Tests / acceptance**: documents exist, are internally consistent, and the product owner approves (or requests changes to) scope, stack, and open questions Q1–Q10.
8. **Security/regression**: n/a.
9. **Done when**: owner approval recorded in `DECISIONS.md` and ledger; P1 marked ready.
10. **Risks/rollback**: risk of over‑scoping MVP → mitigated by explicit exclusions list.

---

## P1 — Project foundation & tooling
1. **Objective**: A runnable, linted, tested, empty Next.js app with CI and local Postgres.
2. **Included**: `git init` (if approved), Next.js + TypeScript strict + Tailwind; ESLint/Prettier; Vitest + Playwright configured with one smoke test each; Docker Compose Postgres; `.env.example` + typed env loader (Zod) that fails fast; pino logger; `/api/health`; GitHub Actions CI (lint, typecheck, test, build); npm scripts; `README.md` quick start.
3. **Excluded**: domain schema, auth, UI screens, i18n catalogues.
4. **Dependencies**: P0 approved; Node 24 (verified installed: v24.19.0), Docker (verified: 29.7.2), Q1/Q8 answers.
5. **Files**: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind` config, `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`, `playwright.config.ts`, `docker-compose.yml`, `.env.example`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/api/health/route.ts`, `src/server/env.ts`, `src/server/logger.ts`, `tests/unit/env.test.ts`, `tests/e2e/smoke.spec.ts`, `.github/workflows/ci.yml`, `README.md`.
6. **Tasks**: init repo & `.gitignore` → scaffold Next.js → strict TS → lint/format → env loader + tests → logger with redaction → compose Postgres → health route (DB ping added in P2) → Vitest/Playwright smoke → CI workflow → README → ledger.
7. **Acceptance**: `npm run dev` serves home page; `npm run lint`, `typecheck`, `test`, `build`, `test:e2e` all pass locally; env loader throws on missing required var (unit test); logger redacts `phone` fields (unit test); CI file validated (runs green on first push if a remote exists — else recorded as NOT RUN).
8. **Security/regression**: no secrets committed; `.env` git‑ignored; `npm audit --omit=dev` shows no high/critical.
9. **Done**: all acceptance evidence recorded; README quick start reproduced from a clean clone.
10. **Risks/rollback**: framework version churn → pin exact versions; rollback = revert scaffold commit.
11. **Actual outcome (2026-10-28)**: IMPLEMENTED.
    - **Differences from the plan**: `vitest.config.mts` (not `.ts`); `.prettierrc.json`; added `src/instrumentation.ts`, `tests/unit/logger.test.ts`, `src/app/globals.css`, `postcss.config.mjs`, `.gitattributes`, `.nvmrc`, `.prettierignore`.
    - **Criteria met with evidence**: lint, format, typecheck, unit (8), build, E2E (3), audit, env‑throws test, logger‑redaction test, `.env` git‑ignored.
    - **CI on GitHub**: PASS (run 40830903353, commit `31757eb`, 2026-10-29). This also covers a clean checkout with install, build and tests.
    - **Still open**: `docker compose up -d db` and `npm run dev` (local quick start), not run.
    - Details in `docs/TESTING.md §5`.

---

## P2 — Database schema, migrations & seed data
1. **Objective**: Full MVP data model in Postgres with migrations and realistic Nagpur seed data.
2. **Included**: Prisma schema for all entities in ARCHITECTURE §5.1; initial migration; indexes §5.4; full‑text `searchVector` columns + triggers (raw SQL migration); seed: Nagpur city, ~100+ localities with centroids and en/hi/mr names, 16 skill categories with icons, one admin user (phone from env), optional demo dataset (`npm run db:seed:demo`: ~40 workers, ~15 employers, ~40 jobs, applications in each status); `db.ts` singleton; health route DB ping; test DB reset helper.
3. **Excluded**: services/business logic, APIs (other than health), UI.
4. **Dependencies**: P1.
5. **Files**: `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/seed/*.ts|json`, `src/server/db.ts`, `tests/integration/schema.test.ts`, `tests/helpers/db.ts`.
6. **Tasks**: model reference data → users/sessions/otp → profiles → jobs/applications/events/invites → reviews/reports/blocks → notifications/outbox/uploads/audit → indexes & FTS triggers → seeds (idempotent upserts) → integration tests → document locality data source.
7. **Acceptance**: `npx prisma migrate dev` from empty DB succeeds; `npm run db:seed` idempotent (run twice, same counts); unique constraints verified by tests (duplicate phone, duplicate application, duplicate review); FTS returns seeded job by keyword; all localities have valid lat/lng inside Nagpur bounding box (test); demo seed creates applications in every status.
8. **Security/regression**: demo seed refuses to run when `NODE_ENV=production`; no real phone numbers in seeds (use reserved `+9199999xxxxx` style test numbers).
9. **Done**: ERD in ARCHITECTURE matches schema (diff reviewed); evidence recorded.
10. **Risks/rollback**: locality coordinate accuracy (manually curated; verify sample with field team); rollback = drop dev DB, revert migration (pre‑production only).
11. **Outcome (2026-10-30)**: all acceptance items pass locally (`docs/TESTING.md §5`). Deviations, recorded in D‑018/D‑019:
    - generated columns instead of triggers
    - 59 localities, not ~100 (the pilot needs 3–5)
    - 17 categories, not 16
    - integration tests use a separate `kaamsetu_test` database
    - local Postgres is native 16.15

    Still open: the ERD diff against ARCHITECTURE §5.1 (rating fields, generated FTS); CI on the branch.

---

## P3 — Phone‑OTP authentication & sessions
1. **Objective**: Users can sign in with mobile + OTP; server knows the actor on every request.
2. **Included**: SMS provider interface + Console/Fake providers (MSG91 adapter stub behind env, untested until credentials exist); OTP request/verify endpoints; hashing; rate limiting; sessions & cookie; logout; `GET/PATCH /me`; `requireUser`/`requireRole` helpers; origin check (CSRF); error envelope; minimal unstyled login pages to exercise the flow.
3. **Excluded**: profiles, onboarding UI polish, account deletion (P11), WebOTP auto‑fill (P13).
4. **Dependencies**: P2.
5. **Files**: `src/server/auth/{otp,session,rateLimit,guards}.ts`, `src/server/adapters/sms/*`, `src/server/errors.ts`, `src/app/api/v1/auth/**`, `src/app/api/v1/me/route.ts`, `src/middleware.ts`, `src/lib/validation/phone.ts`, tests.
6. **Tasks**: phone normalisation + tests → OTP service → rate limiter → session service → route handlers → guards → middleware → login pages → integration + E2E tests.
7. **Acceptance**: valid number + correct OTP → session cookie set (HttpOnly, Secure in prod, SameSite=Lax); wrong OTP 5× → challenge locked; 4th request in 15 min → 429; expired OTP rejected; response for unknown vs known number is identical; logout invalidates session server‑side; suspended user gets 403 on protected endpoints; non‑GET request with foreign Origin → 403; OTP and phone never appear in logs (test captures logger output); `DEV_FIXED_OTP` rejected at startup in production mode (test).
8. **Security/regression**: timing‑safe comparison; session token only stored hashed; cookie flags verified in E2E.
9. **Done**: all above evidenced; MSG91 adapter status recorded as "NOT VERIFIED — awaiting credentials/DLT".
10. **Risks/rollback**: DLT registration delay blocks real SMS (does not block dev); rollback = revert auth module.

---

## P4 — App shell, i18n framework & onboarding entry
1. **Objective**: Mobile‑first shell with navigation, language switching, and the post‑login "choose intent" step.
2. **Included**: next‑intl with `[locale]` routing (en/hi/mr), message catalogues (English complete; hi/mr keys present with English fallback + machine‑draft marked `TODO-REVIEW`); design tokens & UI primitives (Button, Input, Select, Chip, Card, Sheet, Toast, Skeleton, EmptyState, ErrorState); bottom nav per mode; welcome/language screen; styled login/OTP; choose‑intent screen; `activeMode` switching; offline banner; manifest + basic service worker (app shell + offline page); `formatINR`, date helpers; missing‑key CI check.
3. **Excluded**: profile forms, jobs, final translations.
4. **Dependencies**: P3.
5. **Files**: `src/i18n/**`, `src/app/[locale]/**` (layout, welcome, login, choose‑intent), `src/components/ui/**`, `src/lib/format.ts`, `public/manifest.webmanifest`, `public/sw.js`, `scripts/check-i18n.ts`, tests.
6. **Tasks**: i18n routing → catalogues + checker → tokens/primitives → layouts/nav → auth screens → intent screen → PWA files → a11y checks → E2E.
7. **Acceptance**: switching language changes all shell strings and persists to account; `formatINR(125000) === '₹1,25,000'`; missing‑key script fails CI on an absent key; Playwright (Pixel 5 viewport) completes login → choose intent; axe reports no serious/critical violations on shell pages; app installable (manifest valid in Lighthouse); first route JS ≤ 170 KB gzip (build output recorded).
8. **Security/regression**: locale param whitelisted; P3 tests still green.
9. **Done**: evidence recorded; screenshots of shell in 3 languages saved under `docs/screenshots/` (optional).
10. **Risks/rollback**: Devanagari font weight increases payload → subset/system fonts; rollback = revert shell commit.

---

## P5 — Worker profile & onboarding
1. **Objective**: Workers create and manage their profile in < 3 minutes.
2. **Included**: 3‑step onboarding wizard (S5), profile view/edit, public profile view (no phone), availability toggle, optional photo upload (storage adapter: local disk dev, S3 adapter behind env), image processing, worker service + API (`PUT /me/worker-profile`, `GET /workers/:id`, photo, availability).
3. **Excluded**: worker search by employers (P9), ratings display (P12).
4. **Dependencies**: P4.
5. **Files**: `src/server/services/workers/*`, `src/server/adapters/storage/*`, `src/lib/validation/worker.ts`, `src/app/api/v1/me/worker-profile/**`, `src/app/api/v1/workers/[id]/route.ts`, `src/app/[locale]/(worker)/onboarding/**`, `.../profile/**`, tests.
6. **Tasks**: validation schemas → service + policy → upload pipeline → API → wizard UI with saved progress → profile pages → tests.
7. **Acceptance**: invalid inputs rejected server‑side with field errors (422) even when UI is bypassed; 0 or 6 skills rejected; inactive locality rejected; photo > 5 MB or non‑image (renamed .exe) rejected; stored photo is ≤ 512px WebP without EXIF (test reads metadata); public profile JSON contains no `phone` or `gender` key (test); optional gender field saved and editable (D‑015); user cannot edit another's profile (403); E2E: new user completes onboarding on mobile viewport.
8. **Security/regression**: upload path traversal impossible (generated keys); P3/P4 suites green.
9. **Done**: evidence recorded.
10. **Risks/rollback**: sharp native binary on Windows/CI → pin version, test in Docker; rollback = revert; uploads are additive.

---

## P6 — Employer profile & job posting
1. **Objective**: Employers onboard and manage job posts through their lifecycle.
2. **Included**: employer onboarding (S6), profile edit; job wizard (S12) with preview; job service with status machine (DRAFT/OPEN/PAUSED/CLOSED/EXPIRED/FILLED/REMOVED transitions available to employer); unverified‑employer limits; scam‑keyword/low‑pay flagging; "My jobs" (S11); `jobs:tick` script with job‑expiry task; job detail page (shared with P7).
3. **Excluded**: applicant management (P8), admin moderation UI (P11).
4. **Dependencies**: P4 (P5 not required).
5. **Files**: `src/server/services/{employers,jobs}/*`, `src/lib/validation/job.ts`, `src/server/jobs/{tick,expireJobs}.ts`, `src/app/api/v1/jobs/**`, `src/app/api/v1/me/{employer-profile,jobs}/**`, `src/app/[locale]/(employer)/**`, tests.
6. **Tasks**: schemas → transitions table + unit tests → service with limits/flags → API → tick task → UI → tests.
7. **Acceptance**: every allowed job transition succeeds and every other returns 409 (table‑driven test); 4th open job by unverified employer → 403 with clear message; description containing a phone number or "registration fee" sets `flaggedForReview` (test); pay below floor flags job; genderRequirement accepts only ANY/WOMEN_ONLY/MEN_ONLY and defaults to ANY; description mentioning caste/religion/community or a gender requirement in free text is flagged (D‑015); expired job hidden after `jobs:tick` (integration test with fake clock); employer cannot edit another employer's job (403); E2E: post a job on mobile and see it in "My jobs".
8. **Security/regression**: HTML in description escaped on render; previous suites green.
9. **Done**: evidence recorded.
10. **Risks/rollback**: flag rules too aggressive → flags only, never blocks; rollback = revert.

---

## P7 — Job discovery & search (worker side)
1. **Objective**: Workers find relevant nearby jobs fast on slow networks.
2. **Included**: job feed (S7) with default sort by distance then recency; filters (category, job type, pay unit/min pay, distance band, posted within); keyword search (FTS); cursor pagination; job detail (S8) with employer summary & safety notice; empty/loading/error states; anonymous browsing allowed.
3. **Excluded**: recommendations/ML, map view, saved searches.
4. **Dependencies**: P5, P6.
5. **Files**: `src/server/services/jobs/search.ts`, `src/app/api/v1/jobs/route.ts` (GET), `src/app/[locale]/(worker)/jobs/**`, `src/components/jobs/**`, tests.
6. **Tasks**: distance query (Haversine or precomputed matrix; benchmark both on demo data) → filter builder with validation → pagination → feed UI with filter sheet → detail UI → tests + performance check.
7. **Acceptance**: only OPEN, non‑REMOVED jobs from ACTIVE employers returned (test); jobs from users the worker blocked/was blocked by excluded (once P11 exists — test stubbed now); distance ordering correct on fixture localities; each filter covered by an integration test; restricted jobs visible to all with a "Women only"/"Men only" badge, and the "open to me" filter hides ineligible ones (D‑015); invalid filter values → 422; p95 query time < 150 ms on 10k‑job synthetic dataset (recorded); Lighthouse mobile perf ≥ 80 on feed (recorded with throttling settings).
8. **Security/regression**: no employer phone in feed/detail payloads (test); rate limit on search.
9. **Done**: evidence recorded.
10. **Risks/rollback**: locality centroid approximation complaints → document; rollback = revert.

---

## P8 — Applications & hiring workflow
1. **Objective**: End‑to‑end apply → shortlist → offer → hire → complete with contact reveal.
2. **Included**: application service with transition table (ARCHITECTURE §5.3); ApplicationEvent history; apply/withdraw (worker); shortlist/reject/offer/hire/complete/cancel (employer/worker as specified); offer accept/decline; auto‑close on FILLED/CLOSED/EXPIRED; contact reveal endpoint + `ContactReveal` logging; "Call" and "WhatsApp" deep links after reveal; screens S9, S13, S14; per‑worker daily application limit.
3. **Excluded**: notifications (P10 — services emit domain events via a no‑op hook now), reviews (P12), invites (P9).
4. **Dependencies**: P7.
5. **Files**: `src/server/services/applications/{transitions,service,contact}.ts`, `src/server/policies/applications.ts`, `src/app/api/v1/{jobs/[id]/applications,applications/**,me/applications}/**`, UI under `(worker)/applications` and `(employer)/jobs/[id]/applicants`, tests.
6. **Tasks**: transitions + exhaustive unit tests → policies → service (transactions, row locking on hiredCount) → contact reveal → API → UI → E2E full journey.
7. **Acceptance**: table‑driven test covers every (status, actor, target) combination; duplicate apply → 409; applying to own/closed/paused job → 403/409; applying to a WOMEN_ONLY/MEN_ONLY job with a non‑matching or undeclared gender → 403 `GENDER_REQUIREMENT_NOT_MET` (D‑015); gender visible to the employer only on applications to their restricted jobs; contact endpoint 403 before SHORTLISTED and after REJECTED/WITHDRAWN, 200 after, and logs a ContactReveal row; concurrent hires cannot exceed openings (parallel integration test); job becomes FILLED and other applications CLOSED when last opening hired; E2E (two browser contexts): worker applies → employer shortlists → both see phone → offer → accept → hired → complete.
8. **Security/regression**: IDOR tests — worker A cannot read worker B's applications; employer X cannot act on employer Y's applicants.
9. **Done**: evidence recorded.
10. **Risks/rollback**: complex state machine → single transitions table is the only source; rollback = revert (migrations from P2 already include tables).

---

## P9 — Worker search & invites (employer side)
1. **Objective**: Employers proactively find available workers and invite them.
2. **Included**: worker search (S15) by skill, locality/distance band, sort by distance/experience/rating; invite to an OPEN job; worker invite inbox; accept → Application(source=INVITED, status=SHORTLISTED — D‑014) / decline; invite expiry in `jobs:tick`; invite rate limits.
3. **Excluded**: bulk messaging, saved worker lists.
4. **Dependencies**: P8.
5. **Files**: `src/server/services/{workers/search,invites}.ts`, API under `workers` (GET) and `invites`, UI pages, tests.
6. **Tasks**: search query → invite service + transitions → API → UI → tests.
7. **Acceptance**: unavailable/suspended/blocked workers never returned (tests); search payload has no phone or gender; inviting a worker who doesn't meet the job's gender requirement → 403 (D‑015); duplicate invite for same job/worker → 409; > 20 invites/day per employer → 429; accepted invite creates exactly one application; E2E invite → accept → appears in applicants.
8. **Security/regression**: no enumeration of all workers without filters (city‑wide requires category); P8 suite green.
9. **Done**: evidence recorded.
10. **Risks/rollback**: spammy invites → limits + report; rollback = revert.

---

## P10 — Notifications (in‑app + SMS outbox)
1. **Objective**: Users learn about events that need their action.
2. **Included**: Notification rows written transactionally for events in FR‑N1; notification centre (S16) + unread badge; mark‑read; OutboxMessage for SMS events behind `SMS_EVENTS_ENABLED`; outbox processor in `jobs:tick` with retry/backoff; job‑expiring reminder (24 h before).
3. **Excluded**: Web Push, WhatsApp, email.
4. **Dependencies**: P8 (P9 events wired if done).
5. **Files**: `src/server/services/notifications/*`, `src/server/jobs/sendOutbox.ts`, event hooks in application/job/invite services, API `me/notifications`, UI, tests.
6. **Tasks**: notification types + localised templates → emitters in services → outbox processor → UI → tests.
7. **Acceptance**: each event type produces exactly one notification for the correct recipient (integration tests); failed state change produces no notification (rollback test); outbox retries failed sends up to 5× then marks FAILED; fake SMS provider receives correct template + params; SMS disabled flag → no outbox rows; notification text renders in user's locale.
8. **Security/regression**: notification payloads contain no phone numbers; users can only read their own notifications.
9. **Done**: evidence recorded; real SMS delivery recorded as NOT VERIFIED until DLT templates approved.
10. **Risks/rollback**: SMS cost overrun → flag off + daily cap; rollback = revert, flag off.

---

## P11 — Trust & safety + admin dashboard
1. **Objective**: Keep the marketplace safe and operable.
2. **Included**: report (S18) for job/user/review; block/unblock with discovery & action exclusions everywhere; account deletion (soft‑delete, immediate hide, scrub task in `jobs:tick` after 30 days); admin area (A1–A5): metrics, reports queue, user detail with suspend/unsuspend/verify, job moderation (flagged queue, remove), taxonomy management; AuditLog for all admin actions; admin role guard; safety copy screens.
3. **Excluded**: automated ML moderation, document/Aadhaar verification.
4. **Dependencies**: P8.
5. **Files**: `src/server/services/{reports,blocks,admin,accounts}/*`, `src/server/jobs/scrubDeleted.ts`, `src/app/[locale]/admin/**`, API under `admin`, `reports`, `blocks`, `me` (DELETE), tests.
6. **Tasks**: report/block services → retrofit block filters into search, apply, invite, contact → deletion flow → admin guard + APIs → admin UI → audit logging → tests.
7. **Acceptance**: non‑admin → 403 on every `/admin` route (parametrised test over all routes); every admin mutation writes an AuditLog row; suspended user's jobs hidden from discovery; blocked pairs cannot see/apply/invite/contact each other (tests per surface); deleted account disappears from discovery immediately and PII fields are scrubbed after scrub task with fake clock; duplicate report by same user on same target within 24 h → 409.
8. **Security/regression**: admin phone views audited; full regression suite green.
9. **Done**: evidence recorded; moderation SOP drafted in `docs/` (operational dependency).
10. **Risks/rollback**: admin bugs exposing PII → strict tests; rollback = revert, admin routes disabled by flag.

---

## P12 — Reviews & ratings
1. **Objective**: Post‑hire mutual reviews to build trust.
2. **Included**: review form (S17), eligibility rules (FR‑R1), aggregate rating recompute in same transaction, rating display on profiles/cards/applicants, report review, admin hide (recomputes aggregate).
3. **Excluded**: review replies, photo reviews.
4. **Dependencies**: P8, P11.
5. **Files**: `src/server/services/reviews/*`, API, UI components, tests.
6. **Tasks**: eligibility policy → service → aggregates → API → UI → tests.
7. **Acceptance**: only HIRED+COMPLETED parties can review (tests for every other status → 403); second review → 409; rating outside 1–5 → 422; aggregates correct after create/hide (test); CANCELLED hires cannot be reviewed.
8. **Security/regression**: review text escaped; reviewer identity shown as display name only.
9. **Done**: evidence recorded.
10. **Risks/rollback**: retaliatory reviews → report + hide; rollback = revert.

---

## P13 — Localisation content, accessibility & performance pass
1. **Objective**: Pilot‑quality experience for target users.
2. **Included**: native‑speaker‑reviewed Hindi and Marathi catalogues (remove all `TODO-REVIEW`); category/locality labels in all languages; WebOTP; accessibility audit (axe on all screens + manual TalkBack check on a real low‑end Android); performance budget enforcement in CI; image/font optimisation; service‑worker caching of reference data; usability test with 5 workers + 5 employers (record findings).
3. **Excluded**: new features.
4. **Dependencies**: P5–P12; external translators.
5. **Files**: `src/i18n/messages/*`, seed label files, UI tweaks, `scripts/perf-budget.ts`, `docs/TESTING.md`.
6. **Tasks**: translation import → i18n checker zero TODOs → axe sweep + fixes → manual device test → performance tuning → usability sessions → fixes.
7. **Acceptance**: zero missing/TODO keys in hi/mr; axe: no serious/critical violations on all screens; Lighthouse mobile perf ≥ 80 and a11y ≥ 95 on feed, job detail, onboarding; usability: ≥ 4/5 workers complete onboarding unaided (or with ≤ 1 hint).
8. **Security/regression**: full suite green.
9. **Done**: evidence recorded including device model used.
10. **Risks/rollback**: translation delays → blocker recorded; rollback per change.

---

## P14 — Production readiness & deployment
1. **Objective**: Secure, observable staging and production environments.
2. **Included**: Dockerfile (multi‑stage), staging + production on chosen host (Q8) in India region, managed Postgres with daily backups, object storage bucket, domain + TLS, env/secret configuration, `prisma migrate deploy` in release step, cron for `jobs:tick`, Sentry (if approved), uptime check on `/api/health`, security headers verified, MSG91 production integration with DLT templates, privacy policy & terms pages (content from legal), admin accounts provisioned, backup restore drill, runbook (`docs/RUNBOOK.md`).
3. **Excluded**: autoscaling, multi‑region, native apps.
4. **Dependencies**: P13; DLT registration; legal text; hosting account & budget; domain.
5. **Files**: `Dockerfile`, `.dockerignore`, deployment config (e.g. `.do/app.yaml` or IaC), `docs/RUNBOOK.md`, CI deploy workflow.
6. **Tasks**: container build → staging deploy → smoke + E2E against staging → security headers scan (e.g. Mozilla Observatory) → real OTP on staging → backup/restore drill → production deploy → production smoke with internal accounts.
7. **Acceptance**: staging E2E suite passes against deployed URL; real OTP SMS received on 3 carriers (Jio, Airtel, Vi); restore drill restores yesterday's backup into a scratch DB successfully (timed); headers scan grade ≥ A; no secrets in image (`docker history` / scan); production smoke: login, post job, apply, shortlist with internal test accounts, then data cleaned.
8. **Security/regression**: `npm audit` clean of high/critical; production refuses dev flags (test from P3).
9. **Done**: runbook complete; evidence recorded.
10. **Risks/rollback**: deploy failure → previous image rollback documented; migration failure → restore from pre‑deploy backup.

---

## P15 — Nagpur pilot launch & validation
1. **Objective**: Validate demand and the core loop in 3–5 Nagpur localities.
2. **Included**: launch plan (localities chosen per Q9), assisted onboarding events (labour chowks, SHGs, RWAs), employer seeding, WhatsApp share links, weekly metrics review against PRD §11, support line/process, safety incident process, feedback interviews, prioritised backlog for Release 2.
3. **Excluded**: city‑wide marketing, paid acquisition, monetisation.
4. **Dependencies**: P14; field team.
5. **Files**: `docs/PILOT_PLAN.md`, `docs/PILOT_RESULTS.md`, ledger.
6. **Tasks**: pick localities → field partner onboarding → soft launch (internal + 20 friendly users) → open pilot → weekly review → interviews → go/no‑go report.
7. **Acceptance**: metrics in PRD §11 measured and reported weekly; all high‑severity reports resolved < 24 h; go/no‑go recommendation documented.
8. **Security/regression**: incident response tested; hotfix process uses same CI gates.
9. **Done**: pilot results document reviewed with owner.
10. **Risks/rollback**: low liquidity → narrow to fewer localities/categories; serious safety incident → pause new signups via flag.

---

## Appendix A — Development workflow

- **Branching**: `main` always releasable; one branch per phase (`phase/p1-foundation`), small commits; PR (or self‑review of `git diff`) before merge.
- **Definition of done** (all phases): acceptance criteria evidenced, lint/typecheck/tests/build green, docs + ledger updated, no unrelated diffs.
- **Environment config**: `.env.example` is the contract; `src/server/env.ts` validates at startup. Key vars: `DATABASE_URL`, `SESSION_SECRET`, `OTP_PEPPER`, `IP_HASH_SALT`, `SMS_PROVIDER` (`console|fake|msg91`), `MSG91_*`, `SMS_EVENTS_ENABLED`, `STORAGE_DRIVER` (`local|s3`), `S3_*`, `ADMIN_PHONE`, `APP_BASE_URL`, `SENTRY_DSN?`, `DEV_FIXED_OTP?` (non‑prod only).
- **Seed data**: `db:seed` (reference data: city, localities, categories, admin — safe in every env, idempotent); `db:seed:demo` (fake people/jobs, refuses production). All demo phone numbers use a reserved fake range.

## Appendix B — Local demo vs production

| | Local demo | Production pilot |
|---|---|---|
| Run | `docker compose up -d db && npm run dev` | Container on India‑region host |
| OTP | Printed in server console | Real SMS via DLT‑registered MSG91 |
| Data | Demo seed | Real users; backups + restore drill |
| Storage | Local disk | Object storage bucket |
| Security | Dev defaults | TLS, headers, secrets manager, monitoring |
| Legal | — | Privacy policy, terms, consent, grievance officer contact (DPDP) |

## Appendix C — Nagpur launch‑validation strategy

1. **Concierge pre‑pilot (parallel to P5–P12)**: field team collects 50 real job needs and 100 worker profiles on paper/Google Form in 3 localities to validate categories, pay ranges, and language preferences — feeds seed taxonomy and UX copy.
2. **Locality focus**: 3–5 adjacent localities mixing employer demand and worker supply (e.g., Dharampeth / Ramdaspeth / Shivaji Nagar for households, Itwari / Gandhibagh for trades and shops, Hingna MIDC belt for construction/industrial helpers) — final choice Q9.
3. **Category focus**: start with 5–6 categories (house help, cook, cleaner, painter, construction helper, electrician/plumber).
4. **Supply partners**: self‑help groups, labour chowks, ITIs, NGOs working with domestic workers; demand partners: RWAs/housing societies, contractors, local shop associations.
5. **Assisted onboarding**: volunteers onboard workers on their own phones (never collecting OTPs on the worker's behalf without the worker present).
6. **Soft launch** with ~20 friendly users for 1 week → fix → open pilot.
7. **Weekly review** of PRD §11 metrics + call‑back sample of hires; kill/continue/expand decision at week 8–12.
