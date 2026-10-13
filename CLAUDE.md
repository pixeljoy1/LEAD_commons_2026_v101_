# LEAD Platform

Prototype for UMO Design Foundation's LEAD initiative: a loop that connects classrooms and workplaces.
Full spec: docs/SPEC.md and docs/SPEC-ADDENDUM-01.md (the addendum wins on conflict). Read both before any task. Reference UI: docs/reference/LEAD_Platform_Model_Explorer.html.

## Rules
- Phase 1 only: a clickable prototype with seeded, synthetic data. No real people, no real student data.
- Do not build Phase 2 or Phase 3 features (section 2, and any feature marked P1 or P2 in section 6) unless the user says the gates have passed.
- UMO is the dominant brand on every screen. UXINDIA appears small, in the footer. Never use the words "SFIA" or "LUMA" in product copy.
- Plain words. Short sentences. No filler, no emojis, no marketing language. Strategy stays sharp; jargon goes.
- Anything illustrative must say so on screen in plain words (for example “Demo count” or “Illustrative · not the person”). Do not use a “Simulated” label. The footer and persona menu keep one neutral line: “Demo only · nothing saved or charged”.
- 1 Million Women in Design: the automatic share (default 5%) is a setting in the pricing data, never hard-coded. It comes out of the price and is never added to it. Top-up seats are optional and shown before confirm. Rules R18 and R19 live in `rules.js` and `pricing.js` with tests.
- The homepage opens with a timed carousel. “Your path” stays folded until a role is picked.
- Learning codes: `LM-<mode>-<n>` for a module (SP self-paced, IL instructor-led, PL peer circle, CB inside a challenge), `LP-n` for a Learning Path, `TP-n` open topic, `RQ-n` request, `OF-n` offer. Show the code on every card, step and button. Rules R20 to R22 live in `rules.js` with tests.
- There is no UMO steward role. UMO admin runs the loop and the pricing. Never show “mock” on admin or persona labels; priced customer screens keep “Mock pricing. Not an offer.”
- Mobile first. Dark theme is the reference design; light theme must also pass.
- Business rules live in /src/lib/rules as pure functions with unit tests (rules R1–R8 in the spec, R9–R17 in the addendum, R18–R22 added in rounds 4 and 5).
- Prices, plans and coupons are data in the database, never hard-coded. Sign-up records store enumerated keys (addendum A4).
- Mock pricing only. Every priced screen says "Mock pricing. Not an offer." Nothing is charged.
- Look and feel priority: LEAD identity, then umo.design and umodesign.school, then ixdf.org patterns. Copy IxDF patterns only, never its logo, text, images or colours. Link to UMO Design School, UMO Mentors & Catalysts and UXIN; do not duplicate them.
- Public pages (the homepage and the join sheet) use plain words a first-year student understands. No rule codes (R1…), no spec terms (lifecycle, gates, retention, lineage, blueprint, value exchange), no internal lens names. Keep each product name (Passport, Skills Guide, Paths, Codex) and explain it where it first appears. The old name “Lexicon” is retired.
- People photos are illustrative stock. Keep the checker treatment, the caption “Illustrative · not the person”, and the photographer credit in the footer. Never name or imply a real person.
- Every state change writes an audit entry.
- Small steps: finish one milestone, run tests, show the result, then stop and ask.

## Stack (proposal, swap only with a reason)
Next.js (App Router), TypeScript strict, Tailwind, SQLite via Drizzle for the prototype, Zod for validation,
Vitest for rules, Playwright for the demo scenarios.
Fonts: Space Grotesk (headlines, numbers), Roboto (body), Roboto Mono (small caps labels).

## Commands
- install: `npm install`
- dev: `npm run dev`
- seed: `npm run seed`
- test: `npm test` (rules) and `npm run e2e` (scenarios)
- check: `npm run lint && npm run typecheck`

## Done means
Tests pass, lint and typecheck clean, the milestone's acceptance list in the spec is ticked, and a short note says what changed.

## This repo today
- `prototype/` is the Phase 1 clickable prototype as static HTML (no build step). Pure rules and the pricing engine live in `prototype/js/rules.js` and `prototype/js/pricing.js`; port them to `src/lib/` when moving to the Next.js stack.
- `docs/SERVICE-MODEL.md` describes the service model (ecosystem, value flows, lifecycle) that the prototype's Model screen shows.
- Persistence is deliberately temporary: loop data in memory, pricing mirrored to local storage only for cross-tab demos.
- Run: `npm test`, `npm run serve`, `npm run e2e`, `npm run build:artifact`.
