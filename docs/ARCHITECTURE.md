# KaamSetu — Architecture

> Status: **APPROVED** (v1.0, 2026-10-27 — see D‑014). Decisions referenced as `D-xxx` live in `docs/DECISIONS.md`.

---

## 1. Context

- Greenfield: the workspace was empty at planning time (no existing code or conventions to preserve).
- Team assumption: 1–3 full‑stack developers; operating budget small; managed services preferred.
- Users are on low‑end Android phones with intermittent 4G → payload size and resilience matter
  more than feature richness.

## 2. Recommended stack

| Concern | Choice | Why | Alternatives considered |
|---|---|---|---|
| Language | **TypeScript (strict)** end‑to‑end | One language for UI, API, scripts; type‑safe data model | — |
| App framework | **Next.js (App Router) monolith**, React Server Components | Server‑rendered pages ship little JS (good for slow phones); API routes + UI in one deployable; huge ecosystem | Separate Express/NestJS API + React SPA (more moving parts, heavier client); React Native app (Play Store friction, larger install, slower iteration) — see D‑001 |
| Styling | **Tailwind CSS** | Small CSS output, fast iteration, consistent design tokens | CSS modules |
| Database | **PostgreSQL 16** | Relational integrity for multi‑party workflows, full‑text search, mature managed offerings in India regions | MongoDB (weaker relational guarantees), MySQL |
| ORM / migrations | **Prisma** | Typed client, versioned SQL migrations, seed support | Drizzle (lighter; viable alternative) |
| Validation | **Zod** schemas shared by forms and server | Single source of truth; server always re‑validates | Yup |
| Auth | **Custom phone‑OTP + server‑side sessions** (DB table, hashed tokens, HTTP‑only cookie) | Phone OTP is the norm for this audience; avoids heavy auth framework for a single flow | Auth.js credentials provider; Firebase Auth (vendor lock‑in, data outside our DB) — D‑003 |
| SMS / OTP | **Provider interface**: `ConsoleSmsProvider` (dev/test), **MSG91** (prod, DLT‑compliant) | Swappable; dev never needs credentials | 2Factor.in, Twilio (pricier in India) — D‑004 |
| File storage | **S3‑compatible object storage** (DigitalOcean Spaces BLR / AWS S3 ap‑south‑1); local disk adapter in dev | Cheap, CDN‑able; adapter keeps dev offline | Storing blobs in DB |
| Image processing | **sharp** (resize to ≤512px WebP, strip EXIF) | Small images for slow networks, privacy | Client‑side only resize (untrusted) |
| Search | **PostgreSQL**: B‑tree filters + `tsvector` full‑text + Haversine distance on locality centroids | Sufficient for ≤ tens of thousands of rows; zero extra infra | PostGIS (later, when real geo needed), Meilisearch/Elastic (overkill) — D‑005 |
| Background work | **DB outbox table + cron‑invoked scripts** (`npm run jobs:tick`) | No queue infra for pilot; idempotent | pg‑boss / BullMQ+Redis (later if volume grows) |
| i18n | **next‑intl** with ICU message catalogues (en/hi/mr) | App Router support, server‑side translations (no client bundle bloat) | i18next |
| PWA | Web manifest + small service worker (app shell cache, offline page) | Installable, resilient on flaky networks | Native app |
| Testing | **Vitest** (unit + integration against real Postgres), **Playwright** (E2E, mobile viewport), axe‑core for a11y | Fast, TS‑native, realistic | Jest, Cypress |
| Lint/format | ESLint + Prettier, `tsc --noEmit` | Standard | Biome |
| Logging | **pino** structured JSON logs, PII redaction | Cheap, fast | — |
| Error tracking | Sentry (free tier) — optional, behind env flag | Visibility in production | — |
| Rate limiting | Postgres‑backed fixed‑window counters (pilot); Redis later | No extra infra | Upstash Redis |
| CI | GitHub Actions: lint, typecheck, unit/integration (Postgres service), build, E2E | Standard | — |
| Hosting (pilot) | **Docker image** on DigitalOcean App Platform (BLR) or AWS (ap‑south‑1) + managed Postgres in same region | Data stays in India, managed backups, simple ops — decision Q8 | Vercel (functions outside India by default; fine for demo), self‑managed VPS |
| Local dev | Node 24 LTS, Docker Compose (Postgres; optional MinIO) | One command start | — |

## 3. High‑level architecture

```
 Android browser / PWA
        │  HTTPS (HTML via RSC, JSON for mutations)
        ▼
┌──────────────────────────── Next.js app (single container) ───────────────────────────┐
│  app/ (routes, RSC pages, layouts, i18n)                                               │
│  app/api/v1/* (REST route handlers)  ──►  server/services/* (business logic + authz)  │
│  middleware (session, locale, security headers)    server/policies/* (permissions)    │
│                                            server/repos via Prisma                    │
│  adapters: sms/, storage/, clock, logger                                               │
└────────────┬───────────────────────────────┬───────────────────────────────┬──────────┘
             ▼                               ▼                               ▼
      PostgreSQL (managed)          Object storage (photos)          SMS provider (MSG91)
             ▲
   cron → `jobs:tick` script (expire jobs, send outbox SMS, purge OTPs, scrub deleted users)
```

### Layering rules
1. **Route handlers / server actions** parse input with Zod, resolve the session, call one service function, map errors to HTTP. No business logic.
2. **Services** hold business rules and **authorisation** (via `policies/`); they take an explicit `actor` and run DB writes in transactions.
3. **Policies** are pure functions: `canViewContact(actor, application)`, etc. — unit tested exhaustively.
4. **Adapters** wrap every external system behind an interface with a fake implementation for dev/tests.
5. UI components never import Prisma.

### Proposed source layout
```
/
├─ PROJECT_LEDGER.md
├─ docs/…
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed/ (localities.nagpur.json, categories.json, demo.ts)
├─ src/
│  ├─ app/
│  │  ├─ [locale]/(public)/…       login, welcome, privacy
│  │  ├─ [locale]/(worker)/…       jobs, applications, profile
│  │  ├─ [locale]/(employer)/…     my-jobs, applicants, find-workers
│  │  ├─ [locale]/admin/…
│  │  └─ api/v1/…                  REST handlers
│  ├─ components/                  UI primitives + feature components
│  ├─ i18n/                        config + messages/{en,hi,mr}.json
│  ├─ lib/                         formatting (₹, dates), validation schemas (zod)
│  └─ server/
│     ├─ auth/                     otp, sessions, rate limit
│     ├─ services/                 users, workers, employers, jobs, applications, reviews, reports, notifications, admin
│     ├─ policies/
│     ├─ adapters/                 sms/, storage/, clock.ts
│     ├─ db.ts, logger.ts, errors.ts
│     └─ jobs/                     tick.ts and tasks
├─ tests/
│  ├─ unit/  integration/  e2e/  fixtures/
├─ docker-compose.yml, Dockerfile, .env.example
└─ .github/workflows/ci.yml
```

## 4. Authentication & authorisation

### Authentication
- `POST /api/v1/auth/otp/request {phone}` → normalise to E.164 (`+91XXXXXXXXXX`), rate‑limit, create `OtpChallenge` (code hashed with HMAC‑SHA256 + server pepper), send via SMS provider. Response is identical whether or not the number is registered (no enumeration).
- `POST /api/v1/auth/otp/verify {challengeId, code}` → constant‑time compare, attempt counter, on success upsert `User`, create `Session` (random 32‑byte token; DB stores SHA‑256 hash), set cookie `ks_session` (`HttpOnly; Secure; SameSite=Lax; Path=/`).
- Dev/test: `ConsoleSmsProvider` logs the OTP; optional `DEV_FIXED_OTP` only when `NODE_ENV !== 'production'` (startup assertion refuses it in production).
- CSRF: SameSite=Lax cookie + origin check on all non‑GET API requests.

### Roles and capabilities
A user has `roles: WORKER | EMPLOYER | ADMIN` (multi‑valued) derived from profiles + admin flag. `status: ACTIVE | SUSPENDED | DELETED`. Suspended users can log in only to see a suspension notice.

### Permission matrix (enforced in services)

| Action | Worker | Employer | Admin | Notes |
|---|---|---|---|---|
| View OPEN job | ✓ | ✓ | ✓ | Anonymous visitors: job list/detail allowed, employer name only; apply requires login |
| Create/edit/close job | — | own only | hide/remove any | |
| Apply to job | ✓ (not own, not blocked, job OPEN, worker profile complete, declared gender matches job's genderRequirement) | — | — | Eligibility in `policies/jobs.ts` (D‑015) |
| View worker's gender | own | only on applications to own WOMEN_ONLY/MEN_ONLY jobs | ✓ | Never in public profile or search payloads |
| Withdraw application | own | — | — | before HIRED |
| Shortlist/reject/offer/hire | — | applications to own jobs | — | |
| Accept/decline offer | own | — | — | |
| View worker public profile | ✓ | ✓ | ✓ | no phone |
| View phone of counterparty | if application ≥ SHORTLISTED & not REJECTED/WITHDRAWN/CLOSED | same | ✓ (audited) | logged in `ContactReveal` |
| Search workers | — | ✓ | ✓ | only `isAvailable = true`, ACTIVE, not blocked |
| Review | party of COMPLETED hire, once | same | hide | |
| Report / block | ✓ | ✓ | — | |
| Moderation, verification, taxonomy | — | — | ✓ | audit‑logged |

## 5. Data model

### 5.1 Entities (PostgreSQL, Prisma)

All tables: `id` (cuid/uuid), `createdAt`, `updatedAt`. Money stored as integer rupees (`Int`) — paise precision is unnecessary for wages (D‑006).

| Entity | Key fields | Notes |
|---|---|---|
| **City** | slug (`nagpur`), names {en,hi,mr}, isActive | Multi‑city ready |
| **Locality** | cityId, slug, names {en,hi,mr}, lat, lng, isActive | ~100–150 seeded Nagpur localities (Dharampeth, Sitabuldi, Itwari, Manish Nagar…) with centroid coords |
| **SkillCategory** | slug, names {en,hi,mr}, icon, sortOrder, isActive | house‑help, cook, cleaner, babysitter/elder‑care, driver, carpenter, plumber, electrician, painter, mason/construction‑helper, welder, shop‑helper, delivery‑helper, security‑guard, gardener, other |
| **User** | phoneE164 (unique), status, isAdmin, locale, activeMode, consentVersion, consentAt, lastLoginAt, deletedAt | Phone is PII — never in public payloads |
| **Session** | userId, tokenHash (unique), expiresAt, userAgent, ipHash | |
| **OtpChallenge** | phoneE164, codeHash, attempts, expiresAt, consumedAt, ipHash | Purged after 24 h |
| **RateLimitBucket** | key, windowStart, count | |
| **WorkerProfile** | userId (1:1), displayName, photoKey?, localityId, experienceYears, expectedPayAmount?, expectedPayUnit?, availabilityText, languages[], bio, gender? (WOMAN/MAN/OTHER/PREFER_NOT_TO_SAY — private, D‑015), isAvailable, verificationStatus, ratingAvg, ratingCount, searchVector | |
| **WorkerSkill** | workerProfileId, categoryId (unique pair) | 1–5 per worker |
| **EmployerProfile** | userId (1:1), displayName, employerType, businessName?, localityId, verificationStatus, ratingAvg, ratingCount, openJobLimit | |
| **Job** | employerProfileId, categoryId, title, description, payAmount, payUnit, jobType, scheduleText, startDate?, localityId, openings, genderRequirement (ANY/WOMEN_ONLY/MEN_ONLY, default ANY — D‑015), hiredCount, status, expiresAt, publishedAt, flaggedForReview, flagReasons[], searchVector | |
| **Application** | jobId, workerProfileId (unique pair), status, note, source (APPLIED / INVITED), offerPayAmount?, offerPayUnit?, offerStartDate?, offerMessage?, hiredAt?, completedAt? | Offer is folded into Application (D‑007) |
| **ApplicationEvent** | applicationId, actorUserId, fromStatus, toStatus, note | Immutable history |
| **Invite** | jobId, workerProfileId, employerProfileId, status (PENDING/ACCEPTED/DECLINED/EXPIRED) | Accept → creates Application(source=INVITED) |
| **ContactReveal** | applicationId, viewerUserId, revealedUserId, at | Audit of phone visibility |
| **Review** | applicationId, authorUserId, subjectUserId, subjectRole, rating 1–5, text?, status (VISIBLE/HIDDEN) | unique (applicationId, authorUserId) |
| **Report** | reporterUserId, targetType (JOB/USER/REVIEW), targetId, reason, details?, status (OPEN/ACTIONED/DISMISSED), resolvedBy?, resolution? | |
| **Block** | blockerUserId, blockedUserId (unique pair) | |
| **Notification** | userId, type, payload JSON, readAt? | In‑app |
| **OutboxMessage** | channel (SMS), toUserId, template, params JSON, status, attempts, sentAt, error | Processed by `jobs:tick` |
| **Upload** | ownerUserId, key, mime, bytes, purpose, status | |
| **AuditLog** | actorUserId, action, targetType, targetId, reason, metadata JSON | Admin & sensitive actions |
| **VerificationRecord** | userId, profileType, method (PHONE/IN_PERSON/DOCUMENT_SIGHTED), verifiedBy, notes | No document numbers stored |

### 5.2 Relationships

```
City 1─* Locality
User 1─0..1 WorkerProfile *─* SkillCategory (via WorkerSkill)
User 1─0..1 EmployerProfile 1─* Job *─1 SkillCategory
Job *─1 Locality ; WorkerProfile *─1 Locality ; EmployerProfile *─1 Locality
Job 1─* Application *─1 WorkerProfile
Application 1─* ApplicationEvent ; Application 1─* ContactReveal ; Application 1─0..2 Review
Job 1─* Invite *─1 WorkerProfile
User 1─* Report (as reporter) ; Report → polymorphic target (Job | User | Review)
User *─* User (Block)
User 1─* Notification ; User 1─* Session ; User 1─* AuditLog (as actor)
```

### 5.3 Status transitions

**Job**
```
DRAFT ──publish──► OPEN ◄──resume── PAUSED
                    │  └──pause──────►┘
                    ├──hiredCount == openings──► FILLED
                    ├──employer closes──► CLOSED
                    ├──expiresAt passed (tick)──► EXPIRED ──employer renews──► OPEN
                    └──admin──► REMOVED (terminal; from any state)
FILLED ──employer reopens (increase openings)──► OPEN
```

**Application**
```
APPLIED ──employer──► SHORTLISTED ──employer──► OFFERED ──worker accepts──► HIRED ──either party──► COMPLETED
   │                     │                          └──worker declines──► DECLINED
   ├──employer──► REJECTED ◄──employer── (SHORTLISTED | OFFERED)
   ├──worker──► WITHDRAWN ◄──worker── (SHORTLISTED | OFFERED)
   └──job FILLED/CLOSED/EXPIRED/REMOVED──► CLOSED   (also from SHORTLISTED/OFFERED)
No direct SHORTLISTED → HIRED: the worker must always accept an offer (D‑014 / Q5).
Accepted invite → application created directly in SHORTLISTED (source = INVITED).
HIRED ──either party "didn't happen"──► CANCELLED (no review allowed)
```
Transitions are defined in one table (`server/services/applications/transitions.ts`) and unit‑tested; any transition not listed is rejected with `409 INVALID_TRANSITION`.

**Report**: OPEN → ACTIONED | DISMISSED. **Invite**: PENDING → ACCEPTED | DECLINED | EXPIRED. **User**: ACTIVE ↔ SUSPENDED; ACTIVE/SUSPENDED → DELETED.

### 5.4 Indexes
- `User(phoneE164)` unique; `Session(tokenHash)` unique; `Session(userId)`.
- `OtpChallenge(phoneE164, createdAt)`.
- `Job(status, categoryId, localityId, publishedAt DESC)` (genderRequirement filtered in‑query; low cardinality, no separate index); `Job(employerProfileId, status)`; `Job(status, expiresAt)` for expiry; GIN on `Job.searchVector`.
- `WorkerProfile(isAvailable, localityId)`; `WorkerSkill(categoryId, workerProfileId)`; GIN on `WorkerProfile.searchVector`.
- `Application(jobId, status)`; `Application(workerProfileId, status)`; unique `(jobId, workerProfileId)`.
- `Notification(userId, readAt, createdAt DESC)`; `Report(status, createdAt)`; unique `Block(blockerUserId, blockedUserId)`; `OutboxMessage(status, createdAt)`.

Distance search: compute Haversine distance between locality centroids in SQL (≤150 localities → trivial cost), or precompute a `LocalityDistance` matrix (≈22k rows) at seed time. Choose precomputed matrix if query plans prove slow (D‑005).

### 5.5 Validation rules (Zod, enforced server‑side)
- Phone: `^[6-9]\d{9}$` after stripping `+91`/`0`/spaces.
- OTP: 6 digits.
- Names: 2–60 chars, letters (any script), spaces, `.'-`; trimmed; no digits/URLs.
- Job title 5–80 chars; description ≤ 1000; bio ≤ 300; note ≤ 200; review text ≤ 300.
- payAmount integer 1–10,00,000; payUnit ∈ {HOUR, DAY, WEEK, MONTH, FIXED}.
- genderRequirement ∈ {ANY, WOMEN_ONLY, MEN_ONLY}; worker gender ∈ {WOMAN, MAN, OTHER, PREFER_NOT_TO_SAY} or null. Eligibility: WOMEN_ONLY ⇒ WOMAN, MEN_ONLY ⇒ MAN (OTHER policy pending owner, D‑015).
- Description mentions of caste/religion/community/gender requirements are flagged for review (gender must use the structured field).
- openings 1–50; experienceYears 0–50; skills 1–5 active categories; locality must be active and in an active city.
- expiresAt ≤ 30 days from publish; startDate not in past (on create).
- Free text: strip control chars, reject HTML; detect phone numbers/URLs/"fee"/"deposit" keywords → flag (not block) jobs.
- Uploads: magic‑byte MIME check (JPEG/PNG/WebP), ≤ 5 MB, re‑encoded server‑side.

## 6. API boundaries (REST, JSON, `/api/v1`)

Errors: `{ error: { code, message, fields? } }` with codes `VALIDATION_ERROR (422)`, `UNAUTHENTICATED (401)`, `FORBIDDEN (403)`, `NOT_FOUND (404)`, `INVALID_TRANSITION (409)`, `CONFLICT (409)`, `RATE_LIMITED (429)`. Pagination: `?cursor=&limit=` → `{ items, nextCursor }`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/logout`, `GET /me`, `PATCH /me` (locale, activeMode), `DELETE /me` |
| Reference | `GET /localities?city=nagpur`, `GET /categories` |
| Worker | `PUT /me/worker-profile`, `GET /workers/:id`, `POST /me/worker-profile/photo`, `PATCH /me/worker-profile/availability` |
| Employer | `PUT /me/employer-profile`, `GET /employers/:id` |
| Jobs | `GET /jobs` (filters), `GET /jobs/:id`, `POST /jobs`, `PATCH /jobs/:id`, `POST /jobs/:id/{publish,pause,resume,close,renew}`, `GET /me/jobs` |
| Applications | `POST /jobs/:id/applications`, `GET /jobs/:id/applications` (employer), `GET /me/applications` (worker), `POST /applications/:id/transitions {to, offer?}`, `GET /applications/:id/contact` |
| Worker search | `GET /workers?category=&locality=&radiusKm=&sort=` |
| Invites | `POST /jobs/:id/invites {workerProfileId}`, `GET /me/invites`, `POST /invites/:id/{accept,decline}` |
| Reviews | `POST /applications/:id/reviews`, `GET /users/:id/reviews` |
| Safety | `POST /reports`, `POST /blocks`, `DELETE /blocks/:userId` |
| Notifications | `GET /me/notifications`, `POST /me/notifications/read` |
| Admin | `GET /admin/metrics`, `GET /admin/reports`, `POST /admin/reports/:id/resolve`, `GET /admin/users`, `POST /admin/users/:id/{suspend,unsuspend,verify}`, `POST /admin/jobs/:id/remove`, `POST /admin/reviews/:id/hide`, CRUD `/admin/categories`, `/admin/localities` |

RSC pages may call services directly (same process) for reads — they still pass the session actor so authorisation is identical to the API path.

## 7. Notifications
- Service functions write `Notification` rows (and optional `OutboxMessage` for SMS) inside the same transaction as the state change → no lost notifications.
- `jobs:tick` (cron every 1–5 min in production) sends pending outbox SMS with retry/backoff (max 5 attempts), expires jobs and invites, purges OTPs/sessions, scrubs deleted accounts after 30 days.
- SMS templates must be pre‑registered on DLT; template IDs in env config. SMS beyond OTP is behind `SMS_EVENTS_ENABLED`.
- Later: Web Push (VAPID), WhatsApp Business API.

## 8. Security
- Secrets only in environment variables; `.env.example` documents every variable; app fails fast on missing required config.
- Security headers: CSP (self + storage CDN), HSTS, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera only on upload screen).
- Rate limits: OTP request/verify, applications (≤ 30/day/worker), job posts, reports, search (per IP).
- Authorisation tests for every endpoint (positive and negative cases) — see `docs/TESTING.md`.
- PII handling: phone numbers excluded from logs (pino redact paths), IPs stored hashed with rotating salt, admin views of phone numbers audited.
- Dependency audit (`npm audit --omit=dev`) in CI; Dependabot/Renovate.
- Backups: provider daily backups + weekly logical dump to separate bucket; restore drill before pilot.

## 9. Environments

| Env | Purpose | Data | SMS | Storage |
|---|---|---|---|---|
| local | Development | Docker Postgres + demo seed | Console provider | Local disk |
| test/CI | Automated tests | Ephemeral Postgres, fixtures | Fake provider (captures messages) | In‑memory |
| staging | Demo + UAT | Seeded demo data, no real users | MSG91 test/limited | Bucket `ks-staging` |
| production | Nagpur pilot | Real users | MSG91 DLT | Bucket `ks-prod` |

**Local demo ≠ production.** A local demo needs only Docker + Node and uses fake SMS/storage. Production additionally requires: domain + TLS, DLT‑registered sender ID and templates, MSG91 account, managed Postgres with backups, object storage, error tracking, privacy policy & terms reviewed, admin accounts provisioned, monitoring/alerts, and a restore drill.

## 10. Observability
- pino JSON logs with request ID; log levels per env.
- Sentry (optional) for exceptions on server and client.
- Health endpoint `GET /api/health` (DB ping) for uptime monitoring.
- Product metrics computed from DB in admin dashboard (no third‑party analytics in MVP to keep privacy simple and payload small).

## 11. Known architectural trade‑offs
- Monolith on Next.js couples UI and API releases — acceptable at this scale; service layer keeps a future split cheap.
- Locality‑centroid distance is approximate (± 1–2 km) — acceptable for "nearby" in MVP.
- Postgres‑based rate limiting and outbox are fine for pilot volume; move to Redis/queue when > ~50 req/s.
- PWA cannot receive SMS‑based OTP auto‑fill on all devices; WebOTP covers Chrome Android.
