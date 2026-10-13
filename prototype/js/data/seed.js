/* LEAD · loop seed (spec §11). Synthetic organisations and people only. In memory; resets on reload. */
(function (root) {
  const LEAD = (root.LEAD = root.LEAD || {});
  const D = (s) => Date.parse(s);

  function build() {
    const orgs = [
      { id: 'campus-a', name: 'Campus A', kind: 'institution', city: 'Bengaluru', students: 2400 },
      { id: 'campus-b', name: 'Campus B', kind: 'institution', city: 'Pune', students: 850 },
      { id: 'campus-c', name: 'Campus C', kind: 'institution', city: 'Ahmedabad', students: 3600 },
      { id: 'northwind', name: 'Northwind Bank', kind: 'company', city: 'Mumbai' },
      { id: 'harbor', name: 'Harbor Logistics', kind: 'company', city: 'Chennai' },
      { id: 'lumen', name: 'Lumen Health', kind: 'company', city: 'Hyderabad' },
      { id: 'umo', name: 'UMO Design Foundation', kind: 'umo', city: 'Bengaluru' },
      { id: 'open', name: 'Open community', kind: 'open', city: 'Online' },
    ];
    const U = (id, name, role, orgId, extra) => Object.assign({ id, name, role, orgId }, extra || {});
    const users = [
      U('s1', 'Aanya Rao', 'student', 'campus-a'), U('s2', 'Kabir Shah', 'student', 'campus-a'), U('s3', 'Zoya Khan', 'student', 'campus-a'), U('s4', 'Ishaan Pillai', 'student', 'campus-a'),
      U('s5', 'Ira Menon', 'student', 'campus-a'), U('s6', 'Arjun Das', 'student', 'campus-a'), U('s7', 'Neha Varma', 'student', 'campus-a'),
      U('s8', 'Tara Bose', 'student', 'campus-b'), U('s9', 'Vikram Rao', 'student', 'campus-b'), U('s10', 'Sana Mirza', 'student', 'campus-b'), U('s11', 'Rhea Kapoor', 'student', 'campus-b'),
      U('s12', 'Omar Siddiqui', 'student', 'campus-c'), U('s13', 'Diya Patel', 'student', 'campus-c'), U('s14', 'Yash Gupta', 'student', 'campus-c'),
      U('f1', 'Prof. Meera Nair', 'faculty', 'campus-a'), U('f2', 'Prof. Rahul Sen', 'faculty', 'campus-b'), U('f3', 'Prof. Anita Dutta', 'faculty', 'campus-c'),
      U('h1', 'Dr. Arvind Kulkarni', 'head', 'campus-a'), U('h2', 'Dr. Lata Deshpande', 'head', 'campus-b'), U('h3', 'Dr. Hemant Shah', 'head', 'campus-c'),
      U('i1', 'Rohan Mehta', 'industry', 'northwind'), U('i2', 'Priya Shah', 'industry', 'northwind'), U('i3', 'Karan Singh', 'industry', 'harbor'),
      U('i4', 'Asha Reddy', 'industry', 'harbor'), U('i5', 'Nikhil Jain', 'industry', 'lumen'), U('i6', 'Pooja Iyer', 'industry', 'lumen'),
      U('m1', 'Kavya Iyer', 'mentor', 'northwind', { title: 'Design director, fintech', verified: true, hoursOffered: 12 }),
      U('m2', 'Sanjay Rao', 'mentor', 'harbor', { title: 'Principal designer, logistics', verified: true, hoursOffered: 8 }),
      U('m3', 'Leela George', 'mentor', 'lumen', { title: 'Research lead, health', verified: true, hoursOffered: 10 }),
      U('m4', 'Aditya Kumar', 'mentor', 'umo', { title: 'Independent practitioner', verified: true, hoursOffered: 6 }),
      U('m5', 'Fatima Sheikh', 'mentor', 'umo', { title: 'Service designer', verified: false, hoursOffered: 4 }),
      U('m6', 'Gaurav Menon', 'mentor', 'umo', { title: 'Product design manager', verified: true, hoursOffered: 6 }),
      U('st1', 'Nisha Thomas', 'steward', 'umo'), U('st2', 'Farhan Ali', 'steward', 'umo'),
      U('o1', 'Dev Malhotra', 'open', 'open'), U('o2', 'Ritu Bansal', 'open', 'open'), U('o3', 'Joel Fernandes', 'open', 'open'),
    ];
    const defaultUser = { student: 's1', faculty: 'f1', head: 'h1', industry: 'i1', mentor: 'm1', steward: 'st1', open: 'o1', admin: 'adminA' };

    const C = (slug, name, definition, position, asks, status, extra) => Object.assign({ slug, name, definition, position, asks, status: status || 'draft', followers: 0 }, extra || {});
    const capabilities = [
      C('trust-compliance', 'Trust and Compliance', 'Working within the rules that make professional work trustworthy: consent, confidentiality, IP and regulation.', 'Hub · Do First', 6),
      C('job-ethics', 'Job Ethics', 'Making and defending choices that stay honest about their effect on users, colleagues and employers.', 'Hub · Do First', 4),
      C('economic-constraint', 'Economic Constraint', 'Designing within real budgets, timelines and commercial limits.', 'Hub · Plan For', 3),
      C('soft-skills', 'Soft-skills + Ownership', 'Communicating, collaborating and taking responsibility for the outcome.', 'College axis · Do First', 5),
      C('accountability', 'Accountability', 'Owning decisions and their consequences, including when they are challenged.', 'College axis · Do First', 3),
      C('industry-training', 'Industry Training', 'Structured learning from employers’ own practice, paid for and shaped with them (as a function of RoI).', 'Employer side · Plan For', 2),
      C('employment-crosspollination', 'Employment Opportunity + Cross-Pollination', 'Real chances to work on live problems, and movement of people and ideas between campus and industry.', 'Employer side · Quick Wins', 4),
      C('placements', 'Placements', 'Getting graduates into roles that fit what they can show.', 'Employer side · Plan For', 3),
      C('fluency', 'Fluency', 'Working fluently through the design process and its tools, and picking up new ones fast.', 'College axis · Do First', 4),
      C('design-decision', 'Design Decision Training', 'Practising how to make a design decision, record why, and defend it to others.', 'College axis · Do First', 5, 'cosigned', { cosignedIndustry: 'Northwind Bank', cosignedAcademia: 'Campus A' }),
      C('awareness', 'Awareness', 'Knowing what roles, careers and options exist.', 'Not yet carried', 1),
      C('problem-framing', 'Problem framing', 'Finding the real problem inside an ambiguous brief, and stating it so others can act on it.', 'Bud', 7, 'cosigned', { cosignedIndustry: 'Harbor Logistics', cosignedAcademia: 'Campus B' }),
      C('critical-ai', 'Critical AI literacy', 'Using AI tools with judgement, and saying plainly how they were used.', 'Bud', 4),
      C('credit-window', 'Industry-taught credit window', 'A slot in the curriculum where industry teaches and the credit counts.', 'Bud', 2),
      C('upskilling-industry', 'Upskilling people in the industry', 'Helping working practitioners learn new capabilities alongside students.', 'Bud', 2),
    ];
    const levels = ['Not yet', 'Developing', 'Secure', 'Strong'];

    const demandSignals = [
      { id: 'd1', orgId: 'northwind', by: 'i1', capSlug: 'problem-framing', problem: 'New hires solve the brief they are given but cannot find the real one.', needBy: '2027-03-31', seats: 3, mentorHours: 8, sensitive: true, status: 'Published', themeId: 'th1', at: D('2026-09-29') },
      { id: 'd2', orgId: 'harbor', by: 'i3', capSlug: 'problem-framing', problem: 'Dispatch staff misread exceptions; designers do not ask why.', needBy: '2027-01-31', seats: 2, mentorHours: 6, sensitive: false, status: 'Merged', themeId: 'th1', at: D('2026-10-01') },
      { id: 'd3', orgId: 'lumen', by: 'i5', capSlug: 'trust-compliance', problem: 'Designers ship flows that collect more patient data than they need.', needBy: '2027-02-28', seats: 2, mentorHours: 4, sensitive: true, status: 'Reviewed', themeId: null, at: D('2026-10-05') },
      { id: 'd4', orgId: 'northwind', by: 'i2', capSlug: 'design-decision', problem: 'Juniors cannot defend a design decision in a review.', needBy: '2027-03-31', seats: 2, mentorHours: 6, sensitive: false, status: 'Published', themeId: 'th2', at: D('2026-10-06') },
      { id: 'd5', orgId: 'harbor', by: 'i4', capSlug: 'economic-constraint', problem: 'Concepts ignore what the operation can afford to run.', needBy: '2027-04-30', seats: 1, mentorHours: 4, sensitive: false, status: 'Submitted', themeId: null, at: D('2026-10-09') },
      { id: 'd6', orgId: 'lumen', by: 'i6', capSlug: 'soft-skills', problem: 'Graduates struggle to explain trade-offs to clinicians.', needBy: '2027-03-15', seats: 1, mentorHours: 2, sensitive: false, status: 'Submitted', themeId: null, at: D('2026-10-11') },
    ];
    const themes = [
      { id: 'th1', name: 'Framing ambiguous problems', capSlugs: ['problem-framing'], published: true },
      { id: 'th2', name: 'Defending a design decision', capSlugs: ['design-decision'], published: true },
      { id: 'th3', name: 'Business context', capSlugs: ['economic-constraint'], published: false },
    ];

    const challenges = [
      {
        id: 'c0', title: 'Explain bank fees in plain words', sponsorOrgId: 'northwind', owner: 'Rohan Mehta', caps: ['problem-framing', 'design-decision'], status: 'Closed',
        context: 'Customers call support to ask what a fee means.', problem: 'Fee notices are written for compliance, not for people.', solved: 'Support calls about fees fall in a test group.',
        constraints: 'Regulatory wording must remain available.', data: 'Sanitised fee notices; no customer data.', ambiguity: 'Which customers matter most is left open.',
        seats: 2, nda: { noPersonal: true, noConfidential: true, sanitised: true, ipTerms: true }, ipTerms: 'Sponsor licence, student credit', term: 'Monsoon 2026',
      },
      {
        id: 'c1', title: 'Reduce drop-off in onboarding', sponsorOrgId: 'northwind', owner: 'Rohan Mehta', caps: ['problem-framing', 'design-decision'], status: 'Live',
        context: 'Northwind’s account opening loses 4 in 10 applicants before the identity step.', problem: 'The company sees a form problem. The data hints at a trust problem.',
        solved: 'A tested flow that a pilot group completes more often than the current one, with the reasons written down.',
        constraints: 'KYC steps are fixed by regulation. Two sprints of engineering time.', data: 'Aggregated funnel numbers only. No customer records.', ambiguity: 'The brief does not say which applicants to design for. Teams must decide and defend it.',
        seats: 3, nda: { noPersonal: true, noConfidential: true, sanitised: true, ipTerms: true }, ipTerms: 'Sponsor licence, student credit', term: 'Winter 2026',
      },
      {
        id: 'c2', title: 'Make dispatch exceptions understandable to a new hire', sponsorOrgId: 'harbor', owner: 'Karan Singh', caps: ['economic-constraint', 'fluency'], status: 'Shaped',
        context: 'Harbor’s dispatch screen shows 40 exception codes.', problem: 'New hires take three weeks to act on exceptions without help.',
        solved: 'A new hire resolves the five most common exceptions unaided in a test.', constraints: 'Existing screen framework. Shift workers on shared terminals.',
        data: 'Exception codes and anonymised frequency counts.', ambiguity: 'Whether to change the screen or the training is open.',
        seats: 2, nda: { noPersonal: true, noConfidential: true, sanitised: true, ipTerms: true }, ipTerms: 'Shared licence', term: 'Winter 2026',
      },
      {
        id: 'c3', title: 'Explain a lab result to someone who is anxious', sponsorOrgId: 'lumen', owner: 'Nikhil Jain', caps: ['trust-compliance', 'soft-skills'], status: 'Draft',
        context: 'Patients see results in the app before a clinician calls.', problem: 'Abnormal flags cause panic and calls at night.',
        solved: 'Clinicians agree the explanation is accurate, and test readers report less worry.', constraints: 'Medical wording reviewed by a clinician.',
        data: 'Not yet sanitised.', ambiguity: 'How much to say before the clinician calls.',
        seats: 2, nda: { noPersonal: true, noConfidential: false, sanitised: false, ipTerms: false }, ipTerms: '', term: 'Winter 2026',
      },
    ];
    const matches = [
      { id: 'mt0', challengeId: 'c0', institutionId: 'campus-a', cohort: 'Cohort A', term: 'Monsoon 2026', facultyId: 'f1', module: 'Studio 2', mapped: true },
      { id: 'mt0b', challengeId: 'c0', institutionId: 'campus-b', cohort: 'Cohort B', term: 'Monsoon 2026', facultyId: 'f2', module: 'Interaction 3', mapped: true },
      { id: 'mt1', challengeId: 'c1', institutionId: 'campus-a', cohort: 'Cohort A', term: 'Winter 2026', facultyId: 'f1', module: 'Studio 3', mapped: true },
    ];
    const teams = [
      {
        id: 't1', matchId: 'mt1', name: 'Team Kestrel', memberIds: ['s1', 's2', 's3', 's4'],
        milestones: [{ t: 'Frame the problem', done: true }, { t: 'Interview 5 applicants', done: true }, { t: 'Prototype two flows', done: false }, { t: 'Test with a pilot group', done: false }, { t: 'Defend at review', done: false }],
        decisions: [
          { by: 's1', decision: 'Design for first-time account holders', reason: 'They drop off most and have the least help.', alt: 'Small-business owners', at: D('2026-10-02') },
          { by: 's2', decision: 'Treat the drop-off as a trust problem', reason: 'Interviews: 4 of 5 feared the ID upload, not the form.', alt: 'Shorten the form', at: D('2026-10-04') },
          { by: 's3', decision: 'Explain why each document is needed', reason: 'People asked “why do you need this?” at every step.', alt: 'Hide the reasons in an FAQ', at: D('2026-10-06') },
          { by: 's4', decision: 'Keep KYC order unchanged', reason: 'Regulation fixes it; we change wording, not order.', alt: 'Reorder steps', at: D('2026-10-07') },
          { by: 's1', decision: 'Test on mid-range Android phones', reason: 'Most applicants use them; uploads fail more there.', alt: 'Desktop first', at: D('2026-10-09') },
          { by: 's2', decision: 'Drop the progress bar', reason: 'It made the task feel longer in two tests.', alt: 'Keep it', at: D('2026-10-11') },
        ],
        thread: [
          { by: 'm1', body: 'Good scoping. Before session 3, write one sentence on who you are not designing for, and why.', at: D('2026-10-08') },
          { by: 's1', body: 'Done. Added to the decision log as entry 1.', at: D('2026-10-09') },
        ],
      },
      {
        id: 't2', matchId: 'mt1', name: 'Team Heron', memberIds: ['s5', 's6', 's7'],
        milestones: [{ t: 'Frame the problem', done: true }, { t: 'Interview', done: true }, { t: 'Prototype', done: true }, { t: 'Test', done: true }, { t: 'Defend at review', done: false }],
        decisions: [
          { by: 's5', decision: 'Design for applicants who abandon at the ID step', reason: 'The funnel shows the biggest fall there.', alt: 'Whole flow', at: D('2026-10-03') },
          { by: 's6', decision: 'Let people save and return', reason: 'Many did not have documents to hand.', alt: 'Single session', at: D('2026-10-06') },
        ],
        thread: [{ by: 'm4', body: 'Strong testing. Your reflection should say what you would cut with one sprint less.', at: D('2026-10-10') }],
      },
      { id: 't0', matchId: 'mt0', name: 'Team Lark', memberIds: ['s1', 's5'], milestones: [], decisions: [], thread: [] },
      { id: 't9', matchId: 'mt0b', name: 'Team Osprey', memberIds: ['s8', 's9', 's10', 's11'], milestones: [], decisions: [], thread: [] },
    ];
    const sprints = [
      { id: 'sp1', teamId: 't1', mentorId: 'm1', status: 'In progress', sessions: [{ at: D('2026-10-06T16:00'), minutes: 45, done: true }, { at: D('2026-10-13T16:00'), minutes: 45, done: true }, { at: null, minutes: 45, done: false }] },
      { id: 'sp2', teamId: 't2', mentorId: 'm4', status: 'Complete', sessions: [{ at: D('2026-10-01T11:00'), minutes: 45, done: true }, { at: D('2026-10-05T11:00'), minutes: 45, done: true }, { at: D('2026-10-09T11:00'), minutes: 45, done: true }] },
      { id: 'sp0', teamId: 't0', mentorId: 'm2', status: 'Complete', sessions: [{ at: D('2026-08-04'), minutes: 45, done: true }, { at: D('2026-08-11'), minutes: 45, done: true }, { at: D('2026-08-18'), minutes: 45, done: true }] },
      { id: 'sp9', teamId: 't9', mentorId: 'm6', status: 'Complete', sessions: [{ at: D('2026-08-05'), minutes: 45, done: true }, { at: D('2026-08-12'), minutes: 45, done: true }, { at: D('2026-08-19'), minutes: 60, done: true }] },
    ];
    const rubric = [
      { id: 'r1', name: 'Framing the problem', weight: 25 },
      { id: 'r2', name: 'Defending a decision', weight: 25 },
      { id: 'r3', name: 'Business context', weight: 20 },
      { id: 'r4', name: 'Working with others and ownership', weight: 10 },
      { id: 'r5', name: 'Ethics and compliance', weight: 10 },
      { id: 'r6', name: 'Craft and fluency', weight: 10 },
    ];
    const submissions = [
      { id: 'sub2', teamId: 't2', deliverable: 'https://example.org/heron-prototype', reflection: 'With one sprint less we would cut the save-and-return email and keep the in-app resume.', ai: 'Used an AI tool to cluster interview notes; all quotes checked against recordings.', status: 'In scoring', at: D('2026-10-12') },
      { id: 'sub0', teamId: 't0', deliverable: 'https://example.org/lark-fees', reflection: 'We wrote for the anxious reader first.', ai: 'No AI used.', status: 'Moderated', at: D('2026-08-25') },
      { id: 'sub9', teamId: 't9', deliverable: 'https://example.org/osprey-fees', reflection: 'Plain words cut call volume in our test.', ai: 'AI used to draft alternatives; final copy written by the team.', status: 'Scored', at: D('2026-08-26') },
    ];
    const lockAll = (subId, assessorId, vals) => rubric.map((c, i) => ({ submissionId: subId, assessorId, criterion: c.id, value: vals[i], locked: true }));
    const scores = []
      .concat(lockAll('sub2', 'm2', [3, 3, 2, 3, 4, 3]))
      .concat(lockAll('sub0', 'm3', [4, 3, 3, 3, 4, 3]))
      .concat(lockAll('sub0', 'm1', [4, 4, 3, 3, 3, 3]))
      .concat(lockAll('sub9', 'm3', [3, 3, 3, 4, 3, 3]));
    const assessmentDays = [{ id: 'ad1', challengeId: 'c1', date: '2026-11-14', mode: 'Hybrid · Campus A', rubricVersion: 'v2' }];

    const passports = [
      { id: 'pe0', code: 'LEAD-7K2Q-NW', studentId: 's1', submissionId: 'sub0', challengeId: 'c0', capSlug: 'problem-framing', level: 4, status: 'Verified', assessorId: 'm3', approverId: 'st2', shared: false, at: D('2026-09-02') },
      { id: 'pe1', code: null, studentId: 's8', submissionId: 'sub9', challengeId: 'c0', capSlug: 'problem-framing', level: 3, status: 'Proposed', assessorId: 'm3', approverId: null, shared: false, at: D('2026-09-01') },
      { id: 'pe2', code: null, studentId: 's9', submissionId: 'sub9', challengeId: 'c0', capSlug: 'problem-framing', level: 3, status: 'Proposed', assessorId: 'm3', approverId: null, shared: false, at: D('2026-09-01') },
      { id: 'pe3', code: null, studentId: 's10', submissionId: 'sub9', challengeId: 'c0', capSlug: 'problem-framing', level: 3, status: 'Proposed', assessorId: 'm3', approverId: null, shared: false, at: D('2026-09-01') },
      { id: 'pe4', code: null, studentId: 's11', submissionId: 'sub9', challengeId: 'c0', capSlug: 'problem-framing', level: 3, status: 'Proposed', assessorId: 'm3', approverId: null, shared: false, at: D('2026-09-01') },
      { id: 'pe5', code: 'LEAD-3H8D-NW', studentId: 's5', submissionId: 'sub0', challengeId: 'c0', capSlug: 'problem-framing', level: 4, status: 'Shared', assessorId: 'm3', approverId: 'st1', shared: true, at: D('2026-09-02') },
    ];

    const learningContracts = [{ id: 'lc1', mentor: 'Kavya Iyer', plan: 'Weeks 1–4 research shadowing; weeks 5–12 own one onboarding experiment.', stipend: '₹25,000 a month (field only; policy not set)', duration: '3 months' }];
    const opportunities = [
      { id: 'op1', orgId: 'northwind', title: 'Associate product designer', kind: 'role', caps: ['problem-framing', 'design-decision'], status: 'Shortlisting', open: false, note: 'Shares your Passport' },
      { id: 'op2', orgId: 'northwind', title: 'Design internship · 3 months', kind: 'internship', caps: ['problem-framing'], status: 'Open', learningContractId: 'lc1', open: false },
      { id: 'op3', orgId: 'harbor', title: 'Service design intern', kind: 'internship', caps: ['economic-constraint'], status: 'Open', learningContractId: 'lc1', open: false },
      { id: 'op4', orgId: 'umo', title: 'Open cohort · Framing challenge', kind: 'open cohort', caps: ['problem-framing'], status: 'Open', open: true, note: 'Applications open to the open community' },
    ];
    const applications = [
      { id: 'ap1', opportunityId: 'op1', studentId: 's5', passportIds: ['pe5'], shortlisted: true, at: D('2026-10-03') },
      { id: 'ap2', opportunityId: 'op2', studentId: 's1', passportIds: ['pe0'], shortlisted: false, at: D('2026-10-10') },
    ];
    const outcomes = [];
    const problemRecords = [{ id: 'pr0', challengeId: 'c0', result: null, confirmedBy: null, confirmedAt: null, note: 'Awaiting the sponsor’s named owner.' }];

    const events = [
      { id: 'e1', title: 'Industry circle · “Readiness, defined”', at: '2026-10-21T17:30', kind: 'Industry circle', host: 'northwind', visibility: 'public', where: 'Online' },
      { id: 'e2', title: 'Mentor sprint · Team Kestrel · session 3', at: '2026-10-20T16:00', kind: 'Challenge milestone', host: 'campus-a', visibility: 'campus', where: 'Online' },
      { id: 'e3', title: '30-day sync · LEAD Commons', at: '2026-10-26T10:00', kind: 'Sync', host: 'umo', visibility: 'public', where: 'Bengaluru + online' },
      { id: 'e4', title: 'Assessment day · Reduce drop-off in onboarding', at: '2026-11-14T09:30', kind: 'Assessment day', host: 'campus-a', visibility: 'campus', where: 'Campus A' },
      { id: 'e5', title: 'Guest session · Defending a decision', at: '2026-11-21T15:00', kind: 'Guest session', host: 'umo', visibility: 'public', where: 'Online' },
      { id: 'e6', title: 'Circle · Bengaluru', at: '2026-10-28T18:30', kind: 'Circle', host: 'umo', visibility: 'public', where: 'Bengaluru' },
      { id: 'e8', title: 'Women in Design circle · Bengaluru', at: '2026-11-05T18:30', kind: 'Circle', host: 'umo', visibility: 'public', where: 'Bengaluru', women: true },
      { id: 'e9', title: 'Faculty session · Running a studio where women lead', at: '2026-11-12T15:00', kind: 'Guest session', host: 'umo', visibility: 'public', where: 'Online', women: true },
      { id: 'e10', title: 'Mentor hour for women designers · open office', at: '2026-11-19T17:00', kind: 'Guest session', host: 'umo', visibility: 'public', where: 'Online', women: true },
      { id: 'e7', title: '90-day review · gates G3, G4', at: '2026-12-18T11:00', kind: 'Sync', host: 'umo', visibility: 'public', where: 'Online' },
    ];

    const P = (title, why, plugs, status) => ({ title, why, plugs, status, by: 'Spec §14' });
    const provisions = [
      P('Student data and consent', 'Outcomes are shared with employers. Rules on consent, retention and sharing must exist before any Passport does. Check against India’s data protection law with counsel.', 'Codex', 'Needs an owner'),
      P('IP and NDA for challenge work', 'Who owns a student’s solution to a company’s problem?', 'Codex · APPLY', 'Needs an owner'),
      P('Mentor and assessor economics', 'Honoraria or credit, conflict rules, quality control.', 'MENTOR · VALIDATE', 'Reserved'),
      P('Faculty workload credit', 'Faculty time must count somewhere.', 'Faculty Toolkit', 'Needs an owner'),
      P('Equity of access', 'Tier-2 and tier-3 campuses, scholarships, low bandwidth, regional languages, accessibility.', 'Open tier', 'Reserved'),
      P('Credit recognition', 'The industry-taught credit window and NEP credit structures.', 'Faculty Toolkit', 'Needs an owner'),
      P('AI-use policy', 'How AI may be used in challenges, and how it is assessed.', 'Codex', 'Reserved'),
      P('Beyond design', '“Core is dying: pie-shaped and inter-disciplinary.” Extend the Lexicon to product, engineering, business.', 'Lexicon', 'Reserved'),
      P('Awareness', 'The row that did not travel. Career-path awareness belongs in the open tier.', 'Open tier', 'Reserved'),
      P('1 Million Women initiative', 'A cohort overlay with its own funding and metrics.', 'Cohort overlay', 'Reserved'),
      P('Design Pitch', 'A showcase module.', 'CONNECT', 'Reserved'),
      P('Funding model', 'Campus fee band (untested), pooled industry fund, sponsored challenges. No industry-side price exists.', 'Memberships', 'Needs an owner'),
      P('Alumni loop', 'What happens after the hire? Feed outcomes back into the Demand Map.', 'Impact Ledger', 'Reserved'),
    ].map((p, i) => Object.assign({ id: 'pv' + (i + 1) }, p));

    const consents = users.filter((u) => u.role === 'student' || u.role === 'open').flatMap((u) => [
      { userId: u.id, purpose: 'share_passport', granted: u.id === 's5', at: D('2026-09-01') },
      { userId: u.id, purpose: 'record_sessions', granted: true, at: D('2026-09-01') },
      { userId: u.id, purpose: 'analytics', granted: false, at: D('2026-09-01') },
    ]);

    return {
      orgs, users, defaultUser, capabilities, levels, demandSignals, themes, challenges, matches, teams, sprints,
      rubric, submissions, scores, assessmentDays, passports, learningContracts, opportunities, applications, outcomes,
      problemRecords, events, provisions, consents, audit: [], follows: [], circles: [],
    };
  }

  LEAD.seed = { build };
})(typeof globalThis !== 'undefined' ? globalThis : this);
