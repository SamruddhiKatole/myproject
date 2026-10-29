# KaamSetu — Product Requirements

> Status: **APPROVED** (v1.0, 2026-10-27 — owner approved with proposed defaults for Q1–Q10; see `docs/DECISIONS.md` D‑014)
> Owner: Product / Tech Lead. Changes to MVP scope must be recorded in `docs/DECISIONS.md`.

---

## 1. Problem

In Nagpur (and most Indian Tier‑2 cities), blue‑collar and household work is found mostly through
word of mouth, local contractors (*thekedars*), WhatsApp forwards and physical labour chowks.

- **Workers** (house help, cooks, cleaners, carpenters, plumbers, electricians, painters,
  construction helpers, shop helpers, drivers) cannot easily see what work is available near them,
  what it pays, or whether an employer is genuine. Many depend on middlemen who take a cut.
- **Employers** (households, small shops, vendors, contractors, small businesses) struggle to find
  nearby, available, reasonably trustworthy workers quickly, and have no record of past experience
  or reviews.
- Existing national job portals are oriented to white‑collar/English‑literate users, are heavy on
  low‑end phones, and do not model locality, daily wages or recurring household work well.

**KaamSetu** ("work bridge") is a hyperlocal, mobile‑first marketplace that lets workers discover
genuine nearby work and lets employers recruit locally, with privacy and safety built in.

## 2. Intended users and personas

| Persona | Description | Key needs | Constraints |
|---|---|---|---|
| **Sunita — house help** (35, Wardhaman Nagar) | Works in 3 homes, wants 1–2 more slots nearby | Jobs within walking/bus distance, clear timing & monthly pay, safe employers | Low literacy, Marathi/Hindi, shared ₹7k Android phone, prepaid data |
| **Ramesh — carpenter / plumber** (42, Itwari) | Independent tradesman, gets work by referral | Steady gigs, show skills & past work, avoid unpaid jobs | Hindi, WhatsApp‑fluent, little patience for long forms |
| **Akash — construction helper** (22, migrant) | Daily‑wage work, changes sites often | Daily‑wage jobs posted today/tomorrow, same‑day pay info | Very price sensitive on data, may change phone numbers |
| **Meera — household employer** (45, Dharampeth) | Needs a cook and a part‑time cleaner | Find nearby verified workers, see experience/reviews, contact safely | Concerned about safety and privacy |
| **Patil — small contractor** (50) | Needs 5 painters for 2 weeks | Post one job for many workers, shortlist fast, manage hires | Busy; uses phone only |
| **Shop owner / vendor** | Needs shop helper / delivery helper | Full‑time local hire, simple process | — |
| **Admin / moderator** (KaamSetu team) | Keeps the marketplace safe | Review reports, suspend abusers, verify users, remove fake jobs | Needs desktop‑friendly dashboard |

## 3. Core user journeys

1. **Worker onboarding** – open link → choose language → enter mobile → OTP → choose "I want work"
   → name, locality, skills, experience, expected pay, availability → (optional photo) → done.
   Target: < 3 minutes, < 8 inputs.
2. **Worker finds and applies** – home shows nearby open jobs matching skills → filter by
   category/locality/pay type → open job → "Apply" (optional one‑line note) → sees status.
3. **Employer onboarding** – mobile + OTP → "I want to hire" → type (household / contractor /
   shop / business) → name, locality → done.
4. **Employer posts a job** – category → title (suggested) → pay (₹ amount + per hour/day/month/
   fixed) → schedule (one‑time / daily‑wage / part‑time recurring / full‑time) → locality →
   number of openings → description → publish.
5. **Employer reviews applicants** – applicant list with skills, experience, locality, rating →
   shortlist / reject → **contact details revealed only to shortlisted pairs** → offer → worker
   accepts → hired → job auto‑closes when openings filled.
6. **Employer discovers workers** – search workers by skill + locality → view public profile
   (no phone number) → "Invite to apply" to one of their open jobs.
7. **After the work** – either side marks the engagement complete → both may leave a 1–5 rating and
   short review (only for real hires).
8. **Trust & safety** – any user can report a job/profile/user, or block a user. Admin reviews
   reports, hides content, suspends accounts, and marks verification status.

## 4. Scope: MVP vs later phases

### MVP (Release 1 — Nagpur pilot)

| Area | Included |
|---|---|
| Accounts | Phone + OTP login; one account may hold a worker profile, an employer profile, or both; language preference |
| Worker profile | Name, photo (optional), locality, skills (from fixed category list), years of experience, expected pay, availability, languages spoken, short bio, availability toggle ("looking for work") |
| Employer profile | Name, employer type, locality, optional business name |
| Jobs | Create / edit / pause / close; category, pay in ₹ with pay unit, job type, schedule, locality, openings, description, expiry (default 14 days) |
| Discovery | Workers: browse/filter open jobs by locality, distance band, category, job type, pay. Employers: search available workers by skill + locality |
| Applications | Apply, withdraw, shortlist, reject, offer, accept/decline offer, hire, mark complete; status history |
| Contact privacy | Phone number hidden until employer shortlists the applicant (or worker accepts an invite); masked everywhere else |
| Notifications | In‑app notification centre; SMS only for OTP and (if budget allows) "you were shortlisted/hired" |
| Reviews | Post‑hire mutual 1–5 star + short text, one per side per hire |
| Trust & safety | Report (job/user/review), block user, admin moderation queue, suspend/unsuspend, hide job, verification badge (phone‑verified automatically; "KaamSetu‑verified" set manually by admin after offline check) |
| Admin dashboard | Users, jobs, reports, basic metrics (signups, jobs posted, applications, hires) |
| Localisation | English + Hindi + Marathi UI strings (i18n infra from day one; full translations before pilot) |
| Platform | Mobile‑first responsive web app, installable PWA; works on Android Chrome 90+ |

### Later phases (explicitly NOT in MVP)

- Native Android app / Play Store listing (revisit after pilot; PWA → TWA is a cheap path).
- In‑app chat (MVP uses revealed phone/WhatsApp link after shortlist).
- WhatsApp Business notifications / WhatsApp onboarding bot.
- Payments, wallets, escrow, subscriptions, paid job boosts.
- Aadhaar / DigiLocker / police verification integrations.
- Voice‑based profile creation, IVR for feature phones.
- Map view, GPS live location, route‑based distance.
- AI matching/recommendations beyond simple filters and sort.
- Multi‑city support in UI (data model is city‑aware from day one, UI shows Nagpur only).
- Agencies / contractor team management, attendance and wage tracking.
- Referral programme.

## 5. Functional requirements

IDs are referenced by the roadmap and tests.

**Auth & accounts**
- FR‑A1 Users register/sign in with an Indian mobile number (+91, 10 digits, starts 6–9) and a 6‑digit OTP.
- FR‑A2 OTP expires in 5 minutes, max 5 verify attempts per challenge, max 3 OTP sends per number per 15 min and 10 per day; per‑IP limits.
- FR‑A3 Sessions are server‑side, HTTP‑only secure cookies, 30‑day rolling expiry; logout invalidates the session.
- FR‑A4 A user can create a worker profile, an employer profile, or both, and switch active mode.
- FR‑A5 Users can choose UI language (en / hi / mr); persisted to account.
- FR‑A6 Users can delete their account (soft‑delete + PII scrub after retention window).

**Worker profile**
- FR‑W1 Create/edit profile with fields in §4; skills from admin‑managed category list (1–5 skills).
- FR‑W2 Toggle "available for work"; unavailable workers are hidden from employer search.
- FR‑W3 Optional profile photo (JPEG/PNG/WebP, ≤ 5 MB, server‑resized to ≤ 512px, EXIF stripped).
- FR‑W4 Public profile never shows phone number, exact address, age/DOB, or gender.
- FR‑W5 Optional self‑declared gender (Woman / Man / Other / Prefer not to say), editable any time, used only for restricted‑job eligibility (D‑015).

**Employer profile**
- FR‑E1 Create/edit profile: display name, employer type (household/contractor/shop/business/other), locality, optional business name.

**Jobs**
- FR‑J1 Employer creates a job with: category, title, description (≤ 1000 chars), pay amount (₹, integer, ≥ 1), pay unit (hour/day/week/month/fixed), job type (one‑time / daily‑wage / part‑time recurring / full‑time), schedule text (e.g., "Mon–Sat 7–9 am"), start date, locality, openings (1–50), expiry date, gender requirement (Any / Women only / Men only; default Any — D‑015).
- FR‑J2 Job statuses: DRAFT → OPEN → (PAUSED ↔ OPEN) → FILLED / CLOSED / EXPIRED; REMOVED (admin only).
- FR‑J3 Only OPEN jobs are visible in discovery. Expired jobs are auto‑transitioned daily.
- FR‑J4 New employers are limited to 3 open jobs and 5 job posts/day until verified (anti‑spam).
- FR‑J5 Pay below a configurable floor per pay unit (e.g. < ₹100/day) triggers a warning and admin review flag (not blocked).

**Discovery & search**
- FR‑S1 Workers browse OPEN jobs, default sorted by distance from their locality then recency.
- FR‑S2 Filters: category, job type, pay unit & min pay, locality / distance band (≤2 km, ≤5 km, ≤10 km, city‑wide), posted within, "open to me" (hides jobs whose gender requirement the worker doesn't meet).
- FR‑S3 Employers search available workers by skill + locality / distance band, sort by distance, rating, experience.
- FR‑S4 Text search on job title/description and worker bio (simple full‑text; Hindi/Marathi transliteration not required in MVP).
- FR‑S5 Lists are paginated (cursor‑based, 20 per page).

**Applications & hiring**
- FR‑H1 A worker can apply once per job (optional note ≤ 200 chars); cannot apply to own job, closed jobs, or if blocked by/blocking employer; for a Women only / Men only job the worker's declared gender must match (D‑015).
- FR‑H2 Application statuses and transitions per `docs/ARCHITECTURE.md §5.3`.
- FR‑H3 Employer can invite an available worker to apply to an OPEN job; worker accepts (→ application) or ignores.
- FR‑H4 Contact reveal: phone numbers become mutually visible when application is SHORTLISTED or later (not REJECTED/WITHDRAWN). Every reveal is logged.
- FR‑H5 When hired count reaches openings, job becomes FILLED and remaining APPLIED/SHORTLISTED applications are auto‑closed with a polite notice.
- FR‑H6 Every status change is recorded in an application event history.

**Reviews**
- FR‑R1 Only parties of a HIRED application that is marked COMPLETED (or 3 days after start date) may review each other, once each.
- FR‑R2 Rating 1–5 + optional text ≤ 300 chars; reviews can be reported and hidden by admin.
- FR‑R3 Profile shows average rating and count (only after ≥ 1 review).

**Notifications**
- FR‑N1 In‑app notifications for: new application, shortlisted, rejected, offer, hired, invite, job expiring, review received, moderation actions.
- FR‑N2 Unread badge; mark read; list paginated.
- FR‑N3 SMS for OTP (required) and optionally for shortlist/offer/hire (config flag, DLT templates).

**Trust & safety / admin**
- FR‑T1 Report a job, user or review with reason (fake job, fraud/asks for money, harassment, abusive language, wrong info, other) + optional text.
- FR‑T2 Block a user: hides each from the other's discovery, prevents applications/invites.
- FR‑T3 Admin: view moderation queue, resolve reports, hide/remove jobs and reviews, suspend/unsuspend users, set verification status, manage categories & localities, view metrics.
- FR‑T4 All admin actions are audit‑logged (who, what, when, reason).
- FR‑T5 Persistent safety tips shown to workers: "Never pay money to get a job".

## 6. Non‑functional requirements

| ID | Requirement |
|---|---|
| NFR‑1 Performance | First load of job list ≤ 3 s on emulated "Slow 4G" + mid‑range Android (Moto G class); JS shipped to first route ≤ 170 KB gzip; Lighthouse mobile performance ≥ 80 |
| NFR‑2 Data efficiency | Images lazy‑loaded, resized server‑side, WebP; list pages ≤ 100 KB transfer after first visit |
| NFR‑3 Resilience | Offline app shell; graceful retry on flaky networks; form inputs preserved on failure |
| NFR‑4 Availability | Pilot target 99% monthly; daily DB backups, point‑in‑time restore where provider allows |
| NFR‑5 Security | OWASP ASVS L1 baseline; server‑side authorisation on every endpoint; rate limiting; CSRF protection; secure headers; secrets via env only |
| NFR‑6 Privacy | Compliance with India's DPDP Act 2023 principles: consent notice, purpose limitation, data minimisation, deletion rights, data stored in India region |
| NFR‑7 Accessibility | WCAG 2.1 AA target; tap targets ≥ 44px; icons + text labels; font ≥ 16px; high contrast; works with TalkBack |
| NFR‑8 Localisation | All user‑facing strings externalised; Devanagari fonts render correctly; numbers/currency formatted `en-IN` (₹1,25,000) |
| NFR‑9 Observability | Structured logs without PII, error tracking, basic product metrics |
| NFR‑10 Maintainability | TypeScript strict, lint + format, tests in CI, migrations versioned |
| NFR‑11 Browser support | Android Chrome ≥ 90, Samsung Internet, recent desktop browsers; iOS Safari best‑effort |

## 7. Trust, safety, privacy and accessibility requirements

- **No discriminatory filters**: jobs may not specify caste, religion, or community. **Gender requirement** (D‑015): jobs may be marked Women only / Men only from a fixed list. A worker's gender is optional, self‑declared, never shown on the public profile, and used only for eligibility. Restricted jobs stay visible to everyone with a badge. Requirement text in descriptions is moderated.
- **Money‑for‑job scams**: job descriptions containing phone numbers, URLs, "registration fee", "deposit" etc. are auto‑flagged for admin review; workers see a permanent "never pay to get a job" notice.
- **Contact masking** until shortlist (FR‑H4); reveals logged; no bulk export of phone numbers.
- **Minors**: users must self‑declare 18+; child labour is prohibited and reportable.
- **Location privacy**: only locality (neighbourhood) is stored and shown — never exact address or live GPS.
- **Data minimisation**: no Aadhaar/PAN numbers collected in MVP; no DOB (only 18+ checkbox).
- **Consent**: clear, short privacy notice in all three languages at signup; consent version stored.
- **Deletion**: account deletion removes profile from discovery immediately; PII scrubbed within 30 days except records legally required (audit/report logs kept pseudonymised).
- **Admin access**: least privilege; admin accounts require separate role; all access audited.
- **Accessibility**: simple language (Grade 5 reading level), iconography for categories, minimal typing (pickers/chips over free text), voice‑input friendly text fields (native keyboard mic).

## 8. Assumptions

1. Target users have Android smartphones with a browser and intermittent 4G; a household member can help with first signup if needed.
2. Phone number is an acceptable primary identity; OTP via SMS is affordable at pilot scale.
3. Nagpur pilot scale: ≤ 5,000 users, ≤ 2,000 jobs, ≤ 50 concurrent users in first 3 months.
4. Initial supply will be seeded via offline outreach (labour chowks, self‑help groups, NGOs, RWAs).
5. MVP is free for both sides; monetisation is out of scope until product‑market fit.
6. A small team (1–3 developers) builds and operates it; managed services are preferred over self‑hosting.
7. The KaamSetu team can perform manual verification offline for "verified" badges.

## 9. Open questions (need product owner decision)

Q1–Q10 resolved 2026-10-27 with the proposed defaults — see `docs/DECISIONS.md` D‑014. Notable: one number may hold both profiles; contact revealed at SHORTLISTED; worker must accept an offer before HIRED. Q6 was later reversed by D‑015: jobs may require Women only / Men only. Still open (non‑blocking, before P8): whether workers who declare `OTHER` may apply to restricted jobs.

## 10. Product risks

| Risk | Impact | Mitigation |
|---|---|---|
| Cold start (no jobs → no workers → no jobs) | High | Launch in 3–5 localities only; field team seeds jobs from RWAs/contractors; concierge onboarding |
| Low digital literacy among workers | High | Minimal forms, icons, local language, assisted onboarding, WhatsApp share links |
| Fraudulent jobs / money scams | High | Auto‑flag rules, reports, limits on unverified employers, safety copy |
| Harassment / safety incidents for household workers | High | Contact masking, blocking, reporting, verification badge, safety guidance, incident escalation process |
| SMS DLT registration delays (TRAI rules) | Medium | Start DLT registration in parallel with Phase 1; dev uses console OTP |
| Disintermediation after first contact | Medium | Accept in MVP; value is in discovery + reputation |
| Legal/regulatory (DPDP, labour laws) | Medium | Privacy‑by‑design, legal review before public launch |
| Low engagement after first job | Medium | Availability toggle, recurring household jobs, reviews |

## 11. Success criteria for Release 1 (Nagpur pilot, first 8–12 weeks)

Validation, not vanity metrics:

- ≥ 500 worker profiles and ≥ 100 employers onboarded in pilot localities.
- ≥ 150 jobs posted; ≥ 60% of jobs receive ≥ 1 application within 48 h.
- ≥ 50 confirmed hires (HIRED status, confirmed by follow‑up call sample).
- Median time from job post to first shortlist ≤ 24 h.
- Worker onboarding completion rate ≥ 70% of OTP‑verified users.
- Zero unresolved high‑severity safety reports older than 24 h.
- Qualitative: ≥ 10 worker and 10 employer interviews indicating they would use it again.

## 12. User experience specification

### 12.1 Principles
- One primary action per screen; large buttons with icon + text.
- Pickers, chips and steppers instead of free text wherever possible.
- Every category has an icon (broom, cooking pot, hammer, wrench, plug, paint roller, brick…).
- Pay always shown as "₹500 / day" style, formatted `en-IN`.
- Language switcher available before login and in the menu.
- Never a dead end: every empty/error state offers a next step.

### 12.2 Navigation
Bottom tab bar (mobile), mode‑dependent:

| Worker mode | Employer mode | Admin (desktop‑first) |
|---|---|---|
| Jobs (home) | My jobs (home) | Dashboard metrics |
| My applications | Find workers | Reports queue |
| Notifications | Notifications | Users |
| Profile | Profile | Jobs |
| | | Categories & localities |

A mode switch ("Find work" ↔ "Hire") appears in Profile for users with both profiles.

### 12.3 Screen inventory
| # | Screen | Notes |
|---|---|---|
| S1 | Language select + welcome | Shown on first visit; 3 big buttons (मराठी / हिंदी / English) |
| S2 | Phone entry | +91 prefix fixed, numeric keypad, consent checkbox + privacy link |
| S3 | OTP entry | 6 boxes, auto‑read where browser supports WebOTP, resend timer 30 s |
| S4 | Choose intent | "I want work" / "I want to hire" |
| S5 | Worker onboarding (3 steps) | 1) name + locality 2) skills chips + experience 3) pay expectation + availability; photo optional at end |
| S6 | Employer onboarding (1 step) | type, name, locality |
| S7 | Job feed (worker home) | Cards: icon, title, ₹ pay/unit, locality + distance, job type, posted time; filter sheet |
| S8 | Job detail | Pay, schedule, locality, employer name + verified badge + rating, Apply button, Report link, safety notice |
| S9 | My applications | Tabs: Active / Past; status chips; contact button once shortlisted |
| S10 | Worker profile (own / public) | Public view hides phone |
| S11 | Employer home: My jobs | Status filter, applicant counts, "Post job" button |
| S12 | Post/edit job wizard | Steps: category → pay & type → schedule & locality → description & openings → preview |
| S13 | Applicants list | Per job; shortlist / reject quick actions |
| S14 | Applicant detail | Profile + history; Offer / Hire actions; call/WhatsApp after shortlist |
| S15 | Find workers | Skill + locality filters, cards, "Invite to job" |
| S16 | Notifications | Grouped by day |
| S17 | Review form | Stars + optional text |
| S18 | Report / block sheet | Reason list + optional text |
| S19 | Settings | Language, mode switch, logout, delete account, privacy policy |
| A1–A5 | Admin screens | Metrics, reports queue, user detail (suspend/verify), job moderation, taxonomy |

### 12.4 States (each list/detail screen must implement)
- **Loading**: skeleton cards (no full‑page blocking spinners); keep previous data during refresh.
- **Empty**: illustration + message + action (e.g., "No jobs within 2 km — try 5 km" / "Post your first job").
- **Error**: friendly message in the user's language, "Try again" button; offline banner when the device is offline; never show stack traces.
- **Success**: toast + clear next step (e.g., after applying: "Applied! The employer will see your profile. We'll notify you.").
- **Form validation**: inline, per field, in the user's language; inputs preserved across failed submits.

### 12.5 Localisation
- Languages: English (`en`), Hindi (`hi`), Marathi (`mr`). Default from browser `Accept-Language`, else language choice screen with Marathi first.
- All strings in message catalogues (ICU format) — no hardcoded UI text; CI check for missing keys.
- Category and locality names stored with per‑language labels in DB.
- User‑generated text (job descriptions, bios) is shown as written; no machine translation in MVP.
- Fonts: system fonts + Noto Sans Devanagari fallback (subset, `font-display: swap`).
- Translations reviewed by native speakers before pilot (external dependency).
