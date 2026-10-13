/* LEAD · static content transcribed from docs/SPEC.md and docs/SPEC-ADDENDUM-01.md. */
(function (root) {
  const LEAD = (root.LEAD = root.LEAD || {});

  /* ---------- the loop (§4.2) with UMO vocabulary tags (A2.3, proposal) ---------- */
  const stages = [
    { id: 'IDENTIFY', n: '01', module: 'Demand Map + Skills Guide', what: 'Industry states the capability it needs', umo: 'EXPRESS' },
    { id: 'LEARN', n: '02', module: 'Paths', what: 'Short modules, linked to a live project', umo: 'EXCEL' },
    { id: 'APPLY', n: '03', module: 'Live Projects', what: 'Real, scoped, NDA-safe problems taken into a term', umo: 'EXECUTE' },
    { id: 'MENTOR', n: '04', module: 'Mentor sessions', what: 'Time-boxed practitioner feedback', umo: 'EXPERTISE' },
    { id: 'SOLVE', n: '05', module: 'Hand-in', what: 'Team deliverable plus decision log', umo: 'EXECUTE' },
    { id: 'VALIDATE', n: '06', module: 'Assessment + Codex', what: 'Industry assessors score against a shared rubric', umo: 'EXCEL' },
    { id: 'CONNECT', n: '07', module: 'Chapters & Circles', what: 'Campus and industry meet on one calendar', umo: 'EXPERIENCE' },
    { id: 'GET OPPORTUNITY', n: '08', module: 'Opportunity Board + Impact Ledger', what: 'Hire or deploy, and count problems solved', umo: 'EXCEL' },
  ];

  /* ---------- features (§6, A14) ---------- */
  const F = (id, name, what, evidence, mode, pri) => ({ id, name, what, evidence, mode, pri });
  const features = [
    F('F-ID-01', 'Capability finder', 'Shows which capabilities employers asked for this term, in plain words', 'No clear statement of what industry needs now', 'Adapt', 'P0'),
    F('F-ID-02', 'Readiness profile', 'One page defining Day 1 readiness, co-signed by industry and academia', '“Day 1 readiness” defined by neither side', 'New', 'P0'),
    F('F-ID-03', 'Syllabus gap check', 'Upload a syllabus; see which in-demand capabilities it leaves uncovered', '4-year syllabus, unknown future', 'New', 'P0 (mock)'),
    F('F-ID-04', 'Institution gap report', 'Demand against curriculum across programmes', '4-year syllabus, unknown future', 'New', 'P0 (mock)'),
    F('F-ID-05', 'State your capability need', 'Five-minute intake: what you need built, by when', '“We told LEAD what capability we needed.”', 'New', 'P0'),
    F('F-ID-06', 'Demand Map curation', 'UMO admin merges intakes into themes and publishes the Skills Opportunity Map', 'High-demand and underserved areas', 'New', 'P0'),
    F('F-ID-07', 'Skills Guide', 'Plain definitions of capabilities and the roles they lead to', '“What is core?”', 'Replicate', 'P0'),
    F('F-LE-01', 'Path linked to a live project', 'Only the modules the live project needs', 'Tools taught in Y1, gone by Y4', 'Adapt', 'P0 (mock)'),
    F('F-LE-02', 'Fundamentals shelf', 'Stable basics kept apart from tool training', 'Strong fundamentals while being able to adapt', 'Replicate', 'P0 (mock)'),
    F('F-LE-03', 'Faculty residency', 'Faculty development tied to a live project', '“We all do FDPs… the gap remains”', 'Adapt', 'P1'),
    F('F-LE-04', 'Practitioner sessions', 'Industry leaders teach, one public talk a term', 'Faculty lose live industry contact', 'Replicate', 'P1'),
    F('F-LE-05', 'Open Paths', 'Self-paced modules, free to start', 'Equity of access', 'Replicate', 'P2'),
    F('F-AP-01', 'Live Project workspace', 'Team, milestones, a deliberately ambiguous brief', '“Solves the brief, can’t find the brief”', 'New', 'P0'),
    F('F-AP-02', 'Decision log', 'Record why you chose; defended at review', '“Can’t defend a design decision”', 'New', 'P0'),
    F('F-AP-03', 'Live Project-in-a-course kit', 'Fit a live project into an existing module, with credit-window mapping', 'Curriculum rigidity; NEP', 'New', 'P0 (mock)'),
    F('F-AP-04', 'NDA-safe case library', 'Sanitised real cases for teaching', 'NDAs block real case studies', 'New', 'P1'),
    F('F-AP-05', 'Cohort enrolment and term slots', 'Enrol cohorts, fix the term slot', 'Curriculum rigidity', 'New', 'P0 (mock)'),
    F('F-AP-06', 'LEAD Campus membership', 'Access by institution size. Band ₹5–15 lakh a year, untested', 'Madhukar’s note', 'Replicate', 'P2'),
    F('F-AP-07', 'Live Project sponsor desk', 'Shape a scoped, NDA-safe brief with the UMO team', 'Industry doesn’t give proper projects', 'New', 'P0'),
    F('F-AP-08', 'Pooled sponsorship', 'Companies share a live project’s cost', '“Why train someone for a competitor?”', 'Adapt', 'P2'),
    F('F-AP-09', 'Live Project shaping and matching', 'UMO admin makes briefs NDA-safe and scoped; matches to campuses', 'NDAs block real cases', 'New', 'P0'),
    F('F-ME-01', 'Mentor session', 'Three 45-minute sessions with an industry mentor', '“Never done full projects, requires mentoring”', 'New', 'P0'),
    F('F-ME-02', 'Private feedback thread', 'Feedback stays inside the team and assigned mentor', 'Trust and Compliance', 'New', 'P0'),
    F('F-ME-03', 'Co-mentoring', 'Faculty sit in on mentor sessions', 'Good practitioners cost money', 'New', 'P1'),
    F('F-ME-04', 'Hours ledger', 'Every mentor hour counted and recognised', '“Nobody volunteers”', 'New', 'P0'),
    F('F-ME-05', 'Mentor pool and credit ledger', 'Recruit, brief and recognise mentors', '“Nobody volunteers”', 'New', 'P0'),
    F('F-SO-01', 'Submission pack', 'Deliverable, decision log, reflection, AI-use declaration', 'Completes the loop', 'New', 'P0'),
    F('F-VA-01', 'Assessment day', 'Industry panel, rubric visible in advance, blind-first scoring', '“What do you measure??”', 'Adapt', 'P0'),
    F('F-VA-02', 'Rubric co-design', 'Faculty and assessors write the rubric together', '“What do you measure??”', 'New', 'P0 (mock)'),
    F('F-VA-03', 'Assessor seat', 'Industry assessors score blind against the shared rubric', '“What do you measure??”', 'New', 'P0'),
    F('F-VA-04', 'Blind-first assessment', 'Names and institutions hidden until scores lock', 'Trust and Compliance', 'New', 'P0'),
    F('F-VA-05', 'Conflict rule', 'No recruiting while assessing; no scoring a team you mentored', 'Job Ethics', 'New', 'P0'),
    F('F-VA-06', 'Codex and assessment integrity', 'Rubrics, conflicts, consent, two-person approval of Passport entries', 'Trust and Compliance; Job Ethics', 'Adapt', 'P0'),
    F('F-VA-07', 'Outcomes view', 'Validated Passports per cohort, no student names', '“What do you measure??”', 'New', 'P0 (mock)'),
    F('F-VA-08', 'Skills Passport entry', 'Verifiable link and ID, evidence attached, student-controlled sharing', 'Employers need evidence they trust', 'Adapt', 'P0'),
    F('F-CO-01', 'Joint Design Calendar', 'One calendar of industry and campus touchpoints', 'The room’s joint Design Calendar', 'Adapt', 'P0'),
    F('F-CO-02', 'Industry circle', 'Employers meet campus faculty on the shared calendar', 'Cross-pollination', 'Adapt', 'P1'),
    F('F-CO-03', 'Distinctions', 'Recognition for hours and sessions', 'Recognition without cost', 'Adapt', 'P2'),
    F('F-CO-04', 'Circles and Chapters', 'Local and online groups', 'Cross-pollination', 'Adapt', 'P2'),
    F('F-OP-01', 'Opportunity board', 'Roles and internships tied to verified evidence', 'Why is 40% not placed?', 'New', 'P0'),
    F('F-OP-02', 'Learning contract', 'Internships carry a mentor, a learning plan and a stipend field', 'Internships are seen as cheap labour', 'New', 'P0'),
    F('F-OP-03', 'Placement readiness view', 'Verified readiness against open roles', 'Why is 40% not placed?', 'New', 'P0 (mock)'),
    F('F-OP-04', 'Verified shortlist', 'Candidates with evidence attached, shared by the students', 'Employers need evidence they trust', 'New', 'P0'),
    F('F-OP-05', 'Problems solved', 'The ledger counts what a live project solved', '“How many industry problems were solved?”', 'New', 'P0'),
    F('F-OP-06', 'Impact Ledger', 'Problems solved, verified outcomes, Future Skills Index, 30 and 90-day reports', '“What do you measure??”', 'New', 'P0'),
    F('F-OP-07', 'Open opportunity board', 'Entry points for people outside a campus cohort', 'Wider Audience lens was empty', 'New', 'P2'),
    F('F-GV-01', 'Consent manager', 'Records, shows and revokes consent', 'Student data and consent', 'New', 'P0'),
    F('F-GV-03', 'Audit log', 'Every state change recorded', 'Trust and Compliance', 'New', 'P0'),
    F('F-GV-04', 'AI-use declaration', 'Each submission states how AI was used', 'Critical AI literacy (a Bud)', 'New', 'P0'),
    F('F-GV-05', 'Provisions board', 'Reserved slots for missed items; users add their own', 'Section 14', 'New', 'P0'),
    F('F-PR-01', 'Plan registry', 'Create, edit, switch off, archive plans', 'Prices are data, not code', 'New', 'P0'),
    F('F-PR-02', 'Price versions', 'Set prices with history and an optional start date', 'Past sign-ups keep their price', 'New', 'P0'),
    F('F-PR-04', 'Coupon builder', 'Create coupons by name and percent, with limits and dates', 'Founding and pilot offers', 'New', 'P0'),
    F('F-PR-05', 'Second approval', 'Admin B approves high-value coupons', 'Big discounts need two people', 'New', 'P0'),
    F('F-PR-07', 'Live propagation', 'Admin changes reach open sign-up screens in seconds', 'Never confirm at a stale price', 'New', 'P0'),
    F('F-PR-12', 'Announcement banner', 'Admin-set banner on every page', 'IxDF promo banner pattern', 'Adapt', 'P0'),
    F('F-PR-14', 'Sign-up log with snapshots', 'Every mock sign-up with plan, version, coupon and amounts', 'Audit everything', 'New', 'P0'),
  ];
  const featureById = Object.fromEntries(features.map((f) => [f.id, f]));

  /* ---------- roles and journeys (§5, A11) ---------- */
  const J = (stage, moment, feats, title, rows, cta, handoff, route) => ({ stage, moment, feats, screen: { title, rows, cta }, handoff, route });
  const roles = [
    {
      id: 'student', name: 'Student', short: 'Student', lens: 'College', person: 'Aanya Rao · Campus A',
      goal: 'Show I can do the work, not just pass the course.', access: 'Member, via campus',
      sees: ['Skills Guide and Paths', 'Open live projects on my campus', 'My Passport and mentor sessions'],
      can: ['Join or form a team', 'Submit work and a decision log', 'Request a mentor session', 'Share my Passport link'],
      cannot: ['See other students’ feedback', 'See employer shortlisting notes'],
      journey: [
        J('IDENTIFY', 'Week 1', ['F-ID-01', 'F-ID-02'], 'Demand Map · this term', [['Framing the problem', 'asked by 7 companies'], ['Defending a design decision', '5'], ['Business context', '4']], 'Pick a capability', ['industry'], 'demand'),
        J('LEARN', 'Weeks 1–3', ['F-LE-01', 'F-LE-02'], 'LM-SP-1 · Day 1 readiness', [['Lessons', '2 of 3 done'], ['Next', 'Quick check'], ['Format', 'Self-paced']], 'Continue', [], 'learn-LM-SP-1'),
        J('APPLY', 'Weeks 3–8', ['F-AP-01', 'F-AP-02'], 'Live Project · Reduce onboarding drop-off', [['Milestone', '2 of 5'], ['Team', '4 of 4 joined'], ['Decision log', '6 entries']], 'Add a decision', ['mentor'], 'team'),
        J('MENTOR', 'Weeks 4–8', ['F-ME-01', 'F-ME-02'], 'Mentor session · session 2', [['Mentor', 'Kavya Iyer'], ['Agenda', 'Defend your scope'], ['Notes', 'Private to team']], 'Join session', ['mentor'], 'sprints'),
        J('SOLVE', 'Week 8', ['F-SO-01'], 'Submission', [['Deliverable', 'Prototype + deck'], ['Decision log', 'Attached'], ['AI-use declaration', 'Required']], 'Submit', ['mentor'], 'submit'),
        J('VALIDATE', 'Week 9', ['F-VA-01'], 'Assessment · result', [['Framing', 'Strong'], ['Decision defence', 'Developing'], ['Passport entry', 'Added, verifiable']], 'Share Passport link', ['mentor', 'admin'], 'passports'),
        J('GET OPPORTUNITY', 'Month 3 on', ['F-OP-01', 'F-OP-02'], 'Opportunity board', [['Associate designer', 'Shares your Passport'], ['Internship · 3 months', 'Learning contract'], ['Applied', '2']], 'Apply', ['industry'], 'opportunities'),
      ],
    },
    {
      id: 'faculty', name: 'Faculty', short: 'Faculty', lens: 'College', person: 'Prof. Meera Nair · Campus A',
      goal: 'Teach with live industry input without rewriting my course.', access: 'Member, via campus',
      sees: ['Live Project and sanitised case library', 'Progress of my cohort', 'Assessor rubrics'],
      can: ['Slot a live project into a module', 'Co-mentor with a practitioner', 'Score with the shared rubric', 'Claim workload credit'],
      cannot: ['See other campuses’ student data'],
      journey: [
        J('IDENTIFY', 'Before term', ['F-ID-03'], 'Gap check · Studio 3', [['Covered', '9 of 14'], ['Uncovered, high demand', 'Framing, business context'], ['Suggested live projects', '2']], 'Open live project library', ['industry'], 'projects'),
        J('LEARN', 'Term start', ['F-LE-03', 'F-LE-04'], 'Residency · week 1', [['Practitioner', 'Design director, fintech'], ['Your role', 'Co-teach'], ['Hours logged', '6']], 'Log hours', ['mentor'], 'calendar'),
        J('APPLY', 'Weeks 2–8', ['F-AP-03', 'F-AP-04'], 'Module mapping', [['Module', 'Studio 3'], ['Credit window', 'Mapped'], ['Project goes live', 'Week 3']], 'Confirm mapping', ['admin'], 'projects'),
        J('MENTOR', 'Weeks 4–8', ['F-ME-03'], 'Co-mentoring', [['Sessions attended', '3'], ['Teams covered', '2'], ['Notes', 'Shared with you']], 'View notes', ['mentor'], 'team'),
        J('VALIDATE', 'Week 9', ['F-VA-02'], 'Rubric v2', [['Framing', '25%'], ['Decision defence', '25%'], ['Business context', '20%']], 'Approve rubric', ['mentor', 'admin'], 'assess'),
        J('CONNECT', 'Ongoing', ['F-CO-01'], 'Calendar · next 30 days', [['Industry circle', 'Wed'], ['Assessment day', '14 Nov'], ['Guest session', '21 Nov']], 'Add event', ['admin'], 'calendar'),
      ],
    },
    {
      id: 'head', name: 'Institution head', short: 'Inst. head', lens: 'College', person: 'Dr. Arvind Kulkarni · Campus A',
      goal: 'Show placement and accreditation outcomes without adding cost I cannot defend.', access: 'Admin, institution',
      sees: ['Cohort outcomes', 'Spend against the fee band', 'Validated Passports in aggregate'],
      can: ['Enrol cohorts', 'Sign the partnership agreement', 'Approve credit mapping'],
      cannot: ['See an individual student’s feedback without consent'],
      journey: [
        J('IDENTIFY', 'Planning', ['F-ID-04'], 'Gap report', [['Programmes scanned', '6'], ['Highest-demand gap', 'Business context'], ['Cohorts proposed', '2']], 'Plan cohorts', ['industry'], 'demand'),
        J('APPLY', 'Term setup', ['F-AP-05', 'F-AP-06'], 'Membership', [['Tier', 'By institution size'], ['Fee band (proposed)', '₹5–15 lakh a year'], ['Cohorts', '2']], 'Review agreement', ['admin'], 'join-college'),
        J('VALIDATE', 'End of term', ['F-VA-07'], 'Outcomes · cohort A', [['Passports validated', '38 of 60'], ['Live Projects completed', '12'], ['Faculty hours', '54']], 'Download report', ['admin'], 'impact'),
        J('GET OPPORTUNITY', 'Placement season', ['F-OP-03'], 'Readiness · cohort A', [['Shortlisted by employers', '21'], ['Interviews', '14'], ['Offers', '5']], 'Share with placement cell', ['industry'], 'impact'),
      ],
    },
    {
      id: 'industry', name: 'Industry leader', short: 'Industry', lens: 'Employer', person: 'Rohan Mehta · Northwind Bank',
      goal: 'Get a capability built, and find the people who can show it.', access: 'Organisation member',
      sees: ['My live projects and submissions', 'Anonymised cohort results', 'Passports students choose to share'],
      can: ['State a capability need', 'Sponsor a live project', 'Send assessors', 'Shortlist verified talent'],
      cannot: ['See student data that was not shared', 'Contact students outside the platform before consent'],
      journey: [
        J('IDENTIFY', 'Day 1', ['F-ID-05'], 'Capability intake', [['Capability', 'Framing ambiguous problems'], ['Needed by', 'Q2'], ['Seats you could offer', '3 assessors']], 'Submit to UMO', ['admin'], 'demand'),
        J('APPLY', 'Weeks 1–3', ['F-AP-07', 'F-AP-08'], 'Sponsor desk · brief v1', [['NDA-safe', 'Yes'], ['Co-sponsors', '2 companies'], ['Campuses interested', '3']], 'Approve brief', ['admin', 'faculty'], 'projects'),
        J('VALIDATE', 'Week 9', ['F-VA-03'], 'Assessment day · seat', [['Submissions', '12'], ['Blind-first', 'On'], ['Your hours', '4']], 'Start scoring', ['mentor'], 'assess'),
        J('CONNECT', 'Ongoing', ['F-CO-02'], 'Industry circle · Wed', [['Attending', '8 companies'], ['Campuses', '4'], ['Topic', '“Readiness, defined”']], 'RSVP', ['admin'], 'calendar'),
        J('GET OPPORTUNITY', 'Month 3 on', ['F-OP-04', 'F-OP-05'], 'Impact · your live projects', [['Problems solved', '1 of 1'], ['Candidates shortlisted', '6'], ['Hired or deployed', '2']], 'View evidence', ['head', 'admin'], 'opportunities'),
      ],
    },
    {
      id: 'mentor', name: 'Mentor & assessor', short: 'Mentor', lens: 'Employer', person: 'Kavya Iyer · practitioner',
      goal: 'Give back in a way that fits my calendar and is recognised.', access: 'Verified practitioner',
      sees: ['Assigned teams', 'The rubric', 'My hours and distinctions'],
      can: ['Book sessions', 'Give feedback', 'Score blind-first', 'Nominate peers'],
      cannot: ['See student identities before blind scoring ends', 'Recruit during assessment'],
      journey: [
        J('LEARN', 'Any time', ['F-LE-04'], 'Session · 21 Nov', [['Audience', '3 campuses'], ['Length', '45 min'], ['Credit', '1 session']], 'Confirm', ['faculty'], 'calendar'),
        J('MENTOR', 'Weeks 4–8', ['F-ME-01', 'F-ME-04'], 'Mentor sessions · you', [['Teams', '2'], ['Hours this term', '4.5'], ['Next session', 'Tue 4pm']], 'Open team notes', ['student', 'faculty'], 'sprints'),
        J('VALIDATE', 'Week 9', ['F-VA-04', 'F-VA-05'], 'Scoring · submission 4 of 12', [['Rubric', 'Shared'], ['Names', 'Hidden'], ['Score', 'Saved']], 'Next submission', ['student', 'admin'], 'assess'),
        J('CONNECT', 'Ongoing', ['F-CO-03'], 'Your distinctions', [['Mentor', '10 hours'], ['Assessor', '1 day'], ['Circle host', '—']], 'Share badge', ['admin'], 'impact'),
      ],
    },
    {
      id: 'open', name: 'Open community', short: 'Open', lens: 'Open to all', person: 'Dev Malhotra · open member',
      goal: 'Learn, find my people, and get a way in.', access: 'Open, free tier',
      sees: ['Skills Guide', 'Public showcases', 'Circle events', 'Open-cohort live projects'],
      can: ['Join a Circle', 'Follow capabilities', 'Apply to an open cohort'],
      cannot: ['See campus-only live projects', 'See other people’s Passports'],
      journey: [
        J('IDENTIFY', 'Day 1', ['F-ID-07'], 'Skills Guide · “Framing the problem”', [['Definition', 'Plain language'], ['Levels', '4 descriptors'], ['Asked by', '7 companies']], 'Follow', [], 'skills'),
        J('LEARN', 'Weeks 1–4', ['F-LE-05'], 'Open path', [['Module', 'Stakeholder interviews'], ['Progress', '2 of 5'], ['Next', 'Quiz']], 'Continue', [], 'join-path'),
        J('CONNECT', 'Monthly', ['F-CO-04'], 'Circles near you', [['Bengaluru', 'Wed'], ['Online', 'Fri'], ['Members', '120']], 'Join', ['admin'], 'calendar'),
        J('GET OPPORTUNITY', 'Month 2 on', ['F-OP-07'], 'Open board', [['Open cohort live project', 'Applications open'], ['Internship', '1'], ['Mentor match', '2']], 'Apply', ['admin'], 'opportunities'),
      ],
    },
    {
      id: 'admin', name: 'UMO admin', short: 'Admin', lens: 'UMO team', person: 'Admin A or Admin B',
      goal: 'Host the whole loop between meetings, set prices and offers once, and prove it works.', access: 'Admin, platform',
      sees: ['The whole loop in aggregate', 'The operations queue', 'Plans, price history and coupons', 'The audit log'],
      can: ['Shape intake and match live projects', 'Approve mentors and assessors', 'Give the second approval on a Passport', 'Set a price or a coupon (a new version is made)', 'Approve another admin’s coupon', 'Report at 30 and 90 days'],
      cannot: ['Change a student’s outcome alone (a second admin approves)', 'Approve a coupon they created', 'Edit a price in place'],
      journey: [
        J('IDENTIFY', 'Continuous', ['F-ID-06'], 'Demand Map · queue', [['New intakes', '6'], ['Merged into themes', '3'], ['Published', '2']], 'Review intakes', ['industry'], 'demand'),
        J('APPLY', 'Weeks 1–3', ['F-AP-09'], 'Matching', [['Briefs open', '4'], ['Campuses ready', '5'], ['Matched', '2']], 'Match next', ['faculty', 'industry'], 'projects'),
        J('MENTOR', 'Continuous', ['F-ME-05'], 'Mentor pool', [['Active mentors', '14'], ['Hours this term', '62'], ['Gap vs demand', '−3']], 'Invite mentors', ['mentor'], 'sprints'),
        J('VALIDATE', 'Week 9', ['F-VA-06'], 'Integrity checks', [['Rubrics approved', '3 of 3'], ['Conflicts flagged', '0'], ['Entries pending second approval', '4']], 'Approve', ['mentor', 'head'], 'passports'),
        J('GET OPPORTUNITY', 'Day 30 and 90', ['F-OP-06'], 'Impact · day 30', [['Live Projects live', '3'], ['Problems solved', '1'], ['Verified Passports', '38']], 'Publish report', ['head', 'industry'], 'impact'),
      ],
    },
  ];
  const roleById = Object.fromEntries(roles.map((r) => [r.id, r]));

  /* ---------- verdict: room evidence (§3.2) and gates (§2.3) ---------- */
  const evidence = [
    { n: 1, quote: '“Industry doesn’t give students proper projects.”', means: 'Real, scoped industry problems are the scarce input. Build a live project exchange.', reading: 'Supports' },
    { n: 2, quote: '“What is core?” “Day 1 readiness”', means: 'A shared definitions layer is missing and cheap to build.', reading: 'Supports' },
    { n: 3, quote: '“We all do FDPs, live projects, internships, and the gap still remains.”', means: 'Do not repackage the same programmes. Only the closed loop and validation are new.', reading: 'Live Projects' },
    { n: 4, quote: '“Low company budget for training.” “Why train someone for a competitor?”', means: 'Industry willingness to pay is unproven. Test price before building.', reading: 'Live Projects' },
    { n: 5, quote: '“Why is 40% not placed? Is the remaining 60% industry ready?”', means: 'Employers need evidence they trust.', reading: 'Supports' },
    { n: 6, quote: 'Do First: decision defence, accountability, job ethics, soft-skills, trust and compliance', means: 'Behaviours are learned by practice with feedback. Practice and mentoring lead, not courses.', reading: 'Neutral' },
    { n: 7, quote: '“Nobody volunteers; good practitioners cost money.”', means: 'Custodian and mentor economics come before software.', reading: 'Live Projects' },
    { n: 8, quote: '“What do you measure??”', means: 'Build the Impact Ledger from day one. Problems solved beats programmes run.', reading: 'Supports' },
    { n: 9, quote: 'A joint Design Calendar; touchpoints at 30 and 90 days', means: 'Ship the calendar first.', reading: 'Supports' },
  ];
  const gates = [
    { id: 'G1', name: 'Supply', test: 'At least 3 companies each post one real, scoped live project with a named owner', by: 'Day 60 · Wed 25 Nov 2026', target: 3, count: 1, unit: 'companies' },
    { id: 'G2', name: 'Demand', test: 'At least 3 campuses commit a faculty lead and a term slot; 2 would sign a letter of intent in the fee band', by: 'Day 60 · Wed 25 Nov 2026', target: 3, count: 2, unit: 'campuses' },
    { id: 'G3', name: 'Trust', test: 'At least 1 employer states in writing that it would count validated evidence when shortlisting', by: 'Day 90 · Fri 18 Dec 2026', target: 1, count: 0, unit: 'employer' },
    { id: 'G4', name: 'Mentor supply', test: 'At least 10 practitioners give 4 or more hours each, or a mentor-credit model is agreed', by: 'Day 90 · Fri 18 Dec 2026', target: 10, count: 4, unit: 'practitioners' },
    { id: 'G5', name: 'Custody', test: 'UMO confirmed as the host of the loop between meetings', by: '30-day sync · Mon 26 Oct 2026', target: 1, count: 0, unit: 'confirmation' },
  ];

  /* ---------- lifecycle (§2.2) ---------- */
  const phases = [
    { id: 'v0', label: 'Loop v0', name: 'Manual kit', when: 'Now, in parallel', gate: 'None', blurb: 'One calendar, an intake form, a brief template, a spreadsheet Passport, a mentor group and an assessment-day run sheet. No software. This is how the gates get tested.' },
    { id: 'p1', label: 'Phase 1', name: 'Clickable prototype', when: 'Ready for the 26 Oct sync', gate: 'None', blurb: 'This prototype. Role switching, seeded synthetic data, every journey clickable. Mock pricing. Nothing charged, nothing stored.' },
    { id: 'v1', label: 'Phase 2', name: 'Thin v1', when: 'After 3–4 gates pass', gate: 'G1–G5', blurb: 'Real accounts and one real loop for a handful of campuses and companies. Fees invoiced by hand.' },
    { id: 'p3', label: 'Phase 3', name: 'Platform', when: 'After v1 proves the loop', gate: 'v1 results', blurb: 'Memberships, the open tier, Circles, the Future Skills Index, scale.' },
  ];

  /* ---------- ecosystem and value exchange ---------- */
  const valueKinds = [
    { id: 'money', label: 'Money', note: 'Who pays whom: fees, sponsorship, honoraria' },
    { id: 'problem', label: 'Real problems', note: 'What companies bring: real, scoped live projects' },
    { id: 'capability', label: 'Skills and learning', note: 'Learning, teaching and practice' },
    { id: 'evidence', label: 'Proof of work', note: 'Scores, Passports and results' },
    { id: 'talent', label: 'Jobs and hiring', note: 'Roles, internships and hires' },
    { id: 'time', label: 'Hours given', note: 'Mentors, assessors and faculty giving time' },
    { id: 'recognition', label: 'Credit and thanks', note: 'Distinctions, credit and a stage' },
    { id: 'consent', label: 'Privacy and consent', note: 'Who may see what, set by the Codex rulebook' },
  ];

  /* x, y in a 1000 × 640 viewBox. */
  const actors = [
    { id: 'student', label: 'Student', group: 'College', x: 170, y: 250, role: 'student' },
    { id: 'faculty', label: 'Faculty', group: 'College', x: 110, y: 390, role: 'faculty' },
    { id: 'head', label: 'Institution head', group: 'College', x: 200, y: 530, role: 'head' },
    { id: 'challenge', label: 'Live Project', group: 'Shared project', x: 500, y: 215 },
    { id: 'admin', label: 'UMO admin', group: 'UMO team', x: 500, y: 385, role: 'admin', hub: true },
    { id: 'industry', label: 'Industry leader', group: 'Employer', x: 830, y: 255, role: 'industry' },
    { id: 'mentor', label: 'Mentor & assessor', group: 'Employer', x: 880, y: 420, role: 'mentor' },
    { id: 'open', label: 'Open community', group: 'Open to all', x: 560, y: 570, role: 'open' },
    { id: 'school', label: 'UMO Design School', group: 'Partner', x: 160, y: 70, ext: true, href: 'https://umodesign.school' },
    { id: 'catalysts', label: 'Mentors & Catalysts', group: 'Partner', x: 400, y: 70, ext: true, href: 'https://umo.design' },
    { id: 'uxin', label: 'UXIN jobs', group: 'Partner', x: 620, y: 70, ext: true, href: 'https://uxin.co' },
    { id: 'uxindia', label: 'UXINDIA', group: 'Partner', x: 850, y: 70, ext: true, href: 'https://umo.design' },
  ];

  /* state per phase: manual · sim · real · none · reserved */
  const Fl = (id, from, to, kind, label, detail, stage, v0, p1, v1, p3) => ({ id, from, to, kind, label, detail, stage, phase: { v0, p1, v1, p3 } });
  const flows = [
    Fl('f1', 'industry', 'admin', 'problem', 'Capability need', 'A five-minute intake: the capability, need-by date, assessor seats and whether data is sensitive.', 'IDENTIFY', 'manual', 'sim', 'real', 'real'),
    Fl('f2', 'admin', 'challenge', 'problem', 'Shaped, NDA-safe brief', 'The UMO admin merges intakes into themes and shapes a brief: no personal or confidential data, sanitised examples, IP terms chosen.', 'APPLY', 'manual', 'sim', 'real', 'real'),
    Fl('f3', 'challenge', 'student', 'problem', 'Live project in a term', 'Matched to a campus term. Teams form, keep a decision log and work against a deliberately ambiguous brief.', 'APPLY', 'manual', 'sim', 'real', 'real'),
    Fl('f4', 'faculty', 'challenge', 'capability', 'Mapped into a module', 'Faculty slot the live project into an existing module with a credit window. No course rewrite.', 'APPLY', 'manual', 'sim', 'real', 'real'),
    Fl('f5', 'mentor', 'student', 'time', 'Mentor sessions', 'Three 45-minute sessions. Notes stay in a private thread for the team and mentor.', 'MENTOR', 'manual', 'sim', 'real', 'real'),
    Fl('f6', 'student', 'mentor', 'evidence', 'Submission pack', 'Deliverable, decision log, reflection and an AI-use declaration. Scored blind-first.', 'SOLVE', 'manual', 'sim', 'real', 'real'),
    Fl('f7', 'mentor', 'admin', 'evidence', 'Locked blind scores', 'Assessors score against the shared rubric. A mentor never scores their own team.', 'VALIDATE', 'manual', 'sim', 'real', 'real'),
    Fl('f8', 'admin', 'student', 'evidence', 'Verified Passport entry', 'A second approval turns a proposed entry into a verifiable link anyone can check.', 'VALIDATE', 'manual', 'sim', 'real', 'real'),
    Fl('f9', 'student', 'industry', 'consent', 'Passport, shared by choice', 'Employers see only what a student shares, and sharing can be revoked at any time.', 'GET OPPORTUNITY', 'manual', 'sim', 'real', 'real'),
    Fl('f10', 'industry', 'student', 'talent', 'Role or internship', 'Opportunities tied to verified evidence. Every internship carries a learning contract with a mentor and a stipend field.', 'GET OPPORTUNITY', 'manual', 'sim', 'real', 'real'),
    Fl('f11', 'admin', 'industry', 'evidence', 'Problems solved', 'The Impact Ledger counts a live project as solved when the sponsor’s named owner confirms it.', 'GET OPPORTUNITY', 'manual', 'sim', 'real', 'real'),
    Fl('f12', 'admin', 'head', 'evidence', 'Outcomes view', 'Validated Passports, live projects completed and faculty hours per cohort. Groups under 5 stay hidden.', 'VALIDATE', 'manual', 'sim', 'real', 'real'),
    Fl('f13', 'head', 'admin', 'money', 'Campus licence', 'Proposed ₹5–15 lakh a year by institution size. Untested. Mock checkout only in Phase 1.', 'APPLY', 'none', 'sim', 'manual', 'real'),
    Fl('f14', 'industry', 'admin', 'money', 'Membership & sponsorship', 'Seats for teams and per-project sponsorship. Demo prices; no industry-side price exists yet.', 'APPLY', 'none', 'sim', 'manual', 'real'),
    Fl('f15', 'industry', 'mentor', 'time', 'Assessor seats', 'Companies send practitioners to assessment days. Free seats; they feed the supply gate.', 'VALIDATE', 'manual', 'sim', 'real', 'real'),
    Fl('f16', 'admin', 'mentor', 'recognition', 'Hours and distinctions', 'Every mentor hour is counted. Distinctions answer “nobody volunteers”. Honoraria or credit is an open decision.', 'MENTOR', 'manual', 'sim', 'real', 'real'),
    Fl('f17', 'mentor', 'faculty', 'capability', 'Practitioner sessions', 'Residencies and co-mentoring keep faculty in live industry contact.', 'LEARN', 'manual', 'sim', 'real', 'real'),
    Fl('f18', 'admin', 'open', 'capability', 'Skills Guide, Circles, open cohort', 'Plain definitions, local and online Circles, and a way into an open-cohort live project.', 'CONNECT', 'none', 'sim', 'none', 'real'),
    Fl('f19', 'open', 'admin', 'consent', 'Joins with consent', 'A free open-tier member, after the consent manager records what they agreed to.', 'CONNECT', 'none', 'sim', 'none', 'real'),
    Fl('f20', 'school', 'student', 'capability', 'Course content (link out)', 'LEAD links to the UMO Design School for courses and certification. It does not duplicate them.', 'LEARN', 'manual', 'sim', 'real', 'real'),
    Fl('f21', 'catalysts', 'mentor', 'time', 'Seeds the mentor pool', 'UMO Mentors & Catalysts seed the pool, each person by consent.', 'MENTOR', 'manual', 'sim', 'real', 'real'),
    Fl('f22', 'uxin', 'open', 'talent', 'General jobs (link out)', 'UXIN carries general jobs. LEAD’s board keeps only evidence-backed roles.', 'GET OPPORTUNITY', 'manual', 'sim', 'real', 'real'),
    Fl('f23', 'uxindia', 'industry', 'recognition', 'Design Pitch stage', 'A showcase at CONNECT. Reserved as a bundle overlay.', 'CONNECT', 'none', 'none', 'none', 'reserved'),
    Fl('f24', 'industry', 'open', 'money', 'Scholarship & gift match', 'A paid seat funds a free one, as the School’s “Give a gift of Design” does. Reserved; needs a finance and legal decision.', 'LEARN', 'none', 'none', 'none', 'reserved'),
  ];

  const stays = {
    student: { gives: 'Work, a decision log, consent to share', gets: 'Real problems, mentors, a Passport employers trust, a way to a role', why: 'Evidence beats a transcript when 40% are not placed.', risk: 'If live projects are thin, the Passport means little.', quote: '“Never done full projects, requires mentoring.”' },
    faculty: { gives: 'A module slot, co-mentoring, rubric input', gets: 'Live industry input without a course rewrite, workload credit', why: 'The kit fits the existing curriculum and credit window.', risk: 'Without workload credit, faculty time is invisible.', quote: '“We all do FDPs… and the gap still remains.”' },
    head: { gives: 'The licence fee, a faculty lead, a term slot', gets: 'Outcomes for accreditation and placement, aggregate evidence', why: 'Outcomes are measurable and defensible against the fee band.', risk: 'The ₹5–15 lakh band is untested.', quote: '“Why is 40% not placed?”' },
    industry: { gives: 'Real problems, assessors, sponsorship', gets: 'A capability built, verified candidates, problems solved', why: 'Pooled sponsorship and early talent access answer “why train a competitor’s hire?”', risk: 'Willingness to pay is unproven.', quote: '“Low company budget for training.”' },
    mentor: { gives: 'Hours, feedback, blind scores', gets: 'Recognition, distinctions, a credit model', why: 'Time-boxed sessions fit a calendar; every hour is counted.', risk: 'Good practitioners cost money.', quote: '“Nobody volunteers; good practitioners cost money.”' },
    admin: { gives: 'Shaping, matching, integrity, reports', gets: 'A mandate, fees that fund the loop, proof it works', why: 'Nobody had claimed the hosting role. Someone has to host the loop.', risk: 'Until UMO confirms it will host, nothing runs between meetings.', quote: 'In the room’s exercise, the hosting role was left empty.' },
    open: { gives: 'Attention, participation, consent', gets: 'Plain definitions, Circles, an on-ramp into a cohort', why: 'Free to start. Career awareness was left out of the room’s plan, and belongs here.', risk: 'Without an owner, the open tier stays empty.', quote: 'Career awareness was named in the room, then not carried forward.' },
    challenge: { gives: 'A real, scoped problem', gets: 'Solutions, a problems-solved record', why: 'It is the joint project both lenses own.', risk: 'NDAs block real cases unless shaped.', quote: '“Industry doesn’t give students proper projects.”' },
    school: { gives: 'Courses, certification, scholarships', gets: 'Learners routed from LEAD Paths', why: 'Connect, do not duplicate.', risk: 'Open question: who sells LEAD Paths.', quote: 'UMO Design School · “EXCEL”' },
    catalysts: { gives: 'Experienced mentors', gets: 'A structured way to give time', why: 'The pool already exists.', risk: 'Consent per person.', quote: 'UMO Mentors & Catalysts' },
    uxin: { gives: 'General design jobs', gets: 'Traffic from the open tier', why: 'LEAD keeps only evidence-backed roles.', risk: 'Overlap if the boards blur.', quote: 'uxin.co' },
    uxindia: { gives: 'A stage and an audience', gets: 'Showcase content from the loop', why: 'Design Pitch fits CONNECT.', risk: 'Reserved until UMO decides.', quote: 'UXINDIA · 23–27 Sept, Bengaluru' },
  };

  /* ---------- workflows (§7) ---------- */
  const workflows = [
    { id: 'W1', name: 'A company brings a problem', seq: ['industry', 'admin', 'faculty'], result: 'A company’s request becomes a live project in a campus term' },
    { id: 'W2', name: 'A team learns, works and gets coached', seq: ['student', 'mentor', 'faculty'], result: 'A team forms and finishes three coaching sessions' },
    { id: 'W3', name: 'Work becomes a verified Passport', seq: ['student', 'mentor', 'admin'], result: 'Submitted work is scored blind, approved twice, and turned into a Passport entry' },
    { id: 'W4', name: 'A Passport leads to a job', seq: ['student', 'industry', 'head'], result: 'A student shares evidence, an employer shortlists, the outcome is recorded' },
    { id: 'W5', name: 'Faculty grow with industry', seq: ['faculty', 'mentor', 'head'], result: 'Faculty co-mentor on a live project and their hours and credit are recognised' },
    { id: 'W6', name: 'Results shape what comes next', seq: ['admin', 'head', 'industry'], result: 'Published results show what employers still need' },
    { id: 'W7', name: 'Open learners step into a cohort', seq: ['open', 'admin', 'student'], result: 'A free learner finishes a path and is invited into an open live project' },
  ];

  /* ---------- IxDF mapping (§4.1) ---------- */
  const ixdf = [
    ['Open library of articles and videos', 'LEAD Skills Guide', 'Replicate', 'Answers “what is core?”, with how many employers asked for each skill'],
    ['Self-paced courses with certificates', 'LEAD Paths', 'Adapt', 'Weighted to practice with feedback'],
    ['Verifiable certificates and distinctions', 'Skills Passport', 'Adapt', 'Evidence is validated work, not course completion'],
    ['Master classes with industry leaders', 'Practitioner Sessions', 'Replicate', 'Feeds faculty development'],
    ['Community and local groups', 'Chapters and Circles on one calendar', 'Adapt', 'The calendar is the room’s own idea'],
    ['Memberships for companies', 'Industry Membership', 'Replicate', 'Pooled funding and early access to talent'],
    ['Toolkits for educators', 'Faculty Toolkit', 'Adapt', 'Answers curriculum rigidity'],
    ['A published standard for certificates', 'LEAD Codex', 'Adapt', 'Trust and compliance, job ethics, economic constraint'],
    ['Nothing like this', 'Live Projects, mentor sessions, assessment days, the opportunity board and the Impact Ledger', 'New', 'Where the room’s evidence points'],
  ];

  /* ---------- demo mode, run by persona ---------- */
  /* One script per persona: one step per journey stage. The last step hands off to the next persona. */
  const demoOrder = ['industry', 'student', 'mentor', 'faculty', 'head', 'open', 'admin'];
  const demoByRole = {};
  roles.forEach((r) => {
    demoByRole[r.id] = r.journey.map((j) => {
      const s = stages.find((x) => x.id === j.stage);
      return { route: j.route, stage: `${s.n} ${s.id}`, say: `${j.moment}. ${j.screen.title}. Try “${j.screen.cta}”.` };
    });
  });
  demoByRole.admin = demoByRole.admin.concat([
    { route: 'admin', stage: 'Pricing', say: 'Set a price. Pick a plan, change the price and save. It becomes a new version.' },
    { route: 'admin', stage: 'Coupons', say: 'Create BIG70 at 70%. It waits for a second admin.' },
    { route: 'admin', stage: 'Coupons', say: 'Switch to Admin B in the coupons block and approve BIG70.' },
    { route: 'join-college', stage: 'Sign-up', say: 'Open the college sign-up in a second tab, enter a code and watch the price drop.' },
  ]);


  /* ---------- plain-language layer for the public homepage ---------- */
  const plainPhase = {
    v0: { label: 'Today, by hand', short: 'Today', meaning: 'People and spreadsheets do this now.', when: 'Now', blurb: 'People and spreadsheets run the loop: one shared calendar, an intake form, a brief template, a Passport sheet and a mentor group. No software.' },
    p1: { label: 'In this demo', short: 'This demo', meaning: 'You can click through it here.', when: 'Ready for the 26 Oct sync', blurb: 'A clickable version with made-up people. Every role can walk its path. Prices are mock, and nothing is saved or charged.' },
    v1: { label: 'Next: first pilots', short: 'Pilots', meaning: 'Real accounts for a few colleges and companies.', when: 'After most checks pass', blurb: 'Real accounts and one real loop for a few campuses and companies. Fees are invoiced by hand.' },
    p3: { label: 'Later: the full platform', short: 'Full platform', meaning: 'Everything switched on.', when: 'After the pilots prove the loop', blurb: 'Memberships, the open tier, Circles, a skills index, and scale.' },
  };

  const plainGate = { G1: 'Companies bring problems', G2: 'Campuses commit', G3: 'Employers value the evidence', G4: 'Enough mentors', G5: 'UMO hosts the loop' };

  const S = (stage, when, head, body, route, cta, extra) => Object.assign({ stage, when, head, body, route, cta }, extra || {});
  const story = {
    student: [
      S('IDENTIFY', 'Week 1', 'See what employers want.', 'Companies tell LEAD which skills they need this term. You see them in plain words and pick the ones you want to build.', 'demand', 'See what is asked', { photo: 'story-identify' }),
      S('LEARN', 'Weeks 1–3', 'Learn only what the project needs.', 'Start with LM-SP-1, a 25-minute self-paced module. Then add live sessions, a peer circle or a live project. Longer courses live at UMO Design School.', 'learn-LM-SP-1', 'Start LM-SP-1'),
      S('APPLY', 'Weeks 3–8', 'Work on a real company problem.', 'Join a team of four. The brief is real and a little vague on purpose, so you decide what to solve. You keep a log of what you chose and why.', 'team', 'Open my team', { photo: 'story-apply' }),
      S('MENTOR', 'Weeks 4–8', 'Get coached by someone who does this for a living.', 'Three 45-minute sessions with a practitioner. Feedback stays private to your team and your mentor.', 'sprints', 'Book a session', { photo: 'story-mentor' }),
      S('SOLVE', 'Week 8', 'Hand in your work.', 'Send your deliverable, your decision log, a short reflection and a note on how you used AI.', 'submit', 'Open the submission'),
      S('VALIDATE', 'Week 9', 'Get scored by professionals.', 'Assessors score your work against a rubric you saw in advance. They do not see your name or college until they have locked their scores.', 'passports', 'See my Passport', { photo: 'story-validate' }),
      S('CONNECT', 'Ongoing', 'Meet the people.', 'Industry circles, guest sessions and assessment days sit on one shared calendar. Come to any that are public.', 'calendar', 'See the calendar', { feats: ['F-CO-01', 'F-CO-04'], handoff: ['admin'], sample: { title: 'Calendar · next 30 days', rows: [['Industry circle', 'Wed'], ['Assessment day', '14 Nov'], ['Guest session', '21 Nov']] } }),
      S('CONNECT', 'Ongoing', 'Join a women’s circle.', 'Women in design meet every month in Bengaluru and online. Part of every paid plan funds seats for women through 1 Million Women in Design, and you can add a seat of your own.', 'women', 'See 1 Million Women', { feats: ['F-CO-01'], handoff: ['admin'], photo: 'women-circle' }),
      S('GET OPPORTUNITY', 'Month 3 on', 'Apply with proof.', 'Share your Passport with the employers you choose. Roles and internships list the evidence they want, and every internship has a mentor and a learning plan.', 'opportunities', 'See opportunities'),
    ],
    faculty: [
      S('IDENTIFY', 'Before term', 'See what your syllabus leaves out.', 'Compare a module with what employers asked for this term. You see the gaps and the live projects that would fill them.', 'projects', 'Open the live projects'),
      S('LEARN', 'Term start', 'Bring a practitioner into your room.', 'A design director co-teaches in week one. Your hours count as faculty development.', 'calendar', 'See sessions'),
      S('LEARN', 'Before term', 'Learn to teach with a live brief.', 'Take LM-IL-1, three live sessions on fitting a real company problem into your module. You can also lead a session yourself.', 'learn-LM-IL-1', 'Open LM-IL-1', { feats: [], handoff: ['mentor'] }),
      S('APPLY', 'Weeks 2–8', 'Slot a live project into your module.', 'Map the brief to a module and a credit window. You do not rewrite your course.', 'projects', 'Map a live project'),
      S('MENTOR', 'Weeks 4–8', 'Sit in on mentor sessions.', 'Co-mentor with the practitioner, see what your students are told, and share notes with the team.', 'team', 'Open a team'),
      S('VALIDATE', 'Week 9', 'Help write the rubric.', 'Faculty and assessors set the scoring rubric together, so marks mean the same to both sides.', 'assess', 'See the rubric'),
      S('CONNECT', 'Ongoing', 'Meet industry on one calendar.', 'Add campus events, join industry circles and see assessment days in one place.', 'calendar', 'Open the calendar'),
      S('CONNECT', 'Ongoing', 'Run a session for women in your studio.', 'Host or join a dedicated session for women designers. It is part of 1 Million Women in Design.', 'women', 'See the sessions', { feats: ['F-CO-01'], handoff: ['admin'] }),
    ],
    head: [
      S('IDENTIFY', 'Planning', 'See where demand and curriculum differ.', 'A gap report across your programmes shows which skills employers want that your courses do not cover yet.', 'demand', 'See the demand map'),
      S('LEARN', 'Planning', 'Develop your faculty.', 'LM-IL-5 shows heads and faculty leads how to set the term slot and map credit. Ask for a topic your staff need and others can teach it.', 'learn-LM-IL-5', 'Open LM-IL-5', { feats: [], handoff: ['faculty'] }),
      S('APPLY', 'Term setup', 'Join LEAD for your institution.', 'Pick a licence by number of students, set the term slot and name a faculty lead. Prices are under Ways to join.', 'join-college', 'Start a campus licence'),
      S('APPLY', 'At sign-up', 'Pledge seats for women students.', 'When you join, commit a number of seats for women students. Part of your fee also goes to 1 Million Women in Design.', 'join-college', 'Pledge at sign-up', { feats: [], handoff: ['admin'] }),
      S('VALIDATE', 'End of term', 'See outcomes you can defend.', 'How many Passports were validated, how many live projects finished, how many faculty hours. No student names; groups under five stay hidden.', 'impact', 'See outcomes'),
      S('GET OPPORTUNITY', 'Placement season', 'Show readiness to employers.', 'Share verified readiness with your placement cell: shortlists, interviews and offers.', 'impact', 'See readiness'),
    ],
    industry: [
      S('IDENTIFY', 'Day 1', 'Tell us what capability you need.', 'A five-minute intake: the capability, the date you need it by, and how many assessors you can offer.', 'demand', 'State a need'),
      S('LEARN', 'Day 1', 'Upskill your team, and teach.', 'LM-IL-4 helps you plan learning for a working team. You can also offer hours as a teacher, or open a request for something you want the next generation to learn.', 'learn', 'Open Learn', { feats: [], handoff: ['mentor'] }),
      S('APPLY', 'Weeks 1–3', 'Bring one real problem.', 'The UMO team shapes your brief so it is safe to share: no confidential data, sanitised examples, clear IP terms. Share the cost with other companies if you like.', 'projects', 'Open the sponsor desk'),
      S('APPLY', 'Weeks 1–3', 'Sponsor a women’s cohort.', 'Fund seats for a cohort of women designers on your live project. Part of every fee also goes to 1 Million Women in Design.', 'join-sponsor', 'Sponsor a cohort', { feats: [], handoff: ['admin'] }),
      S('VALIDATE', 'Week 9', 'Score the work, blind.', 'Send an assessor to an assessment day. Names stay hidden until scores are locked.', 'assess', 'Open scoring'),
      S('CONNECT', 'Ongoing', 'Meet campuses.', 'Industry circles put your team in the room with faculty from several colleges.', 'calendar', 'See circles'),
      S('GET OPPORTUNITY', 'Month 3 on', 'Hire from evidence.', 'See shortlists with verified work attached, and a count of problems solved.', 'opportunities', 'See the shortlist'),
    ],
    mentor: [
      S('LEARN', 'Any time', 'Give a talk.', 'Offer a 45-minute session to several campuses at once.', 'calendar', 'Offer a session'),
      S('LEARN', 'Any time', 'Learn to coach and score well.', 'LM-IL-2 teaches the three-session coaching pattern. LM-IL-3 is a calibration session for scoring blind. Then give hours back as a teacher.', 'learn-LM-IL-2', 'Open LM-IL-2', { feats: [], handoff: ['student'] }),
      S('MENTOR', 'Weeks 4–8', 'Coach a team.', 'Three short sessions per team. Every hour is logged and counted.', 'sprints', 'Open my teams'),
      S('MENTOR', 'Any time', 'Offer a session for women designers.', 'Give an office hour or a talk for women in design. It counts toward your hours and toward 1 Million Women in Design.', 'women', 'See the initiative', { feats: [], handoff: ['admin'] }),
      S('VALIDATE', 'Week 9', 'Score blind.', 'Score against the shared rubric. You never score a team you mentored.', 'assess', 'Start scoring'),
      S('CONNECT', 'Ongoing', 'Be recognised.', 'Hours and assessment days earn distinctions you can share.', 'impact', 'See my hours'),
    ],
    open: [
      S('IDENTIFY', 'Day 1', 'Learn what the words mean.', 'The Skills Guide explains design skills in plain language and shows how many employers ask for each.', 'skills', 'Open the Skills Guide'),
      S('LEARN', 'Weeks 1–4', 'Start with a free module.', 'Begin with LM-SP-1, free and self-paced. When you are ready, try a peer circle or enrol on a Learning Path tied to a live project.', 'learn-LM-SP-1', 'Start LM-SP-1'),
      S('CONNECT', 'Monthly', 'Find a circle near you.', 'Meet people in Bengaluru or online.', 'calendar', 'Find a circle'),
      S('GET OPPORTUNITY', 'Month 2 on', 'Take an open live project.', 'Apply to an open-cohort live project and see what a real brief feels like.', 'opportunities', 'See the open board'),
    ],
  };
  const storyTabs = [
    { role: 'student', label: 'Student', lede: 'From your first week to your first role. Every step opens a real screen.' },
    { role: 'faculty', label: 'Faculty', lede: 'Teach with live industry input, without rewriting your course.' },
    { role: 'head', label: 'College', lede: 'Show outcomes you can defend, without adding cost you cannot.' },
    { role: 'industry', label: 'Industry', lede: 'Get a capability built, and find the people who can show it.' },
    { role: 'mentor', label: 'Mentor', lede: 'Give back in a way that fits your calendar, and is recognised.' },
    { role: 'open', label: 'Open learner', lede: 'Learn, find your people and get a way in. Free.' },
  ];

  const doors = [
    { role: 'student', name: 'Student', photo: 'door-student', line: 'Work on real briefs and leave with proof.', can: ['Take on a live company live project', 'Get coached by a practitioner', 'Earn a Passport employers can check'], plan: 'PATH_FRAMING', price: (f) => `Free to start · paths from ${f}` },
    { role: 'faculty', name: 'Faculty', photo: 'door-faculty', line: 'Teach with live briefs, without rewriting your course.', can: ['Slot a live project into a module', 'Co-teach with a practitioner', 'Score with a shared rubric'], plan: null, price: () => 'Through your campus' },
    { role: 'head', name: 'College', photo: 'door-college', line: 'Show placement outcomes you can defend.', can: ['Enrol cohorts by term', 'See validated Passports in aggregate', 'Report outcomes to your board'], plan: 'CAMPUS_STANDARD', price: (f) => `From ${f} a year` },
    { role: 'industry', name: 'Industry', photo: 'door-industry', line: 'Get a capability built and find the people who show it.', can: ['Bring a real, scoped problem', 'Send assessors to score work', 'See shortlists with evidence attached'], plan: 'INDUSTRY_TEAM', price: (f) => `From ${f} a seat a year` },
    { role: 'mentor', name: 'Mentor', photo: 'door-mentor', line: 'Give back in a way that fits your calendar.', can: ['Coach a team in three short sessions', 'Score blind against a shared rubric', 'Earn recognition for every hour'], plan: null, price: () => 'Free · recognised' },
    { role: 'open', name: 'Just curious', photo: 'door-open', line: 'Find out what design work is really like.', can: ['Read the Skills Guide', 'Join a circle near you', 'Try an open live project'], plan: null, price: () => 'Free' },
  ];
  const heroPromises = [
    { label: 'Teach with live briefs', role: 'faculty' },
    { label: 'Show outcomes you can defend', role: 'head' },
    { label: 'Find talent with proof', role: 'industry' },
    { label: 'Give back and be recognised', role: 'mentor' },
    { label: 'Just curious? Start free', role: 'open' },
  ];

  /* The homepage carousel. 'ms' is how long a leaf holds. The first leaf is a guided story that plays on its own. */
  const leaves = [
    { id: 'concept', kind: 'story', ms: 15000, label: 'The idea', eyebrow: 'LEAD by UMO Design', head: 'A loop that connects classrooms and workplaces.', line: 'Watch how one real problem travels around the loop.',
      beats: [
        { tile: 'Classroom', cap: 'A college runs a design term.' },
        { tile: 'Company', cap: 'A company brings a real problem to the class.' },
        { tile: 'Mentor', cap: 'A practitioner coaches the students.' },
        { tile: 'Passport', cap: 'Professionals score the work. The student earns a Passport.' },
        { tile: 'Job', cap: 'Employers hire from proof. Their next problem starts the loop again.' },
      ], primary: ['Start as a student', 'student'], second: ['See what is in it for you', 'ecosystem'] },
    { id: 'student', kind: 'role', ms: 7000, role: 'student', label: 'Student', photo: 'hero', head: 'Do real design work before you graduate.', line: 'Take on a live brief from a real company, get coached by a practitioner, and leave with proof employers trust.', primary: ['Join as a student', 'student'] },
    { id: 'faculty', kind: 'role', ms: 7000, role: 'faculty', label: 'Faculty', photo: 'door-faculty', head: 'Teach with live briefs.', line: 'Bring a real company problem into your module without rewriting your course.', primary: ['Join as faculty', 'faculty'] },
    { id: 'head', kind: 'role', ms: 7000, role: 'head', label: 'College', photo: 'door-college', head: 'Show outcomes you can defend.', line: 'See validated work, placements and faculty hours for your college. Pledge seats for women students.', primary: ['Join as a college', 'head'] },
    { id: 'industry', kind: 'role', ms: 7000, role: 'industry', label: 'Industry', photo: 'door-industry', head: 'Find talent with proof.', line: 'Bring one real problem, score the work blind, and hire from verified evidence. Sponsor a women’s cohort.', primary: ['Join as a company', 'industry'] },
    { id: 'mentor', kind: 'role', ms: 7000, role: 'mentor', label: 'Mentor', photo: 'door-mentor', head: 'Give back and be recognised.', line: 'Coach a team in three short sessions. Every hour is counted.', primary: ['Join as a mentor', 'mentor'] },
    { id: 'open', kind: 'role', ms: 7000, role: 'open', label: 'Just curious', photo: 'door-open', head: 'Just curious? Start free.', line: 'Read the Skills Guide, join a circle and try an open live project.', primary: ['Start free', 'open'] },
    { id: 'women', kind: 'women', ms: 7000, label: '1 Million Women', photo: 'women', head: 'Help reach 1 million women in design.', line: 'Part of every paid plan funds seats for women. Add a seat of your own, sponsor a cohort, or run a session.', primary: ['Join as a student', 'student'], second: ['See the initiative', 'women'] },
  ];

  const faq = [
    ['What can I learn here?', 'Modules in four formats: on your own, taught live, in a peer circle, or inside a real live project. Each has a code. LM-SP-1 means Learning Module, self-paced, number 1. Start with LM-SP-1, which is free and takes about 25 minutes.'],
    ['Can I teach?', 'Yes. Mentors, company staff, faculty and college staff can offer hours. Students can lead a peer circle after finishing a module. A UMO admin approves each offer.'],
    ['How do I ask for something to be taught?', 'Open a request in Learn. Everyone can see it. Others add “me too”, and a teacher can offer to take it on.'],
    ['What is 1 Million Women in Design?', 'An initiative of UMO Design Foundation to help one million women into design. Part of every paid plan on LEAD funds it, and you can add seats of your own.'],
    ['Do I pay extra for it?', 'No. The share comes out of the price you already pay. Adding a seat for a woman is optional, and you see the amount before you confirm.'],
    ['Is it free for students?', 'You can start free. An open account gives you the Skills Guide, circles and open live projects. Enrolling on a Path has a price. Every price on this page is mock and not an offer.'],
    ['Does my college have to be on LEAD?', 'No. Join free first. Linking your campus unlocks the live projects that run inside your college’s term.'],
    ['What is a Passport?', 'A record of work you did on a real live project, scored by professionals, with a link anyone can check. You decide who sees it, and you can stop sharing at any time.'],
    ['Who owns the work I do on a company’s problem?', 'The terms are being set with counsel. You will see them before you start a live project.'],
    ['Will assessors know who I am?', 'Not while they score. Assessors see names and colleges only after they lock their scores.'],
    ['What do the Skills Guide, Paths and the Codex mean?', 'The Skills Guide is a plain-language list of design skills. Paths (codes starting LP) are bundles of modules tied to a live project, with one price. The Codex is the rulebook for consent, IP, ethics and conflicts.'],
    ['What does it cost a college or a company?', 'A campus licence is priced by number of students, a company membership by seats, and a sponsored live project by live project. All prices here are mock.'],
    ['Who runs LEAD?', 'UMO Design Foundation, a non-profit. A UMO admin hosts the loop: they shape briefs, match campuses and give the second approval on Passports.'],
    ['Is this a real platform?', 'This is a working prototype with made-up people and data. Nothing is saved or charged.'],
  ];

  Object.assign(LEAD, { content: { stages, features, featureById, roles, roleById, evidence, gates, phases, valueKinds, actors, flows, stays, workflows, ixdf, demoByRole, demoOrder, plainPhase, plainGate, story, storyTabs, doors, heroPromises, leaves, faq } });
})(typeof globalThis !== 'undefined' ? globalThis : this);
