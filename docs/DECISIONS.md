# KaamSetu — Decision Record

Format: one entry per significant decision. Status: **PROPOSED** (awaiting owner approval), **ACCEPTED**, **SUPERSEDED by D‑xxx**, **REJECTED**.
Never edit an accepted decision's rationale silently — add a new entry that supersedes it.

---

### D‑000 — Plan before implementation; one phase at a time
- **Date**: 2026-10-27 · **Status**: ACCEPTED (instructed by product owner)
- **Decision**: No application code until the plan is approved. Implement only the next approved phase; stop for review after each.
- **Consequence**: P0 ends at AWAITING APPROVAL.

### D‑001 — Mobile‑first PWA on a Next.js monolith (no native app in MVP)
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27)
- **Context**: Users on low‑end Android with limited storage/data; small team; need fast iteration and shareable links (WhatsApp).
- **Decision**: Server‑rendered Next.js (App Router, RSC) + TypeScript as a single deployable with a REST API under `/api/v1` and a service layer.
- **Alternatives**: React Native/Flutter app (install friction, store review, larger footprint); separate API + SPA (more infra, heavier client JS).
- **Consequences**: One codebase; a native/TWA wrapper later can reuse the API. UI and API deploy together.

### D‑002 — PostgreSQL + Prisma with versioned migrations
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27)
- **Rationale**: Multi‑party workflows (jobs ↔ applications ↔ reviews) need relational integrity and transactions; Postgres FTS covers MVP search.
- **Alternative**: Drizzle ORM (lighter) — acceptable swap if owner prefers.

### D‑003 — Custom phone‑OTP auth with server‑side sessions
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27)
- **Rationale**: Phone is the natural identity for the audience; a single auth flow does not justify a framework; DB sessions allow instant revocation (suspension).
- **Alternatives**: Firebase Auth (data/vendor outside our DB), Auth.js (credentials flow adds little), JWT (hard to revoke).

### D‑004 — SMS behind a provider interface; MSG91 proposed for production
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27; Q2 → MSG91)
- **Rationale**: Indian commercial SMS requires TRAI DLT registration (entity, sender ID, templates). Interface + console/fake providers mean development and tests never depend on credentials.

### D‑005 — Locality‑based distance, no PostGIS in MVP
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27)
- **Rationale**: Storing only neighbourhood (not GPS) is better for privacy and enough for "nearby". Distance computed between locality centroids (Haversine or a precomputed matrix).
- **Revisit when**: map view, GPS, or > 1 city with many localities.

### D‑006 — Money stored as integer rupees
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27)
- **Rationale**: Wages are whole rupees; avoids float errors; no payments in MVP. Revisit (paise) if payments are added.

### D‑007 — Offer folded into Application (no separate Offer table)
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27)
- **Rationale**: One offer per application in MVP; status `OFFERED` + offer fields keep the state machine in one place. Revisit if counter‑offers/negotiation are needed.

### D‑008 — Contact details revealed only from SHORTLISTED onward, with audit log
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27; Q4 → mutual reveal at SHORTLISTED)
- **Rationale**: Protects workers (especially women in household work) from unsolicited contact and limits scraping of phone numbers.

### D‑009 — No in‑app chat, payments, or ID‑document verification in MVP
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27)
- **Rationale**: Each is high‑cost/high‑risk (moderation, RBI/PA rules, Aadhaar regulations). Phone/WhatsApp after shortlist covers communication; manual in‑person verification badge covers trust.

### D‑010 — DB outbox + cron script instead of a queue
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27)
- **Rationale**: Pilot volume is tiny; avoids Redis/queue infra. Notifications are written in the same transaction as the state change.

### D‑011 — Hosting in an India region (DigitalOcean BLR or AWS ap‑south‑1)
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27; Q8 → DigitalOcean BLR)
- **Rationale**: Low latency for Nagpur users; keeps personal data in India, simplifying DPDP posture.

### D‑012 — Three UI languages from day one (en, hi, mr), externalised strings
- **Date**: 2026-10-27 · **Status**: ACCEPTED (2026-10-27)
- **Rationale**: Retro‑fitting i18n is expensive; Marathi and Hindi are essential for the target users. Final translations are an external dependency before pilot (P13).

### D‑013 — Documentation paths
- **Date**: 2026-10-27 · **Status**: ACCEPTED
- **Decision**: Use the exact paths requested by the owner (`PROJECT_LEDGER.md`, `docs/PRODUCT_REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_ROADMAP.md`, `docs/DECISIONS.md`, `docs/TESTING.md`). UX specification lives in `docs/PRODUCT_REQUIREMENTS.md §12`; data model and API design live in `docs/ARCHITECTURE.md §5–6`.

### D‑014 — Plan approved with proposed defaults for Q1–Q10
- **Date**: 2026-10-27 · **Status**: ACCEPTED (product owner: "I approve the plan with the proposed defaults for Q1–Q10")
- **Decision**: D‑001 … D‑012 accepted. Owner answers:
  - **Q1** Project moves to a permanent folder chosen by the owner; `git init` happens in P1; a private GitHub repo will be added for CI (remote URL still to be supplied).
  - **Q2** MSG91 for SMS/OTP; DLT registration to be started by the owner in parallel (external).
  - **Q3** One phone number may hold both a worker and an employer profile, with a mode switch.
  - **Q4** Phone numbers revealed mutually at SHORTLISTED (and later statuses except REJECTED/WITHDRAWN/CLOSED), every reveal logged.
  - **Q5** A worker must accept an offer before becoming HIRED (no direct hire from SHORTLISTED); an accepted invite creates an application in SHORTLISTED.
  - **Q6** No gender‑preference field in MVP; revisit after pilot interviews.
  - **Q7** A KaamSetu team member performs in‑person verification; only the method is recorded, never document numbers.
  - **Q8** DigitalOcean Bangalore (App Platform + Managed Postgres + Spaces), pilot budget ≈ US$30–50/month.
  - **Q9** 3–5 pilot localities and 5–6 categories as in roadmap Appendix C; final locality list confirmed before P15.
  - **Q10** Stack approved as proposed; no third‑party analytics in MVP; brand assets/domain to be supplied before P14.
- **Consequences**: P0 COMPLETE. ARCHITECTURE §5.3 drops the direct SHORTLISTED → HIRED path. P1 is ready to start and awaits an explicit go‑ahead.
- **Note**: the Q6 answer was superseded by D‑015 on 2026-10-27.

### D‑015 — Jobs may state a gender requirement (supersedes the Q6 part of D‑014)
- **Date**: 2026-10-27 · **Status**: ACCEPTED (owner: "there should be gender preference as some jobs can be only for man or woman")
- **Context**: Some household and care jobs are realistically only for women (e.g., caring for an elderly woman, live‑in help in a women‑only home), and some site jobs are posted only for men. Without a structured field, employers would write it into the description or reject applicants after contact. That wastes workers' time and data and is harder to moderate.
- **Decision**:
  - `Job.genderRequirement` ∈ {`ANY` (default), `WOMEN_ONLY`, `MEN_ONLY`}, chosen from a fixed list. No free text.
  - `WorkerProfile.gender` ∈ {`WOMAN`, `MAN`, `OTHER`, `PREFER_NOT_TO_SAY`}. It is optional and self‑declared. It is **not shown** on the public worker profile. It is used only to check eligibility for restricted jobs, and shown to an employer only on applications to that employer's restricted jobs.
  - Restricted jobs remain **visible to everyone** with a clear badge ("Women only" / "Men only"). Workers can filter to "jobs open to me".
  - Apply / accept‑invite to a restricted job requires a matching declared gender. A worker with `PREFER_NOT_TO_SAY` or no answer is asked to declare (or can cancel). This is enforced server‑side.
  - Employers can invite only workers whose declared gender matches the job's requirement. Worker search has **no** standalone gender filter. When inviting to a restricted job, ineligible workers are simply not invitable.
  - No other protected attribute (caste, religion, community, age band, marital status) may be a requirement. Description text mentioning these is auto‑flagged for admin review (extends FR‑J5 flags).
  - Admin metrics show the share of restricted jobs per category so misuse can be spotted.
- **Open sub‑question (non‑blocking, owner to decide before P8)**: whether `OTHER` may apply to restricted jobs. Default until decided: eligible for neither `WOMEN_ONLY` nor `MEN_ONLY`. Owner may change.
- **Risk**: legal and reputational exposure from gender‑restricted listings. Mitigation: fixed options only, private gender field, moderation, legal review before public launch (P14 dependency).
- **Phases affected (D‑015)**: P2 (schema), P5 (worker gender field), P6 (job field + flags), P7 (badge + filter), P8 (apply eligibility), P9 (invite eligibility), P11 (metrics). P1 is not affected.

### D‑016 — Toolchain versions pinned in P1
- **Date**: 2026-10-27 · **Status**: ACCEPTED (implementation detail within D‑001/D‑002)
- **Decision**: Exact versions, no ranges: Next 16.4.3, React 19.3.1, TypeScript **6.0.3**, ESLint **9.39.5**, Tailwind 4.3.3, Vitest 5.0.5, Playwright 1.64.1, Zod 4.6.7, pino 10.4.0, `@types/node` 24.x (matches Node 24).
- **Why not latest**: TypeScript 7.0.2 is latest, but `typescript-eslint` (used by `eslint-config-next`) supports only `<6.1.0`. ESLint 10 is latest, but ESLint 9 was chosen because Next's lint plugins (react, import, jsx‑a11y) are proven on 9.
- **Revisit**: when `typescript-eslint` supports TS 7 and the Next lint plugins support ESLint 10.

### D‑017 — Small P1 tooling choices
- **Date**: 2026-10-27 · **Status**: ACCEPTED
- Prettier ignores `*.md`. The docs are hand‑maintained and contain long tables, and auto‑formatting would cause churn.
- The Vitest config is `vitest.config.mts`, an ES module, because `package.json` has no `"type": "module"`.
- The env loader is lazy (`getEnv()`), so imports never fail at build time. `src/instrumentation.ts` calls it at server start for fail‑fast behaviour.
- Basic security headers are set in `next.config.ts`; the full CSP comes with P14. The `X-Powered-By` header is disabled.
- `pino` is listed in `serverExternalPackages`, so it isn't bundled.
- Branching (P1 only): P1 was committed directly to `main` at the owner's request (2026-10-29). The repo is public on GitHub (`SamruddhiKatole/myproject`), which the owner confirmed is fine; this supersedes the "private repo" default in Q1. Later phases default to a `phase/…` branch with a PR. Local git 2.20 lacks `git switch`, so use `git checkout -b`.

### D‑018 — P2 data‑layer details
- **Date**: 2026-10-30 · **Status**: ACCEPTED (implementation details within D‑002/D‑005; schema not yet validated, pending installs)
- **Prisma 7.10.1, not 8.x**: npm's `latest` tag for `prisma` points at a release candidate (8.0.0‑rc.28). We pin the stable 7.10.1 (released 2026-10-15) for `prisma`, `@prisma/client` and `@prisma/adapter-pg`.
- **Prisma 7 layout**: the `prisma-client` generator outputs to `src/generated/prisma` (git‑ignored, rebuilt by `postinstall`). The connection URL lives in `prisma.config.ts`, and the client connects through `@prisma/adapter-pg` + `pg`. `.env` is loaded with Node 24's `process.loadEnvFile()`, so there's no `dotenv` dependency.
- **Full‑text search**: `searchVector` is a **STORED GENERATED** `tsvector` column (Job: title + description; WorkerProfile: displayName + bio), not trigger‑maintained as ARCHITECTURE §5.1 first said. It uses the `simple` configuration (no Hindi/Marathi stemming exists in Postgres), with a GIN index. It's modelled as `Unsupported("tsvector")?` and converted by the hand‑written migration `prisma/migrations/20261030000100_fts_generated_columns`. The `init` migration was produced with `prisma migrate diff --from-empty --to-schema` (no database needed).
- **CHECK constraints** in SQL for pay range, openings, `hiredCount ≤ openings`, rating 1–5, experience 0–50, coordinates, and no self‑block. These are a second line of defence; services still validate with Zod.
- **Ratings** are stored as `ratingSum` + `ratingCount` (integers), with the average computed on read. This avoids float drift; ARCHITECTURE §5.1 said `ratingAvg`.
- **Locality names** are three columns (`nameEn`, `nameHi`, `nameMr`), not JSON, so they're simple to query and sort.
- **Distance**: Haversine computed at query time in P7. The precomputed matrix is deferred until query plans show a need.
- **Seed data**: about 60 Nagpur localities with **approximate centroids from general knowledge, not surveyed**, and 17 categories. Hindi/Marathi strings are best‑effort. Both are flagged for field‑team and native‑speaker review (P13/P15).
- **Reserved fake phone ranges**: tests `+91999990xxxx`, demo workers `+91999991xxxx`, demo employers `+91999992xxxx`.
- **Test split**: `npm test` = unit (no DB); `npm run test:integration` = Postgres‑backed, run one file at a time. CI runs both after `prisma migrate deploy`.
- **Separate test database** (added 2026-10-30, after validation): integration tests TRUNCATE every table. They therefore read `TEST_DATABASE_URL` (locally `kaamsetu_test`, created by `npm run db:test:prepare`) and refuse to run when it equals `DATABASE_URL`, except in CI, whose database is throwaway.
- **Generated columns vs `migrate diff`**: Prisma reads a STORED GENERATED column as a database default. The schema therefore mirrors each generation expression with `@default(dbgenerated(…))`, so `migrate diff`/`migrate dev` stay empty instead of proposing a `DROP DEFAULT`.
- Status update 2026-10-30: schema validated against a real database (see TESTING §5).

### D‑019 — Native local PostgreSQL instead of Docker
- **Date**: 2026-10-30 · **Status**: ACCEPTED (owner choice)
- **Context**: Docker Desktop is installed but its engine wasn't running. The owner asked whether Docker was needed.
- **Decision**: For local development, use native **PostgreSQL 16.15** installed via `winget` (the EDB installer). The owner ran the wizard and holds the `postgres` superuser password. App role `kaamsetu` (LOGIN, CREATEDB, dev‑only password) owns `kaamsetu` and `kaamsetu_test`. CREATEDB lets Prisma create its shadow database.
- `docker-compose.yml` stays as an optional alternative with the same credentials. CI is unchanged (Postgres 16 service container). Production is unaffected (managed Postgres, P14).
- **Trade‑off**: a background Windows service uses some RAM, and the major version must be kept in step with CI/production (16) by hand.
