# LEAD Platform — Build Spec for Claude Code

**Owner:** UMO Design Foundation · LEAD
**Prepared:** 13 October 2026 · **Version:** 0.2 · **Status:** ready to build Phase 1; Phase 2 is gated (see section 2). **Read `docs/SPEC-ADDENDUM-01.md` too: it adds the Admin and pricing module and the look-and-feel sources, and wins on any conflict.**
**Reference prototype:** `LEAD_Platform_Model_Explorer.html` (static, all four tabs). Port its content and look; do not start from zero.

---

## 0. How to use this file

1. Save this file in the repo as `docs/SPEC.md`.
2. Copy the block in section 1 into `CLAUDE.md` at the repo root.
3. Put the logos in `public/brand/` (`UMO_logo.png`, `UXINDIA_logo.png`).
4. Put `LEAD_Platform_Model_Explorer.html` in `docs/reference/`. Save the addendum as `docs/SPEC-ADDENDUM-01.md`.
5. Start Claude Code in the repo and use the first prompts in section 18.

If anything here conflicts with the room's evidence in Appendix A, the evidence wins. Ask before changing scope.

---

## 1. CLAUDE.md block (paste at repo root)

```markdown
# LEAD Platform

Prototype for UMO Design Foundation's LEAD initiative: a loop that connects classrooms and workplaces.
Full spec: docs/SPEC.md and docs/SPEC-ADDENDUM-01.md (the addendum wins on conflict). Read both before any task. Reference UI: docs/reference/LEAD_Platform_Model_Explorer.html.

## Rules
- Phase 1 only: a clickable prototype with seeded, synthetic data. No real people, no real student data.
- Do not build Phase 2 or Phase 3 features (section 2, and any feature marked P1 or P2 in section 6) unless the user says the gates have passed.
- UMO is the dominant brand on every screen. UXINDIA appears small, in the footer. Never use the words "SFIA" or "LUMA" in product copy.
- Plain words. Short sentences. No filler, no emojis, no marketing language. Strategy stays sharp; jargon goes.
- Anything simulated or illustrative must say so on screen.
- Mobile first. Dark theme is the reference design; light theme must also pass.
- Business rules live in /src/lib/rules as pure functions with unit tests (rules R1–R8 in the spec, R9–R17 in the addendum).
- Prices, plans and coupons are data in the database, never hard-coded. Sign-up records store enumerated keys (addendum A4).
- Mock pricing only. Every priced screen says "Mock pricing. Not an offer." Nothing is charged.
- Look and feel priority: LEAD identity, then umo.design and umodesign.school, then ixdf.org patterns. Copy IxDF patterns only, never its logo, text, images or colours. Link to UMO Design School, UMO Mentors & Catalysts and UXIN; do not duplicate them.
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
```

---

## 2. Decision first: what to build, and what not yet

### 2.1 The question
Is a platform worth building? The room's evidence says: **worth testing, not yet worth building.** The loop is the product; the platform is where it lives.

### 2.2 Phases

| Phase | What | When | Gate |
|---|---|---|---|
| **0. Done** | Static Model Explorer (verdict, model, access chooser, provisions) | Done | — |
| **1. Clickable prototype** | A real app shell with role switching, seeded data and every journey clickable end to end. No real accounts. Used to show the model at the 26 Oct sync and to run the gate conversations | Build now; ready for the 26 Oct sync (13 days from today) | None |
| **1b. LEAD Loop v0 (no software)** | A manual kit: one calendar, intake form, brief template, spreadsheet Passport, mentor group, assessment-day run sheet (section 15) | Start now, in parallel | None |
| **2. Thin v1** | Real accounts and one real loop for a handful of campuses and companies | Only after the gates pass | G1–G5 below |
| **3. Platform** | Memberships, open tier, circles, index, scale | After v1 proves the loop | v1 results |

### 2.3 Gates before any Phase 2 build
These are proposals. Madhukar Joshi and Kaladhar Bapu set the final numbers.

| Gate | Test | By |
|---|---|---|
| **G1 Supply** | At least 3 companies each post one real, scoped challenge with a named owner | Day 60 (Wed 25 Nov 2026) |
| **G2 Demand** | At least 3 campuses commit a faculty lead and a term slot. At least 2 would sign a letter of intent in the proposed fee band | Day 60 |
| **G3 Trust** | At least 1 employer states in writing that it would count validated evidence when shortlisting | Day 90 (work to Fri 18 Dec; 25 Dec is a holiday) |
| **G4 Mentor supply** | At least 10 practitioners give 4 or more hours each, or a mentor-credit model is agreed | Day 90 |
| **G5 Custody** | UMO confirmed as steward, the host for the empty UXINDIA Chair lens | 30-day sync (Mon 26 Oct 2026) |

**Reading the result:** 0–2 gates: stay manual. 3–4: build a thin v1 for one loop. 5: commission the platform.

### 2.4 Out of scope for Phase 1 (do not build)
- Real payments, real billing, real invoicing (a **mock** checkout is in scope; see the addendum)
- Video calls, live chat, a social feed (link out; use simple threads only)
- Hosting course content (link out to existing material)
- Recommendation engines or AI matching
- Real authentication (use a role switcher; see section 9 and the addendum for Admin A / Admin B)
- The 1 Million Women initiative and Design Pitch (reserved as overlays, section 14)

---

## 3. Context: why this exists

### 3.1 The room (LEAD Commons' Roundtable, 26 Sep 2026, Srishti Manipal Institute, Bengaluru)
Twenty design leaders and educators were invited (12 industry, 8 academia). 18–19 were present. Four methods ran in order: Rose, Thorn, Bud; an abstraction ladder; a Venn of ownership; an importance-against-difficulty chart.

### 3.2 What the room said that shapes this platform

| # | Evidence | What it means for the build |
|---|---|---|
| 1 | “Industry doesn’t give students proper projects.” “Never done full projects, requires mentoring.” | Real, scoped industry problems are the scarce input. Build a challenge exchange |
| 2 | “What is core?” “Day 1 readiness” (used by both sides, defined by neither) | A shared definitions layer is missing and is cheap to build |
| 3 | Academia call: “We all do FDPs, live projects, internships, and the gap still remains.” | Do not repackage the same programmes. Only the closed loop and validation are new |
| 4 | “Low company budget for training.” “Why train someone for a competitor?” Industry Training sat in Plan For “as a function of RoI” | Industry willingness to pay is unproven. Test price before building |
| 5 | “Why is 40% not placed? Is the remaining 60% industry ready?” | Employers need evidence they trust |
| 6 | The Do First cards are behaviours: decision defence, accountability, job ethics, soft-skills, trust and compliance | They are learned by practice with feedback. Practice and mentoring lead, not courses |
| 7 | UXINDIA Chair and Wider Audience lenses held no cards. “Nobody volunteers; good practitioners cost money” | Custodian and mentor economics come before software |
| 8 | The pink card: “What do you measure??” | Build the Impact Ledger from day one. “Industry problems solved” beats “programmes run” |
| 9 | The one concrete idea: a joint Design Calendar; touchpoints at 30 and 90 days | Ship the calendar first |

### 3.3 The shortlist (from Madhukar Joshi, 12 Oct 2026)
**LEAD Campus**, proposed ₹5–15 lakh a year by institution size (untested). Includes: student access, faculty access, curriculum integration, Industry Challenges, faculty development, industry mentors, placement readiness, Skills Passport, industry assessment days. Bundle ideas: 1 Million Women, Design Pitch.

**The loop:** IDENTIFY → LEARN → APPLY → MENTOR → SOLVE → VALIDATE → CONNECT → GET OPPORTUNITY.

**Proof of success, in his words:** “We told LEAD what capability we needed. LEAD helped academia build it. Students demonstrated it. We hired or deployed the talent.”

**Impact question:** “How many industry problems were solved?”

Full coverage map: section 13.

---

## 4. The model (modelled on IxDF, extended where the room demands)

IxDF (the Interaction Design Foundation) is open knowledge, certified learning, a verifiable credential and a local community, run as a membership. LEAD copies that skeleton and adds what IxDF does not do: real industry problems, mentoring and industry validation.

### 4.1 What to replicate, adapt, or add

| What IxDF does | LEAD equivalent | Mode | What the room adds |
|---|---|---|---|
| Open library of design articles and videos | **LEAD Lexicon**: open, plain-language definitions of each capability, co-signed by industry and academia | Replicate | Answers “what is core?” and “Day 1 readiness”. Each definition carries a demand signal: how many employers asked for it |
| Self-paced courses with certificates | **LEAD Paths**: short modules linked to a live challenge | Adapt | Weighted to practice with feedback |
| Verifiable certificates and Distinctions (a permanent link and ID anyone can check) | **Skills Passport**: verifiable link, distinctions, evidence attached | Adapt | Evidence is validated work from an industry assessor, not course completion |
| Master Classes with industry leaders | **Practitioner Sessions** and faculty residencies | Replicate | Feeds faculty development |
| Community conversations and Local Groups | **Campus Chapters + Industry Circles** on one **Joint Design Calendar** | Adapt | The calendar is the room’s own idea |
| Company Memberships with an administrator | **Industry Membership**: org admin, sponsored challenges, assessor seats, shortlist access | Replicate | Pooled funding and early talent access answer “why train for a competitor?” |
| Toolkits for educators | **Faculty Toolkit**: challenge-in-a-course kit, credit-window mapping, NEP alignment | Adapt | Answers curriculum rigidity |
| The Educational Codex (standard for certificates) | **LEAD Codex**: rules for challenges, mentors, assessors, IP, consent, ethics | Adapt | Holds the hub items: Trust and Compliance, Job Ethics, Economic Constraint |
| No equivalent | **Industry Challenges · Mentor Sprints · Assessment Days · Opportunity Board · Impact Ledger** | New | Where the room’s evidence points |

### 4.2 The closed loop (eight stages)

| # | Stage | Module | What happens |
|---|---|---|---|
| 1 | IDENTIFY | Demand Map + Lexicon | Industry states the capability it needs |
| 2 | LEARN | Paths | Short modules, linked to a live challenge |
| 3 | APPLY | Challenges | Real, scoped, NDA-safe problems taken into a term |
| 4 | MENTOR | Mentor Sprints | Time-boxed practitioner feedback |
| 5 | SOLVE | Submissions | Team deliverable plus decision log |
| 6 | VALIDATE | Assessment + Codex | Industry assessors score against a shared rubric |
| 7 | CONNECT | Chapters & Circles | Campus and industry meet on one calendar |
| 8 | GET OPPORTUNITY | Opportunity Board + Impact Ledger | Hire or deploy, and count problems solved |

Two layers run under every stage:
- **Governance (Codex):** consent, IP and NDA, ethics, assessor conflicts.
- **Measurement (Impact Ledger):** problems solved, verified outcomes. It feeds stage 1.

### 4.3 The five lenses from the room, mapped to roles

| Lens (Venn) | Roles |
|---|---|
| College | Student, Faculty, Institution head |
| Employer | Industry leader, Mentor & assessor |
| Joint Project | The challenge itself (shared between College and Employer) |
| UXINDIA Chair | UMO steward |
| Wider Audience | Open community |

---

## 5. Roles, access and journeys

Seven roles here, plus an eighth, **UMO admin (mock)**, defined in the addendum (A3, A11, A13). For each: goal, what they can see, do, and not do, then their path through the loop. Feature IDs are in section 6.

### 5.1 Student (College lens)
- **Goal:** Show I can do the work, not just pass the course.
- **Access:** Member, via campus.
- **Sees:** Lexicon and Paths; open challenges on my campus; my Passport and mentor sessions.
- **Can do:** join or form a team; submit work and a decision log; request a mentor sprint; share my Passport link.
- **Cannot:** see other students’ feedback; see employer shortlisting notes.

| Stage | Moment | Features | Simulated screen | Hands off to |
|---|---|---|---|---|
| IDENTIFY | Week 1 | F-ID-01 Capability finder; F-ID-02 Readiness profile | Demand Map · this term: Framing the problem (asked by 7 companies), Defending a design decision (5), Business context (4). CTA: Pick a capability | Industry leader |
| LEARN | Weeks 1–3 | F-LE-01 Path linked to a live challenge; F-LE-02 Fundamentals shelf | Your path: Problem framing (done), Interviewing stakeholders (in progress), Defending a decision (next). CTA: Continue | — |
| APPLY | Weeks 3–8 | F-AP-01 Challenge workspace; F-AP-02 Decision log | Challenge · Reduce onboarding drop-off: Milestone 2 of 5, Team 4 of 4 joined, Decision log 6 entries. CTA: Add a decision | Mentor |
| MENTOR | Weeks 4–8 | F-ME-01 Mentor sprint; F-ME-02 Private feedback thread | Mentor sprint · session 2: Mentor, Agenda “Defend your scope”, Notes private to team. CTA: Join session | Mentor |
| SOLVE | Week 8 | F-SO-01 Submission pack | Submission: deliverable, decision log, reflection, AI-use declaration. CTA: Submit | Mentor & assessor |
| VALIDATE | Week 9 | F-VA-01 Assessment day | Assessment · result: Framing strong, Decision defence developing, Passport entry added and verifiable. CTA: Share Passport link | Mentor & assessor, Steward |
| OPPORTUNITY | Month 3 on | F-OP-01 Opportunity board; F-OP-02 Learning contract | Opportunity board: Associate designer (shares your Passport), Internship 3 months (learning contract), Applied 2. CTA: Apply | Industry leader |

### 5.2 Faculty (College lens)
- **Goal:** Teach with live industry input without rewriting my course.
- **Access:** Member, via campus.
- **Sees:** challenge and sanitised case library; progress of my cohort; assessor rubrics.
- **Can do:** slot a challenge into a module; co-mentor with a practitioner; score with the shared rubric; claim workload credit.
- **Cannot:** see other campuses’ student data.

| Stage | Moment | Features | Simulated screen | Hands off to |
|---|---|---|---|---|
| IDENTIFY | Before term | F-ID-03 Syllabus gap check | Gap check · Studio 3: Covered 9 of 14; Uncovered, high demand: Framing, business context; Suggested challenge 2. CTA: Open challenge library | Industry leader |
| LEARN | Term start | F-LE-03 Faculty residency; F-LE-04 Practitioner sessions | Residency · week 1: Practitioner (design director, fintech), Your role co-teach, Hours logged 6. CTA: Log hours | Mentor |
| APPLY | Weeks 2–8 | F-AP-03 Challenge-in-a-course kit; F-AP-04 NDA-safe case library | Module mapping: Module Studio 3, Credit window mapped, Challenge live week 3. CTA: Confirm mapping | Steward |
| MENTOR | Weeks 4–8 | F-ME-03 Co-mentoring | Co-mentoring: Sessions attended 3, Teams covered 2, Notes shared with you. CTA: View notes | Mentor |
| VALIDATE | Week 9 | F-VA-02 Rubric co-design | Rubric v2: Framing 25%, Decision defence 25%, Business context 20%. CTA: Approve rubric | Mentor, Steward |
| CONNECT | Ongoing | F-CO-01 Joint Design Calendar | Calendar · next 30 days: Industry circle Wed, Assessment day 14 Nov, Guest session 21 Nov. CTA: Add event | Steward |

### 5.3 Institution head (College lens, institution level)
- **Goal:** Show placement and accreditation outcomes without adding cost I cannot defend.
- **Access:** Admin, institution.
- **Sees:** cohort outcomes; spend against the fee band; validated Passports in aggregate.
- **Can do:** enrol cohorts; sign the partnership agreement; approve credit mapping.
- **Cannot:** see an individual student’s feedback without consent.

| Stage | Moment | Features | Simulated screen | Hands off to |
|---|---|---|---|---|
| IDENTIFY | Planning | F-ID-04 Institution gap report | Gap report: Programmes scanned 6; Highest-demand gap Business context; Cohorts proposed 2. CTA: Plan cohorts | Industry leader |
| APPLY | Term setup | F-AP-05 Cohort enrolment and term slots; F-AP-06 LEAD Campus membership | Membership: Tier by institution size; Fee band (proposed) ₹5–15 lakh a year; Cohorts 2. CTA: Review agreement | Steward |
| VALIDATE | End of term | F-VA-07 Outcomes view | Outcomes · cohort A: Passports validated 38 of 60; Challenges completed 12; Faculty hours 54. CTA: Download report | Steward |
| OPPORTUNITY | Placement season | F-OP-03 Placement readiness view | Readiness · cohort A: Shortlisted by employers 21; Interviews 14; Offers 5. CTA: Share with placement cell | Industry leader |

### 5.4 Industry leader (Employer lens)
- **Goal:** Get a capability built, and find the people who can show it.
- **Access:** Organisation member.
- **Sees:** my challenges and submissions; anonymised cohort results; Passports students choose to share.
- **Can do:** state a capability need; sponsor a challenge; send assessors; shortlist verified talent.
- **Cannot:** see student data that was not shared; contact students outside the platform before consent.

| Stage | Moment | Features | Simulated screen | Hands off to |
|---|---|---|---|---|
| IDENTIFY | Day 1 | F-ID-05 State your capability need | Capability intake: Capability (Framing ambiguous problems), Needed by Q2, Seats you could offer 3 assessors. CTA: Submit to steward | Steward |
| APPLY | Weeks 1–3 | F-AP-07 Challenge sponsor desk; F-AP-08 Pooled sponsorship | Sponsor desk · brief v1: NDA-safe yes; Co-sponsors 2 companies; Campuses interested 3. CTA: Approve brief | Steward, Faculty |
| VALIDATE | Week 9 | F-VA-03 Assessor seat | Assessment day · seat: Submissions 12; Blind-first on; Your hours 4. CTA: Start scoring | Mentor |
| CONNECT | Ongoing | F-CO-02 Industry circle | Industry circle · Wed: Attending 8 companies; Campuses 4; Topic “Readiness, defined”. CTA: RSVP | Steward |
| OPPORTUNITY | Month 3 on | F-OP-04 Verified shortlist; F-OP-05 Problems solved | Impact · your challenges: Problems solved 1 of 1; Candidates shortlisted 6; Hired or deployed 2. CTA: View evidence | Institution head, Steward |

### 5.5 Mentor & assessor (Employer lens, as practitioner)
- **Goal:** Give back in a way that fits my calendar and is recognised.
- **Access:** Verified practitioner.
- **Sees:** assigned teams; the rubric; my hours and distinctions.
- **Can do:** book sprints; give feedback; score blind-first; nominate peers.
- **Cannot:** see student identities before blind scoring ends; recruit during assessment.

| Stage | Moment | Features | Simulated screen | Hands off to |
|---|---|---|---|---|
| LEARN | Any time | F-LE-04 Practitioner session | Session · 21 Nov: Audience 3 campuses; Length 45 min; Credit 1 session. CTA: Confirm | Faculty |
| MENTOR | Weeks 4–8 | F-ME-01 Mentor sprint (mentor side); F-ME-04 Hours ledger | Mentor sprints · you: Teams 2; Hours this term 4.5; Next session Tue 4pm. CTA: Open team notes | Student, Faculty |
| VALIDATE | Week 9 | F-VA-04 Blind-first assessment; F-VA-05 Conflict rule | Scoring · submission 4 of 12: Rubric shared; Names hidden; Score saved. CTA: Next submission | Student, Steward |
| CONNECT | Ongoing | F-CO-03 Distinctions | Your distinctions: Mentor 10 hours; Assessor 1 day; Circle host —. CTA: Share badge | Steward |

### 5.6 UMO steward (UXINDIA Chair lens)
- **Goal:** Host the whole loop between meetings, and prove it works.
- **Access:** Steward, platform.
- **Sees:** the whole loop in aggregate; the operations queue; quality flags.
- **Can do:** shape intake and match; approve mentors and assessors; publish the Codex; report at 30 and 90 days.
- **Cannot:** change a student’s outcome alone (two-person approval).

| Stage | Moment | Features | Simulated screen | Hands off to |
|---|---|---|---|---|
| IDENTIFY | Continuous | F-ID-06 Demand Map curation | Demand Map · queue: New intakes 6; Merged into themes 3; Published 2. CTA: Review intakes | Industry leader |
| APPLY | Weeks 1–3 | F-AP-09 Challenge shaping and matching | Matching: Briefs open 4; Campuses ready 5; Matched 2. CTA: Match next | Faculty, Industry leader |
| MENTOR | Continuous | F-ME-05 Mentor pool and credit ledger | Mentor pool: Active mentors 14; Hours this term 62; Gap vs demand −3. CTA: Invite mentors | Mentor |
| VALIDATE | Week 9 | F-VA-06 Codex and assessment integrity | Integrity checks: Rubrics approved 3 of 3; Conflicts flagged 0; Entries pending second approval 4. CTA: Approve | Mentor, Institution head |
| OPPORTUNITY | Day 30 and 90 | F-OP-06 Impact Ledger | Impact · day 30: Challenges live 3; Problems solved 1; Verified Passports 38. CTA: Publish report | Institution head, Industry leader |

### 5.7 Open community (Wider Audience lens)
- **Goal:** Learn, find my people, and get a way in.
- **Access:** Open, free tier.
- **Sees:** Lexicon; public showcases; circle events; open-cohort challenges.
- **Can do:** join a Circle; follow capabilities; apply to an open cohort.
- **Cannot:** see campus-only challenges; see other people’s Passports.

| Stage | Moment | Features | Simulated screen | Hands off to |
|---|---|---|---|---|
| IDENTIFY | Day 1 | F-ID-07 Lexicon | Lexicon · “Framing the problem”: Definition plain language; Levels 4 descriptors; Asked by 7 companies. CTA: Follow | — |
| LEARN | Weeks 1–4 | F-LE-05 Open Paths | Open path: Module Stakeholder interviews; Progress 2 of 5; Next Quiz. CTA: Continue | — |
| CONNECT | Monthly | F-CO-04 Circles and Chapters | Circles near you: Bengaluru Wed; Online Fri; Members 120. CTA: Join | Steward |
| OPPORTUNITY | Month 2 on | F-OP-07 Open opportunity board | Open board: Open cohort challenge (applications open); Internship 1; Mentor match 2. CTA: Apply | Steward |

> All figures on simulated screens are illustrative. Label every simulated screen “Simulated · illustrative data”.

---

## 6. Feature catalogue

**Priority:** P0 = in the Phase 1 prototype. P1 = needed for one real loop with real accounts (Phase 2). P2 = platform (Phase 3).
**Mode:** Replicate, Adapt, or New (against IxDF).

| ID | Feature | What it does | Room evidence | Mode | Pri |
|---|---|---|---|---|---|
| **IDENTIFY** | | | | | |
| F-ID-01 | Capability finder | Shows which capabilities employers asked for this term, in plain words | No clear statement of what industry needs now | Adapt | P0 |
| F-ID-02 | Readiness profile | One page defining Day 1 readiness, co-signed by industry and academia | “Day 1 readiness” defined by neither side | New | P0 |
| F-ID-03 | Syllabus gap check | Upload a syllabus; see which in-demand capabilities it leaves uncovered | 4-year syllabus, unknown future | New | P0 (mock) |
| F-ID-04 | Institution gap report | Demand against curriculum across programmes | Same | New | P0 (mock) |
| F-ID-05 | State your capability need | Five-minute intake: what you need built, by when | “We told LEAD what capability we needed.” | New | P0 |
| F-ID-06 | Demand Map curation | Steward merges intakes into themes and publishes the Skills Opportunity Map | High-demand and underserved areas | New | P0 |
| F-ID-07 | Lexicon | Plain definitions of capabilities and the roles they lead to | “What is core?”; Awareness (the row that did not travel) | Replicate | P0 |
| **LEARN** | | | | | |
| F-LE-01 | Path linked to a live challenge | Only the modules the challenge needs | Tools taught in Y1, gone by Y4 | Adapt | P0 (mock) |
| F-LE-02 | Fundamentals shelf | Stable basics kept apart from tool training | Strong fundamentals while being able to adapt | Replicate | P0 (mock) |
| F-LE-03 | Faculty residency | Faculty development tied to a live challenge | “We all do FDPs… the gap remains” | Adapt | P1 |
| F-LE-04 | Practitioner sessions | Industry leaders teach, one public talk a term | Faculty lose live industry contact | Replicate | P1 |
| F-LE-05 | Open Paths | Self-paced modules, free to start | Equity of access | Replicate | P2 |
| **APPLY** | | | | | |
| F-AP-01 | Challenge workspace | Team, milestones, a deliberately ambiguous brief | “Solves the brief, can’t find the brief” | New | P0 |
| F-AP-02 | Decision log | Record why you chose; defended at review | “Can’t defend a design decision” | New | P0 |
| F-AP-03 | Challenge-in-a-course kit | Fit a challenge into an existing module, with credit-window mapping | Curriculum rigidity; NEP | New | P0 (mock) |
| F-AP-04 | NDA-safe case library | Sanitised real cases for teaching | NDAs block real case studies | New | P1 |
| F-AP-05 | Cohort enrolment and term slots | Enrol cohorts, fix the term slot | Curriculum rigidity | New | P0 (mock) |
| F-AP-06 | LEAD Campus membership | Student, faculty and challenge access by institution size. Band ₹5–15 lakh a year, untested | Madhukar’s note | Replicate | P2 |
| F-AP-07 | Challenge sponsor desk | Shape a scoped, NDA-safe brief with the steward | Industry doesn’t give proper projects | New | P0 |
| F-AP-08 | Pooled sponsorship | Companies share a challenge’s cost | “Why train someone for a competitor?” | Adapt | P2 |
| F-AP-09 | Challenge shaping and matching | Steward makes briefs NDA-safe and scoped; matches to campuses | NDAs block real cases | New | P0 |
| **MENTOR** | | | | | |
| F-ME-01 | Mentor sprint | Three 45-minute sessions with an industry mentor | “Never done full projects, requires mentoring” | New | P0 |
| F-ME-02 | Private feedback thread | Feedback stays inside the team and assigned mentor | Trust and Compliance | New | P0 |
| F-ME-03 | Co-mentoring | Faculty sit in on mentor sprints | Good practitioners cost money | New | P1 |
| F-ME-04 | Hours ledger | Every mentor hour counted and recognised | “Nobody volunteers” | New | P0 |
| F-ME-05 | Mentor pool and credit ledger | Recruit, brief and recognise mentors | “Nobody volunteers” | New | P0 |
| **SOLVE** | | | | | |
| F-SO-01 | Submission pack | Deliverable, decision log, reflection, AI-use declaration. Added in this spec; not in the explorer | Completes the loop | New | P0 |
| **VALIDATE** | | | | | |
| F-VA-01 | Assessment day | Industry panel, rubric visible in advance, blind-first scoring | “What do you measure??” | Adapt | P0 |
| F-VA-02 | Rubric co-design | Faculty and assessors write the rubric together | Same | New | P0 (mock) |
| F-VA-03 | Assessor seat | Industry assessors score blind against the shared rubric | Same | New | P0 |
| F-VA-04 | Blind-first assessment | Names and institutions hidden until scores lock | Trust and Compliance | New | P0 |
| F-VA-05 | Conflict rule | No recruiting while assessing; no scoring a team you mentored | Job Ethics | New | P0 |
| F-VA-06 | Codex and assessment integrity | Rubrics, conflicts, consent, two-person approval of Passport entries | Trust and Compliance; Job Ethics | Adapt | P0 |
| F-VA-07 | Outcomes view | Validated Passports per cohort, no student names | “What do you measure??” | New | P0 (mock) |
| F-VA-08 | Skills Passport entry | Verifiable link and ID, evidence attached, student-controlled sharing | Employers need evidence they trust | Adapt | P0 |
| **CONNECT** | | | | | |
| F-CO-01 | Joint Design Calendar | One calendar of industry and campus touchpoints | The room’s joint Design Calendar | Adapt | P0 |
| F-CO-02 | Industry circle | Employers meet campus faculty on the shared calendar | Cross-pollination | Adapt | P1 |
| F-CO-03 | Distinctions | Recognition for hours and sprints | Recognition without cost | Adapt | P2 |
| F-CO-04 | Circles and Chapters | Local and online groups | Cross-pollination | Adapt | P2 |
| **OPPORTUNITY** | | | | | |
| F-OP-01 | Opportunity board | Roles and internships tied to verified evidence | Why is 40% not placed? | New | P0 |
| F-OP-02 | Learning contract | Internships carry a mentor, a learning plan and a stipend field | Internships are seen as cheap labour | New | P0 |
| F-OP-03 | Placement readiness view | Verified readiness against open roles | Why is 40% not placed? | New | P0 (mock) |
| F-OP-04 | Verified shortlist | Candidates with evidence attached, shared by the students | Employers need evidence they trust | New | P0 |
| F-OP-05 | Problems solved | The ledger counts what a challenge solved | “How many industry problems were solved?” | New | P0 |
| F-OP-06 | Impact Ledger | Problems solved, verified outcomes, Future Skills Index, 30 and 90-day reports | “What do you measure??” | New | P0 |
| F-OP-07 | Open opportunity board | Entry points for people outside a campus cohort | Wider Audience lens was empty | New | P2 |
| **GOVERNANCE** | | | | | |
| F-GV-01 | Consent manager | Records, shows and revokes consent | Student data and consent | New | P0 |
| F-GV-02 | IP and NDA templates | Plain terms on who owns a solution | IP and NDA for challenge work | New | P1 |
| F-GV-03 | Audit log | Every state change recorded | Trust and Compliance | New | P0 |
| F-GV-04 | AI-use declaration | Each submission states how AI was used | Critical AI literacy (a Bud) | New | P0 |
| F-GV-05 | Provisions board | Reserved slots for missed items; users add their own | Section 14 | New | P0 |

**P0** (no label) means: it works in Phase 1 against the seeded database (create, edit, list, state changes, rules).
**P0 (mock)** means: the screen exists and is clickable with static seeded data, but nothing behind it works.

---

## 7. Interconnected workflows

Each workflow is a chain of hand-offs between roles. Each must run end to end in the prototype.

| ID | Name | Sequence | Trigger → Result |
|---|---|---|---|
| **W1** | Demand to Challenge | Industry leader → Steward → Faculty | Intake submitted → published challenge matched to a campus term |
| **W2** | Learn, Apply, Mentor | Student → Mentor → Faculty | Team formed → three mentor sprints complete |
| **W3** | Solve to Passport | Student → Mentor & assessor → Steward | Submission → blind scoring → second approval → Verified Passport entry |
| **W4** | Passport to Opportunity | Student → Industry leader → Institution head | Student shares Passport → employer shortlists → outcome recorded against the challenge |
| **W5** | Faculty uplift | Faculty → Mentor → Institution head | Faculty co-mentor on a live challenge → hours and credit recognised |
| **W6** | Measure and re-aim | Steward → Institution head → Industry leader | Impact Ledger published → feeds the Demand Map |
| **W7** | Open on-ramp | Open community → Steward → Student | Open learner completes a path → invited into an open cohort challenge |

### 7.1 Step detail for the three core workflows

**W1 Demand to Challenge**
1. Industry leader submits intake (F-ID-05): capability, need-by date, assessor seats offered, whether data or IP is sensitive.
2. Steward reviews (F-ID-06): merges into a theme or keeps as its own; marks “Reviewed”.
3. Steward and industry leader shape the brief (F-AP-07, F-AP-09): scope, success criteria, deliberate ambiguity, sanitised data. Rule R6 must pass before publishing.
4. Steward matches the challenge to one or more campuses (F-AP-09).
5. Faculty accept and map it to a module (F-AP-03). Challenge becomes **Live**.

**W2 Learn, Apply, Mentor**
1. Students form a team and open the workspace (F-AP-01).
2. A short path appears with only the modules the challenge needs (F-LE-01).
3. Team requests a mentor sprint; steward or the pool assigns a mentor (F-ME-01, F-ME-05).
4. Three sessions are booked and held; notes go to the private thread (F-ME-02). Hours are logged (F-ME-04).
5. The team keeps a decision log throughout (F-AP-02).

**W3 Solve to Passport**
1. Team submits the pack (F-SO-01): deliverable, decision log, reflection, AI-use declaration (F-GV-04).
2. Assessors score blind against the rubric (F-VA-03, F-VA-04). Rule R1 and R5 apply.
3. Scores lock. A moderator view shows spread between assessors.
4. A Passport entry is proposed with evidence attached (F-VA-08).
5. Steward gives the second approval (rule R2). Entry becomes **Verified** and gets a public verification link.
6. The student chooses whether to share it (rule R3).

---

## 8. Data model

Names are proposals. Use snake_case in the database. Every table has `id`, `created_at`, `updated_at`.

### 8.1 People and organisations

| Entity | Key fields | Notes |
|---|---|---|
| `organisation` | name, kind (`institution` \| `company` \| `umo`), city, fee_band_note | Synthetic in Phase 1 |
| `user` | name, email (fake), role, organisation_id, open_member (bool) | Role is one of the seven in section 5 |
| `consent` | user_id, purpose, granted (bool), granted_at, revoked_at | Purposes: share_passport, record_sessions, analytics |

### 8.2 Knowledge

| Entity | Key fields | Notes |
|---|---|---|
| `capability` | slug, name, definition, status (`draft` \| `cosigned`), cosigned_by_industry, cosigned_by_academia | The Lexicon term |
| `capability_level` | capability_id, level (1–4), descriptor | Plain descriptors, four levels |
| `demand_signal` | organisation_id, capability_id, need_by, assessor_seats, sensitivity, status | An intake |
| `demand_theme` | name, capability_ids, published (bool) | What the Demand Map shows |
| `path` / `path_module` | title, capability_id, order, duration_min | Content is a link, not hosted |

### 8.3 Challenges and teams

| Entity | Key fields | Notes |
|---|---|---|
| `challenge` | title, sponsor_org_id, capability_ids, success_criteria, ambiguity_note, status, nda_safe (bool), ip_terms_id | State machine in 8.6 |
| `challenge_match` | challenge_id, institution_id, cohort_id, term, faculty_lead_id | |
| `cohort` | institution_id, name, size, term | |
| `team` | challenge_match_id, name, member_ids | |
| `decision_log_entry` | team_id, author_id, decision, reason, alternatives, created_at | |
| `milestone` | team_id, title, due_date, done | |

### 8.4 Mentoring, submission, assessment

| Entity | Key fields | Notes |
|---|---|---|
| `mentor_profile` | user_id, capabilities, hours_offered, verified (bool) | |
| `mentor_sprint` | team_id, mentor_id, status, sessions_planned (3), sessions_done | |
| `session` | sprint_id, starts_at, minutes, notes_private | |
| `message` | thread_id, author_id, body | Thread belongs to a team and its assigned mentor |
| `submission` | team_id, deliverable_url, reflection, ai_use_declaration, status | |
| `rubric` / `rubric_criterion` | name, version; criterion name, weight, descriptors | Default weights in 11.3 |
| `assessment_day` | challenge_id, date, mode, rubric_id | |
| `score` | submission_id, assessor_id, criterion_id, value, locked (bool), blind (bool) | |
| `passport_entry` | student_id, submission_id, capability_id, level, status, verification_code, assessor_id, approver_id, shared (bool) | State machine in 8.6 |

### 8.5 Connection, opportunity, impact, governance

| Entity | Key fields | Notes |
|---|---|---|
| `calendar_event` | title, starts_at, kind, host_org_id, visibility, capability_id | Real in Phase 1 |
| `opportunity` | organisation_id, title, kind (`role` \| `internship`), requires_capability_ids, stipend_note, learning_contract_id | |
| `learning_contract` | mentor_name, plan, stipend_note, duration | Required for every internship |
| `application` | opportunity_id, student_id, passport_entry_ids | |
| `outcome` | application_id, result (`hired` \| `deployed` \| `none`), recorded_by, recorded_at | |
| `problem_record` | challenge_id, result (`solved` \| `partly` \| `not`), confirmed_by_sponsor, confirmed_at, note | Definition in section 12 |
| `provision` | title, note, plugs_into, status, added_by | The Provisions board |
| `audit_entry` | actor_id, action, entity, entity_id, before, after, at | Written on every state change |

### 8.6 State machines

| Entity | States (in order) | Rule |
|---|---|---|
| `demand_signal` | Submitted → Reviewed → Merged → Published | Steward moves it |
| `challenge` | Draft → Shaped → Matched → Live → In assessment → Closed | Draft→Shaped needs R6. Closed carries a `problem_record` |
| `mentor_sprint` | Requested → Booked → In progress → Complete | Complete after 3 sessions |
| `submission` | Draft → Submitted → In scoring → Scored → Moderated | In scoring locks edits |
| `passport_entry` | Proposed → Verified → Shared → Revoked | Proposed→Verified needs R2. Shared needs R3 |
| `opportunity` | Open → Shortlisting → Filled → Closed | |

---

## 9. Access control

Phase 1 uses a **role switcher** (the access chooser) instead of sign-in. It sets the active user from seed data. Build the permission checks as if real sign-in existed, so Phase 2 only swaps the login.

Legend: **R** read · **RW** read and write · **R (own)** only my own · **R (agg)** aggregates only · **—** no access.

| Resource | Student | Faculty | Inst. head | Industry | Mentor & assessor | Steward | Open |
|---|---|---|---|---|---|---|---|
| Lexicon | R | R | R | R | R | RW | R |
| Demand Map | R (themes) | R | R | RW own intakes; R themes | R | RW | R (public themes) |
| Paths | R | R | R | R | R | RW | R (open paths) |
| Challenge, published | R (own campus) | R | R (own campus) | RW own | R (assigned) | RW | R (open cohort only) |
| Challenge brief, draft | — | — | — | RW own | — | RW | — |
| Team workspace | RW own team | R own cohort | — | — | R assigned teams | R (agg) | — |
| Feedback thread | RW own team | R own cohort | — | — | RW assigned | — | — |
| Submission | RW own team | R own cohort | R (agg) | R own challenge, anonymised | R, blind until scores lock | R | — |
| Scores | R own, after release | R own cohort | R (agg) | R own challenge, anonymised | RW own | R | — |
| Passport entry | R own; share | R cohort, if consented | R (agg) | R if shared by the student | R entries I assessed | RW (second approval) | — |
| Opportunities | R; apply | R | R | RW own | — | RW | R open board |
| Impact Ledger | R own | R cohort | R own institution | R own organisation | R own hours | RW | R public totals |
| Calendar | R | RW own campus | RW own | RW own | R | RW | R public |
| Consent records | RW own | — | — | — | — | R (compliance) | RW own |
| Audit log | — | — | R own institution | R own organisation | — | R | — |

### 9.1 Business rules (build each as a pure function with tests)

| ID | Rule | Plain words |
|---|---|---|
| **R1** | Blind-first | Assessors see no names or institutions until all their scores are locked |
| **R2** | Two-person approval | A Passport entry is Verified only after an assessor’s scores are locked and a steward approves. Neither can edit the other’s part |
| **R3** | Student controls sharing | Employers see a Passport entry only if the student shares it. Sharing can be revoked at any time |
| **R4** | Small groups stay hidden | Aggregates hide any group smaller than 5 |
| **R5** | Conflicts | A person who mentored a team does not score it. An assessor does not contact candidates until scores are locked and the student shares |
| **R6** | NDA-safe before publishing | A brief cannot move from Draft to Shaped until the NDA-safe check passes (no personal data, no confidential data, sanitised examples, IP terms chosen) |
| **R7** | AI-use declaration | A submission cannot be submitted without one |
| **R8** | Everything is logged | Every state change writes an audit entry |

---

## 10. Screens and routes (Phase 1)

| Route | Screen | Roles | Features |
|---|---|---|---|
| `/` | Verdict (is it worth building) | All | Gates, evidence table |
| `/model` | The model, loop, workflows, coverage | All | Section 4, 7, 13 |
| `/choose` | Access chooser | All | Persona cards, access summary |
| `/w/[role]` | Role home: journey path (8 stages), current stage, featurettes, hand-offs, simulated screen | By role | Section 5 |
| `/lexicon`, `/lexicon/[slug]` | Capability list and detail | All | F-ID-07, F-ID-02 |
| `/demand` | Demand Map and intake form | Industry, Steward | F-ID-05, F-ID-06 |
| `/challenges`, `/challenges/[id]` | Library, brief, status | By role | F-AP-07, F-AP-09 |
| `/teams/[id]` | Workspace, milestones, decision log, thread | Student, Mentor, Faculty | F-AP-01, F-AP-02, F-ME-02 |
| `/sprints` | Mentor sprint booking and hours | Student, Mentor | F-ME-01, F-ME-04 |
| `/submit/[teamId]` | Submission pack | Student | F-SO-01, F-GV-04 |
| `/assess/[dayId]` | Blind scoring screen | Mentor & assessor | F-VA-03, F-VA-04 |
| `/passport/[id]` | Public verification page (works without sign-in) | Anyone with the link | F-VA-08 |
| `/opportunities` | Board and shortlist | Student, Industry, Open | F-OP-01, F-OP-04 |
| `/calendar` | Joint Design Calendar (real) | All | F-CO-01 |
| `/impact` | Impact Ledger | By role | F-OP-05, F-OP-06 |
| `/provisions` | Provisions board | All | F-GV-05 |

**Header on every screen:** UMO logo, role badge, “Simulated” banner when the screen uses mock data.
**Footer on every screen:** “UMO Design Foundation · LEAD” and a small UXINDIA mark.

---

## 11. Seed data

Use only synthetic names. Never real people or real companies.

### 11.1 Organisations and people (fictional)
- Institutions: Campus A, Campus B, Campus C.
- Companies: Northwind Bank, Harbor Logistics, Lumen Health.
- UMO: the steward team.
- Create at least 3 students per campus, 2 faculty, 1 institution head per campus, 2 industry leaders per company, 6 mentors, 2 stewards, 3 open members.

### 11.2 Lexicon seed (from the room; all definitions are DRAFT for co-signing)
The room carried ten rows to the Venn and the chart. An eleventh, Awareness, did not travel; keep it, marked “not yet carried”.

| Capability | Draft definition | Room position |
|---|---|---|
| Trust and Compliance | Working within the rules that make professional work trustworthy: consent, confidentiality, IP and regulation | Hub · Do First |
| Job Ethics | Making and defending choices that stay honest about their effect on users, colleagues and employers | Hub · Do First |
| Economic Constraint | Designing within real budgets, timelines and commercial limits | Hub · Plan For |
| Soft-skills + Ownership | Communicating, collaborating and taking responsibility for the outcome | College axis · Do First |
| Accountability | Owning decisions and their consequences, including when they are challenged | College axis · Do First |
| Industry Training | Structured learning from employers’ own practice, paid for and shaped with them (as a function of RoI) | Employer side · Plan For |
| Employment Opportunity + Cross-Pollination | Real chances to work on live problems, and movement of people and ideas between campus and industry | Employer side · Quick Wins |
| Placements | Getting graduates into roles that fit what they can show | Employer side · Plan For |
| Fluency | Working fluently through the design process and its tools, and picking up new ones fast | College axis · Do First |
| Design Decision Training | Practising how to make a design decision, record why, and defend it to others | College axis · Do First |
| Awareness | Knowing what roles, careers and options exist | Not carried |

Also seed these from the Bud column: Problem framing, Critical AI literacy, Industry-taught credit window, Upskilling people in the industry.

### 11.3 Default rubric (proposal; faculty and assessors change it)

| Criterion | Weight |
|---|---|
| Framing the problem | 25% |
| Defending a decision | 25% |
| Business context | 20% |
| Working with others and ownership | 10% |
| Ethics and compliance | 10% |
| Craft and fluency | 10% |

Levels: four plain descriptors per criterion (for example: Not yet / Developing / Secure / Strong).

### 11.4 Challenge seeds
1. Northwind Bank: “Reduce drop-off in onboarding.” Capability: Framing the problem, Defending a decision.
2. Harbor Logistics: “Make dispatch exceptions understandable to a new hire.” Capability: Business context, Fluency.
3. Lumen Health: “Explain a lab result to someone who is anxious.” Capability: Ethics and compliance, Soft-skills.

Write each as a one-page brief: context, the problem as the company sees it, what “solved” means, constraints, sanitised data note, assessor seats offered.

---

## 12. Measurement: the Impact Ledger

### 12.1 Headline metric
**Industry problems solved.** Definition (proposal): a challenge is counted as *solved* when the sponsoring company’s named owner confirms, in the ledger, that at least one submission meets the success criteria written in the brief. A challenge can be *partly solved* (counted separately) or *not solved*. Each challenge is counted once.

### 12.2 Supporting measures

| Measure | Definition | Source |
|---|---|---|
| Challenges posted / live / closed | Count by state | `challenge` |
| Verified Passport entries | Entries in Verified or Shared state | `passport_entry` |
| Shortlisted, hired or deployed | Applications and outcomes tied to a Passport | `application`, `outcome` |
| Mentor hours | Sum of completed session minutes ÷ 60 | `session` |
| Faculty hours | Hours logged in residencies and co-mentoring | |
| Calendar touchpoints booked | Events on the Joint Design Calendar with industry and campus both attending | `calendar_event` |
| Median days, intake to live challenge | Speed of the supply side | `demand_signal`, `challenge` |
| Assessor agreement | Spread between assessors’ scores per submission | `score` |

### 12.3 Future Skills Index (concept only; label it “concept” in the UI)
For each capability: **demand** (employer asks in the period) against **supply** (Verified entries at level 3 or above). Show the gap as a ratio. Do not claim it is validated. Show it only as a view in Phase 1, with seeded data.

### 12.4 Reports
- **Day 30 report** (for the 26 Oct sync): challenges live, problems solved, Verified Passports, mentor hours, gate status.
- **Day 90 report:** the same, plus gate results and a recommendation to stay manual, build thin v1, or commission the platform.
- Hide any group smaller than 5 (rule R4).

---

## 13. Coverage of the shortlist (nothing dropped)

### 13.1 Platform features

| Shortlist item | Where it lives |
|---|---|
| Student access | Role: Student |
| Faculty access | Role: Faculty |
| Curriculum integration | F-AP-03 |
| Industry Challenges | F-AP-01, F-AP-07, F-AP-09 |
| Illustrated Industry Challenge framework | Challenge brief template (11.4, 15.2) |
| Faculty development | F-LE-03 |
| Industry mentors | F-ME-01, F-ME-05 |
| Skills Passport | F-VA-08 |
| Industry assessment days | F-VA-01, F-VA-03 |
| Placement readiness | F-OP-03 |
| LEAD Skills Opportunity Map | F-ID-06 (Demand Map) |
| High-demand and underserved capability areas | Demand Map filters |
| Industry × Academia partnership model | F-AP-06 plus the Codex |
| Skills and outcomes measurement framework | Section 12 |
| LEAD Future Skills Index concept | 12.3 |
| “How many industry problems were solved?” | 12.1 |

### 13.2 Programme documents (not platform features)
UMO produces these as the 30-day sync pack: executive summary and strategic proposition; proposed flagship initiatives; 12-month implementation roadmap; strategic positioning and validation study; premium institutional visual treatment.

### 13.3 Bundle overlays
- **1 Million Women:** a cohort overlay available at any stage, with its own funding and metrics.
- **Design Pitch:** a showcase module at CONNECT.

---

## 14. Provisions (reserved slots)

Things that are easy to miss and costly to bolt on later. Seed all of these in the Provisions board. Status is *Reserved* or *Needs an owner*.

| # | Item | Why it matters | Plugs into | Status |
|---|---|---|---|---|
| 1 | Student data and consent | Outcomes are shared with employers. Rules on consent, retention and sharing must exist before any Passport does. **Check against India’s data protection law with counsel.** | Codex | Needs an owner |
| 2 | IP and NDA for challenge work | Who owns a student’s solution to a company’s problem? | Codex · APPLY | Needs an owner |
| 3 | Mentor and assessor economics | Honoraria or credit, conflict rules, quality control | MENTOR · VALIDATE | Reserved |
| 4 | Faculty workload credit | Faculty time must count somewhere | Faculty Toolkit | Needs an owner |
| 5 | Equity of access | Tier-2 and tier-3 campuses, scholarships, low bandwidth, regional languages, accessibility | Open tier | Reserved |
| 6 | Credit recognition | The industry-taught credit window and NEP credit structures | Faculty Toolkit | Needs an owner |
| 7 | AI-use policy | How AI may be used in challenges, and how it is assessed | Codex | Reserved |
| 8 | Beyond design | “Core is dying: pie-shaped and inter-disciplinary.” Extend the Lexicon to product, engineering, business | Lexicon | Reserved |
| 9 | Awareness | The row that did not travel. Career-path awareness belongs in the open tier | Open tier | Reserved |
| 10 | 1 Million Women initiative | A cohort overlay with its own funding and metrics | Cohort overlay | Reserved |
| 11 | Design Pitch | A showcase module | CONNECT | Reserved |
| 12 | Funding model | Campus fee band (untested), pooled industry fund, sponsored challenges. No industry-side price exists | Memberships | Needs an owner |
| 13 | Alumni loop | What happens after the hire? Feed outcomes back into the Demand Map | Impact Ledger | Reserved |

Users can add their own items (title, note, plugs-into). In Phase 1 store them in the database; no browser-only storage.

---

## 15. LEAD Loop v0: the manual kit (no software)

Build alongside Phase 1. This is how the gates get tested. Claude Code can generate the templates as Markdown or spreadsheets.

### 15.1 Joint Design Calendar
One shared calendar (any tool). Fields: title, date and time, kind (industry circle, guest session, assessment day, challenge milestone), host, who should attend, link. Everything the room wanted (“regular virtual meetings”) goes here first.

### 15.2 Challenge intake and brief
**Intake form fields:** company, contact, capability needed (from the Lexicon), the problem in your words, need-by date, is any data or IP sensitive (yes/no), assessor seats you can offer, mentor hours you can offer.
**One-page brief template:** context; the problem as the company sees it; what “solved” means (success criteria); constraints; sanitised data note; deliberate ambiguity note; assessor seats; IP terms chosen.

### 15.3 Skills Passport (spreadsheet)
Columns: passport_id, student (initials or code), campus, challenge, capability, level (1–4), assessor, approver, verified (Y/N), shared with employer (Y/N), date, evidence link. A second person approves before “verified” turns Y.

### 15.4 Mentor sprint
Sign-up sheet with: mentor, capability, hours offered, team assigned, three session dates, hours logged.

### 15.5 Assessment day run sheet
Rubric (11.3) circulated in advance; blind scoring sheet; scores locked before names are shown; moderator notes on spread; second approval; results sent.

### 15.6 Gate tracker (one sheet)
Rows G1–G5. Columns: target, count so far, evidence link, date, owner, status.

---

## 16. Design system

### 16.1 Brand rules
- **UMO is the dominant brand.** Logo top-left of the header, large. UXINDIA appears small in the footer. Conference and LEAD marks are subtler still.
- Use the logo files as supplied. Do not redraw or recolour them. UMO’s logo sits on a white tile in dark theme.
- No stock portraits unless captioned “Illustrative · not the person”. Credit every Unsplash photographer.

### 16.2 Tokens

| Token | Light | Dark |
|---|---|---|
| Background | `#FFFFFF` | `#14110F` |
| Ink (headlines) | `#1A1614` | `#F3EEE9` |
| Body text | `#46403D` | `#CFC8C2` |
| Muted | `#8A817C` | `#9A918B` |
| Hairline | `#E2DCD6` | `#37312D` |
| Panel | `#F6F2EF` | `#1E1A18` |
| UMO indigo (accent) | `#363A97` | `#9AA0F4` |
| UMO cyan (highlight) | `#06B2F6` | `#38C2FA` |
| Flag red (used sparingly) | `#F94746` | `#FF6B6A` |
| Tint, indigo | `#EEEFF8` | `#22244A` |
| Tint, cyan | `#E6F6FE` | `#10303F` |
| Tint, warning | `#FDECEC` | `#3A1D1D` |
| Positive | `#E4F4EA` on `#1F7A45` | `#143323` on `#6FD39A` |

Dark is the reference design for screenshots; light must also pass.

### 16.3 Type
- **Space Grotesk** (500, 700): headlines, big numbers, card titles.
- **Roboto** (400, 500, 700): body and tables.
- **Roboto Mono** (400, 500, 700): small caps labels, chips, table headers, eyebrows (uppercase, letter-spaced).
- Body 15px, line height 1.5. Minimum touch target 44px.

### 16.4 Components to build once and reuse
Header with logo and role badge; tab bar; verdict banner; evidence table with Supports / Challenges / Neutral chips; gate checklist with meter; Replicate / Adapt / New chips; eight-stage loop strip; journey path (stages the role touches are active); featurette card (name, what it does, mode chip, “Answers:” evidence line); simulated screen frame (dark title bar with a SIMULATED tag); hand-off chips; access panel (Sees / Can do / Cannot); provisions card; calendar list.

### 16.5 Copy rules
- Plain words and short sentences. Hard, sharp, focused. No filler, no emojis.
- Say what the room said, in its words, with the source.
- Label anything simulated.
- Never use “SFIA” or “LUMA”.

### 16.6 Accessibility and reach
WCAG 2.2 AA. Full keyboard use. Visible focus. Reduced-motion respected. Works on a slow mobile connection (keep the first load light). Set up text so regional languages can be added later (a simple dictionary file; English first). Use a font stack that falls back to a face with Indic-script coverage.

---

## 17. Quality, tests and acceptance

### 17.1 Unit tests (Vitest), one file per rule
- R1: an assessor cannot read a submission’s team or institution while any of their scores is unlocked.
- R2: a Passport entry cannot become Verified without locked scores and a steward approval; the assessor cannot approve their own entry.
- R3: an employer cannot read an unshared entry; revoking sharing removes access immediately.
- R4: an aggregate over fewer than 5 records returns “hidden”.
- R5: a mentor cannot score their own team; an assessor cannot contact a candidate before scores lock and sharing.
- R6: a brief cannot move to Shaped without all NDA-safe checks.
- R7: a submission cannot be submitted without an AI-use declaration.
- R8: every state change creates an audit entry with before and after.
- State machines: illegal transitions throw.

### 17.2 End-to-end scenarios (Playwright)

| # | Scenario | Pass when |
|---|---|---|
| S1 | Industry leader submits an intake; steward merges and publishes it | The theme shows on the Demand Map for students |
| S2 | Steward shapes a brief and matches it to Campus A; faculty maps it to a module | Challenge is Live and visible to Campus A students only |
| S3 | A student team opens a workspace and logs three decisions | Entries appear in the log; the thread is private to the team and mentor |
| S4 | Team books and completes three mentor sprints | Sprint is Complete; hours appear in the mentor’s ledger |
| S5 | Team submits with an AI-use declaration | Submission is In scoring |
| S6 | Two assessors score blind; scores lock | Names stay hidden until lock; spread is shown |
| S7 | Steward gives second approval; student shares | Verification link works signed out; employer can see the entry |
| S8 | Employer shortlists; the outcome is recorded; sponsor confirms | Impact Ledger shows 1 problem solved and the hire |
| S9 | Switch to each of the seven roles | Each sees only what section 9 allows |
| S10 | Add a provision | It appears on the board and survives a reload |

### 17.3 Milestone acceptance lists
Tick every box before moving on. Each milestone ends with a short demo and a note.

---

## 18. Build order and first prompts

### 18.1 Milestones (Phase 1)

| M | Milestone | Done means |
|---|---|---|
| **M0** | Repo, tokens, fonts, logos, theme switch, header and footer | Light and dark render; UMO logo large, UXINDIA small; lint and typecheck pass |
| **M1** | Port the explorer: verdict (`/`), model (`/model`), access chooser (`/choose`), role home (`/w/[role]`) from static data | All seven roles walk their journeys; hand-offs switch role and stage; matches the reference |
| **M2** | Database, seed, rules R1–R8 with tests | `npm test` green; seed runs; audit log writes |
| **M3** | Real flows: intake → brief → challenge → team → sprints → submission | S1–S5 pass |
| **M4** | Blind scoring, Passport, public verification, shortlist, Impact Ledger | S6–S8 pass |
| **M5** | Joint Design Calendar (real), Provisions board (real), Lexicon pages | S10 passes; calendar create, edit, list work |
| **M6** | Demo script, role-access check, accessibility pass, preview deploy behind a password | S9 passes; 10-minute demo runs clean on a phone |
| **M7–M9** | Admin and pricing module (see the addendum, A16) | S11–S20 pass |

### 18.2 Demo script for the 26 Oct sync (10 minutes)
1. Verdict screen: “Worth testing, not yet worth building.” Tick the gates.
2. Model screen: the IxDF skeleton and what LEAD adds.
3. Access chooser: pick Industry leader; submit an intake.
4. Switch to Steward: shape and match the brief.
5. Switch to Student: join the challenge, log a decision, book a sprint.
6. Switch to Mentor & assessor: score blind.
7. Switch to Steward: second approval.
8. Switch to Student: share the Passport; open the verification link signed out.
9. Switch to Industry leader: shortlist; see problems solved.
10. Provisions board: add one item live. Close on the three open gates.

### 18.3 First prompts for Claude Code
1. “Read CLAUDE.md and docs/SPEC.md. Summarise Phase 1 scope, the out-of-scope list and the eight rules in your own words. Do not write code yet.”
2. “Do M0. Show me the header and footer in light and dark, then stop.”
3. “Do M1 using docs/reference/LEAD_Platform_Model_Explorer.html as the reference. Move the data into typed files under src/data. Stop when all seven roles work.”
4. “Do M2. Write the tests for R1–R8 first, then the code.”
Continue one milestone at a time.

### 18.4 Optional: photography
If you want stock photography, add the Unsplash connector in Claude Code (`claude mcp add --transport http unsplash https://mcp.unsplash.com/mcp`, then `/mcp` to sign in). Credit photographers on screen. Caption portraits “Illustrative · not the person”.

---

## 19. Decisions only people can make

| # | Decision | Who |
|---|---|---|
| 1 | Final gate numbers and dates | Madhukar Joshi, Kaladhar Bapu |
| 2 | UMO as steward (G5) | Kaladhar Bapu |
| 3 | Who validates the first Passports, and on what authority | UMO with the first employers |
| 4 | Mentor and assessor economics: paid, credited, or both | UMO, industry sponsors |
| 5 | Fee band and any industry-side price | Madhukar Joshi, UMO |
| 6 | IP terms for challenge work | Counsel |
| 7 | Student data and consent under India’s data protection law | Counsel |
| 8 | Stipend rule for internships (a field exists; the policy does not) | UMO, employers |
| 9 | Whether 1 Million Women and Design Pitch bundle at launch or later | Madhukar Joshi, Kaladhar Bapu |
| 10 | Product name, domain and hosting for Phase 2 | UMO |

---

## Appendix A. The room’s evidence (traceability)

Source: LEAD Commons Report-Out v1.04. Counts are from the photographs of the walls.

### A.1 Learn (Rose, Thorn, Bud)

| Column | Prepared from the 23 Sep academia call | After the room | Added |
|---|---|---|---|
| Rose | 6 | 6 | 0 |
| Thorn | 10 | 23 | 13 |
| Bud | 3 | 6 | 3 |
| **Total** | **19** | **35** | **16** |

Additions to Thorn cluster in three groups: readiness (5), “what is core?” (4), domain and breadth (4).

### A.2 Educate: the eleven rows
Employment Opportunity + Cross-Pollination · Fluency · Design Decision Training · Job Ethics · Economic Constraint · Soft-skills + Ownership · Accountability · Trust and Compliance · Industry Training · Placements · Awareness.
Fluency and Design Decision Training were on the rail before Part 2 opened. Awareness did not travel to the Venn or the chart. The 1–7 level grid was left unmarked.

### A.3 Advance: the Venn (ten cards)
Distance is from the hub in lens radii (± 0.1). Nearer the centre means more imperative, by the room’s own rule.

| Rank | Card | r | Zone | Quadrant |
|---|---|---|---|---|
| 1 | Trust and Compliance | 0.11 | Hub | Do First |
| 2 | Job Ethics | 0.29 | Hub | Do First |
| 3 | Economic Constraint | 0.33 | Hub | Plan For |
| 4 | Soft-skills + Ownership | 0.46 | College axis | Do First |
| 5 | Accountability | 0.71 | College axis | Do First |
| 6 | Industry Training (as a function of RoI) | 0.79 | Employer side | Plan For |
| 7 | Employment Opportunity + Cross-Pollination | 0.90 | Employer side | Quick Wins |
| 8 | Fluency † | 0.97 | College axis | Do First |
| 9 | Placements | 1.19 | Employer side | Plan For |
| 10 | Design Decision Training † | 1.34 | College axis | Do First |

† On the rail before Part 2 opened.
Mean r: hub 0.24 (n 3), College axis 0.87 (n 4), Employer side 0.96 (n 3), all ten 0.71.
UXINDIA Chair and Wider Audience held no cards.
Inside Do First, the Venn distance and the chart’s vertical order rank the six cards in exact reverse (ρ = −1.0).

### A.4 Design: the chart
- **Do First:** Design Decision Training, Fluency, Accountability, Soft-skills, Job Ethics, Trust and Compliance, plus the note “What do you measure??”
- **Plan For:** Industry Training (as a function of RoI), Placements, Economic Constraint.
- **Quick Wins:** Employment Opportunity + Cross-Pollination.
- **Park For Later:** empty.

### A.5 Concept poster
Filled: the timeline: “30 days → 90 days → regular virtual meetings. First touchpoint at 30, then we meet further in 90 days.” Blank: Why might it fail? What can we prototype and test? How will we measure success? One concrete idea: a joint Design Calendar.

---

## Appendix B. IxDF reference (as read on ixdf.org, October 2026)

- **About:** a global design education institution, founded in 2002; the page reported 1,150,763 enrollments and local chapters in 497 cities across 106 countries.
- **FAQ:** all courses are self-paced and online; Company Memberships exist for teams; Local Group meetups run in 450+ cities.
- **Open library:** a free compendium of design articles and videos; free toolkits for educators.
- **Credentials:** member pages show a Membership Certificate with a permanent link and ID that third parties can verify, a list of Distinctions (for example Certified, Top 10%, Assiduous, Community Influencer, Community Explorer, Local Group Member, Master), and Course and Master Class certificates awarded “to the standards established by the IxDF Educational Codex”.

These are product-structure notes for modelling, not endorsements. Do not copy IxDF’s content, branding or wording.

---

## Appendix C. Glossary

| Term | Meaning |
|---|---|
| LEAD | The initiative that connects classrooms and workplaces, carried by UMO Design Foundation |
| Steward | The UMO role that hosts the loop between meetings |
| Lens | One of five owners on the Venn: College, Joint Project, Employer, UXINDIA Chair, Wider Audience |
| Hub | The centre of the Venn, where something is owned by all lenses at once |
| Challenge | A real, scoped industry problem taken into a term |
| Mentor sprint | Three 45-minute sessions between a team and a mentor |
| Passport | A student’s verified, shareable evidence of what they can do |
| Blind-first | Scoring before the assessor sees names or institutions |
| Codex | The platform’s rules for quality, consent, IP and ethics |
| Impact Ledger | The record of problems solved and verified outcomes |
| Gate | A test that must pass before the next phase is built |
| FDP | Faculty Development Programme |
| NEP | National Education Policy |
