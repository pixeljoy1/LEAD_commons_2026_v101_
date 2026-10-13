# LEAD service model

**Owner:** UMO Design Foundation · **Version:** 0.4 · **Prepared:** 13 October 2026
**Companion to:** `docs/SPEC.md` and `docs/SPEC-ADDENDUM-01.md` (the addendum wins on conflict).
**Interactive version:** `prototype/index.html` (open it from a local server; see "Run it" below). The **Model** screen is this document as a working map.

LEAD is a loop where each party gives what it has and gets what it lacks. Industry gives real problems and gets proven capability. Campuses give time and talent and get outcomes they can defend. UMO hosts the loop and proves it works. If any party gets less than it gives, the loop stops. This model is built to show that balance, and when each part of it becomes real.

---

## 1. Parties

| Party | Lens (26 Sep Venn) | Gives | Gets | Stays because | Risk |
|---|---|---|---|---|---|
| Student | College | Work, a decision log, consent to share | Real problems, mentors, a Passport employers trust, a way to a role | Evidence beats a transcript when 40% are not placed | Thin challenges make the Passport mean little |
| Faculty | College | A module slot, co-mentoring, rubric input | Live industry input without a course rewrite, workload credit | The kit fits the existing curriculum and credit window | Without workload credit, faculty time is invisible |
| Institution head | College | Licence fee, a faculty lead, a term slot | Outcomes for accreditation and placement | Outcomes are measurable and defensible against the fee band | ₹5–15 lakh band is untested (G2) |
| Industry Challenge | Joint Project | A real, scoped problem | Solutions and a problems-solved record | Both lenses own it | NDAs block real cases unless shaped (R6) |
| Industry leader | Employer | Problems, assessors, sponsorship | A capability built, verified candidates, problems solved | Pooled sponsorship and early talent access | Willingness to pay unproven (G1, G3) |
| Mentor & assessor | Employer | Hours, feedback, blind scores | Recognition, distinctions, a credit model | Time-boxed sprints fit a calendar; every hour counts | Good practitioners cost money (G4) |
| UMO steward | UXINDIA Chair | Shaping, matching, integrity, reports | A mandate, fees that fund the loop, proof | The Chair lens held no cards; someone must host the loop | No custody (G5), nothing runs between meetings |
| Open community | Wider Audience | Attention, participation, consent | Plain definitions, Circles, an on-ramp | Free to start; fills the empty Wider Audience lens | Without an owner the open tier stays empty |

**Connected services (link out, do not duplicate):** UMO Design School (courses, certification, scholarships), UMO Mentors & Catalysts (seeds the mentor pool, by consent), UXIN (general jobs), UXINDIA (stage for Design Pitch, reserved).

## 2. Value flows

Eight kinds of value move through the service: **money, problems, capability, evidence, talent, time, recognition, consent and data**. The 24 flows below are the blueprint. States per phase: **Manual** (people and spreadsheets), **Sim** (in the clickable prototype), **Real** (in software), **—** (not yet), **Res.** (reserved).

| # | From → To | Kind | Flow | Stage | Loop v0 | Phase 1 | Thin v1 | Platform |
|---|---|---|---|---|---|---|---|---|
| 1 | Industry → Steward | Problems | Capability need (intake) | IDENTIFY | Manual | Sim | Real | Real |
| 2 | Steward → Challenge | Problems | Shaped, NDA-safe brief (R6) | APPLY | Manual | Sim | Real | Real |
| 3 | Challenge → Student | Problems | Live challenge in a term | APPLY | Manual | Sim | Real | Real |
| 4 | Faculty → Challenge | Capability | Mapped into a module | APPLY | Manual | Sim | Real | Real |
| 5 | Mentor → Student | Time | Mentor sprints, 3 × 45 min | MENTOR | Manual | Sim | Real | Real |
| 6 | Student → Assessor | Evidence | Submission pack with AI-use declaration (R7) | SOLVE | Manual | Sim | Real | Real |
| 7 | Assessor → Steward | Evidence | Locked blind scores (R1, R5) | VALIDATE | Manual | Sim | Real | Real |
| 8 | Steward → Student | Evidence | Verified Passport entry (R2) | VALIDATE | Manual | Sim | Real | Real |
| 9 | Student → Industry | Consent | Passport, shared by choice (R3) | DESIGN JOB | Manual | Sim | Real | Real |
| 10 | Industry → Student | Talent | Role or internship with learning contract | DESIGN JOB | Manual | Sim | Real | Real |
| 11 | Steward → Industry | Evidence | Problems solved (Impact Ledger) | DESIGN JOB | Manual | Sim | Real | Real |
| 12 | Steward → Inst. head | Evidence | Outcomes view, groups under 5 hidden (R4) | VALIDATE | Manual | Sim | Real | Real |
| 13 | Inst. head → Steward | Money | Campus licence | APPLY | — | Sim | Manual | Real |
| 14 | Industry → Steward | Money | Membership and sponsorship | APPLY | — | Sim | Manual | Real |
| 15 | Industry → Mentor | Time | Assessor seats | VALIDATE | Manual | Sim | Real | Real |
| 16 | Steward → Mentor | Recognition | Hours ledger and distinctions | MENTOR | Manual | Sim | Real | Real |
| 17 | Mentor → Faculty | Capability | Practitioner sessions, residencies | LEARN | Manual | Sim | Real | Real |
| 18 | Steward → Open | Capability | Lexicon, Circles, open cohort | CONNECT | — | Sim | — | Real |
| 19 | Open → Steward | Consent | Joins with consent | CONNECT | — | Sim | — | Real |
| 20 | UMO Design School → Student | Capability | Course content (link out) | LEARN | Manual | Sim | Real | Real |
| 21 | Mentors & Catalysts → Mentor | Time | Seeds the mentor pool | MENTOR | Manual | Sim | Real | Real |
| 22 | UXIN → Open | Talent | General jobs (link out) | DESIGN JOB | Manual | Sim | Real | Real |
| 23 | UXINDIA → Industry | Recognition | Design Pitch stage | CONNECT | — | — | — | Res. |
| 24 | Industry → Open | Money | Scholarship and gift match | LEARN | — | — | — | Res. |

**Two layers run under every flow:** the **Codex** (consent, IP and NDA, ethics, assessor conflicts) and the **Impact Ledger** (problems solved, verified outcomes), which feeds IDENTIFY.

## 3. Offers (what can be joined)

All prices are data in the plan registry, set by the UMO admin. Only the campus band is sourced; everything else is a demo value. **Mock pricing. Not an offer.**

| Plan key | Offer | Model | Seed price | Capacity |
|---|---|---|---|---|
| `CAMPUS_STANDARD` | LEAD Campus | Tiered by size, annual | ₹5,00,000 · ₹10,00,000 · ₹15,00,000 | 10 pilot campuses |
| `INDUSTRY_TEAM` | Industry Membership | Per seat, annual, min 2 | ₹40,000 a seat | 30 seats |
| `PATH_FRAMING`, `PATH_DECISIONS` | LEAD Paths | Per learner, per term | ₹12,000 a learner | 40 each |
| `SPONSOR_SINGLE` | Challenge Sponsorship | Per challenge | ₹2,50,000 | 6 challenges |
| `OPEN_FREE` | Open Community | Free | ₹0 | No cap |

Seed codes: `FOUNDING20` (20%, all), `PILOT50` (50%, campus), `STUDENT10` (10%, paths), `SPONSORFULL` (100%, waits for a second admin).

## 4. Lifecycle

| Phase | What runs | Gate to enter |
|---|---|---|
| **Loop v0 · manual kit** | Calendar, intake form, brief template, spreadsheet Passport, mentor group, assessment-day run sheet | None. Start now |
| **Phase 1 · clickable prototype** | This prototype: every journey clickable, seeded data, mock pricing. For the 26 Oct sync | None |
| **Phase 2 · thin v1** | Real accounts, one real loop, a handful of campuses and companies; fees invoiced by hand | 3–4 of G1–G5 |
| **Phase 3 · platform** | Memberships, open tier, Circles, Future Skills Index, scale | v1 results |

Gates: G1 Supply (3 companies, day 60) · G2 Demand (3 campuses, day 60) · G3 Trust (1 employer in writing, day 90) · G4 Mentor supply (10 practitioners × 4 h, day 90) · G5 Custody (UMO as steward, 26 Oct).

## 5. Where each part lives in the prototype

| Screen | Route | What it shows |
|---|---|---|
| Homepage | `#home` (`#model` redirects here) | The whole service model in plain language, student-first. See “Homepage sections” below |
| Verdict | `#verdict` | Gates with a live reading, the room's evidence, out-of-scope list, open decisions |
| Access chooser and role homes | `#choose`, `#w-student` … `#w-admin` | All eight roles: journey, simulated screens, hand-offs, Sees / Can do / Cannot |
| Working loop | `#demand`, `#challenges`, `#team`, `#sprints`, `#submit`, `#assess`, `#passports`, `#passport-<code>`, `#jobs`, `#impact` | W1–W7 end to end with rules R1–R8 |
| Community | `#lexicon`, `#calendar`, `#provisions` | Lexicon A–Z, Joint Design Calendar, Provisions board |
| Join | `#join`, `#join-college`, `#join-industry`, `#join-path`, `#join-sponsor`, `#join-open` | Five mock sign-up flows with live quotes, codes, availability and email preview |
| Admin | `#admin` | One page: pricing models (set a price, new version each time), coupons (second approval by a different admin), recent sign-ups. Choosing the Admin persona goes straight here. Simplified from addendum A11 on UMO's instruction: no separate dashboard, enumerations, banner or audit screens. The change log is the steward and admin `#audit` view |

## Homepage sections (v0.4)

The homepage is the model itself, written for anyone who lands on LEAD. About 90% of visitors are students, so the default path is a student's. Every section kept its content; the names changed.

| Order | Section on the page | Was |
|---|---|---|
| 1 | Do real design work before you graduate (hero, simulated numbers strip) | Exchange. (hero) |
| 2 | **Your path**: persona tabs and a vertical story from Week 1 to Month 3, current stage names kept | The eight-stage loop and the role homes |
| 3 | **Find your door**: six cards (Student, Faculty, College, Industry, Mentor, Just curious) with a photo, a live mock price and Join | The access chooser |
| 4 | **Who is in LEAD**: the interactive map, with a switch for how it runs (by hand today, in this prototype, first live pilots, full platform) | Ecosystem and Lifecycle switch |
| 5 | **What everyone gives and gets** | Value exchange |
| 6 | **Why people stay** | Retention |
| 7 | **Seven ways people work together** | Workflows W1–W7 |
| 8 | **Ways to join and what they cost** (live from the admin plan registry, mock prices) | Offers |
| 9 | **Where LEAD is today** and **Five checks before each next step** | Lifecycle and Gates |
| 10 | **Built on what already works** (IxDF is named only in the footer's About the model) | IxDF lineage |
| 11 | **Everything, in detail** (collapsed: all 24 exchanges by step) | Blueprint |
| 12 | **Questions people ask** | New |
| 13 | **Ready to start?** | New |

**Join sheet.** Every Join button opens one dialog that offers every route for the chosen role: free account, link my campus, or a Path for students; join through a campus or ask your college for faculty; a campus licence or a talk with UMO for colleges; membership, sponsorship or offering your own hours for industry; an application form for mentors. A mentor application appears in the steward's mentor pool, unverified, until the steward approves it.

**Photos.** People photos are illustrative Unsplash stock, shown in grayscale with an indigo and cyan tint and a checker corner, each captioned “Illustrative · not the person”. Photographers are credited in the footer. Each slot is a named file in `prototype/assets/photos/`, so any photo can be replaced with a real UMO or UXINDIA one.

**Header:** one lockup ("LEAD", "by", then the UMO Design logo), the nav, then one **Demo** button, the **persona menu** and **Join**. The persona menu holds the eight personas, the theme switch and Reset demo. **Demo runs by persona:** it walks the current persona through their own journey, one step per stage, and the last step hands off to the next persona (Industry, Steward, Student, Mentor, Faculty, Institution head, Open, Admin).

**Persistence:** nothing is permanent. Loop data lives in memory and resets on reload. The pricing slice is mirrored to local browser storage only so admin changes reach a second open tab; **Reset demo** clears it.

## 6. Run it

```bash
npm test              # 30 unit tests: A8.3 worked examples, R1–R17, state machines
npm run serve         # then open http://localhost:4173/prototype/index.html
npm run e2e           # Playwright: S1–S20 scenarios, all roles × all routes, 390px layout
npm run build:artifact  # one self-contained HTML file in prototype/dist/
```

## 7. Decisions only people can make

Final gate numbers (Madhukar Joshi, Kaladhar Bapu) · UMO as steward (Kaladhar Bapu) · who validates the first Passports (UMO with first employers) · mentor economics (UMO, sponsors) · real prices beyond the campus band (Madhukar Joshi, UMO) · whether LEAD Paths are sold in LEAD or through UMO Design School (UMO) · tax per plan type, refund windows, payment provider (finance, counsel) · IP terms and student data under India's data protection law (counsel) · coupon stacking, scholarships and gift matching (UMO, counsel).


## Round 4 additions (v0.5)

**Homepage carousel.** The first banner is a timed carousel of eight leaves: the idea (a guided story, no controls, 15 s), Student, Faculty, College, Industry, Mentor, Just curious, and 1 Million Women (7 s each). It pauses on hover, focus or any tap, has a pause button, and does not autoplay for reduced-motion users. Picking a role button unfolds "Your path" for that role below the carousel. The rest of the page does not change.

**1 Million Women in Design.** Its own page (`#women`) and top-menu item ("1M Women"). It is funded two ways. (1) An automatic share of every paid plan, default 5%, one admin setting (`womenSharePct`). It comes out of the price; nobody pays extra. (2) An optional top-up, "Add a seat for a woman", at a seat price held in data (`womenSeatPrice`). A running tally counts top-up seats and the seats the share buys, toward 1,000,000. The seeded starting count is made up and says so.

| Role | Link |
|---|---|
| Student | A "Join a women's circle" step in the path |
| College | Seat pledge at onboarding (`join-college`) |
| Industry | Sponsor a women's cohort of 10 seats (`join-sponsor`) |
| Mentor | Office hour or session for women designers |
| Faculty | Dedicated session in the studio |

New rules: R18 (share is 0 to 50 percent, whole or half, computed on the amount paid, round half up, zero on free plans) and R19 (top-up seats at the seat price, counted in the tally; a changed share or seat count re-quotes before confirm).


## Round 5 additions (v0.6): Learn, one admin role, women imagery

**Learn** is the first menu item and the main reason to enrol. It has a pinned start module, a shelf that changes with the persona, a filterable catalogue, and a "Teach, add and ask" section.

| Code | Meaning |
|---|---|
| `LM-SP-n` | Learning Module, self-paced, online. LM-SP-1 is the full demo course (3 one-page lessons and a 3-question check). |
| `LM-IL-n` | Instructor-led: taught live by a person, with seats. |
| `LM-PL-n` | Peer circle: led by a peer. |
| `LM-CB-n` | Inside a live challenge. |
| `LP-n` | Learning Path: a priced bundle of modules (price comes from the plan registry). |
| `TP-n`, `RQ-n`, `OF-n` | Open topic, request for learning, offer to teach. |

Giving back: mentors, company staff, faculty and college staff offer hours; students lead a peer circle after finishing a module; anyone proposes a topic or opens a request; others add "me too"; a teacher offers; a UMO admin approves and matches. Rules: R20 module codes, R21 progress (never backwards; done needs every lesson and a 2-of-3 check), R22 offers, requests and votes.

The Lexicon is now the **Skills Guide**, in plain words with four levels per skill, linked to the modules that teach it. **UMO steward** is folded into **UMO admin** (operations strip on the admin page). Not built yet: a Passport line for finished modules.


## Round 6 (v0.7): "What is in it for you"

The homepage map section (was "Who is in LEAD") now answers two questions: what is in it for me, and how the whole system works. The map drawing is unchanged. The big tab bar is replaced by a four-step control in the side panel, "When does this work?": **Today, by hand** · **In this demo** · **Next: first pilots** · **Later: the full platform**. The value chips read Money · Real problems · Skills and learning · Proof of work · Jobs and hiring · Hours given · Credit and thanks · Privacy and consent. A selected group shows "What they give", "What they get" and "Why they stay", and its button opens that role's path.


## Round 7 (v0.8): sign in, My path, and the route to a million

**Sign in and out.** The demo opens signed out: the public view, Join in UMO blue, and a "Sign in as…" menu. Picking a persona signs in. Log out replaces Join, and **My path** (Admin for UMO admin) appears in the top menu until Log out. Logging out returns to the homepage.

**1 Million Women: seats funded only, seeded at 12,341.**

| Source | Seeded | Grows when |
|---|---|---|
| Share of paid plans | 5,240 | Any paid sign-up (share ÷ seat price) |
| Top-up seats | 2,310 | A learner or company adds seats at sign-up |
| College pledges | 3,150 | A college pledges seats in its sign-up |
| Sponsored cohorts | 1,200 | A company sponsors a women's cohort (10 seats) |
| Hours given | 441 | A UMO admin marks a women's teaching offer Done (R23: 10 hours = 1 seat) |

The 1 Million Women page shows the count, the split by source, and one card per role with its running total and its real action. The photo is a vocational training class of women.


## Round 8 (v0.9): LEAD by UMO Design, Live Projects, one join flow, Design Jobs

**Name.** The product is **LEAD by UMO Design**: a LEAD wordmark, a small "by", then the UMO Design logo. "Commons" is retired.

**Live Projects.** Challenges are now **Live Projects**, with codes `PJ-n`. A six-step strip explains how one works, and each persona gets one first action. Routes are `#projects` and `#project-<id>`. The old `#challenges` routes still work. Sub-pages: My team, Mentor sessions, Hand in, Scoring.

**One join flow.** Every Join option for every persona goes to **Package details → Cart → Confirm**. Confirm signs you in as that persona and offers Go to My path and one next step. Personas: student (free account or a Path), faculty (free, through a campus), college (campus licence), industry (membership or sponsor a Live Project), mentor (free, unverified until a UMO admin approves), open learner (free). Nothing routes to Live Projects. Arriving on a join page from elsewhere starts at the package details.

**Design Jobs** (was Opportunities, `#jobs`, old `#opportunities` works). Four lanes. Each lane has two panels in the same order: who opens, then who responds.

| Lane | Opens | Responds |
|---|---|---|
| 1 Roles and internships | Industry | Students and open learners |
| 2 Campus hiring drives | Colleges | Industry accepts or declines |
| 3 Open-cohort calls | UMO admin | Open learners |
| 4 Referrals | Mentors and faculty | The student, then the employer |

The signed-in persona's own lanes come first, tagged Yours. Signed out shows all four read-only. **R24:** a referral stays private until the student confirms it. **R25:** a drive reply moves Pending to Accepted or Declined, and only the college that opened a drive can close it. Every action writes an audit entry.
