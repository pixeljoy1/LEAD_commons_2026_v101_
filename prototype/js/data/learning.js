/* LEAD · learning seed (round 5). Synthetic. Modules, one full demo course (LM-SP-1), open topics, requests and offers.
 * Codes: LM-<mode>-<n> module · LP-n path (a priced bundle) · TP-n open topic · RQ-n request · OF-n offer.
 * Prices are never typed here. A module that sits in a Path points at its plan key in the price registry. */
(function (root) {
  const LEAD = (root.LEAD = root.LEAD || {});
  const D = (s) => Date.parse(s);

  /* Learning Paths. A Path is a priced bundle. The price comes from the plan registry. */
  const paths = [
    { code: 'LP-1', planKey: 'PATH_FRAMING', name: 'Framing the problem', modules: ['LM-SP-2', 'LM-IL-1', 'LM-CB-1'] },
    { code: 'LP-2', planKey: 'PATH_DECISIONS', name: 'Defending a decision', modules: ['LM-SP-3', 'LM-PL-1'] },
  ];

  const M = (code, title, line, o) => Object.assign({ code, mode: code.split('-')[1], n: Number(code.split('-')[2]), title, line, for: ['student', 'open'], level: 'Starter', mins: 30, lessons: [], skills: [], path: null, outline: true, sessions: [], seats: null, booked: 0, women: false, pinned: false }, o || {});

  const L = (id, title, mins) => ({ id, title, mins });
  const modules = [
    M('LM-SP-1', 'Day 1 readiness, defined', 'What a graduate must show to be useful on the first day of a design job, in plain words. Start here.', {
      for: ['student', 'faculty', 'head', 'industry', 'mentor', 'open'], level: 'Starter', mins: 25, pinned: true, outline: false,
      skills: ['problem-framing', 'design-decision', 'trust-compliance', 'soft-skills'],
      lessons: [L('l1', 'What “Day 1 ready” means', 7), L('l2', 'The four skills', 9), L('l3', 'How you will be checked', 7)],
      pass: 2,
    }),
    M('LM-SP-2', 'Framing the problem', 'Find the real problem inside a vague brief, and say it so others can act on it.', { level: 'Core', mins: 45, skills: ['problem-framing'], path: 'LP-1', lessons: [L('l1', 'Brief or problem?', 10), L('l2', 'Ask better questions', 15), L('l3', 'Write a problem statement', 20)] }),
    M('LM-SP-3', 'Making and defending a design decision', 'Choose, write down why, and defend the choice to a sceptical person.', { level: 'Core', mins: 40, skills: ['design-decision', 'accountability'], path: 'LP-2', lessons: [L('l1', 'The decision log', 12), L('l2', 'Defend it', 15), L('l3', 'Change your mind well', 13)] }),
    M('LM-SP-4', 'Using AI, and saying so', 'Use AI tools with judgement, and state plainly how you used them.', { for: ['student', 'open', 'faculty', 'mentor'], level: 'Starter', mins: 30, skills: ['critical-ai', 'job-ethics'], lessons: [L('l1', 'Where AI helps', 10), L('l2', 'Where it misleads', 10), L('l3', 'Declaring your use', 10)] }),
    M('LM-SP-5', 'Women in Design: first steps', 'A starter module for women entering design: what the work is, the paths in, and who to ask.', { for: ['student', 'open', 'faculty', 'mentor', 'industry', 'head'], level: 'Starter', mins: 30, women: true, skills: ['awareness'], lessons: [L('l1', 'What design work looks like', 10), L('l2', 'Ways in', 10), L('l3', 'Who to ask', 10)] }),

    M('LM-IL-1', 'Teaching with a live brief', 'Fit a real company problem into your module without rewriting your course. Three live sessions.', { for: ['faculty', 'head'], level: 'Core', mins: 180, skills: ['credit-window', 'problem-framing'], path: 'LP-1', seats: 30, booked: 12, sessions: [{ at: '2026-11-04T16:00', where: 'Online', teacherId: 'm1' }, { at: '2026-11-11T16:00', where: 'Online', teacherId: 'm1' }, { at: '2026-11-18T16:00', where: 'Online', teacherId: 'f1' }] }),
    M('LM-IL-2', 'Coaching a student team in 45 minutes', 'The three-session coaching pattern, with practice. For practitioners new to mentoring.', { for: ['mentor', 'industry'], level: 'Starter', mins: 120, skills: ['soft-skills'], seats: 20, booked: 7, sessions: [{ at: '2026-11-06T17:30', where: 'Online', teacherId: 'm3' }, { at: '2026-11-13T17:30', where: 'Online', teacherId: 'm3' }] }),
    M('LM-IL-3', 'Scoring blind: a calibration session', 'Score a sample submission against the shared rubric, then compare with other assessors.', { for: ['mentor', 'industry', 'faculty'], level: 'Core', mins: 90, skills: ['accountability', 'job-ethics'], seats: 25, booked: 18, sessions: [{ at: '2026-11-10T15:00', where: 'Online', teacherId: 'm2' }] }),
    M('LM-IL-4', 'Upskilling your design team', 'Plan learning for a working team: what to teach, in what order, and how to know it worked.', { for: ['industry', 'head'], level: 'Core', mins: 150, skills: ['upskilling-industry', 'industry-training'], seats: 15, booked: 4, sessions: [{ at: '2026-11-20T11:00', where: 'Bengaluru', teacherId: 'm4' }] }),
    M('LM-IL-5', 'Running LEAD in your college', 'For heads and faculty leads: set the term slot, map credit, and report outcomes.', { for: ['head', 'faculty'], level: 'Core', mins: 120, skills: ['credit-window', 'placements'], seats: 20, booked: 6, sessions: [{ at: '2026-11-25T10:00', where: 'Online', teacherId: 'm4' }] }),

    M('LM-PL-1', 'Studio circle: feedback on your work', 'Meet weekly, show work in progress and give each other direct, kind feedback. Led by a peer.', { for: ['student', 'open'], level: 'Starter', mins: 60, skills: ['soft-skills', 'design-decision'], path: 'LP-2', seats: 12, booked: 8, sessions: [{ at: '2026-10-29T18:00', where: 'Campus A', teacherId: 's5' }] }),
    M('LM-PL-2', 'Women in Design circle', 'A monthly circle for women in design, in Bengaluru and online. Hosted by a peer.', { for: ['student', 'open', 'faculty', 'mentor', 'industry'], level: 'Starter', mins: 90, women: true, skills: ['awareness', 'soft-skills'], seats: 30, booked: 14, sessions: [{ at: '2026-11-05T18:30', where: 'Bengaluru + online', teacherId: 'm3' }] }),

    M('LM-CB-1', 'Learn inside a live challenge: onboarding drop-off', 'Learn framing and decisions while you work on a real company problem with a team and a mentor.', { for: ['student'], level: 'Core', mins: 480, skills: ['problem-framing', 'design-decision'], path: 'LP-1', challengeId: 'c1' }),
    M('LM-CB-2', 'Open challenge: make dispatch exceptions clear', 'A challenge open to people outside a campus. Learn by trying it, with feedback.', { for: ['open', 'student'], level: 'Starter', mins: 360, skills: ['economic-constraint'], challengeId: 'c2' }),
  ];

  /* The one full demo course. Short on purpose: three one-page lessons and a three-question check. */
  const content = {
    'LM-SP-1': {
      lessons: {
        l1: {
          title: 'What “Day 1 ready” means',
          intro: 'Day 1 ready means you can do useful, safe design work in your first week at a job. Not perfectly. Usefully.',
          points: [
            'It is shown on real work, not on a test.',
            'The bar is level 2 or above on each skill: you can apply it with guidance on a clear brief.',
            'Employers asked for it in their own words. Colleges and employers wrote the list together.',
          ],
          example: 'Example: you get a vague brief on day one. You ask three good questions, write down the real problem, and show a first idea by the afternoon.',
        },
        l2: {
          title: 'The four skills',
          intro: 'Four skills make up Day 1 readiness. Each one has four levels, from “not yet” to “strong”.',
          points: [
            'Problem framing: finding the real problem inside a vague brief and stating it clearly.',
            'Design decision training: choosing, writing down why, and defending the choice.',
            'Trust and compliance: working within consent, confidentiality, IP and the law.',
            'Soft skills and ownership: communicating well and taking responsibility for the result.',
          ],
          example: 'Example: you change a design because a user said it was confusing, and you note why in a short log.',
        },
        l3: {
          title: 'How you will be checked',
          intro: 'You are checked on real work, by professionals who score it against a rubric you can read in advance.',
          points: [
            'Assessors do not see your name or college until they have locked their scores.',
            'A second person approves before anything enters your Passport.',
            'You decide who sees your Passport, and you can stop sharing at any time.',
          ],
          example: 'Example: your team hands in a decision log. Two assessors score it blind. Your Passport shows the verified level.',
        },
      },
      check: [
        { q: 'Day 1 ready is shown…', options: ['By passing a written exam', 'On real work', 'By years of study'], answer: 1 },
        { q: 'Which is one of the four skills?', options: ['Problem framing', 'Speed typing', 'Logo drawing'], answer: 0 },
        { q: 'Who decides who sees your Passport?', options: ['The employer', 'The college', 'You'], answer: 2 },
      ],
      pass: 2,
    },
  };

  function build() {
    const mods = JSON.parse(JSON.stringify(modules));
    mods.forEach((m) => { const c = content[m.code]; if (c) { m.check = c.check.map((q) => ({ q: q.q, options: q.options, answer: q.answer })); m.pass = c.pass; } });
    return {
      paths: JSON.parse(JSON.stringify(paths)),
      modules: mods,
      topics: [
        { id: 'TP-1', title: 'Design for people who read little', why: 'Many users cannot read long text. How do we design for them?', state: 'Open', by: 'i1', pledges: ['m1', 'f1', 'i2'], at: D('2026-10-02') },
        { id: 'TP-2', title: 'Writing a decision log people read', why: 'A log that is short, honest and useful to the next person.', state: 'Open', by: 'f1', pledges: ['m2', 'm3', 's5', 'f2', 'i3'], at: D('2026-10-03') },
        { id: 'TP-3', title: 'Accessible design basics', why: 'Colour, text size, keyboard use and screen readers.', state: 'Proposed', by: 'm6', pledges: [], at: D('2026-10-09') },
        { id: 'TP-4', title: 'Designing in Indian languages', why: 'Type, layout and tone for scripts other than English.', state: 'Open', by: 'o1', pledges: ['m4', 'f3', 'i4', 'm1'], at: D('2026-10-04') },
        { id: 'TP-5', title: 'Presenting your work to a non-designer', why: 'Explain a design choice to someone who is not a designer.', state: 'Open', by: 's5', pledges: ['m3'], at: D('2026-10-06') },
      ],
      requests: [
        { id: 'RQ-1', title: 'How to run user interviews', who: 'Open learners and first-year students', count: 24, by: 'o1', state: 'Open', votes: ['s5', 's6', 'o2', 'o3'], teacherId: null, at: D('2026-10-05') },
        { id: 'RQ-2', title: 'Pricing a design project', who: 'Final-year students going freelance', count: 12, by: 's5', state: 'Matched', votes: ['s6', 's7'], teacherId: 'i2', at: D('2026-10-07') },
        { id: 'RQ-3', title: 'Design for voice and low-literacy users', who: 'Industry design teams', count: 15, by: 'i1', state: 'Open', votes: ['i2', 'i3'], teacherId: null, at: D('2026-10-08') },
        { id: 'RQ-4', title: 'Teaching design to first-generation learners', who: 'Faculty', count: 9, by: 'f1', state: 'Open', votes: ['f2', 'f3', 'h1'], teacherId: null, at: D('2026-10-09') },
      ],
      offers: [
        { id: 'OF-1', by: 'm1', topic: 'Coaching in 45 minutes', mode: 'IL', hours: 6, when: 'Nov', state: 'Approved', at: D('2026-10-03') },
        { id: 'OF-2', by: 'i2', topic: 'Reading a brief like a product manager', mode: 'IL', hours: 4, when: 'Dec', state: 'Proposed', at: D('2026-10-10') },
        { id: 'OF-3', by: 'f2', topic: 'A studio critique that works', mode: 'IL', hours: 8, when: 'Nov', state: 'Scheduled', at: D('2026-10-05') },
      ],
      progress: {},
      enrols: [],
    };
  }

  LEAD.learningData = { build, content };
})(typeof globalThis !== 'undefined' ? globalThis : this);
