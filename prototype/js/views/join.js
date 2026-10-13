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
    open: { name: 'Dev Malhotra', email: 'dev@open.example', codex: true, analytics: false, done: null },
  };
  const FLOW = { college: 'COLLEGE_ONBOARDING', industry: 'INDUSTRY_PARTNERSHIP', path: 'PATH_ENROLMENT', sponsor: 'CHALLENGE_SPONSORSHIP', open: 'OPEN_JOIN' };
  const KIND = { college: 'CAMPUS_LICENCE', industry: 'INDUSTRY_MEMBERSHIP', path: 'PATH_ENROLMENT', sponsor: 'CHALLENGE_SPONSORSHIP', open: 'OPEN_TIER' };

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
        <div class="row between"><span class="eyebrow">Your quote</span>${ui.mockTag()}</div>
        ${plan ? `<h3>${esc(plan.name)}</h3>` : ''}
        <div id="q-${flow}" aria-live="polite">${priceSummary(flow)}</div>
        ${staleNote(flow)}
        <button class="btn primary" data-act="confirm" data-flow="${flow}" ${S[flow].quote && S[flow].quote.ok ? '' : 'disabled'} id="go-${flow}">Confirm (mock)</button>
        <span class="muted" style="font-size:12.5px">Confirm re-checks the price. If an admin changed it, you see the new total first.</span>
      </div>
      ${plan ? `<div class="card"><span class="eyebrow">Availability</span>${ui.availability(plan)}</div>` : ''}
      ${extra || ''}
    </aside>`;
  }

  function steps(cur) {
    return `<div class="stepper" aria-label="Steps">${['Plan', 'Details', 'Code', 'Quote', 'Confirm'].map((s, i) => `<span class="${i <= cur ? 'on' : ''}">${String(i + 1).padStart(2, '0')} ${s}</span>`).join('')}</div>`;
  }

  function confirmCard(flow) {
    const su = S[flow].done;
    const q = su.quoteSnapshot;
    const st = S[flow];
    const period = { ANNUAL: 'a year', TERM: 'per term', ONE_TIME: 'one time' }[q.billingPeriod];
    const next = {
      college: 'The UMO admin verifies your institution, then sets up your term slot and faculty lead.',
      industry: 'Your coordinator gets an admin dashboard. It shows seats used and Passport counts, never individual submissions or feedback.',
      path: 'Your first module opens with the next live challenge. Course content links to the UMO Design School.',
      sponsor: 'The UMO team contacts your named owner to shape the brief NDA-safe and match it to campuses.',
      open: 'Follow capabilities in the Skills Guide and join a Circle near you.',
    }[flow];
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
          <div class="btn-row"><button class="btn" data-act="join-again" data-flow="${flow}">Start another sign-up</button><a class="btn ghost" href="#join">All offers</a></div>
        </section>
        <aside class="stack"><span class="eyebrow">Access email · preview</span><div class="email">${esc(email)}</div></aside>
      </div>
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
          const per = { TIERED_BY_SIZE: 'a year, by size', PER_SEAT: p.kind === 'PATH_ENROLMENT' ? 'per learner, per term' : 'per seat, a year', PER_CHALLENGE: 'per challenge', FREE: '', FLAT: p.billingPeriod.toLowerCase(), PER_COHORT: 'per cohort' }[p.pricingModel];
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
      const st = S.college;
      if (st.done) return confirmCard('college');
      requote('college');
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'A10.1 · College onboarding · LEAD Campus', title: 'Campus.', lede: 'Student and faculty access, Industry Challenges, mentors and assessment days for your institution. The fee band is ₹5–15 lakh a year by size. It is a proposal and untested.', meta: steps(st.code ? 3 : 1) })}
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
      const st = S.industry;
      if (st.done) return confirmCard('industry');
      requote('industry');
      const learners = Math.max(0, Number(st.seats) - Number(st.supervisors));
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'A10.2 · Industry partnership · Industry Membership', title: 'Partner.', lede: 'Seats for your team: sponsor challenges, send assessors, and see verified shortlists. Minimum two seats.', meta: steps(st.code ? 3 : 1) })}
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
      if (st.done) return confirmCard('path');
      const paths = sellableOfKind('PATH_ENROLMENT');
      if (!paths.some((p) => p.key === st.key) && paths[0]) st.key = paths[0].key;
      requote('path');
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'A10.3 · Path enrolment · LEARN', title: 'Learn.', lede: 'Short modules tied to a live challenge, weighted to practice with feedback, with one mentor sprint included.', meta: steps(st.code ? 3 : 1) })}
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
      if (st.done) return confirmCard('sponsor');
      requote('sponsor');
      const chs = store.loop.challenges.filter((c) => c.status !== 'Closed');
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'A10.4 · Challenge sponsorship · APPLY', title: 'Sponsor.', lede: 'Bring a real, scoped problem into a term. The UMO team shapes it NDA-safe and matches it to campuses.', meta: steps(st.code ? 3 : 1) })}
        <div class="split">
          <section class="card" style="gap:16px">
            <div class="form-grid">
              <label class="field">Company<input id="js-name" data-on="jf" data-flow="sponsor" data-k="name" value="${esc(st.name)}"></label>
              <label class="field">Contact email<input id="js-contact" type="email" data-on="jf" data-flow="sponsor" data-k="contact" value="${esc(st.contact)}"></label>
              <label class="field">Challenge<select id="js-ch" data-on="jf" data-flow="sponsor" data-k="challenge">${chs.map((c) => `<option value="${c.id}" ${c.id === st.challenge ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}<option value="new" ${st.challenge === 'new' ? 'selected' : ''}>A new brief, shaped with the UMO team</option></select></label>
              <label class="field">Number of challenges<input id="js-n" type="number" min="1" data-on="jf" data-flow="sponsor" data-k="count" value="${esc(st.count)}"></label>
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

  /* ---------- open ---------- */
  LEAD.views['join-open'] = {
    title: () => 'Join · Open',
    render() {
      const st = S.open;
      if (st.done) return confirmCard('open');
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'A10.5 · Open join · free', title: 'Explore.', lede: 'The Skills Guide, public showcases, Circles near you and open-cohort calls. Free. No code needed.', meta: steps(1) })}
        <form class="card" data-form="open-join" style="max-width:720px">
          <div class="form-grid"><label class="field">Name<input id="jo-name" name="name" value="${esc(st.name)}" required></label>
          <label class="field">Email<input id="jo-email" type="email" name="email" value="${esc(st.email)}" required></label></div>
          <span class="eyebrow">Consent · F-GV-01</span>
          <label class="check"><input type="checkbox" name="codex" id="jo-codex" ${st.codex ? 'checked' : ''}> I agree to the LEAD Codex: consent, IP and ethics rules. <span class="muted">Required</span></label>
          <label class="check"><input type="checkbox" name="analytics" id="jo-an" ${st.analytics ? 'checked' : ''}> Use my activity in aggregate analytics. <span class="muted">Optional</span></label>
          <button class="btn primary" type="submit">Join free</button>
        </form>
      </div>`;
    },
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
    S[flow][el.dataset.k] = el.value;
    S[flow].stale = null;
    clearTimeout(timers[flow + 'f']);
    const structural = flow === 'industry' || (flow === 'sponsor' && el.dataset.k === 'challenge');
    timers[flow + 'f'] = setTimeout(() => (structural ? LEAD.render({ keepScroll: true }) : refreshQuote(flow)), 250);
  };
  LEAD.on.jpath = (el) => { S.path.key = el.value; S.path.stale = null; LEAD.render({ keepScroll: true }); };

  LEAD.act.confirm = (el) => {
    const flow = el.dataset.flow; const st = S[flow];
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
    LEAD.render();
    ui.toast('Confirmed. Nothing was charged.');
  };
  LEAD.act['women-cohort'] = () => { S.sponsor.women = (Number(S.sponsor.women) || 0) + 10; S.sponsor.stale = null; LEAD.render({ keepScroll: true }); };
  LEAD.act['join-again'] = (el) => { const st = S[el.dataset.flow]; st.done = null; st.code = ''; st.quote = null; st.stale = null; LEAD.render(); };

  LEAD.forms['open-join'] = (fd) => {
    const st = S.open;
    st.name = String(fd.get('name')).trim(); st.email = String(fd.get('email')).trim(); st.codex = !!fd.get('codex'); st.analytics = !!fd.get('analytics');
    if (!st.codex) { ui.toast('Agree to the Codex to join. It covers consent, IP and ethics.'); LEAD.render({ keepScroll: true }); return; }
    const plan = planFor('open');
    if (!plan) { ui.toast('The open tier is switched off.'); return; }
    const q = P.quote(inputFor('open'), store.pricingData());
    if (!q.ok) { ui.toast(q.error); return; }
    st.quote = q;
    const su = P.buildSignup(q, { orgId: q.input.orgId, orgName: 'Open community', details: { name: st.name, analytics: st.analytics } });
    store.pricingCommit('Open member joined', 'signup', su.id, null, (p) => { p.signups.unshift(su); const pl = p.plans.find((x) => x.key === su.planKey); pl.booked = (pl.booked || 0) + 1; return su; });
    const id = 'o' + Date.now().toString(36);
    store.commit('Open member created after consent', 'user', id, () => { const u = { id, name: st.name, role: 'open', orgId: 'open' }; store.loop.users.push(u); store.loop.consents.push({ userId: id, purpose: 'analytics', granted: st.analytics, at: Date.now() }); return u; });
    st.done = su;
    LEAD.render();
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
