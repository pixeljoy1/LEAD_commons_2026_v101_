/* LEAD · Join hub and the five mock sign-up flows (addendum A10). Prices come from the admin's registry. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, pricing: P, rules, enums } = LEAD;
  const { esc } = ui;

  const slug = (s) => 'org-' + String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const S = {
    college: { name: 'Campus D', city: 'Kochi', students: 2400, contact: 'dean@campus-d.example', women: 0, code: '', quote: null, stale: null, done: null },
    industry: { name: 'Riverbend Software', seats: 5, supervisors: 1, coordinators: 1, assessors: 2, contact: 'design-lead@riverbend.example', women: 0, code: '', quote: null, stale: null, done: null },
    path: { key: 'PATH_FRAMING', name: 'Aanya Rao', org: 'Campus A', learners: 1, eligibility: '', contact: 'aanya@student.example', women: 0, code: '', quote: null, stale: null, done: null },
    sponsor: { key: '', name: 'Northwind Bank', challenge: 'c2', count: 1, contact: 'rohan@northwind.example', women: 0, code: '', quote: null, stale: null, done: null },
    open: { name: 'Dev Malhotra', email: 'dev@open.example', codex: true, analytics: false, persona: 'open', campus: '', done: null },
    faculty: { name: 'Prof. Meera Nair', email: 'meera@campus-a.example', campus: 'campus-a', codex: true, done: null },
    mentor: { name: 'Dana Fernandes', email: 'dana@practice.example', practice: 'Senior product designer, healthtech', hours: 6, codex: true, done: null },
  };
  Object.values(S).forEach((x) => { x.step = 'package'; });
  const CAMPUS_USERS = { 'campus-a': { student: 's1', faculty: 'f1' }, 'campus-b': { student: 's8', faculty: 'f2' }, 'campus-c': { student: 's12', faculty: 'f3' } };
  const NOTE = 'Hello, I would like our college to join LEAD by UMO Design, a programme of UMO Design Foundation that connects design classrooms with real company projects. Could we look at the campus sign-up together? Contact for details: team@umo.design';
  /* Arriving at a join page from anywhere else starts at the package page. Re-renders of the same page keep the step. */
  const arrive = (flow) => {
    const st = S[flow];
    if (LEAD.prevView === LEAD.curView) return;
    st.done = null; st.quote = null; st.stale = null; st.code = '';
    st.step = 'package';
    if ('persona' in st && !(st.pinAt && Date.now() - st.pinAt < 2000)) st.persona = 'open';
  };
  const FLOW = { college: 'COLLEGE_ONBOARDING', industry: 'INDUSTRY_PARTNERSHIP', path: 'PATH_ENROLMENT', sponsor: 'CHALLENGE_SPONSORSHIP', open: 'OPEN_JOIN', faculty: 'OPEN_JOIN', mentor: 'OPEN_JOIN' };
  const KIND = { college: 'CAMPUS_LICENCE', industry: 'INDUSTRY_MEMBERSHIP', path: 'PATH_ENROLMENT', sponsor: 'CHALLENGE_SPONSORSHIP', open: 'OPEN_TIER', faculty: 'OPEN_TIER', mentor: 'OPEN_TIER' };

  const sellableOfKind = (kind) => store.pricing.plans.filter((p) => p.kind === kind && !p.archived && p.active);

  function planFor(flow) {
    const st = S[flow];
    const list = sellableOfKind(KIND[flow]);
    if ((flow === 'path' || flow === 'sponsor') && st.key && list.some((p) => p.key === st.key)) return store.plan(st.key);
    return list[0] || null;
  }

  function inputFor(flow) {
    const st = S[flow]; const plan = planFor(flow);
    const base = { flow: FLOW[flow], planKey: plan ? plan.key : '', couponCode: st.code, womenSeats: Number(st.women) || 0, now: Date.now() };
    if (flow === 'college') return Object.assign(base, { orgSize: Number(st.students), quantity: 1, orgId: slug(st.name) });
    if (flow === 'industry') return Object.assign(base, { quantity: Number(st.seats), orgId: slug(st.name) });
    if (flow === 'path') return Object.assign(base, { quantity: Number(st.learners), orgId: slug(st.org + '-' + st.name) });
    if (flow === 'sponsor') return Object.assign(base, { quantity: Number(st.count), orgId: slug(st.name) });
    return Object.assign(base, { quantity: 1, orgId: slug(st.email) });
  }

  function requote(flow) {
    const st = S[flow];
    if (!planFor(flow)) { st.quote = { ok: false, error: 'No plan of this kind is on sale right now.' }; return; }
    st.quote = P.quote(inputFor(flow), store.pricingData());
  }

  /* A9.4: on a new epoch, re-run the open quote; if it moved, say so before the user confirms. */
  function livePricing(flow) {
    return () => {
      const st = S[flow];
      if (st.done) { LEAD.render({ keepScroll: true }); return; }
      const prev = st.quote;
      requote(flow);
      const q = st.quote;
      if (prev && prev.ok && q && q.ok && (prev.total !== q.total || (prev.coupon && prev.coupon.applied) !== (q.coupon && q.coupon.applied))) {
        st.stale = { msg: `Price updated. Total was ${P.formatINR(prev.total)}, now ${P.formatINR(q.total)}. Check it before you confirm.`, diff: [] };
      } else if (prev && prev.ok && q && !q.ok) {
        st.stale = { msg: `Price updated. ${q.error}`, diff: [] };
      }
      LEAD.render({ keepScroll: true });
    };
  }

  /* ---------- shared components ---------- */
  function priceSummary(flow) {
    const q = S[flow].quote;
    if (!q) return '';
    if (!q.ok) return `<div class="msg err" role="alert">${esc(q.error)}</div>`;
    const period = { ANNUAL: 'a year', TERM: 'per term', ONE_TIME: 'one time' }[q.billingPeriod];
    return `<div class="price">
      ${q.lines.map((l) => `<div class="line"><span>${esc(l.label)}</span><span>${ui.inr(l.amount)}</span></div>`).join('')}
      ${q.coupon && q.coupon.applied ? `<div class="line disc"><span>Code ${esc(q.coupon.code)} · ${q.coupon.percentOff}% off</span><span>− ${ui.inr(q.discount)}</span></div>` : ''}
      <div class="line"><span>Tax <span class="muted">· not applied in prototype</span></span><span>${ui.inr(q.tax)}</span></div>
      ${q.womenSeats ? `<div class="line"><span>${q.womenSeats} ${q.womenSeats === 1 ? 'seat' : 'seats'} for women × ${ui.inr(q.womenSeatPrice)}</span><span>${ui.inr(q.topUp)}</span></div>` : ''}
      <div class="total"><span class="label">Total · ${esc(period)}</span><b>${ui.inr(q.total)}</b></div>
      ${q.womenShare ? `<span class="women-note">${ui.inr(q.womenShare)} of this (${q.womenSharePct}%) goes to <a href="#women">1 Million Women in Design</a>.</span>` : ''}
      ${q.perMonthEquivalent != null ? `<span class="muted" style="font-size:13px">About ${ui.inr(q.perMonthEquivalent)} a month at list price, for comparison.</span>` : ''}
      ${q.sponsored ? ui.tag('Sponsored · fully covered', 'live') : ''}
      <span class="muted" style="font-size:12px">Price version <span class="code">${esc(q.priceVersionId)}</span> · quote valid 15 minutes</span>
    </div>`;
  }

  /* 1 Million Women in Design: an automatic share, shown plainly, and an optional top-up of seats. */
  const WOMEN = {
    college: { head: 'Pledge seats for women students', hint: 'Your college commits seats for women students at onboarding.' },
    industry: { head: 'Add a seat for a woman', hint: 'Fund seats for women learners. Optional.' },
    path: { head: 'Add a seat for a woman', hint: 'Fund a seat for a woman on a Path. Optional.' },
    sponsor: { head: 'Sponsor a women’s cohort', hint: 'A cohort is 10 seats. Optional.' },
  };
  function womenBlock(flow) {
    const w = WOMEN[flow]; const st = S[flow];
    const pct = store.pricing.settings.womenSharePct;
    return `<div class="women-block"><span class="eyebrow">1 Million Women in Design</span>
      <p style="font-size:14px">${pct}% of what you pay goes to 1 Million Women in Design. You do not pay extra for this. <a href="#women">How it works</a></p>
      <label class="field">${esc(w.head)}<span class="hint">${esc(w.hint)} ${ui.inr(store.pricing.settings.womenSeatPrice)} a seat. Mock price.</span><input id="jw-${flow}" type="number" min="0" max="500" data-on="jf" data-flow="${flow}" data-k="women" value="${esc(st.women)}"></label>
      ${flow === 'sponsor' ? `<div class="btn-row"><button class="btn small" type="button" data-act="women-cohort">Add a cohort of 10</button></div>` : ''}
    </div>`;
  }

  function couponMsg(flow) {
    const st = S[flow]; const q = st.quote;
    if (!st.code) return '<span class="muted" style="font-size:13px">Have a code? One code per sign-up.</span>';
    if (!q || !q.ok || !q.coupon) return '';
    return `<div class="msg ${q.coupon.applied ? 'ok' : 'err'}">${esc(q.coupon.reason)}</div>`;
  }

  function couponField(flow) {
    return `<label class="field">Code<span class="hint">Checked as you type.</span><input id="cp-${flow}" data-on="coupon" data-flow="${flow}" value="${esc(S[flow].code)}" autocomplete="off" spellcheck="false" style="text-transform:uppercase" placeholder="FOUNDING20"></label><div id="cm-${flow}" aria-live="polite">${couponMsg(flow)}</div>`;
  }

  function staleNote(flow) {
    const st = S[flow].stale;
    if (!st) return '';
    return `<div class="msg warn" role="alert"><span>${esc(st.msg)}${st.diff && st.diff.length ? ` Changed: ${st.diff.map((d) => esc(d.field)).join(', ')}.` : ''}</span></div>`;
  }

  function summaryCard(flow, extra) {
    const plan = planFor(flow);
    return `<aside class="stack" style="gap:16px">
      <div class="card" id="sum-${flow}">
        <div class="row between"><span class="eyebrow">Your cart</span>${ui.mockTag()}</div>
        ${plan ? `<h3>${esc(plan.name)}</h3>` : ''}
        <div id="q-${flow}" aria-live="polite">${priceSummary(flow)}</div>
        ${staleNote(flow)}
        <button class="btn primary" data-act="confirm" data-flow="${flow}" ${S[flow].quote && S[flow].quote.ok ? '' : 'disabled'} id="go-${flow}">Confirm and join</button>
        <button class="btn small ghost" data-act="pkg-back" data-flow="${flow}">Back to the package</button>
        <span class="muted" style="font-size:12.5px">Confirm re-checks the price. If an admin changed it, you see the new total first.</span>
      </div>
      ${plan ? `<div class="card"><span class="eyebrow">Availability</span>${ui.availability(plan)}</div>` : ''}
      ${extra || ''}
    </aside>`;
  }

  function steps(cur) {
    return `<div class="stepper" aria-label="Steps">${['Package', 'Details', 'Cart', 'Confirm'].map((s, i) => `<span class="${i <= cur ? 'on' : ''}">${String(i + 1).padStart(2, '0')} ${s}</span>`).join('')}</div>`;
  }

  const NEXT = {
    college: ['See Live Projects for your campus', 'projects'], industry: ['Open Design Jobs', 'jobs'], path: ['Open Learn', 'learn'],
    sponsor: ['See Live Projects', 'projects'], open: ['Open Learn', 'learn'], faculty: ['See Live Projects on your campus', 'projects'], mentor: ['See mentor sessions', 'sprints'],
  };

  function confirmCard(flow) {
    const su = S[flow].done;
    const q = su.quoteSnapshot;
    const st = S[flow];
    const period = { ANNUAL: 'a year', TERM: 'per term', ONE_TIME: 'one time' }[q.billingPeriod];
    const next = {
      college: 'The UMO admin verifies your institution, then sets up your term slot and faculty lead.',
      industry: 'Your coordinator gets an admin dashboard. It shows seats used and Passport counts, never individual submissions or feedback.',
      path: 'Your first module opens with the next live project. Course content links to the UMO Design School.',
      sponsor: 'The UMO team contacts your named owner to shape the brief NDA-safe and match it to campuses.',
      open: 'Follow capabilities in the Skills Guide and join a Circle near you.',
      faculty: 'You can see the live projects and the cohort at your campus. Your college admin links you to your term slot.',
      mentor: 'A UMO admin checks every practitioner before they are listed. Until then you can look around.',
    }[flow];
    const nx = NEXT[flow]; const me = store.session;
    const mine = me.signedIn && me.role !== 'admin' ? 'w-' + me.role : 'home';
    const email = `To: ${st.contact || st.email} (preview only, not sent)
Subject: Welcome to LEAD · ${q.planName}

Hello ${st.name},

You joined ${q.planName}${q.tierKey ? ` (${q.tierKey} tier)` : ''}.
Price version: ${q.priceVersionId}
Code: ${q.couponCode || 'none'}
Total: ${P.formatINR(q.total)} ${period}

${next}

This is a mock sign-up. Nothing was charged.
UMO Design Foundation · LEAD`;
    return `<div class="page wrap">
      ${ui.hero({ compact: true, eyebrow: `Confirmed · sign-up ${esc(su.id)}`, title: 'Welcome.', lede: 'Mock sign-up. Nothing was charged.', meta: `${ui.status('CONFIRMED_MOCK', 'Confirmed (mock)')}${ui.mockTag()}` })}
      <div class="split">
        <section class="card">
          <span class="eyebrow">What you joined</span>
          ${ui.kv([['Plan', `${q.planName} · ${su.planKey}`], ['Flow', su.flow], ['Billing', su.billingPeriod], ...(su.tierKey ? [['Tier', su.tierKey]] : []), ['Quantity', String(su.quantity)], ['Price version', su.priceVersionId], ['Code', su.couponCode || 'None'], ['List', P.formatINR(su.listTotal)], ['Discount', P.formatINR(su.discount)], ...(su.womenShare ? [['To 1 Million Women', P.formatINR(su.womenShare) + ' (' + q.womenSharePct + '%)']] : []), ...(su.womenSeats ? [['Seats for women', String(su.womenSeats)]] : []), ['Total', P.formatINR(su.total)]])}
          <p class="muted" style="font-size:13.5px">Thank you for helping reach 1 million women in design. <a href="#women">See the tally</a>.</p>
          <p class="ink">${esc(next)}</p>
          <p class="muted tiny">You are now signed in as ${esc(ui.roleName(me.role))}. Demo only.</p>
          <div class="btn-row"><a class="btn primary" id="go-mypath" href="#${mine}">Go to My path</a><a class="btn" id="go-next" href="#${nx[1]}">${esc(nx[0])}</a><button class="btn ghost" data-act="join-again" data-flow="${flow}">Start another sign-up</button></div>
        </section>
        <aside class="stack"><span class="eyebrow">Access email · preview</span><div class="email">${esc(email)}</div></aside>
      </div>
    </div>`;
  }

  /* ---------- package details: the first page of every join ---------- */
  const PKG = {
    college: { eyebrow: 'Package details · for a college', title: 'LEAD Campus.', lede: 'Student and faculty access, Live Projects, mentors and scoring days for one institution. Priced by number of students.' },
    industry: { eyebrow: 'Package details · for a company', title: 'Industry membership.', lede: 'Seats for your team, scorer seats and verified shortlists. Minimum two seats.' },
    path: { eyebrow: 'Package details · for a learner', title: 'Learning Paths.', lede: 'Short modules tied to a live project, with one mentor session. Pick the Path you want.' },
    sponsor: { eyebrow: 'Package details · for a sponsor', title: 'Sponsor a Live Project.', lede: 'Bring one real problem into a campus term. The UMO team shapes it and matches it to campuses.' },
    open: { eyebrow: 'Package details · free account', title: 'Free account.', lede: 'The Skills Guide, circles near you and open live projects. Free. You agree to the Codex in the next step.' },
    faculty: { eyebrow: 'Package details · for faculty', title: 'Faculty access.', lede: 'Free through your college. See the live projects and your cohort, and teach with live company input.' },
    mentor: { eyebrow: 'Package details · for mentors', title: 'Mentor access.', lede: 'Free. Give hours to student teams. A UMO admin checks every practitioner before they are listed.' },
  };
  const ALT = {
    open: [['#join-path', 'Take a Learning Path instead', 'Short modules and one mentor session. Mock price.']],
    faculty: [['#join-college', 'Ask my college to join', 'Start the campus sign-up for your institution.']],
    industry: [['#join-sponsor', 'Sponsor a Live Project', 'Bring one real problem into a campus term.']],
    sponsor: [['#join-industry', 'Become a member instead', 'Seats for your team and verified shortlists.']],
    path: [['#join-open', 'Start with a free account', 'No price. You agree to the Codex first.']],
  };
  const PER = { TIERED_BY_SIZE: 'a year, by size', PER_SEAT: 'per seat', PER_CHALLENGE: 'per live project', FREE: '', FLAT: '', PER_COHORT: 'per cohort' };

  function pkgCard(flow, p, single) {
    const from = P.fromPrice(p); const v = P.currentVersion(p); const sellable = rules.sellable(p);
    const per = p.pricingModel === 'PER_SEAT' && p.kind === 'PATH_ENROLMENT' ? 'per learner, per term' : PER[p.pricingModel];
    const tiers = p.pricingModel === 'TIERED_BY_SIZE' && v && Array.isArray(v.tiers) ? `<div class="table-wrap"><table><thead><tr><th>Tier</th><th>Students</th><th class="num">A year</th></tr></thead><tbody>${v.tiers.filter((t) => t.price != null).map((t) => `<tr><td>${esc(t.tier)}</td><td>${t.min.toLocaleString('en-IN')}${t.max == null ? ' and up' : '–' + t.max.toLocaleString('en-IN')}</td><td class="num">${ui.inr(t.price)}</td></tr>`).join('')}</tbody></table></div>` : '';
    return `<article class="card plan-card pkg" data-plan="${esc(p.key)}">
      <div class="row between"><span class="eyebrow accent">${esc(p.key)}</span>${ui.mockTag()}</div>
      <h3>${esc(p.name)}</h3><p style="font-size:14px">${esc(p.blurb || '')}</p>
      <div><span class="from">${from == null ? 'Not priced' : from === 0 ? 'Free' : (p.pricingModel === 'TIERED_BY_SIZE' ? 'from ' : '') + ui.inr(from)}</span> <span class="muted" style="font-size:13px">${esc(per || '')}</span></div>
      ${tiers}
      ${p.includes ? `<ul class="px-list" style="font-size:14px">${p.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      ${ui.availability(p)}
      <span class="muted" style="font-size:12.5px">Mock pricing. Not an offer. Nothing is charged.</span>
      ${sellable.ok ? `<button class="btn primary" data-act="pkg-choose" data-flow="${flow}" data-key="${esc(p.key)}">Choose this package</button>` : `<button class="btn" disabled>${esc(sellable.reason)}</button>`}
    </article>`;
  }

  function packagePage(flow) {
    const h = PKG[flow]; const st = S[flow];
    const plans = sellableOfKind(KIND[flow]).filter((p) => flow !== 'sponsor' || true);
    const body = plans.length ? plans.map((p) => pkgCard(flow, p)).join('') : '<div class="msg warn">No package of this kind is on sale right now.</div>';
    const alt = (ALT[flow] || []).map(([href, t, d]) => `<a class="opt" href="${href}"><b>${esc(t)}</b><span>${esc(d)}</span></a>`).join('');
    const who = flow === 'open' && st.persona === 'student' ? ' for students' : '';
    return `<div class="page wrap" id="join-package">
      ${ui.hero({ compact: true, eyebrow: h.eyebrow + who, title: h.title, lede: h.lede, meta: `${ui.mockTag()}${steps(0)}` })}
      <div class="grid g3">${body}</div>
      ${alt ? `<section class="section"><span class="eyebrow">Other ways to join</span><div class="opts">${alt}</div></section>` : ''}
      <div class="notice"><span class="px cyan"></span>Next you add your details, then you see your cart and confirm. <a href="#join">All packages</a></div>
    </div>`;
  }

  /* ---------- hub ---------- */
  const ROUTE = { CAMPUS_LICENCE: 'join-college', INDUSTRY_MEMBERSHIP: 'join-industry', PATH_ENROLMENT: 'join-path-', CHALLENGE_SPONSORSHIP: 'join-sponsor', OPEN_TIER: 'join-open' };
  const AUD = [
    ['CAMPUS_LICENCE', 'For institutions'], ['INDUSTRY_MEMBERSHIP', 'For companies'], ['PATH_ENROLMENT', 'For learners'], ['CHALLENGE_SPONSORSHIP', 'For sponsors'], ['OPEN_TIER', 'For everyone'],
  ];
  LEAD.views.join = {
    title: () => 'Join',
    render() {
      const cards = AUD.map(([kind, label]) => {
        const plans = sellableOfKind(kind);
        return plans.map((p) => {
          const from = P.fromPrice(p);
          const v = P.currentVersion(p);
          const sellable = rules.sellable(p);
          const r = ROUTE[p.kind] === 'join-path-' ? 'join-path-' + p.key : ROUTE[p.kind];
          const per = { TIERED_BY_SIZE: 'a year, by size', PER_SEAT: p.kind === 'PATH_ENROLMENT' ? 'per learner, per term' : 'per seat, a year', PER_CHALLENGE: 'per live project', FREE: '', FLAT: p.billingPeriod.toLowerCase(), PER_COHORT: 'per cohort' }[p.pricingModel];
          const pm = p.billingPeriod === 'ANNUAL' && from ? P.roundHalfUp(from, 12) : null;
          return `<article class="card plan-card">
            <div class="row between"><span class="eyebrow accent">${label}</span>${p.isDemo && p.kind !== 'CAMPUS_LICENCE' ? ui.tag('Demo price', 'mock') : ui.tag('Band sourced · untested', 'info')}</div>
            <h3>${esc(p.name)}</h3><p style="font-size:14px">${esc(p.blurb || '')}</p>
            <div><span class="from">${from == null ? 'Not priced' : from === 0 ? 'Free' : (p.pricingModel === 'TIERED_BY_SIZE' ? 'from ' : '') + ui.inr(from)}</span> <span class="muted" style="font-size:13px">${esc(per)}</span>${pm ? `<br><span class="muted" style="font-size:12.5px">about ${ui.inr(pm)} a month</span>` : ''}</div>
            ${p.includes ? `<ul class="px-list" style="font-size:14px">${p.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
            ${ui.availability(p)}
            ${sellable.ok ? `<a class="btn ${p.kind === 'OPEN_TIER' ? '' : 'primary'}" href="#${r}">${p.kind === 'OPEN_TIER' ? 'Join free' : 'Join'}</a>` : `<button class="btn" disabled>${esc(sellable.reason)}</button>`}
            ${v ? `<span class="muted" style="font-size:12px">Price version ${esc(v.id)}${p.refundDays ? ` · ${p.refundDays}-day refund window (policy not set)` : ''}</span>` : ''}
          </article>`;
        }).join('');
      }).join('');
      const groups = `<div class="grid g3">${cards}</div>`;
      return `<div class="page wrap">
        ${ui.hero({ eyebrow: 'Join LEAD · five ways in', title: 'Join.', lede: 'Pick how you take part. Every price is set by the UMO admin and updates here within seconds. Nothing is charged in this prototype.', meta: `${ui.mockTag()}${steps(0)}` })}
        <div id="join-groups">${groups}</div>
        <section class="section" aria-label="Join by role"><span class="eyebrow">Or join by role</span>
          <div class="opts">${[['open', 'student', 'Student', 'A free account, or a Path.'], ['faculty', '', 'Faculty', 'Free through your college.'], ['mentor', '', 'Mentor', 'Give hours. Free.'], ['open', 'open', 'Open learner', 'Free. No campus needed.']].map(([f, per, t, d]) => `<button class="opt" data-act="join-start" data-flow="${f}" data-persona="${per}"><b>${t}</b><span>${d}</span></button>`).join('')}</div></section>
        <div class="notice"><span class="px cyan"></span>Courses and certification live at the <a href="https://umodesign.school" target="_blank" rel="noopener">UMO Design School</a>. LEAD links to them. Scholarships and gift matching are reserved and need a decision.</div>
      </div>`;
    },
  };

  /* ---------- college ---------- */
  function tierReason(n) {
    const plan = planFor('college'); const v = plan && P.currentVersion(plan);
    const t = v && P.tierFor(v, Number(n));
    if (!t) return '<span class="muted">No tier covers this size.</span>';
    return `<b class="ink">${t.tier}</b> tier, because ${Number(n).toLocaleString('en-IN')} students falls in ${t.min.toLocaleString('en-IN')}–${t.max == null ? 'and up' : t.max.toLocaleString('en-IN')}.`;
  }
  LEAD.views['join-college'] = {
    title: () => 'Join · College',
    render() {
      const st = S.college; arrive('college');
      if (st.done) return confirmCard('college');
      if (st.step !== 'cart') return packagePage('college');
      requote('college');
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'A10.1 · College onboarding · LEAD Campus', title: 'Campus.', lede: 'Student and faculty access, Live Projects, mentors and assessment days for your institution. The fee band is ₹5–15 lakh a year by size. It is a proposal and untested.', meta: steps(st.code ? 2 : 1) })}
        <div class="split">
          <section class="card" style="gap:16px">
            <span class="eyebrow">Institution details</span>
            <div class="form-grid">
              <label class="field">Institution name<input id="jc-name" data-on="jf" data-flow="college" data-k="name" value="${esc(st.name)}"></label>
              <label class="field">City<input id="jc-city" data-on="jf" data-flow="college" data-k="city" value="${esc(st.city)}"></label>
              <label class="field">Number of students<input id="jc-students" type="number" min="1" data-on="jf" data-flow="college" data-k="students" value="${esc(st.students)}"></label>
              <label class="field">Contact email<input id="jc-contact" type="email" data-on="jf" data-flow="college" data-k="contact" value="${esc(st.contact)}"></label>
            </div>
            <div class="notice" id="tier-why"><span class="px"></span>${tierReason(st.students)}</div>
            <label class="check"><input type="checkbox" disabled> Extra cohorts <span class="muted">· reserved, not built</span></label>
            ${womenBlock('college')}
            ${couponField('college')}
          </section>
          ${summaryCard('college')}
        </div>
      </div>`;
    },
    onPricing: livePricing('college'),
  };

  /* ---------- industry ---------- */
  LEAD.views['join-industry'] = {
    title: () => 'Join · Industry',
    render() {
      const st = S.industry; arrive('industry');
      if (st.done) return confirmCard('industry');
      if (st.step !== 'cart') return packagePage('industry');
      requote('industry');
      const learners = Math.max(0, Number(st.seats) - Number(st.supervisors));
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'A10.2 · Industry partnership · Industry Membership', title: 'Partner.', lede: 'Seats for your team: sponsor live projects, send assessors, and see verified shortlists. Minimum two seats.', meta: steps(st.code ? 2 : 1) })}
        <div class="split">
          <section class="card" style="gap:16px">
            <span class="eyebrow">Organisation</span>
            <div class="form-grid">
              <label class="field">Organisation name<input id="ji-name" data-on="jf" data-flow="industry" data-k="name" value="${esc(st.name)}"></label>
              <label class="field">Contact email<input id="ji-contact" type="email" data-on="jf" data-flow="industry" data-k="contact" value="${esc(st.contact)}"></label>
            </div>
            <span class="eyebrow">Seats and roles</span>
            <div class="form-grid">
              <label class="field">Seats<span class="hint">Minimum 2</span><input id="ji-seats" type="number" min="1" data-on="jf" data-flow="industry" data-k="seats" value="${esc(st.seats)}"></label>
              <label class="field">Supervisors<span class="hint">Admin, uses a seat</span><input id="ji-sup" type="number" min="0" data-on="jf" data-flow="industry" data-k="supervisors" value="${esc(st.supervisors)}"></label>
              <label class="field">Coordinators<span class="hint">Admin only, no seat</span><input id="ji-coord" type="number" min="0" data-on="jf" data-flow="industry" data-k="coordinators" value="${esc(st.coordinators)}"></label>
              <label class="field">Assessor seats offered<span class="hint">Free; feeds gate G4</span><input id="ji-ass" type="number" min="0" data-on="jf" data-flow="industry" data-k="assessors" value="${esc(st.assessors)}"></label>
            </div>
            <div class="notice"><span class="px"></span><span><b class="ink">${learners}</b> member seats · <b class="ink">${esc(st.supervisors)}</b> supervisor · <b class="ink">${esc(st.coordinators)}</b> coordinator (no seat) · <b class="ink">${esc(st.assessors)}</b> assessor seats, not priced</span></div>
            <div class="msg info">Privacy: your admins see seats used and Passport counts. They never see individual submissions or feedback (R3, R4).</div>
            ${womenBlock('industry')}
            ${couponField('industry')}
          </section>
          ${summaryCard('industry')}
        </div>
      </div>`;
    },
    onPricing: livePricing('industry'),
  };

  /* ---------- path ---------- */
  LEAD.views['join-path'] = {
    title: () => 'Join · Path',
    render(key) {
      const st = S.path;
      if (key && key !== st.key && !st.done) st.key = key;
      arrive('path');
      if (st.done) return confirmCard('path');
      if (st.step !== 'cart') return packagePage('path');
      const paths = sellableOfKind('PATH_ENROLMENT');
      if (!paths.some((p) => p.key === st.key) && paths[0]) st.key = paths[0].key;
      requote('path');
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'A10.3 · Path enrolment · LEARN', title: 'Learn.', lede: 'Short modules tied to a live project, weighted to practice with feedback, with one mentor session included.', meta: steps(st.code ? 2 : 1) })}
        <div class="split">
          <section class="card" style="gap:16px">
            <label class="field">Path<span class="hint">From the live plan registry</span><select id="jp-key" data-on="jpath">${paths.map((p) => `<option value="${p.key}" ${p.key === st.key ? 'selected' : ''}>${esc(p.name)} · ${esc(p.key)}</option>`).join('')}</select></label>
            <div class="form-grid">
              <label class="field">Your name<input id="jp-name" data-on="jf" data-flow="path" data-k="name" value="${esc(st.name)}"></label>
              <label class="field">Campus or organisation<input id="jp-org" data-on="jf" data-flow="path" data-k="org" value="${esc(st.org)}"></label>
              <label class="field">Learners<span class="hint">1 for an individual</span><input id="jp-n" type="number" min="1" data-on="jf" data-flow="path" data-k="learners" value="${esc(st.learners)}"></label>
              <label class="field">Email<input id="jp-contact" type="email" data-on="jf" data-flow="path" data-k="contact" value="${esc(st.contact)}"></label>
            </div>
            ${womenBlock('path')}
            ${couponField('path')}
            ${String(st.code).toUpperCase().startsWith('STUDENT') ? `<label class="field">Eligibility note<span class="hint">Student check is reserved (P2). Tell us your institution and expected graduation date.</span><textarea id="jp-elig" data-on="jf" data-flow="path" data-k="eligibility">${esc(st.eligibility)}</textarea></label>` : ''}
          </section>
          ${summaryCard('path')}
        </div>
      </div>`;
    },
    onPricing: livePricing('path'),
  };

  /* ---------- sponsor ---------- */
  LEAD.views['join-sponsor'] = {
    title: () => 'Join · Sponsor',
    render(id) {
      const st = S.sponsor;
      if (id) st.challenge = id;
      arrive('sponsor');
      if (st.done) return confirmCard('sponsor');
      if (st.step !== 'cart') return packagePage('sponsor');
      requote('sponsor');
      const chs = store.loop.challenges.filter((c) => c.status !== 'Closed');
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'A10.4 · Live Project sponsorship · APPLY', title: 'Sponsor.', lede: 'Bring a real, scoped problem into a term. The UMO team shapes it NDA-safe and matches it to campuses.', meta: steps(st.code ? 2 : 1) })}
        <div class="split">
          <section class="card" style="gap:16px">
            <div class="form-grid">
              <label class="field">Company<input id="js-name" data-on="jf" data-flow="sponsor" data-k="name" value="${esc(st.name)}"></label>
              <label class="field">Contact email<input id="js-contact" type="email" data-on="jf" data-flow="sponsor" data-k="contact" value="${esc(st.contact)}"></label>
              <label class="field">Live Project<select id="js-ch" data-on="jf" data-flow="sponsor" data-k="challenge">${chs.map((c) => `<option value="${c.id}" ${c.id === st.challenge ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}<option value="new" ${st.challenge === 'new' ? 'selected' : ''}>A new brief, shaped with the UMO team</option></select></label>
              <label class="field">Number of live projects<input id="js-n" type="number" min="1" data-on="jf" data-flow="sponsor" data-k="count" value="${esc(st.count)}"></label>
            </div>
            <label class="check"><input type="checkbox" disabled> Split the price with co-sponsors <span class="muted">· reserved, not built (F-AP-08)</span></label>
            ${womenBlock('sponsor')}
            ${couponField('sponsor')}
          </section>
          ${summaryCard('sponsor')}
        </div>
      </div>`;
    },
    onPricing: livePricing('sponsor'),
  };

  /* ---------- free packages: open (student or open learner), faculty, mentor ---------- */
  const campuses = () => store.loop.orgs.filter((o) => o.kind === 'institution');
  function campusField(flow, required) {
    const st = S[flow]; const v = flow === 'open' ? st.campus : st.campus;
    return `<label class="field">Your campus<span class="hint">${required ? 'Demo campuses. Choosing one signs you in as a made-up person there.' : 'Optional. Demo campuses.'}</span>
      <select id="jf-campus-${flow}" data-on="jf" data-flow="${flow}" data-k="campus" data-struct="1">
        <option value="">${required ? 'Choose a campus' : 'No campus yet'}</option>
        ${campuses().map((o) => `<option value="${o.id}" ${v === o.id ? 'selected' : ''}>${esc(o.name)} · ${esc(o.city)}</option>`).join('')}
        <option value="none" ${v === 'none' ? 'selected' : ''}>My campus is not listed</option></select></label>
      ${v === 'none' ? `<div class="stack"><p style="font-size:14px">Send this to your head of department or placement cell.</p><div class="email" id="join-note">${esc(NOTE)}</div><div class="btn-row"><button class="btn small" type="button" data-act="join-copy">Copy the note</button></div></div>` : ''}`;
  }
  const codexField = (flow, analytics) => `<span class="eyebrow">Consent</span>
    <label class="check"><input type="checkbox" id="jf-codex-${flow}" data-on="jf" data-flow="${flow}" data-k="codex" ${S[flow].codex ? 'checked' : ''}> I agree to the LEAD Codex: consent, IP and ethics rules. <span class="muted">Required</span></label>
    ${analytics ? `<label class="check"><input type="checkbox" id="jf-an-${flow}" data-on="jf" data-flow="${flow}" data-k="analytics" ${S[flow].analytics ? 'checked' : ''}> Use my activity in aggregate analytics. <span class="muted">Optional</span></label>` : ''}`;
  const textField = (flow, k, label, type) => `<label class="field">${label}<input id="jf-${k}-${flow}" ${type ? `type="${type}"` : ''} data-on="jf" data-flow="${flow}" data-k="${k}" value="${esc(S[flow][k])}" ${type === 'number' ? 'min="1" max="60"' : ''}></label>`;

  function freePage(flow, fields) {
    const st = S[flow]; const h = PKG[flow];
    requote(flow);
    return `<div class="page wrap">
      ${ui.hero({ compact: true, eyebrow: h.eyebrow.replace('Package details', 'Your details'), title: h.title, lede: 'Add your details. Your cart is on the right. Nothing is charged.', meta: steps(1) })}
      <div class="split">
        <section class="card" style="gap:16px"><span class="eyebrow">Your details</span>${fields}</section>
        ${summaryCard(flow)}
      </div>
    </div>`;
  }

  LEAD.views['join-open'] = {
    title: () => 'Join · Free account',
    render() {
      const st = S.open; arrive('open');
      if (st.done) return confirmCard('open');
      if (st.step !== 'cart') return packagePage('open');
      const stud = st.persona === 'student';
      return freePage('open', `<div class="form-grid">${textField('open', 'name', 'Name')}${textField('open', 'email', 'Email', 'email')}</div>${stud ? campusField('open', false) : ''}${codexField('open', true)}`);
    },
    onPricing: livePricing('open'),
  };
  LEAD.views['join-faculty'] = {
    title: () => 'Join · Faculty',
    render() {
      const st = S.faculty; arrive('faculty');
      if (st.done) return confirmCard('faculty');
      if (st.step !== 'cart') return packagePage('faculty');
      return freePage('faculty', `<div class="form-grid">${textField('faculty', 'name', 'Name')}${textField('faculty', 'email', 'Email', 'email')}</div>${campusField('faculty', true)}${codexField('faculty', false)}`);
    },
    onPricing: livePricing('faculty'),
  };
  LEAD.views['join-mentor'] = {
    title: () => 'Join · Mentor',
    render() {
      const st = S.mentor; arrive('mentor');
      if (st.done) return confirmCard('mentor');
      if (st.step !== 'cart') return packagePage('mentor');
      return freePage('mentor', `<div class="form-grid">${textField('mentor', 'name', 'Name')}${textField('mentor', 'email', 'Email', 'email')}${textField('mentor', 'practice', 'What you do')}${textField('mentor', 'hours', 'Hours you can give this term', 'number')}</div>${codexField('mentor', false)}`);
    },
    onPricing: livePricing('mentor'),
  };

  /* ---------- handlers ---------- */
  const timers = {};
  function refreshQuote(flow) {
    requote(flow);
    const q = document.getElementById('q-' + flow); if (q) { q.innerHTML = priceSummary(flow); q.classList.remove('flash'); void q.offsetWidth; q.classList.add('flash'); }
    const cm = document.getElementById('cm-' + flow); if (cm) cm.innerHTML = couponMsg(flow);
    const go = document.getElementById('go-' + flow); if (go) go.disabled = !(S[flow].quote && S[flow].quote.ok);
    if (flow === 'college') { const t = document.getElementById('tier-why'); if (t) t.innerHTML = '<span class="px"></span>' + tierReason(S.college.students); }
  }
  LEAD.on.coupon = (el) => {
    const flow = el.dataset.flow;
    S[flow].code = el.value.trim();
    S[flow].stale = null;
    clearTimeout(timers[flow]);
    timers[flow] = setTimeout(() => {
      if (flow === 'path' && (!!document.getElementById('jp-elig')) !== S.path.code.toUpperCase().startsWith('STUDENT')) LEAD.render({ keepScroll: true });
      else refreshQuote(flow);
    }, 300);
  };
  LEAD.on.jf = (el) => {
    const flow = el.dataset.flow;
    S[flow][el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value;
    S[flow].stale = null;
    clearTimeout(timers[flow + 'f']);
    const structural = flow === 'industry' || (flow === 'sponsor' && el.dataset.k === 'challenge') || !!el.dataset.struct;
    timers[flow + 'f'] = setTimeout(() => (structural ? LEAD.render({ keepScroll: true }) : refreshQuote(flow)), 250);
  };
  LEAD.on.jpath = (el) => { S.path.key = el.value; S.path.stale = null; LEAD.render({ keepScroll: true }); };

  LEAD.act.confirm = (el) => {
    const flow = el.dataset.flow; const st = S[flow];
    const bad = validate(flow);
    if (bad) { ui.toast(bad); return; }
    const data = store.pricingData();
    const res = P.confirm(st.quote, data, Date.now());
    if (!res.ok) {
      st.quote = res.quote; st.stale = { msg: res.error, diff: res.diff };
      LEAD.render({ keepScroll: true });
      ui.toast('The price changed. Check the new total.');
      return;
    }
    const q = res.quote;
    const details = Object.assign({}, st); delete details.quote; delete details.stale; delete details.done;
    const su = P.buildSignup(q, { orgId: q.input.orgId, orgName: st.name || st.org, details });
    const reg = rules.registry(store.pricing.plans, store.pricing.coupons);
    const errs = P.validateSignupEnums(su, { planKeys: reg.plan_keys, couponCodes: store.pricing.coupons.map((c) => c.code) });
    if (errs.length) { ui.toast(errs[0]); return; }
    /* One transaction: sign-up, booked count and redemption together (A8.2). */
    store.pricingCommit('Mock sign-up confirmed', 'signup', su.id, null, (p) => {
      p.signups.unshift(su);
      const plan = p.plans.find((x) => x.key === su.planKey);
      plan.booked = (plan.booked || 0) + (plan.pricingModel === 'TIERED_BY_SIZE' ? 1 : su.quantity);
      if (su.couponCode) {
        const c = p.coupons.find((x) => enums.normaliseCode(x.code) === su.couponCode);
        c.redemptions.push({ orgId: su.orgId, signupId: su.id, discount: su.discount, at: Date.now() });
        p.audit.unshift(rules.auditEntry(store.actorLabel(), 'Coupon redeemed', 'coupon', c.code, null, { signupId: su.id, discount: su.discount }));
      }
      return su;
    });
    if (flow === 'college') store.commit('Pending institution: UMO admin to verify', 'organisation', su.orgId, () => ({ name: st.name, city: st.city, status: 'Pending verification' }));
    st.done = su;
    signIn(flow);
    LEAD.render({ navigated: true });
    ui.toast('Confirmed. Nothing was charged.');
  };
  function validate(flow) {
    const st = S[flow];
    if (!String(st.name || '').trim()) return 'Add your name.';
    if (['open', 'faculty', 'mentor'].includes(flow)) {
      if (!String(st.email || '').trim()) return 'Add your email.';
      if (!st.codex) return 'Agree to the Codex to join. It covers consent, IP and ethics.';
    }
    if (flow === 'faculty' && !st.campus) return 'Choose your campus.';
    if (flow === 'mentor' && !String(st.practice || '').trim()) return 'Say what you do.';
    if (flow === 'mentor' && !(Number(st.hours) > 0)) return 'Add the hours you can give.';
    return '';
  }
  /* Confirming signs you in as the persona you joined as. Demo only. */
  function signIn(flow) {
    const st = S[flow];
    const fresh = (role, extra) => {
      const id = role.slice(0, 1) + Date.now().toString(36);
      store.commit(role === 'mentor' ? 'Mentor application' : 'Member created after consent', 'user', id, () => { const u = Object.assign({ id, name: st.name, role, orgId: role === 'mentor' ? 'umo' : 'open' }, extra || {}); store.loop.users.push(u); if (role === 'open') store.loop.consents.push({ userId: id, purpose: 'analytics', granted: !!st.analytics, at: Date.now() }); return u; });
      return id;
    };
    if (flow === 'college') store.setRole('head');
    else if (flow === 'industry' || flow === 'sponsor') store.setRole('industry');
    else if (flow === 'path') store.setRole('student');
    else if (flow === 'mentor') store.setRole('mentor', fresh('mentor', { title: st.practice, verified: false, hoursOffered: Number(st.hours) || 4 }));
    else if (flow === 'faculty') {
      const c = CAMPUS_USERS[st.campus];
      if (c) { store.setRole('faculty', c.faculty); ui.toast(`Demo: you are now ${store.user(c.faculty).name} at ${ui.orgName(st.campus)}.`); } else store.setRole('open', fresh('open'));
    } else if (st.persona === 'student') {
      const c = CAMPUS_USERS[st.campus];
      store.setRole('student', c ? c.student : undefined);
    } else store.setRole('open', fresh('open'));
  }
  LEAD.act['women-cohort'] = () => { S.sponsor.women = (Number(S.sponsor.women) || 0) + 10; S.sponsor.stale = null; LEAD.render({ keepScroll: true }); };
  LEAD.act['join-again'] = (el) => { const st = S[el.dataset.flow]; st.done = null; st.code = ''; st.quote = null; st.stale = null; LEAD.render(); };

  LEAD.act['pkg-choose'] = (el) => {
    const flow = el.dataset.flow; const st = S[flow];
    if ((flow === 'path' || flow === 'sponsor') && el.dataset.key) st.key = el.dataset.key;
    st.step = 'cart'; st.stale = null; st.quote = null;
    LEAD.render({ navigated: true });
  };
  LEAD.act['pkg-back'] = (el) => { const st = S[el.dataset.flow]; st.step = 'package'; st.stale = null; LEAD.render({ navigated: true }); };
  /* Start a join from anywhere (the join sheet, the hub): set who is joining, open the package page. */
  function start(flow, persona) {
    const st = S[flow];
    st.done = null; st.quote = null; st.stale = null; st.code = ''; st.step = 'package';
    if ('persona' in st) { st.persona = persona || 'open'; st.pinAt = Date.now(); }
    LEAD.go('join-' + flow);
  }
  LEAD.join = { start, state: S };
  LEAD.act['join-start'] = (el) => start(el.dataset.flow, el.dataset.persona);
  LEAD.act['join-copy'] = () => {
    const fallback = () => { const n = document.getElementById('join-note'); if (n) { const r = document.createRange(); r.selectNodeContents(n); const x = window.getSelection(); x.removeAllRanges(); x.addRange(r); } ui.toast('Select and copy the text.'); };
    try { navigator.clipboard.writeText(NOTE).then(() => ui.toast('Copied.'), fallback); } catch (e) { fallback(); }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
