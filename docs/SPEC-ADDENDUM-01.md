# LEAD Platform — Addendum 01: Look and feel, Admin and Pricing

**Applies to:** `docs/SPEC.md` (v0.2) · **Prepared:** 13 October 2026 · **Status:** Phase 1 (clickable prototype with a working mock admin)
**Reference behaviour:** the **Admin & pricing (mock)** tab in `LEAD_Platform_Model_Explorer.html`. Port its logic; it is the working example of sections A5–A9.

---

## A0. How to use this file
1. Save as `docs/SPEC-ADDENDUM-01.md` next to `docs/SPEC.md`.
2. Where this addendum conflicts with `SPEC.md`, **this addendum wins**.
3. Read A1 first. It lists every change to the main spec.
4. Build order is in A16 (milestones M7–M9). Do not start them before M0–M2 are done.

---

## A1. What changes in SPEC.md

| # | Change | Where |
|---|---|---|
| 1 | Eighth role: **UMO admin (mock)**. Only this role can write prices, plans and coupons | Section 5, section 9 |
| 2 | “Payments, billing, invoicing” stays out of scope for **real** money. A **mock checkout** is in scope (nothing is charged) | Section 2.4 |
| 3 | Real sign-in stays out of scope. The role switcher gains an “Acting as Admin A / Admin B” toggle for two-person approval | Section 9 |
| 4 | New features F-PR-01 to F-PR-18 | A14 |
| 5 | New rules R9–R17 | A13 |
| 6 | New tables | A12 |
| 7 | New routes: `/admin/*` and `/join/*` | A11, A10 |
| 8 | New scenarios S11–S20 | A15 |
| 9 | New milestones M7–M9; demo script gains three steps | A16 |
| 10 | Look and feel now draws on three named sources | A2 |
| 11 | New brand and copy rules in CLAUDE.md | A2.6 |

---

## A2. Look, feel and interaction: what to reuse, from where

### A2.1 Three sources, in this order of priority

| Priority | Source | What to take |
|---|---|---|
| 1 | **LEAD’s own identity** (the Participant Playbook and the four boards from 26 Sep) | The visual language already designed for LEAD |
| 2 | **umo.design** and **umodesign.school** | Structure, tone, calls to action, ecosystem |
| 3 | **ixdf.org** | Learning, sign-up, membership and billing interaction patterns |

If sources conflict, follow the order above.

### A2.2 LEAD’s own identity (take first)
From the Playbook and boards:
- Large numbered headings (“01 LEARN”, “02 EDUCATE”) with a pixel-style display face for numerals. Use for the eight stages.
- Small monospaced caps for labels, eyebrows and table headers (already in the type system: Roboto Mono).
- Pastel gradient fields (soft blue, pink, coral) behind hero and section bands. Keep them light; text stays high-contrast.
- Halftone dot clusters in corners (red and blue) as a quiet decorative device. Never behind text.
- Small black pixel squares as a bullet and divider motif.
- The two-logo header: UMO large, UXINDIA smaller (see SPEC section 16.1).

### A2.3 umo.design and umodesign.school (what was read, what to reuse)

**Read on 13 Oct 2026.** I could read their published text and structure. I could **not** view their rendered visuals, so fonts, exact colours and spacing are **not** confirmed. Do a visual audit before locking tokens (A2.7).

What the sites show:
- **UMO Design Foundation** is a non-profit. Mission line: “Good design for a better living.” Public contact: team@umo.design.
- **Top navigation:** Initiatives · Jobs · Community. Initiatives include UMO Design Grads, Design School, Design X Social, Moving Stories, UXI Conf, WiDesign Fest, UMO Unites. Community includes The Story, Partners, Speakers, **UMO Mentors & Catalysts**, Get Involved.
- **A six-part framework, “UMO.Design initiatives framework”:** EXPLORE · EXPRESS · EXPERIENCE · EXPERTISE · EXECUTE · EXCEL. Each has one short line and one short action button.
- **Page pattern:** large plain headline, one short paragraph, illustrated card, one imperative button (Participate, Register, Apply, Join, Support, Post). Four closing cards: Volunteer, Become a Mentor, Partner with Us, Find a Job. Mailing-list form. Footer with Initiatives, Support, Connect.
- **UMO Design School** (a hosted storefront) leads with one word, **“EXCEL”**, and “Your Career In Design”. It sells a Design Literacy Program, a 24-week UX certification (UMO Design Grads), workshops and masterclasses. It offers a free one-to-one mentoring call, **scholarships for developing nations and the economically challenged**, and **“Give a gift of Design”**, where a purchase is matched 1:1 to fund a learner. Certificate rule: pass at 80%.

**Reuse:**
1. One-word headline plus one line on top of every major page.
2. The nav shape: **Learn · Challenges · Community · Opportunities** and a primary **Join** button (the UMO “Initiatives · Jobs · Community” shape, adapted).
3. Imperative, one-word buttons: Join, Post, Apply, Book, Share, Verify.
4. Illustrated cards as the main building block on public pages.
5. The footer pattern: Initiatives · Support · Connect, plus the mission line.
6. The six-part framework as an **optional vocabulary tag** on each loop stage (proposal; UMO to approve):

| LEAD stage | UMO word |
|---|---|
| Lexicon and open tier | EXPLORE |
| IDENTIFY | EXPRESS |
| CONNECT | EXPERIENCE |
| MENTOR | EXPERTISE |
| APPLY, SOLVE | EXECUTE |
| LEARN, VALIDATE, GET OPPORTUNITY | EXCEL |

**Do not duplicate what UMO already runs. Connect to it.**

| UMO already has | LEAD should |
|---|---|
| UMO Design School (courses, certification, scholarships, gift matching) | Link to it for course content. Decide whether LEAD Paths are sold inside LEAD or through the School (A17 #1). Reuse its scholarship and gift-match ideas as reserved coupon kinds |
| UMO Mentors & Catalysts | Seed the mentor pool from it (with each person’s consent) |
| UXIN jobs (uxin.co) | Link out for general jobs. Keep LEAD’s Opportunity Board for evidence-backed roles only |
| UMO Design Grads (24-week programme) | Treat as a related path, not a competitor |

### A2.4 ixdf.org: interaction patterns to copy (patterns only)

**Read on 13 Oct 2026** (FAQ, about, member pages).

| IxDF pattern | LEAD use | Where in this addendum |
|---|---|---|
| Persistent promo banner above the nav (for example “3 Months Free”) | **Announcement banner**, set by the admin | A11, F-PR-12 |
| “Start Today” as the single primary call to action, going straight to plan choice, then checkout | **Join** button, five short flows | A10 |
| Fees listed as monthly equivalents so plans compare | Show a **per-month equivalent** beside annual prices | A10 |
| “XX% booked” on each course, and “Course closed, re-opens in a few weeks” | **Availability meter** on campus slots, cohorts, challenge slots | A9, A10 |
| Student verification form (school, expected graduation date, document upload) | **Eligibility check** for student coupons. Reserved (P2) | A7.5 |
| Company Membership: minimum 2 members; roles Learner, Supervisor, Coordinator; a Coordinator is admin-only and uses no seat; a dashboard shows seats used and completions, but supervisors cannot read individual answers | Seat model for Industry and Institution memberships. **Same privacy rule as R3 and R4** | A10.2 |
| Instant access email a few seconds after payment | **Confirmation screen plus email preview** after mock sign-up | A10 |
| Billing tab: invoices, change plan, upgrade, cancel | **My billing** page (mock). P2 | A14 |
| Refer-a-Friend and Educational Partner codes (a link code, first-click credit, long cookie) | **Partner codes**. Reserved (P2) | A7.5 |
| 14-day money-back window | A **refund window** field on each plan. Policy decision | A17 #4 |
| Career Programs: a path of foundation, then core courses, plus suggested extras | **Path bundles** with a bundle price. Reserved (P2) | A6 |
| Course catalogue, FAQ with topic anchors, A–Z topic library | Catalogue, FAQ, Lexicon A–Z | SPEC 10 |
| Cookie and privacy settings panel | **Consent manager** (F-GV-01) | SPEC 6 |

### A2.5 What not to copy
- IxDF’s logo, wordmark, photos, certificate designs, course titles, page copy, or promotion text.
- IxDF’s colour scheme. Use LEAD’s own tokens.
- Any wording from the UMO Design School’s claims (for example job guarantees). LEAD makes no such promise.
- UMO’s illustrations unless UMO supplies the files.

### A2.6 Rules to add to CLAUDE.md
```markdown
## Brand and reuse
- Order of priority for look and feel: LEAD identity, then umo.design and umodesign.school, then ixdf.org patterns.
- Copy IxDF interaction patterns only. Never copy its logo, text, images, certificate design or colours.
- Do not duplicate UMO Design School, UMO Mentors & Catalysts or UXIN. Link to them.
- Every priced screen says: "Mock pricing. Not an offer." Nothing is charged.
- Prices, plans and coupons are data in the database, never hard-coded in screens.
```

### A2.7 Visual audit to do first (30 minutes, in Claude Code)
Open umo.design, umodesign.school and ixdf.org in a browser. Record: fonts, colours, spacing, button shapes, card styles, motion. Save as `docs/reference/visual-audit.md`. If it conflicts with SPEC section 16.2 tokens, UMO’s measured values win for brand colours and type; keep our token names.

---

## A3. Admin and pricing module: purpose and principles

**Purpose.** A mock admin sets prices for every thing that can be joined or bought, and creates discount coupons by name and percentage. Changes show **immediately** in every sign-up flow. Sign-up records store the plan, price version and coupon as **enumerated values**, never free text.

**Principles**
1. **Data, not code.** Prices, plans and coupons live in tables. Screens read them.
2. **Enumerated, not typed.** Every sign-up stores keys from a registry (A4), validated on write.
3. **Live.** An admin change reaches open sign-up screens within seconds (A9).
4. **Safe.** Price history is kept. Big discounts need a second person. Everything is logged.
5. **Mock.** No money moves. The checkout produces a record and a preview email.

---

## A4. Enumerations

### A4.1 Two kinds

**Fixed in code** (change only with a code release). Define once in `src/lib/enums.ts` and use everywhere.

| Enum | Values |
|---|---|
| `PlanKind` | `CAMPUS_LICENCE` · `INDUSTRY_MEMBERSHIP` · `PATH_ENROLMENT` · `CHALLENGE_SPONSORSHIP` · `OPEN_TIER` |
| `PricingModel` | `FLAT` · `TIERED_BY_SIZE` · `PER_SEAT` · `PER_COHORT` · `PER_CHALLENGE` · `FREE` |
| `BillingPeriod` | `ONE_TIME` · `TERM` · `ANNUAL` |
| `SignupFlow` | `COLLEGE_ONBOARDING` · `INDUSTRY_PARTNERSHIP` · `PATH_ENROLMENT` · `CHALLENGE_SPONSORSHIP` · `OPEN_JOIN` |
| `SignupStatus` | `QUOTED` · `CONFIRMED_MOCK` · `CANCELLED` |
| `CouponStatus` | `DRAFT` · `PENDING_APPROVAL` · `ACTIVE` · `PAUSED` · `EXPIRED` · `EXHAUSTED` · `ARCHIVED` |
| `CouponKind` | `PERCENT` (built) · `FIXED_AMOUNT`, `SCHOLARSHIP`, `GIFT_MATCH`, `PARTNER_CODE` (reserved, not built) |
| `TierKey` | `SMALL` · `MEDIUM` · `LARGE` |

**Managed at run time** (created by the admin, no release needed). Stored as rows; the **registry** is the table plus its unique key.

| Registry | Key format | Examples |
|---|---|---|
| `plan_key` | `UPPER_SNAKE`, 3–40 chars, unique | `CAMPUS_STANDARD`, `INDUSTRY_TEAM`, `PATH_FRAMING`, `SPONSOR_SINGLE`, `OPEN_FREE` |
| `coupon_code` | `A–Z 0–9 - _`, 4–20 chars, unique, case-insensitive | `FOUNDING20`, `PILOT50`, `STUDENT10` |

### A4.2 How run-time values behave as enumerations
1. **One endpoint lists the current valid values:** `GET /api/enums` returns `{ plan_keys: [...], coupon_codes: [...] }` (only ACTIVE for sale; ARCHIVED listed separately).
2. **Every write validates against the live list.** Build the Zod schema per request: `z.enum(planKeys)`. Unknown values are rejected with a plain message.
3. **Dropdowns read the endpoint.** Sign-up screens never hard-code plan names.
4. **Types for developer comfort.** `npm run gen:enums` writes `src/generated/enums.d.ts` with the current keys as a TypeScript union. The database remains the authority.
5. **Immutability.** A key used by any sign-up cannot be renamed or deleted. It can be **ARCHIVED** (hidden from sale, kept in history). Rule R13.

### A4.3 What a sign-up stores (all enumerated)
`flow` (SignupFlow) · `plan_key` · `plan_kind` · `pricing_model` · `billing_period` · `tier_key` (if tiered) · `price_version_id` · `coupon_code` (nullable) · `status`. Plus numbers in paise: `list_total`, `discount`, `tax`, `total`.

---

## A5. Pricing models

All money is stored as **integer paise** (₹1 = 100 paise). Currency is INR in Phase 1. Display with Indian digit grouping (`Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`), for example ₹5,00,000.

| Model | Inputs | List price formula | Used for |
|---|---|---|---|
| `FLAT` | none | `price` | A fixed package |
| `TIERED_BY_SIZE` | organisation size | `price` of the tier whose `[min_size, max_size]` contains the size | Campus licence |
| `PER_SEAT` | seats or learners | `price × quantity` (quantity ≥ `min_qty`) | Industry membership, path enrolment |
| `PER_COHORT` | cohorts | `price × cohorts` | Campus add-on, path cohorts |
| `PER_CHALLENGE` | challenges | `price × challenges` | Challenge sponsorship |
| `FREE` | none | `0` | Open tier |

**Per-month equivalent:** for `ANNUAL` plans, show `list ÷ 12` beside the price (the IxDF way of comparing plans).

---

## A6. Plan catalogue and seed values

The only **sourced** figure is the campus band **₹5–15 lakh a year** (Madhukar Joshi’s note, 12 Oct 2026). Everything else below is a **demo value** so the screens work. The admin changes any of it. Every seeded price is flagged `is_demo = true` and shows “Demo price” in the admin.

| `plan_key` | Kind | Model | Period | Seed price | Min qty | Capacity (for “% booked”) |
|---|---|---|---|---|---|---|
| `CAMPUS_STANDARD` | CAMPUS_LICENCE | TIERED_BY_SIZE | ANNUAL | SMALL ₹5,00,000 · MEDIUM ₹10,00,000 · LARGE ₹15,00,000 (tier size limits are placeholders: up to 1,000 · 1,001–3,000 · 3,001+) | 1 | 10 campuses (pilot) |
| `INDUSTRY_TEAM` | INDUSTRY_MEMBERSHIP | PER_SEAT | ANNUAL | ₹40,000 per seat | 2 | 30 seats |
| `PATH_FRAMING` | PATH_ENROLMENT | PER_SEAT (per learner) | TERM | ₹12,000 per learner | 1 | 40 learners |
| `PATH_DECISIONS` | PATH_ENROLMENT | PER_SEAT (per learner) | TERM | ₹12,000 per learner | 1 | 40 learners |
| `SPONSOR_SINGLE` | CHALLENGE_SPONSORSHIP | PER_CHALLENGE | ONE_TIME | ₹2,50,000 per challenge | 1 | 6 challenges |
| `OPEN_FREE` | OPEN_TIER | FREE | ONE_TIME | ₹0 | 1 | none |

> Note: `PER_SEAT` means “per seat or per learner”. The quantity is seats for industry plans and learners for path plans.

**Reserved, not built:** path bundles (a Career-Program style bundle price), campus add-ons (extra cohorts), scholarship and gift-match plans.

**An unpriced plan cannot be sold** (rule R17). A new plan starts with no price and cannot be quoted until the admin sets one.

---

## A7. Coupons

### A7.1 Fields

| Field | Rule |
|---|---|
| `code` | The coupon’s **name**. 4–20 chars, `A–Z 0–9 - _`, unique ignoring case. Shown in capitals |
| `percent_off` | Integer 1–100 |
| `applies_to` | `ALL`, or a list of `PlanKind` values, or a list of `plan_key` values |
| `min_qty` | Optional. Seats, learners or cohorts |
| `valid_from`, `valid_until` | Optional dates |
| `max_redemptions` | Total across everyone. Blank means no limit |
| `max_per_org` | Default 1 |
| `status` | `CouponStatus` |
| `funded_by` | `UMO`, `SPONSOR`, `PARTNER` (for reporting) |
| `note` | Why this coupon exists |
| `created_by`, `approved_by` | Admin A, Admin B (mock) |

### A7.2 Lifecycle
`DRAFT → ACTIVE` when `percent_off` is at or below the approval threshold.
`DRAFT → PENDING_APPROVAL → ACTIVE` when above the threshold (R11).
`ACTIVE ↔ PAUSED` at any time.
`ACTIVE → EXPIRED` when `valid_until` passes. `ACTIVE → EXHAUSTED` when redemptions reach the cap.
`ANY → ARCHIVED` (kept for history).

### A7.3 Validation (run at quote **and** again at confirm)
A coupon is valid only if **all** hold:
1. The code exists (ignore case and surrounding spaces).
2. Status is `ACTIVE`.
3. Now is inside `[valid_from, valid_until]`.
4. Total redemptions are below `max_redemptions`.
5. This organisation’s redemptions are below `max_per_org`.
6. It applies to the plan (by kind or key).
7. Quantity meets `min_qty`.
8. It is the only coupon on this sign-up (no stacking).

Return **one plain reason** on failure, for example: “Code not found.” “Expired on 31 Dec 2026.” “Valid for campus licences only.” “All redemptions used.” “Already used by your organisation.” “Waiting for a second approval.”

### A7.4 Seed coupons (demo)

| Code | % | Applies to | Max redemptions | Valid until | Status |
|---|---|---|---|---|---|
| `FOUNDING20` | 20 | ALL | 50 | 31 Dec 2026 | ACTIVE |
| `PILOT50` | 50 | `CAMPUS_LICENCE` | 3 | 31 Dec 2026 | ACTIVE |
| `STUDENT10` | 10 | `PATH_ENROLMENT` | 200 | 31 Dec 2026 | ACTIVE |
| `SPONSORFULL` | 100 | `CHALLENGE_SPONSORSHIP` | 1 | 31 Dec 2026 | PENDING_APPROVAL |

### A7.5 Reserved coupon kinds (not built, but leave the field)
- **Fixed amount** off.
- **Scholarship:** eligibility reviewed before it applies (the UMO Design School offers scholarships; the IxDF student check is the pattern).
- **Gift match 1:1:** a paid sign-up funds a free seat, as UMO Design School’s “Give a gift of Design” does.
- **Partner code:** a link code that credits the referrer (IxDF Educational Partners pattern).

Each needs a finance and legal decision (A17).

---

## A8. Quote and checkout engine

Write as pure functions in `src/lib/pricing/` with unit tests.

### A8.1 `quote(input) → Quote`

**Input:** `flow`, `plan_key`, `quantity`, `org_size` (for tiers), `org_id`, `coupon_code?`, `now`.

**Steps**
1. Load the plan. Reject if archived, inactive, unpriced (R17), or closed (capacity reached).
2. Find the unit price: from the tier for `org_size`, or from the current **price version**.
3. `list_total = unit_price × quantity` (see A5). Enforce `min_qty`.
4. If a coupon is given, validate (A7.3). If valid, `discount = round_half_up(list_total × percent_off / 100)`. Else `discount = 0` and attach the reason.
5. `taxable = list_total − discount`. `tax = round_half_up(taxable × tax_rate_bps / 10000)`. **Default tax rate is 0 in Phase 1** (A17 #2).
6. `total = taxable + tax`. Never below 0.
7. Return line items, all amounts in paise, `price_version_id`, `coupon_code`, `quote_id`, `computed_at`, `expires_at` (15 minutes), `per_month_equivalent` (annual plans).

### A8.2 `confirm(quote_id) → Signup`
1. Re-run `quote` with the same inputs and the **current** data.
2. If `total`, `list_total`, `discount` or the coupon result differ from the earlier quote, **do not confirm**. Return the new quote and the difference. The user re-confirms. (This is how live admin changes stay safe.)
3. Otherwise write the sign-up with every enumerated value (A4.3), increment `plan.booked`, and increment the coupon’s redemptions in the **same transaction**.
4. Write audit entries (R16). Return a confirmation and an email preview.

### A8.3 Worked examples (use as unit tests)

| # | Case | Result |
|---|---|---|
| 1 | Campus, MEDIUM, ₹10,00,000, `FOUNDING20` | discount ₹2,00,000; total ₹8,00,000 |
| 2 | Industry, 5 seats × ₹40,000, no coupon | list ₹2,00,000; total ₹2,00,000 (tax 0) |
| 3 | Industry, 5 seats, `PILOT50` | coupon rejected: “Valid for campus licences only.” total ₹2,00,000 |
| 4 | Path, 1 learner × ₹12,000, `STUDENT10` | discount ₹1,200; total ₹10,800 |
| 5 | Rounding: list ₹333.33 (33333 paise), 15% | discount 4999.95 → 5000 paise (₹50.00); total ₹283.33 |
| 6 | `SPONSORFULL` (100%), sponsor ₹2,50,000 | blocked until approved; once approved, total ₹0 and flagged “sponsored” |
| 7 | Industry, 1 seat, `min_qty` 2 | rejected: “Minimum 2 seats.” |
| 8 | Plan at 30 of 30 capacity | “Closed. Re-opens soon.” No quote |
| 9 | `FOUNDING20` used once by Org A, `max_per_org` 1, second try by Org A | rejected: “Already used by your organisation.” |
| 10 | Admin changes price between quote and confirm | confirm returns the new total and asks again |

---

## A9. Real-time propagation

**Goal:** an admin change reaches open sign-up screens within **2 seconds** (SSE) or **5 seconds** (polling fallback). No page reload.

1. Keep one counter, `pricing_epoch`, incremented on every admin change (plan, price, tier, coupon, banner).
2. **Preferred:** `GET /api/stream/pricing` (Server-Sent Events). Each event carries `{ epoch, kind, key }`. For a single server process use an in-memory emitter. Note: multi-instance hosting needs Postgres `LISTEN/NOTIFY` or Redis; not needed in Phase 1.
3. **Fallback:** `GET /api/pricing/epoch` every 5 seconds. Use this on hosts that do not allow long connections.
4. On a new epoch, the open screen **re-fetches** plans, coupons, banner and **re-runs its quote**. It shows a short note: “Price updated.”
5. A screen with a confirm button always re-validates on click (A8.2).
6. In the prototype, also notify other open browser tabs with `BroadcastChannel('lead-pricing')` so the live effect can be shown on one laptop.

---

## A10. Sign-up flows (where pricing plugs in)

Every flow ends at the same mock confirmation. Shared components: `PriceSummary`, `CouponField` (validates as you type, 300 ms delay, one plain message), `AvailabilityMeter` (“% booked”), `ConfirmCard` (with email preview).

### A10.1 College onboarding — `/join/college`
1. Institution details: name, city, student count.
2. The tier is **picked automatically** from the count (shown, with the reason).
3. Add-ons (reserved).
4. Coupon.
5. Quote: list, discount, tax (shown as “Not applied in prototype”), total, per-month equivalent.
6. Confirm (mock). Result: a **pending institution** record and a task for the steward to verify the institution (the IxDF student-verification pattern, applied to the campus).
Enumerated on the record: `flow=COLLEGE_ONBOARDING`, `plan_key`, `tier_key`, `billing_period=ANNUAL`.

### A10.2 Industry partnership — `/join/industry`
1. Organisation details.
2. **Seats.** Minimum 2. Roles: **Learner**-style seat (member), **Supervisor** (admin, uses a seat), **Coordinator** (admin only, **no seat**). Mirrors the IxDF company model.
3. Assessor seats offered (free, not priced; they feed the supply gate).
4. Coupon, quote, confirm.
Privacy rule on the org dashboard: admins see seats used and Passport counts, **never individual submissions or feedback** (R3, R4).

### A10.3 Path enrolment — `/join/path/[plan_key]`
1. Choose learner count (1 for an individual).
2. Student coupon asks for an eligibility note (reserved check).
3. Availability meter (“% booked”). At 100% show “Closed. Re-opens soon.”
4. Quote, confirm. Result: enrolment, plus a preview of the access email.

### A10.4 Challenge sponsorship — `/join/sponsor/[challenge_id]`
1. Number of challenges.
2. Co-sponsors (reserved: split the price).
3. Coupon (for example the sponsored 100% coupon, once approved).
4. Quote, confirm. Result: sponsor record linked to the challenge.

### A10.5 Open join — `/join/open`
Free. No coupon field. Creates an open-tier member after consent (F-GV-01).

### A10.6 Confirmation screen
Shows: what you joined, plan and price version, coupon applied, total, a **preview of the email** (plain text, no real send), and “Mock sign-up. Nothing was charged.”

---

## A11. Admin screens and routes

Mock admin = role switcher entry **UMO admin (mock)**, with an “Acting as **Admin A / Admin B**” toggle.

| Route | Screen | What the admin does |
|---|---|---|
| `/admin` | Dashboard | See live plans, live coupons, redemptions, “% booked”, coupons expiring in 14 days, last 10 changes |
| `/admin/plans` | Plan list | Create a plan (key, name, kind, model, period, min qty, capacity, refund window). Switch on or off |
| `/admin/plans/[key]` | Plan detail | Set price or tier prices. See **price version history**. Schedule a price from a future date |
| `/admin/coupons` | Coupon list | Filter by status. Pause, resume, archive |
| `/admin/coupons/new` | New coupon | Name, percent, applies to, limits, dates, funded by, note |
| `/admin/signups` | Sign-up log | Every mock sign-up with its **snapshot** (plan, price version, coupon, amounts) |
| `/admin/enums` | Enumerations | Show current plan keys and coupon codes (live and archived), as the endpoint returns them |
| `/admin/banner` | Announcement banner | Text, link, window. Shown above the nav on every page |
| `/admin/audit` | Audit log | Every admin change, before and after |

**Every admin form:** plain labels, inline validation, a “Preview as a customer” link that opens the matching `/join/*` screen.

---

## A12. Data model additions

Names are proposals. Money is integer paise. Every table has `id`, `created_at`, `updated_at`.

| Table | Key fields | Notes |
|---|---|---|
| `plan` | `plan_key` (unique), name, kind, pricing_model, billing_period, min_qty, capacity (nullable), booked, refund_window_days, active, archived, is_demo | The plan registry |
| `plan_price_version` | plan_id, version, unit_price (nullable), effective_from, note, created_by | Prices are **never edited in place** (R9) |
| `plan_tier` | plan_version_id, tier_key, min_size, max_size, price | For `TIERED_BY_SIZE` |
| `coupon` | `code` (unique, case-insensitive), kind, percent_off, applies_kind[], applies_plan_keys[], min_qty, valid_from, valid_until, max_redemptions, max_per_org, status, funded_by, note, created_by, approved_by | The coupon registry |
| `coupon_redemption` | coupon_id, signup_id, org_id, discount_paise, at | Written inside the confirm transaction |
| `signup` | flow, org_id, plan_id, plan_key, plan_kind, pricing_model, billing_period, tier_key, price_version_id, coupon_code, quantity, list_total, discount, tax, total, status, quote_id, quote_snapshot (JSON) | All enumerated fields validated on write |
| `announcement_banner` | text, link, starts_at, ends_at, active | One active at a time |
| `pricing_epoch` | value | Single row. Incremented on every admin change |
| `setting` | key, value | `approval_threshold_pct` (default 50), `tax_rate_bps` (default 0), `quote_ttl_minutes` (default 15) |

---

## A13. Rules R9–R17 and access

| ID | Rule | Plain words |
|---|---|---|
| **R9** | Price versioning | A price change creates a new version. Past sign-ups keep the version they accepted |
| **R10** | Coupon validation | The eight checks in A7.3, at quote **and** at confirm |
| **R11** | Second approval | A coupon above the approval threshold (default **50%**), and any 100% coupon, cannot go ACTIVE until a **different** admin approves it. An admin cannot approve their own |
| **R12** | Price change warning | A change larger than ±30% against the last version needs a written note |
| **R13** | Key immutability | A plan key or coupon code used by any sign-up cannot be renamed or deleted. It can be archived |
| **R14** | Mock only | Every priced screen says “Mock pricing. Not an offer.” No payment is taken |
| **R15** | Live and safe | Open screens update on a new epoch. Confirm always re-validates. Never confirm at a stale price |
| **R16** | Audit everything | Every admin change and every redemption writes an audit entry with before and after |
| **R17** | No price, no sale | A plan with no price (or no tier for the given size) cannot be quoted |

### Access additions

| Resource | Admin | Steward | Institution head | Industry | Student / Open | Others |
|---|---|---|---|---|---|---|
| Plans, price versions, tiers | RW | R | R own quote | R own quote | R list price | — |
| Coupons | RW (not own approval) | R | — | — | Apply a code only | — |
| Sign-up log | R all | R all | R own org | R own org | R own | — |
| Banner | RW | R | R | R | R | R |
| Settings (threshold, tax, TTL) | RW | R | — | — | — | — |
| Audit log | R all | R all | R own institution | R own org | — | — |

Add **UMO admin (mock)** to the role switcher and to every permission test.

---

## A14. New features

**Priority:** P0 = in Phase 1 and works against the seeded database. P1 and P2 as in SPEC section 6.

| ID | Feature | What it does | Pri |
|---|---|---|---|
| F-PR-01 | Plan registry | Create, edit, switch off, archive plans | P0 |
| F-PR-02 | Price versions | Set prices with history and an optional start date | P0 |
| F-PR-03 | Tier prices | Prices by institution size band | P0 |
| F-PR-04 | Coupon builder | Create coupons by name and percent, with limits and dates | P0 |
| F-PR-05 | Second approval | Admin B approves high-value coupons (R11) | P0 |
| F-PR-06 | Quote engine | Pure functions with worked-example tests (A8) | P0 |
| F-PR-07 | Live propagation | SSE with polling fallback and tab sync (A9) | P0 |
| F-PR-08 | College onboarding flow | `/join/college` | P0 |
| F-PR-09 | Industry partnership flow | `/join/industry`, seats and roles | P0 |
| F-PR-10 | Path enrolment flow | `/join/path/[key]` | P0 |
| F-PR-11 | Challenge sponsorship flow | `/join/sponsor/[id]` | P0 |
| F-PR-12 | Announcement banner | Admin-set banner on every page | P0 |
| F-PR-13 | Availability meter | “% booked” and a Closed state | P0 |
| F-PR-14 | Sign-up log with snapshots | `/admin/signups` | P0 |
| F-PR-15 | Enumerations viewer | `/admin/enums` and `GET /api/enums` | P0 |
| F-PR-16 | Confirmation and email preview | Mock access email | P0 |
| F-PR-17 | My billing | Invoices, change plan, cancel within the refund window (mock) | P2 |
| F-PR-18 | Reserved coupon kinds | Scholarship, gift match, partner code, fixed amount | P2 |

---

## A15. Tests

### A15.1 Unit tests (Vitest)
- Engine: the ten worked examples in A8.3, exactly.
- Rounding: always half-up in paise; never negative totals.
- R9: a price change creates a new version; an old sign-up still reads its old version.
- R10: each of the eight coupon checks fails on its own, with the right message.
- R11: a coupon over the threshold stays PENDING until a different admin approves; self-approval is refused.
- R12: a change over ±30% without a note is refused.
- R13: renaming or deleting a used key is refused; archiving works.
- R15: confirm refuses when the quote is stale and returns the new quote.
- R17: an unpriced plan, or a size with no tier, cannot be quoted.
- Enumerations: writing an unknown `plan_key` or `coupon_code` is rejected; a newly created key is accepted at once.

### A15.2 End-to-end scenarios (Playwright)

| # | Scenario | Pass when |
|---|---|---|
| S11 | Admin creates plan `PATH_TEST` and sets a price | It appears on `/admin/enums` and in the `/join/path` dropdown **without a reload** |
| S12 | Admin creates coupon `FOUNDING20` (20%) | A customer on `/join/college` enters it and sees the discount |
| S13 | Admin creates `BIG70` (70%) as Admin A | It stays PENDING. Switching to Admin B and approving makes it ACTIVE. Admin A cannot approve it |
| S14 | A customer has a quote open. Admin changes the price | The open screen shows “Price updated” within 5 seconds and a new total |
| S15 | A customer confirms after the admin pauses the coupon | Confirm refuses, shows the new total, asks again |
| S16 | Campus pilot has 10 slots; 10 sign-ups confirm | The meter reaches 100%, the plan shows Closed, and the 11th is refused |
| S17 | Coupon `max_per_org` is 1 | The same organisation’s second sign-up with it is refused |
| S18 | Admin archives a used plan key | It disappears from sale and stays in the sign-up log; renaming it is refused |
| S19 | Admin switches the banner on | It shows on every page within 5 seconds |
| S20 | Open another browser tab on `/join/industry`, change a price in the admin tab | The second tab updates (tab sync) |

---

## A16. Milestones, demo and first prompts

| M | Milestone | Done means |
|---|---|---|
| **M7** | Enumerations, plans, price versions, tiers, coupons, engine and tests | A15.1 green; `GET /api/enums` works; seeds from A6 and A7.4 load |
| **M8** | Admin screens (A11) and the five join flows (A10) with mock confirm | S11–S18 pass |
| **M9** | Live propagation, banner, availability meter, tab sync, audit | S19–S20 pass; A9 timing met on the preview deploy |

**Demo script additions (insert after step 9 of SPEC 18.2):**
- 9a. Switch to **UMO admin (mock)**. Create coupon `FOUNDING20`.
- 9b. In a second tab, open `/join/college`, enter the coupon, watch the price drop.
- 9c. As Admin A create `BIG70`; switch to Admin B and approve it. Show the rule working.

**First prompts for Claude Code**
1. “Read `docs/SPEC-ADDENDUM-01.md`. Summarise sections A3 to A9 in your own words and list any gaps. Do not write code.”
2. “Do M7. Write the engine tests from A8.3 first, then the code.”
3. “Do M8. Use the reference tab in `docs/reference/LEAD_Platform_Model_Explorer.html` for behaviour.”
4. “Do M9. Show me S14 and S20 working before you stop.”

---

## A17. Decisions only people can make

| # | Decision | Who |
|---|---|---|
| 1 | Are LEAD Paths sold inside LEAD, or through the UMO Design School storefront, or both? Who owns the price? | UMO |
| 2 | Tax on each plan type (education services, memberships, sponsorships) and how invoices show it. The model carries a rate field; the policy is not set | Finance, counsel |
| 3 | Payment provider for Phase 2 and invoicing for large accounts (IxDF uses card payments plus invoices for large accounts) | UMO, finance |
| 4 | Refund or cancellation window per plan | UMO |
| 5 | The approval threshold for coupons (default 50%) and who the second approver is | Kaladhar Bapu, Madhukar Joshi |
| 6 | Whether scholarships and 1:1 gift matching apply to LEAD, and how eligibility is checked | UMO, counsel |
| 7 | Whether coupons may ever stack, or combine with scholarships | UMO |
| 8 | Real prices. Only the campus band ₹5–15 lakh is sourced. Industry, path and sponsorship prices are demo values | Madhukar Joshi, UMO |
| 9 | Whether partner codes and referral credit are offered (and how long credit lasts) | UMO |
| 10 | Data handling for sign-up records (consent, retention) under India’s data protection law | Counsel |

---

## A18. Source notes

- **umo.design** (read 13 Oct 2026): non-profit; Initiatives, Jobs, Community navigation; the six-part framework; closing cards (Volunteer, Mentor, Partner, Find a Job); contact and footer pattern. Rendered visuals not inspected.
- **umodesign.school** (read 13 Oct 2026): EXCEL positioning; Design Literacy and UMO Design Grads (24 weeks); scholarships; “Give a gift of Design” 1:1 matching; certificate rule (pass at 80%).
- **ixdf.org** (FAQ and about, read 13 Oct 2026): memberships (Professional and Student billed yearly; Design League billed monthly with a personal coach); student verification; Company Membership (minimum 2, three roles, dashboard, invoices for large accounts); 14-day money-back; gift option; Refer-a-Friend and Educational Partner codes with long-lived first-click credit; promotional banner; “% booked” on courses; Career Programs; Local Groups; certificates verifiable by link.
- These are **pattern notes for modelling**. Do not copy IxDF or UMO Design School content, claims or branding.
- Photographs, logos and certificate designs belong to their owners. UMO’s own logo files are supplied by UMO.
