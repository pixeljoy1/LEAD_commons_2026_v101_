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
| 9 | Student → Industry | Consent | Passport, shared by choice (R3) | OPPORTUNITY | Manual | Sim | Real | Real |
| 10 | Industry → Student | Talent | Role or internship with learning contract | OPPORTUNITY | Manual | Sim | Real | Real |
| 11 | Steward → Industry | Evidence | Problems solved (Impact Ledger) | OPPORTUNITY | Manual | Sim | Real | Real |
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
| 22 | UXIN → Open | Talent | General jobs (link out) | OPPORTUNITY | Manual | Sim | Real | Real |
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
| Working loop | `#demand`, `#challenges`, `#team`, `#sprints`, `#submit`, `#assess`, `#passports`, `#passport-<code>`, `#opportunities`, `#impact` | W1–W7 end to end with rules R1–R8 |
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

**Header:** one lockup (UMO Design logo and "LEAD Commons"), the nav, then one **Demo** button, the **persona menu** and **Join**. The persona menu holds the eight personas, the theme switch and Reset demo. **Demo runs by persona:** it walks the current persona through their own journey, one step per stage, and the last step hands off to the next persona (Industry, Steward, Student, Mentor, Faculty, Institution head, Open, Admin).

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
