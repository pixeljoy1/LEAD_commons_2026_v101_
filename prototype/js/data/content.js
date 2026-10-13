/* LEAD · static content transcribed from docs/SPEC.md and docs/SPEC-ADDENDUM-01.md. */
(function (root) {
  const LEAD = (root.LEAD = root.LEAD || {});

  /* ---------- the loop (§4.2) with UMO vocabulary tags (A2.3, proposal) ---------- */
  const stages = [
    { id: 'IDENTIFY', n: '01', module: 'Demand Map + Lexicon', what: 'Industry states the capability it needs', umo: 'EXPRESS' },
    { id: 'LEARN', n: '02', module: 'Paths', what: 'Short modules, linked to a live challenge', umo: 'EXCEL' },
    { id: 'APPLY', n: '03', module: 'Challenges', what: 'Real, scoped, NDA-safe problems taken into a term', umo: 'EXECUTE' },
    { id: 'MENTOR', n: '04', module: 'Mentor Sprints', what: 'Time-boxed practitioner feedback', umo: 'EXPERTISE' },
    { id: 'SOLVE', n: '05', module: 'Submissions', what: 'Team deliverable plus decision log', umo: 'EXECUTE' },
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
    F('F-ID-06', 'Demand Map curation', 'Steward merges intakes into themes and publishes the Skills Opportunity Map', 'High-demand and underserved areas', 'New', 'P0'),
    F('F-ID-07', 'Lexicon', 'Plain definitions of capabilities and the roles they lead to', '“What is core?”', 'Replicate', 'P0'),
    F('F-LE-01', 'Path linked to a live challenge', 'Only the modules the challenge needs', 'Tools taught in Y1, gone by Y4', 'Adapt', 'P0 (mock)'),
    F('F-LE-02', 'Fundamentals shelf', 'Stable basics kept apart from tool training', 'Strong fundamentals while being able to adapt', 'Replicate', 'P0 (mock)'),
    F('F-LE-03', 'Faculty residency', 'Faculty development tied to a live challenge', '“We all do FDPs… the gap remains”', 'Adapt', 'P1'),
    F('F-LE-04', 'Practitioner sessions', 'Industry leaders teach, one public talk a term', 'Faculty lose live industry contact', 'Replicate', 'P1'),
    F('F-LE-05', 'Open Paths', 'Self-paced modules, free to start', 'Equity of access', 'Replicate', 'P2'),
    F('F-AP-01', 'Challenge workspace', 'Team, milestones, a deliberately ambiguous brief', '“Solves the brief, can’t find the brief”', 'New', 'P0'),
    F('F-AP-02', 'Decision log', 'Record why you chose; defended at review', '“Can’t defend a design decision”', 'New', 'P0'),
    F('F-AP-03', 'Challenge-in-a-course kit', 'Fit a challenge into an existing module, with credit-window mapping', 'Curriculum rigidity; NEP', 'New', 'P0 (mock)'),
    F('F-AP-04', 'NDA-safe case library', 'Sanitised real cases for teaching', 'NDAs block real case studies', 'New', 'P1'),
    F('F-AP-05', 'Cohort enrolment and term slots', 'Enrol cohorts, fix the term slot', 'Curriculum rigidity', 'New', 'P0 (mock)'),
    F('F-AP-06', 'LEAD Campus membership', 'Access by institution size. Band ₹5–15 lakh a year, untested', 'Madhukar’s note', 'Replicate', 'P2'),
    F('F-AP-07', 'Challenge sponsor desk', 'Shape a scoped, NDA-safe brief with the steward', 'Industry doesn’t give proper projects', 'New', 'P0'),
    F('F-AP-08', 'Pooled sponsorship', 'Companies share a challenge’s cost', '“Why train someone for a competitor?”', 'Adapt', 'P2'),
    F('F-AP-09', 'Challenge shaping and matching', 'Steward makes briefs NDA-safe and scoped; matches to campuses', 'NDAs block real cases', 'New', 'P0'),
    F('F-ME-01', 'Mentor sprint', 'Three 45-minute sessions with an industry mentor', '“Never done full projects, requires mentoring”', 'New', 'P0'),
    F('F-ME-02', 'Private feedback thread', 'Feedback stays inside the team and assigned mentor', 'Trust and Compliance', 'New', 'P0'),
    F('F-ME-03', 'Co-mentoring', 'Faculty sit in on mentor sprints', 'Good practitioners cost money', 'New', 'P1'),
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
    F('F-CO-03', 'Distinctions', 'Recognition for hours and sprints', 'Recognition without cost', 'Adapt', 'P2'),
    F('F-CO-04', 'Circles and Chapters', 'Local and online groups', 'Cross-pollination', 'Adapt', 'P2'),
    F('F-OP-01', 'Opportunity board', 'Roles and internships tied to verified evidence', 'Why is 40% not placed?', 'New', 'P0'),
    F('F-OP-02', 'Learning contract', 'Internships carry a mentor, a learning plan and a stipend field', 'Internships are seen as cheap labour', 'New', 'P0'),
    F('F-OP-03', 'Placement readiness view', 'Verified readiness against open roles', 'Why is 40% not placed?', 'New', 'P0 (mock)'),
    F('F-OP-04', 'Verified shortlist', 'Candidates with evidence attached, shared by the students', 'Employers need evidence they trust', 'New', 'P0'),
    F('F-OP-05', 'Problems solved', 'The ledger counts what a challenge solved', '“How many industry problems were solved?”', 'New', 'P0'),
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
      sees: ['Lexicon and Paths', 'Open challenges on my campus', 'My Passport and mentor sessions'],
      can: ['Join or form a team', 'Submit work and a decision log', 'Request a mentor sprint', 'Share my Passport link'],
      cannot: ['See other students’ feedback', 'See employer shortlisting notes'],
      journey: [
        J('IDENTIFY', 'Week 1', ['F-ID-01', 'F-ID-02'], 'Demand Map · this term', [['Framing the problem', 'asked by 7 companies'], ['Defending a design decision', '5'], ['Business context', '4']], 'Pick a capability', ['industry'], 'demand'),
        J('LEARN', 'Weeks 1–3', ['F-LE-01', 'F-LE-02'], 'Your path', [['Problem framing', 'Done'], ['Interviewing stakeholders', 'In progress'], ['Defending a decision', 'Next']], 'Continue', [], 'lexicon'),
        J('APPLY', 'Weeks 3–8', ['F-AP-01', 'F-AP-02'], 'Challenge · Reduce onboarding drop-off', [['Milestone', '2 of 5'], ['Team', '4 of 4 joined'], ['Decision log', '6 entries']], 'Add a decision', ['mentor'], 'team'),
        J('MENTOR', 'Weeks 4–8', ['F-ME-01', 'F-ME-02'], 'Mentor sprint · session 2', [['Mentor', 'Kavya Iyer'], ['Agenda', 'Defend your scope'], ['Notes', 'Private to team']], 'Join session', ['mentor'], 'sprints'),
        J('SOLVE', 'Week 8', ['F-SO-01'], 'Submission', [['Deliverable', 'Prototype + deck'], ['Decision log', 'Attached'], ['AI-use declaration', 'Required']], 'Submit', ['mentor'], 'submit'),
        J('VALIDATE', 'Week 9', ['F-VA-01'], 'Assessment · result', [['Framing', 'Strong'], ['Decision defence', 'Developing'], ['Passport entry', 'Added, verifiable']], 'Share Passport link', ['mentor', 'steward'], 'passports'),
        J('GET OPPORTUNITY', 'Month 3 on', ['F-OP-01', 'F-OP-02'], 'Opportunity board', [['Associate designer', 'Shares your Passport'], ['Internship · 3 months', 'Learning contract'], ['Applied', '2']], 'Apply', ['industry'], 'opportunities'),
      ],
    },
    {
      id: 'faculty', name: 'Faculty', short: 'Faculty', lens: 'College', person: 'Prof. Meera Nair · Campus A',
      goal: 'Teach with live industry input without rewriting my course.', access: 'Member, via campus',
      sees: ['Challenge and sanitised case library', 'Progress of my cohort', 'Assessor rubrics'],
      can: ['Slot a challenge into a module', 'Co-mentor with a practitioner', 'Score with the shared rubric', 'Claim workload credit'],
      cannot: ['See other campuses’ student data'],
      journey: [
        J('IDENTIFY', 'Before term', ['F-ID-03'], 'Gap check · Studio 3', [['Covered', '9 of 14'], ['Uncovered, high demand', 'Framing, business context'], ['Suggested challenges', '2']], 'Open challenge library', ['industry'], 'challenges'),
        J('LEARN', 'Term start', ['F-LE-03', 'F-LE-04'], 'Residency · week 1', [['Practitioner', 'Design director, fintech'], ['Your role', 'Co-teach'], ['Hours logged', '6']], 'Log hours', ['mentor'], 'calendar'),
        J('APPLY', 'Weeks 2–8', ['F-AP-03', 'F-AP-04'], 'Module mapping', [['Module', 'Studio 3'], ['Credit window', 'Mapped'], ['Challenge live', 'Week 3']], 'Confirm mapping', ['steward'], 'challenges'),
        J('MENTOR', 'Weeks 4–8', ['F-ME-03'], 'Co-mentoring', [['Sessions attended', '3'], ['Teams covered', '2'], ['Notes', 'Shared with you']], 'View notes', ['mentor'], 'team'),
        J('VALIDATE', 'Week 9', ['F-VA-02'], 'Rubric v2', [['Framing', '25%'], ['Decision defence', '25%'], ['Business context', '20%']], 'Approve rubric', ['mentor', 'steward'], 'assess'),
        J('CONNECT', 'Ongoing', ['F-CO-01'], 'Calendar · next 30 days', [['Industry circle', 'Wed'], ['Assessment day', '14 Nov'], ['Guest session', '21 Nov']], 'Add event', ['steward'], 'calendar'),
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
        J('APPLY', 'Term setup', ['F-AP-05', 'F-AP-06'], 'Membership', [['Tier', 'By institution size'], ['Fee band (proposed)', '₹5–15 lakh a year'], ['Cohorts', '2']], 'Review agreement', ['steward'], 'join-college'),
        J('VALIDATE', 'End of term', ['F-VA-07'], 'Outcomes · cohort A', [['Passports validated', '38 of 60'], ['Challenges completed', '12'], ['Faculty hours', '54']], 'Download report', ['steward'], 'impact'),
        J('GET OPPORTUNITY', 'Placement season', ['F-OP-03'], 'Readiness · cohort A', [['Shortlisted by employers', '21'], ['Interviews', '14'], ['Offers', '5']], 'Share with placement cell', ['industry'], 'impact'),
      ],
    },
    {
      id: 'industry', name: 'Industry leader', short: 'Industry', lens: 'Employer', person: 'Rohan Mehta · Northwind Bank',
      goal: 'Get a capability built, and find the people who can show it.', access: 'Organisation member',
      sees: ['My challenges and submissions', 'Anonymised cohort results', 'Passports students choose to share'],
      can: ['State a capability need', 'Sponsor a challenge', 'Send assessors', 'Shortlist verified talent'],
      cannot: ['See student data that was not shared', 'Contact students outside the platform before consent'],
      journey: [
        J('IDENTIFY', 'Day 1', ['F-ID-05'], 'Capability intake', [['Capability', 'Framing ambiguous problems'], ['Needed by', 'Q2'], ['Seats you could offer', '3 assessors']], 'Submit to steward', ['steward'], 'demand'),
        J('APPLY', 'Weeks 1–3', ['F-AP-07', 'F-AP-08'], 'Sponsor desk · brief v1', [['NDA-safe', 'Yes'], ['Co-sponsors', '2 companies'], ['Campuses interested', '3']], 'Approve brief', ['steward', 'faculty'], 'challenges'),
        J('VALIDATE', 'Week 9', ['F-VA-03'], 'Assessment day · seat', [['Submissions', '12'], ['Blind-first', 'On'], ['Your hours', '4']], 'Start scoring', ['mentor'], 'assess'),
        J('CONNECT', 'Ongoing', ['F-CO-02'], 'Industry circle · Wed', [['Attending', '8 companies'], ['Campuses', '4'], ['Topic', '“Readiness, defined”']], 'RSVP', ['steward'], 'calendar'),
        J('GET OPPORTUNITY', 'Month 3 on', ['F-OP-04', 'F-OP-05'], 'Impact · your challenges', [['Problems solved', '1 of 1'], ['Candidates shortlisted', '6'], ['Hired or deployed', '2']], 'View evidence', ['head', 'steward'], 'opportunities'),
      ],
    },
    {
      id: 'mentor', name: 'Mentor & assessor', short: 'Mentor', lens: 'Employer', person: 'Kavya Iyer · practitioner',
      goal: 'Give back in a way that fits my calendar and is recognised.', access: 'Verified practitioner',
      sees: ['Assigned teams', 'The rubric', 'My hours and distinctions'],
      can: ['Book sprints', 'Give feedback', 'Score blind-first', 'Nominate peers'],
      cannot: ['See student identities before blind scoring ends', 'Recruit during assessment'],
      journey: [
        J('LEARN', 'Any time', ['F-LE-04'], 'Session · 21 Nov', [['Audience', '3 campuses'], ['Length', '45 min'], ['Credit', '1 session']], 'Confirm', ['faculty'], 'calendar'),
        J('MENTOR', 'Weeks 4–8', ['F-ME-01', 'F-ME-04'], 'Mentor sprints · you', [['Teams', '2'], ['Hours this term', '4.5'], ['Next session', 'Tue 4pm']], 'Open team notes', ['student', 'faculty'], 'sprints'),
        J('VALIDATE', 'Week 9', ['F-VA-04', 'F-VA-05'], 'Scoring · submission 4 of 12', [['Rubric', 'Shared'], ['Names', 'Hidden'], ['Score', 'Saved']], 'Next submission', ['student', 'steward'], 'assess'),
        J('CONNECT', 'Ongoing', ['F-CO-03'], 'Your distinctions', [['Mentor', '10 hours'], ['Assessor', '1 day'], ['Circle host', '—']], 'Share badge', ['steward'], 'impact'),
      ],
    },
    {
      id: 'steward', name: 'UMO steward', short: 'Steward', lens: 'UXINDIA Chair', person: 'Nisha Thomas · UMO',
      goal: 'Host the whole loop between meetings, and prove it works.', access: 'Steward, platform',
      sees: ['The whole loop in aggregate', 'The operations queue', 'Quality flags'],
      can: ['Shape intake and match', 'Approve mentors and assessors', 'Publish the Codex', 'Report at 30 and 90 days'],
      cannot: ['Change a student’s outcome alone (two-person approval)'],
      journey: [
        J('IDENTIFY', 'Continuous', ['F-ID-06'], 'Demand Map · queue', [['New intakes', '6'], ['Merged into themes', '3'], ['Published', '2']], 'Review intakes', ['industry'], 'demand'),
        J('APPLY', 'Weeks 1–3', ['F-AP-09'], 'Matching', [['Briefs open', '4'], ['Campuses ready', '5'], ['Matched', '2']], 'Match next', ['faculty', 'industry'], 'challenges'),
        J('MENTOR', 'Continuous', ['F-ME-05'], 'Mentor pool', [['Active mentors', '14'], ['Hours this term', '62'], ['Gap vs demand', '−3']], 'Invite mentors', ['mentor'], 'sprints'),
        J('VALIDATE', 'Week 9', ['F-VA-06'], 'Integrity checks', [['Rubrics approved', '3 of 3'], ['Conflicts flagged', '0'], ['Entries pending second approval', '4']], 'Approve', ['mentor', 'head'], 'passports'),
        J('GET OPPORTUNITY', 'Day 30 and 90', ['F-OP-06'], 'Impact · day 30', [['Challenges live', '3'], ['Problems solved', '1'], ['Verified Passports', '38']], 'Publish report', ['head', 'industry'], 'impact'),
      ],
    },
    {
      id: 'open', name: 'Open community', short: 'Open', lens: 'Wider Audience', person: 'Dev Malhotra · open member',
      goal: 'Learn, find my people, and get a way in.', access: 'Open, free tier',
      sees: ['Lexicon', 'Public showcases', 'Circle events', 'Open-cohort challenges'],
      can: ['Join a Circle', 'Follow capabilities', 'Apply to an open cohort'],
      cannot: ['See campus-only challenges', 'See other people’s Passports'],
      journey: [
        J('IDENTIFY', 'Day 1', ['F-ID-07'], 'Lexicon · “Framing the problem”', [['Definition', 'Plain language'], ['Levels', '4 descriptors'], ['Asked by', '7 companies']], 'Follow', [], 'lexicon'),
        J('LEARN', 'Weeks 1–4', ['F-LE-05'], 'Open path', [['Module', 'Stakeholder interviews'], ['Progress', '2 of 5'], ['Next', 'Quiz']], 'Continue', [], 'join-path'),
        J('CONNECT', 'Monthly', ['F-CO-04'], 'Circles near you', [['Bengaluru', 'Wed'], ['Online', 'Fri'], ['Members', '120']], 'Join', ['steward'], 'calendar'),
        J('GET OPPORTUNITY', 'Month 2 on', ['F-OP-07'], 'Open board', [['Open cohort challenge', 'Applications open'], ['Internship', '1'], ['Mentor match', '2']], 'Apply', ['steward'], 'opportunities'),
      ],
    },
    {
      id: 'admin', name: 'UMO admin (mock)', short: 'Admin', lens: 'UXINDIA Chair', person: 'Admin A or Admin B',
      goal: 'Set prices and offers once, and see them reach every sign-up safely.', access: 'Admin, pricing (mock)',
      sees: ['Plans, price history and tiers', 'Coupons and redemptions', 'Every mock sign-up', 'The audit log'],
      can: ['Create plans and set prices', 'Create coupons by name and percent', 'Approve another admin’s coupon', 'Set the announcement banner'],
      cannot: ['Approve a coupon they created', 'Edit a price in place (a new version is made)', 'Rename or delete a key a sign-up used'],
      journey: [
        J('IDENTIFY', 'Before launch', ['F-PR-01', 'F-PR-02'], 'Plans', [['Live plans', '6'], ['Demo prices', 'All but the campus band'], ['Unpriced', '0']], 'Set a price', ['steward'], 'admin-plans'),
        J('APPLY', 'Any time', ['F-PR-04', 'F-PR-05'], 'Coupons', [['Active', '3'], ['Waiting for approval', '1'], ['Threshold', '50%']], 'Create coupon', ['admin'], 'admin-coupons'),
        J('CONNECT', 'Campaigns', ['F-PR-12', 'F-PR-07'], 'Banner', [['Status', 'On'], ['Reaches', 'Every page'], ['Propagation', 'Under 5 seconds']], 'Edit banner', [], 'admin-banner'),
        J('GET OPPORTUNITY', 'Weekly', ['F-PR-14'], 'Sign-ups', [['Mock sign-ups', 'Live count'], ['Snapshots', 'Kept'], ['Charged', 'Nothing']], 'Open log', ['steward'], 'admin-signups'),
      ],
    },
  ];
  const roleById = Object.fromEntries(roles.map((r) => [r.id, r]));

  /* ---------- verdict: room evidence (§3.2) and gates (§2.3) ---------- */
  const evidence = [
    { n: 1, quote: '“Industry doesn’t give students proper projects.”', means: 'Real, scoped industry problems are the scarce input. Build a challenge exchange.', reading: 'Supports' },
    { n: 2, quote: '“What is core?” “Day 1 readiness”', means: 'A shared definitions layer is missing and cheap to build.', reading: 'Supports' },
    { n: 3, quote: '“We all do FDPs, live projects, internships, and the gap still remains.”', means: 'Do not repackage the same programmes. Only the closed loop and validation are new.', reading: 'Challenges' },
    { n: 4, quote: '“Low company budget for training.” “Why train someone for a competitor?”', means: 'Industry willingness to pay is unproven. Test price before building.', reading: 'Challenges' },
    { n: 5, quote: '“Why is 40% not placed? Is the remaining 60% industry ready?”', means: 'Employers need evidence they trust.', reading: 'Supports' },
    { n: 6, quote: 'Do First: decision defence, accountability, job ethics, soft-skills, trust and compliance', means: 'Behaviours are learned by practice with feedback. Practice and mentoring lead, not courses.', reading: 'Neutral' },
    { n: 7, quote: '“Nobody volunteers; good practitioners cost money.”', means: 'Custodian and mentor economics come before software.', reading: 'Challenges' },
    { n: 8, quote: '“What do you measure??”', means: 'Build the Impact Ledger from day one. Problems solved beats programmes run.', reading: 'Supports' },
    { n: 9, quote: 'A joint Design Calendar; touchpoints at 30 and 90 days', means: 'Ship the calendar first.', reading: 'Supports' },
  ];
  const gates = [
    { id: 'G1', name: 'Supply', test: 'At least 3 companies each post one real, scoped challenge with a named owner', by: 'Day 60 · Wed 25 Nov 2026', target: 3, count: 1, unit: 'companies' },
    { id: 'G2', name: 'Demand', test: 'At least 3 campuses commit a faculty lead and a term slot; 2 would sign a letter of intent in the fee band', by: 'Day 60 · Wed 25 Nov 2026', target: 3, count: 2, unit: 'campuses' },
    { id: 'G3', name: 'Trust', test: 'At least 1 employer states in writing that it would count validated evidence when shortlisting', by: 'Day 90 · Fri 18 Dec 2026', target: 1, count: 0, unit: 'employer' },
    { id: 'G4', name: 'Mentor supply', test: 'At least 10 practitioners give 4 or more hours each, or a mentor-credit model is agreed', by: 'Day 90 · Fri 18 Dec 2026', target: 10, count: 4, unit: 'practitioners' },
    { id: 'G5', name: 'Custody', test: 'UMO confirmed as steward, the host for the empty UXINDIA Chair lens', by: '30-day sync · Mon 26 Oct 2026', target: 1, count: 0, unit: 'confirmation' },
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
    { id: 'money', label: 'Money', note: 'Fees, sponsorship, honoraria' },
    { id: 'problem', label: 'Problems', note: 'Real, scoped industry challenges' },
    { id: 'capability', label: 'Capability', note: 'Learning, teaching, practice' },
    { id: 'evidence', label: 'Evidence', note: 'Scores, Passports, outcomes' },
    { id: 'talent', label: 'Talent', note: 'Roles, internships, hires' },
    { id: 'time', label: 'Time', note: 'Mentor and assessor hours' },
    { id: 'recognition', label: 'Recognition', note: 'Distinctions, credit, stage' },
    { id: 'consent', label: 'Consent & data', note: 'Sharing choices, governed by the Codex' },
  ];

  /* x, y in a 1000 × 640 viewBox. */
  const actors = [
    { id: 'student', label: 'Student', group: 'College', x: 170, y: 250, role: 'student' },
    { id: 'faculty', label: 'Faculty', group: 'College', x: 110, y: 390, role: 'faculty' },
    { id: 'head', label: 'Institution head', group: 'College', x: 200, y: 530, role: 'head' },
    { id: 'challenge', label: 'Industry Challenge', group: 'Joint Project', x: 500, y: 215 },
    { id: 'steward', label: 'UMO steward', group: 'UXINDIA Chair', x: 500, y: 385, role: 'steward', hub: true },
    { id: 'industry', label: 'Industry leader', group: 'Employer', x: 830, y: 255, role: 'industry' },
    { id: 'mentor', label: 'Mentor & assessor', group: 'Employer', x: 880, y: 420, role: 'mentor' },
    { id: 'open', label: 'Open community', group: 'Wider Audience', x: 560, y: 570, role: 'open' },
    { id: 'school', label: 'UMO Design School', group: 'Connected', x: 160, y: 70, ext: true, href: 'https://umodesign.school' },
    { id: 'catalysts', label: 'Mentors & Catalysts', group: 'Connected', x: 400, y: 70, ext: true, href: 'https://umo.design' },
    { id: 'uxin', label: 'UXIN jobs', group: 'Connected', x: 620, y: 70, ext: true, href: 'https://uxin.co' },
    { id: 'uxindia', label: 'UXINDIA', group: 'Connected', x: 850, y: 70, ext: true, href: 'https://umo.design' },
  ];

  /* state per phase: manual · sim · real · none · reserved */
  const Fl = (id, from, to, kind, label, detail, stage, v0, p1, v1, p3) => ({ id, from, to, kind, label, detail, stage, phase: { v0, p1, v1, p3 } });
  const flows = [
    Fl('f1', 'industry', 'steward', 'problem', 'Capability need', 'A five-minute intake: the capability, need-by date, assessor seats and whether data is sensitive.', 'IDENTIFY', 'manual', 'sim', 'real', 'real'),
    Fl('f2', 'steward', 'challenge', 'problem', 'Shaped, NDA-safe brief', 'The steward merges intakes into themes and shapes a brief. R6: no personal or confidential data, sanitised examples, IP terms chosen.', 'APPLY', 'manual', 'sim', 'real', 'real'),
    Fl('f3', 'challenge', 'student', 'problem', 'Live challenge in a term', 'Matched to a campus term. Teams form, keep a decision log and work against a deliberately ambiguous brief.', 'APPLY', 'manual', 'sim', 'real', 'real'),
    Fl('f4', 'faculty', 'challenge', 'capability', 'Mapped into a module', 'Faculty slot the challenge into an existing module with a credit window. No course rewrite.', 'APPLY', 'manual', 'sim', 'real', 'real'),
    Fl('f5', 'mentor', 'student', 'time', 'Mentor sprints', 'Three 45-minute sessions. Notes stay in a private thread for the team and mentor.', 'MENTOR', 'manual', 'sim', 'real', 'real'),
    Fl('f6', 'student', 'mentor', 'evidence', 'Submission pack', 'Deliverable, decision log, reflection and an AI-use declaration (R7). Scored blind-first (R1).', 'SOLVE', 'manual', 'sim', 'real', 'real'),
    Fl('f7', 'mentor', 'steward', 'evidence', 'Locked blind scores', 'Assessors score against the shared rubric. A mentor never scores their own team (R5).', 'VALIDATE', 'manual', 'sim', 'real', 'real'),
    Fl('f8', 'steward', 'student', 'evidence', 'Verified Passport entry', 'A second approval (R2) turns a proposed entry into a verifiable link anyone can check.', 'VALIDATE', 'manual', 'sim', 'real', 'real'),
    Fl('f9', 'student', 'industry', 'consent', 'Passport, shared by choice', 'Employers see only what a student shares, and sharing can be revoked at any time (R3).', 'GET OPPORTUNITY', 'manual', 'sim', 'real', 'real'),
    Fl('f10', 'industry', 'student', 'talent', 'Role or internship', 'Opportunities tied to verified evidence. Every internship carries a learning contract with a mentor and a stipend field.', 'GET OPPORTUNITY', 'manual', 'sim', 'real', 'real'),
    Fl('f11', 'steward', 'industry', 'evidence', 'Problems solved', 'The Impact Ledger counts a challenge as solved when the sponsor’s named owner confirms it.', 'GET OPPORTUNITY', 'manual', 'sim', 'real', 'real'),
    Fl('f12', 'steward', 'head', 'evidence', 'Outcomes view', 'Validated Passports, challenges completed and faculty hours per cohort. Groups under 5 stay hidden (R4).', 'VALIDATE', 'manual', 'sim', 'real', 'real'),
    Fl('f13', 'head', 'steward', 'money', 'Campus licence', 'Proposed ₹5–15 lakh a year by institution size. Untested. Mock checkout only in Phase 1.', 'APPLY', 'none', 'sim', 'manual', 'real'),
    Fl('f14', 'industry', 'steward', 'money', 'Membership & sponsorship', 'Seats for teams and per-challenge sponsorship. Demo prices; no industry-side price exists yet.', 'APPLY', 'none', 'sim', 'manual', 'real'),
    Fl('f15', 'industry', 'mentor', 'time', 'Assessor seats', 'Companies send practitioners to assessment days. Free seats; they feed the supply gate (G4).', 'VALIDATE', 'manual', 'sim', 'real', 'real'),
    Fl('f16', 'steward', 'mentor', 'recognition', 'Hours and distinctions', 'Every mentor hour is counted. Distinctions answer “nobody volunteers”. Honoraria or credit is an open decision.', 'MENTOR', 'manual', 'sim', 'real', 'real'),
    Fl('f17', 'mentor', 'faculty', 'capability', 'Practitioner sessions', 'Residencies and co-mentoring keep faculty in live industry contact.', 'LEARN', 'manual', 'sim', 'real', 'real'),
    Fl('f18', 'steward', 'open', 'capability', 'Lexicon, Circles, open cohort', 'Plain definitions, local and online Circles, and a way into an open-cohort challenge.', 'CONNECT', 'none', 'sim', 'none', 'real'),
    Fl('f19', 'open', 'steward', 'consent', 'Joins with consent', 'A free open-tier member, after the consent manager records what they agreed to.', 'CONNECT', 'none', 'sim', 'none', 'real'),
    Fl('f20', 'school', 'student', 'capability', 'Course content (link out)', 'LEAD links to the UMO Design School for courses and certification. It does not duplicate them.', 'LEARN', 'manual', 'sim', 'real', 'real'),
    Fl('f21', 'catalysts', 'mentor', 'time', 'Seeds the mentor pool', 'UMO Mentors & Catalysts seed the pool, each person by consent.', 'MENTOR', 'manual', 'sim', 'real', 'real'),
    Fl('f22', 'uxin', 'open', 'talent', 'General jobs (link out)', 'UXIN carries general jobs. LEAD’s board keeps only evidence-backed roles.', 'GET OPPORTUNITY', 'manual', 'sim', 'real', 'real'),
    Fl('f23', 'uxindia', 'industry', 'recognition', 'Design Pitch stage', 'A showcase at CONNECT. Reserved as a bundle overlay.', 'CONNECT', 'none', 'none', 'none', 'reserved'),
    Fl('f24', 'industry', 'open', 'money', 'Scholarship & gift match', 'A paid seat funds a free one, as the School’s “Give a gift of Design” does. Reserved; needs a finance and legal decision.', 'LEARN', 'none', 'none', 'none', 'reserved'),
  ];

  const stays = {
    student: { gives: 'Work, a decision log, consent to share', gets: 'Real problems, mentors, a Passport employers trust, a way to a role', why: 'Evidence beats a transcript when 40% are not placed.', risk: 'If challenges are thin, the Passport means little.', quote: '“Never done full projects, requires mentoring.”' },
    faculty: { gives: 'A module slot, co-mentoring, rubric input', gets: 'Live industry input without a course rewrite, workload credit', why: 'The kit fits the existing curriculum and credit window.', risk: 'Without workload credit, faculty time is invisible.', quote: '“We all do FDPs… and the gap still remains.”' },
    head: { gives: 'The licence fee, a faculty lead, a term slot', gets: 'Outcomes for accreditation and placement, aggregate evidence', why: 'Outcomes are measurable and defensible against the fee band.', risk: 'The ₹5–15 lakh band is untested (G2).', quote: '“Why is 40% not placed?”' },
    industry: { gives: 'Real problems, assessors, sponsorship', gets: 'A capability built, verified candidates, problems solved', why: 'Pooled sponsorship and early talent access answer “why train a competitor’s hire?”', risk: 'Willingness to pay is unproven (G1, G3).', quote: '“Low company budget for training.”' },
    mentor: { gives: 'Hours, feedback, blind scores', gets: 'Recognition, distinctions, a credit model', why: 'Time-boxed sprints fit a calendar; every hour is counted.', risk: 'Good practitioners cost money (G4).', quote: '“Nobody volunteers; good practitioners cost money.”' },
    steward: { gives: 'Shaping, matching, integrity, reports', gets: 'A mandate, fees that fund the loop, proof it works', why: 'The UXINDIA Chair lens held no cards. Someone has to host the loop.', risk: 'Without custody (G5), nothing runs between meetings.', quote: 'UXINDIA Chair and Wider Audience held no cards.' },
    open: { gives: 'Attention, participation, consent', gets: 'Plain definitions, Circles, an on-ramp into a cohort', why: 'Free to start; Awareness is the row that did not travel.', risk: 'Without an owner, the open tier stays empty.', quote: 'Awareness did not travel to the Venn.' },
    challenge: { gives: 'A real, scoped problem', gets: 'Solutions, a problems-solved record', why: 'It is the joint project both lenses own.', risk: 'NDAs block real cases unless shaped (R6).', quote: '“Industry doesn’t give students proper projects.”' },
    school: { gives: 'Courses, certification, scholarships', gets: 'Learners routed from LEAD Paths', why: 'Connect, do not duplicate.', risk: 'Open decision: who sells LEAD Paths (A17 #1).', quote: 'UMO Design School · “EXCEL”' },
    catalysts: { gives: 'Experienced mentors', gets: 'A structured way to give time', why: 'The pool already exists.', risk: 'Consent per person.', quote: 'UMO Mentors & Catalysts' },
    uxin: { gives: 'General design jobs', gets: 'Traffic from the open tier', why: 'LEAD keeps only evidence-backed roles.', risk: 'Overlap if the boards blur.', quote: 'uxin.co' },
    uxindia: { gives: 'A stage and an audience', gets: 'Showcase content from the loop', why: 'Design Pitch fits CONNECT.', risk: 'Reserved until a bundle decision (§19 #9).', quote: 'UXINDIA · 23–27 Sept, Bengaluru' },
  };

  /* ---------- workflows (§7) ---------- */
  const workflows = [
    { id: 'W1', name: 'Demand to Challenge', seq: ['industry', 'steward', 'faculty'], result: 'Intake submitted → published challenge matched to a campus term' },
    { id: 'W2', name: 'Learn, Apply, Mentor', seq: ['student', 'mentor', 'faculty'], result: 'Team formed → three mentor sprints complete' },
    { id: 'W3', name: 'Solve to Passport', seq: ['student', 'mentor', 'steward'], result: 'Submission → blind scoring → second approval → Verified Passport entry' },
    { id: 'W4', name: 'Passport to Opportunity', seq: ['student', 'industry', 'head'], result: 'Student shares → employer shortlists → outcome recorded' },
    { id: 'W5', name: 'Faculty uplift', seq: ['faculty', 'mentor', 'head'], result: 'Faculty co-mentor → hours and credit recognised' },
    { id: 'W6', name: 'Measure and re-aim', seq: ['steward', 'head', 'industry'], result: 'Impact Ledger published → feeds the Demand Map' },
    { id: 'W7', name: 'Open on-ramp', seq: ['open', 'steward', 'student'], result: 'Open learner completes a path → invited into an open cohort' },
  ];

  /* ---------- IxDF mapping (§4.1) ---------- */
  const ixdf = [
    ['Open library of articles and videos', 'LEAD Lexicon', 'Replicate', 'Answers “what is core?”, with a demand signal per definition'],
    ['Self-paced courses with certificates', 'LEAD Paths', 'Adapt', 'Weighted to practice with feedback'],
    ['Verifiable certificates and Distinctions', 'Skills Passport', 'Adapt', 'Evidence is validated work, not course completion'],
    ['Master Classes with industry leaders', 'Practitioner Sessions', 'Replicate', 'Feeds faculty development'],
    ['Community and Local Groups', 'Chapters + Circles on one calendar', 'Adapt', 'The calendar is the room’s own idea'],
    ['Company Memberships', 'Industry Membership', 'Replicate', 'Pooled funding and early talent access'],
    ['Toolkits for educators', 'Faculty Toolkit', 'Adapt', 'Answers curriculum rigidity'],
    ['The Educational Codex', 'LEAD Codex', 'Adapt', 'Trust and Compliance, Job Ethics, Economic Constraint'],
    ['No equivalent', 'Challenges · Sprints · Assessment Days · Opportunity Board · Impact Ledger', 'New', 'Where the room’s evidence points'],
  ];

  /* ---------- demo script (§18.2 + A16 9a–9c) ---------- */
  const demo = [
    { role: 'steward', route: 'verdict', say: 'Verdict: worth testing, not yet worth building. Tick the gates.' },
    { role: 'steward', route: 'model', say: 'The service model: who gives what to whom, and what each phase makes real.' },
    { role: 'industry', route: 'choose', say: 'Access chooser. Pick Industry leader.' },
    { role: 'industry', route: 'demand', say: 'As Industry leader, submit a capability intake.' },
    { role: 'steward', route: 'demand', say: 'As Steward, review the intake, merge it and publish the theme.' },
    { role: 'steward', route: 'challenges', say: 'Shape the brief (NDA-safe check) and match it to Campus A.' },
    { role: 'student', route: 'team', say: 'As Student: open the challenge workspace, log a decision.' },
    { role: 'student', route: 'sprints', say: 'Book a mentor sprint.' },
    { role: 'mentor', route: 'assess', say: 'As Mentor & assessor, score blind. Names stay hidden until scores lock.' },
    { role: 'steward', route: 'passports', say: 'As Steward, give the second approval.' },
    { role: 'student', route: 'passports', say: 'As Student, share the Passport and open the verification link.' },
    { role: 'industry', route: 'opportunities', say: 'As Industry leader, shortlist and see problems solved.' },
    { role: 'admin', route: 'admin-coupons', say: '9a · As UMO admin, create coupon FOUNDING20 (or a new one).' },
    { role: 'head', route: 'join-college', say: '9b · Open the college sign-up in a second tab, enter the code, watch the price drop.' },
    { role: 'admin', route: 'admin-coupons', say: '9c · As Admin A create BIG70; switch to Admin B and approve it.' },
    { role: 'steward', route: 'provisions', say: 'Provisions board: add one item live. Close on the open gates.' },
  ];

  Object.assign(LEAD, { content: { stages, features, featureById, roles, roleById, evidence, gates, phases, valueKinds, actors, flows, stays, workflows, ixdf, demo } });
})(typeof globalThis !== 'undefined' ? globalThis : this);
