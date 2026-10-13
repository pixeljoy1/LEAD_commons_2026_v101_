/* LEAD · UMO admin, one page: the operations links, pricing models, coupons, the women share, recent sign-ups. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, pricing: P, rules, enums } = LEAD;
  const { esc } = ui;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const role = () => store.session.role;
  const actor = () => store.session.adminActor;
  const canWrite = () => role() === 'admin';
  const dis = () => (canWrite() ? '' : 'disabled');

  /* One message, shown next to the control it belongs to. Typed values survive a refused save. */
  const note = { key: null, msg: null, cls: 'ok' };
  const drafts = {};
  const say = (key, msg, cls) => { note.key = key; note.msg = msg; note.cls = cls || 'ok'; };
  const noteFor = (key) => (note.msg && note.key === key ? `<div class="msg ${note.cls}" role="status">${esc(note.msg)}</div>` : '');

  const priceText = (p) => {
    const v = P.currentVersion(p);
    if (!P.isPriced(v, p.pricingModel)) return '<span class="status s-bad">No price. Cannot be sold.</span>';
    if (p.pricingModel === 'FREE') return 'Free';
    if (p.pricingModel === 'TIERED_BY_SIZE') return v.tiers.map((t) => `${t.tier[0]} ${ui.inr(t.price)}`).join(' · ');
    return ui.inr(v.unitPrice);
  };
  const planStatus = (p) => (!p.active ? ui.status('PAUSED', 'Off') : rules.sellable(p).ok ? ui.status('ACTIVE', 'On sale') : ui.status('DRAFT', rules.sellable(p).reason));
  const joinRoute = (p) => ({ CAMPUS_LICENCE: 'join-college', INDUSTRY_MEMBERSHIP: 'join-industry', PATH_ENROLMENT: 'join-path-' + p.key, CHALLENGE_SPONSORSHIP: 'join-sponsor', OPEN_TIER: 'join-open' }[p.kind]);
  const per = (p) => ({ TIERED_BY_SIZE: 'by institution size, a year', PER_SEAT: p.kind === 'PATH_ENROLMENT' ? 'per learner, per term' : 'per seat, a year', PER_CHALLENGE: 'per challenge', FREE: 'free', FLAT: 'flat', PER_COHORT: 'per cohort' }[p.pricingModel]);

  function planCard(p) {
    const latest = (p.versions || []).slice().sort((a, b) => b.version - a.version)[0];
    const d = drafts[p.key] || {};
    const tiers = p.pricingModel === 'TIERED_BY_SIZE' ? ((latest && latest.tiers) || enums.TierKey.map((t, i) => ({ tier: t, min: [1, 1001, 3001][i], max: [1000, 3000, null][i], price: null }))) : null;
    const val = (k, cur) => esc(d[k] != null ? d[k] : (cur == null ? '' : cur / 100));
    const form = p.pricingModel === 'FREE'
      ? '<p class="muted" style="font-size:13px">Free plan. There is no price to set.</p>'
      : `<form class="stack" style="gap:10px" data-form="price" data-key="${p.key}">
        ${tiers
    ? `<div class="form-grid">${tiers.map((t) => `<label class="field">${t.tier} · up to ${t.max == null ? 'any size' : t.max.toLocaleString('en-IN') + ' students'} (₹)<input id="tp-${p.key}-${t.tier}" name="tier-${t.tier}" inputmode="decimal" value="${val('tier-' + t.tier, t.price)}" ${dis()}></label>`).join('')}</div>`
    : `<label class="field">Price, ${esc(per(p))} (₹)<input id="pp-${p.key}" name="price" inputmode="decimal" value="${val('price', latest && latest.unitPrice)}" ${dis()}></label>`}
        <label class="field">Note<span class="hint">Needed when the change is over 30%</span><input id="pn-${p.key}" name="note" value="${esc(d.note || '')}" ${dis()}></label>
        <div class="btn-row"><button class="btn primary small" type="submit" ${dis()}>Save as new version</button><a class="btn small ghost" href="#${joinRoute(p)}">Preview sign-up</a></div>
        ${noteFor(p.key)}
      </form>`;
    const hist = (p.versions || []).slice().sort((a, b) => b.version - a.version);
    const cur = P.currentVersion(p);
    return `<article class="card" id="plan-${p.key}">
      <div class="row between"><span class="code">${esc(p.key)}</span>${planStatus(p)}</div>
      <h3>${esc(p.name)}</h3>
      <div class="stack" style="gap:2px"><span style="font:700 22px/1.2 var(--f-display);color:var(--ink)" class="tnum">${p.pricingModel === 'TIERED_BY_SIZE' && P.fromPrice(p) != null ? 'from ' + ui.inr(P.fromPrice(p)) : priceText(p)}</span>${p.pricingModel === 'TIERED_BY_SIZE' && P.fromPrice(p) != null ? `<span class="tnum" style="font-size:13px">${priceText(p)}</span>` : ''}<span class="muted" style="font-size:13px">${esc(per(p))}${p.isDemo && p.kind !== 'CAMPUS_LICENCE' ? ' · demo price' : ''}</span></div>
      ${ui.availability(p)}
      ${form}
      <div class="row between"><button class="btn small" data-act="plan-toggle" data-key="${p.key}" ${dis()}>${p.active ? 'Switch off' : 'Switch on'}</button>
        <details class="more"><summary>History · ${hist.length}</summary><div class="stack" style="gap:6px;margin-top:8px;font-size:13px">${hist.map((x) => `<div class="row between"><span><span class="code">${esc(x.id)}</span>${cur && x.id === cur.id ? ' ' + ui.tag('In force', 'live') : ''}</span><span class="tnum">${x.tiers ? x.tiers.map((t) => ui.inr(t.price || 0)).join(' · ') : ui.inr(x.unitPrice || 0)}</span></div>`).join('') || '<span class="muted">No price yet.</span>'}</div></details></div>
    </article>`;
  }

  function couponCard(c) {
    const st = P.effectiveCouponStatus(c);
    const own = c.status === 'PENDING_APPROVAL' && c.createdBy === actor();
    return `<article class="card tight">
      <div class="row between"><span class="code" style="font-size:15px">${esc(c.code)}</span>${ui.status(st)}</div>
      <div class="row" style="gap:12px;align-items:baseline"><span class="pxnum" style="font-size:34px">${c.percentOff}%</span><span>off · ${esc(P.appliesText(c, store.pricing.plans))}</span></div>
      <p class="muted" style="font-size:13px">${c.redemptions.length}${c.maxRedemptions != null ? ' of ' + c.maxRedemptions : ''} used · ${c.maxPerOrg || 1} per organisation · until ${c.validUntil ? P.formatDate(c.validUntil) : 'no end'}<br>Created by ${esc(c.createdBy)}${c.approvedBy ? ' · approved by ' + esc(c.approvedBy) : ''}</p>
      ${c.status === 'PENDING_APPROVAL' ? `<div class="msg warn" style="font-size:13px">${own ? `You created this. Switch to ${actor() === 'Admin A' ? 'Admin B' : 'Admin A'} to approve it.` : 'Waiting for a second approval.'}</div>` : ''}
      <div class="btn-row">
        ${c.status === 'PENDING_APPROVAL' ? `<button class="btn small primary" data-act="cp-approve" data-code="${c.code}" ${dis()}>Approve as ${esc(actor())}</button>` : ''}
        ${c.status === 'ACTIVE' ? `<button class="btn small" data-act="cp-status" data-code="${c.code}" data-to="PAUSED" ${dis()}>Pause</button>` : ''}
        ${c.status === 'PAUSED' ? `<button class="btn small" data-act="cp-status" data-code="${c.code}" data-to="ACTIVE" ${dis()}>Resume</button>` : ''}
        ${!['ARCHIVED', 'EXPIRED', 'EXHAUSTED'].includes(st) ? `<button class="btn small ghost danger" data-act="cp-status" data-code="${c.code}" data-to="ARCHIVED" ${dis()}>Archive</button>` : ''}
      </div>
      ${noteFor('c:' + c.code)}
    </article>`;
  }

  function newCouponForm() {
    const th = store.pricing.settings.approvalThresholdPct;
    const d = drafts.coupon || {};
    return `<form class="card" data-form="coupon-new" style="gap:12px"><span class="eyebrow">New coupon</span>
      <div class="form-grid">
        <label class="field">Name (code)<span class="hint">4–20 characters: A–Z, 0–9, - or _</span><input id="cn-code" name="code" value="${esc(d.code || 'BIG70')}" style="text-transform:uppercase" required ${dis()}></label>
        <label class="field">Percent off<input id="cn-pct" type="number" min="1" max="100" name="pct" value="${esc(d.pct || 70)}" required ${dis()}></label>
        <label class="field">Applies to<select id="cn-applies" name="applies" ${dis()}><option value="ALL">All plans</option>${enums.PlanKind.map((k) => `<option value="${k}" ${d.applies === k ? 'selected' : ''}>${esc(enums.PlanKindLabel[k][0].toUpperCase() + enums.PlanKindLabel[k].slice(1))}</option>`).join('')}</select></label>
        <label class="field">Max redemptions<span class="hint">Blank for no limit</span><input id="cn-max" type="number" min="1" name="max" value="${esc(d.max != null ? d.max : 10)}" ${dis()}></label>
        <label class="field">Valid until<input id="cn-until" type="date" name="until" value="${esc(d.until || '2026-12-31')}" ${dis()}></label>
      </div>
      <div class="msg info" style="font-size:13px">Above ${th}%, or at 100%, a different admin must approve it before it goes live.</div>
      <div class="btn-row"><button class="btn primary" type="submit" ${dis()}>Create coupon</button></div>
      ${noteFor('coupon')}
    </form>`;
  }

  function opsStrip() {
    const L = store.loop;
    const items = [
      ['#demand', 'Intake queue', `${L.demandSignals.filter((d) => d.status === 'Submitted').length} to review`],
      ['#challenges', 'Challenges', `${L.challenges.filter((c) => ['Draft', 'Shaped'].includes(c.status)).length} to shape or match`],
      ['#sprints', 'Mentor pool', `${L.users.filter((u) => u.role === 'mentor' && !u.verified).length} to verify`],
      ['#passports', 'Passports', `${L.passports.filter((p) => p.status === 'Proposed').length} to approve`],
      ['#learn', 'Learning catalogue', `${LEAD.learn ? LEAD.learn.pending() : 0} to review`],
      ['#audit', 'Audit log', `${L.audit.length} entries`],
    ];
    return `<div class="ops" role="group" aria-label="UMO operations">${items.map(([h, t, n]) => `<a class="card tight ops-item" href="${h}"><b class="ink">${esc(t)}</b><span class="muted tiny">${esc(n)}</span></a>`).join('')}</div>`;
  }

  function womenCard() {
    const st = store.pricing.settings; const t = store.womenTally();
    return `<form class="card" data-form="women-share" style="gap:12px;max-width:640px">
      <div class="form-grid">
        <label class="field">Share of every paid plan (%)<span class="hint">0 to 50. Whole or half percents.</span><input id="ws-pct" type="number" step="0.5" min="0" max="50" name="pct" value="${esc(st.womenSharePct)}" required ${dis()}></label>
        <label class="field">Hours of teaching that count as one seat<span class="hint">1 to 100. Counted when you mark an offer Done.</span><input id="ws-hps" type="number" min="1" max="100" name="hps" value="${esc(st.womenHoursPerSeat)}" required ${dis()}></label>
        <div class="stack" style="gap:4px"><span class="label">Tally</span><b class="ink tnum">${t.seats.toLocaleString('en-IN')} of ${t.target.toLocaleString('en-IN')} seats</b><span class="muted tiny">Seat price for top-ups: ${ui.inr(st.womenSeatPrice)}</span></div>
      </div>
      <div class="btn-row"><button class="btn primary" type="submit" ${dis()}>Save share</button><a class="btn ghost" href="#women">See the public page</a></div>
      ${noteFor('women')}
    </form>`;
  }

  function signups() {
    const su = store.pricing.signups.slice(0, 8);
    return `<div class="table-wrap"><table><thead><tr><th>When</th><th>Organisation</th><th>Plan</th><th>Version</th><th>Code</th><th class="num">Total</th></tr></thead><tbody>
      ${su.map((s) => `<tr><td style="white-space:nowrap">${ui.ago(s.at)}</td><td>${esc(s.orgName || s.orgId)}</td><td><span class="code">${esc(s.planKey)}</span>${s.tierKey ? ' · ' + esc(s.tierKey) : ''}</td><td><span class="code">${esc(s.priceVersionId)}</span></td><td>${s.couponCode ? `<span class="code">${esc(s.couponCode)}</span>` : '—'}</td><td class="num"><b>${ui.inr(s.total)}</b></td></tr>`).join('') || '<tr><td colspan="6" class="muted">No sign-ups yet. Try <a href="#join-college">the college sign-up</a>.</td></tr>'}
    </tbody></table></div>`;
  }

  LEAD.views.admin = {
    title: () => 'Pricing admin',
    render() {
      if (role() !== 'admin') return ui.guard(['admin'], 'The pricing admin');
      const pr = store.pricing;
      const html = `<div class="page wrap">
        <div class="stack" style="gap:12px">
          <div class="row between"><div class="stack" style="gap:6px"><span class="eyebrow">UMO admin</span><h1 style="font-size:clamp(34px,5vw,54px)">Admin.</h1></div><div class="row"><a class="btn small ghost" href="#audit">Change log</a></div></div>
          <p>Run the loop and stage the prices every sign-up screen reads. A price change reaches open sign-up screens within seconds. Nothing is charged.</p>
          ${opsStrip()}
        </div>
        <section class="section">
          ${ui.sectionHead('01', 'Pricing models', '', 'Each plan is a priced offer. Saving creates a new price version; past sign-ups keep the one they accepted.')}
          <div class="grid g3">${pr.plans.filter((p) => !p.archived).map(planCard).join('')}</div>
        </section>
        <section class="section">
          ${ui.sectionHead('02', 'Coupons', canWrite() ? `<span class="label">Acting as</span><div class="seg" role="group" aria-label="Acting admin">${['Admin A', 'Admin B'].map((a) => `<button data-act="admin-actor" data-actor="${a}" aria-pressed="${actor() === a}">${a}</button>`).join('')}</div>` : '')}
          <div class="split">
            <div class="grid g2">${pr.coupons.filter((c) => c.status !== 'ARCHIVED').map(couponCard).join('') || '<div class="empty">No coupons yet.</div>'}</div>
            <aside>${newCouponForm()}</aside>
          </div>
        </section>
        <section class="section">
          ${ui.sectionHead('03', '1 Million Women in Design', '', 'One setting. This share of every paid sign-up goes to the initiative. The payer sees it and pays nothing extra.')}
          ${womenCard()}
        </section>
        <section class="section">
          ${ui.sectionHead('04', 'Recent sign-ups', `<span class="muted" style="font-size:13px">${pr.signups.length} in total</span>`)}
          ${signups()}
        </section>
      </div>`;
      note.msg = null;
      return html;
    },
    onPricing() { LEAD.render({ keepScroll: true }); },
  };

  /* ---------- actions ---------- */
  LEAD.forms.price = (fd, form) => {
    if (!canWrite()) return;
    const key = form.dataset.key;
    const p = store.plan(key);
    const input = { note: String(fd.get('note') || '').trim(), by: actor(), now: Date.now(), effectiveFrom: null };
    if (p.pricingModel === 'TIERED_BY_SIZE') {
      const latest = (p.versions || []).slice().sort((a, b) => b.version - a.version)[0];
      const base = (latest && latest.tiers) || enums.TierKey.map((t, i) => ({ tier: t, min: [1, 1001, 3001][i], max: [1000, 3000, null][i] }));
      input.tiers = base.map((t) => { const raw = fd.get('tier-' + t.tier); return { tier: t.tier, min: t.min, max: t.max, price: raw === '' || raw == null ? null : P.rupeesToPaise(raw) }; });
    } else {
      input.unitPrice = P.rupeesToPaise(fd.get('price'));
    }
    const res = rules.setPrice(p, input);
    if (!res.ok) { drafts[key] = Object.fromEntries(fd.entries()); say(key, res.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
    delete drafts[key];
    store.pricingCommit(`Price set: ${res.version.id}`, 'plan_price_version', key, { price: rules.lastPrice(p) }, (s) => { s.plans.find((x) => x.key === key).versions.push(res.version); return res.version; });
    say(key, `Saved ${res.version.id}. Open sign-up screens update within seconds.`);
    LEAD.render({ keepScroll: true });
  };

  LEAD.act['plan-toggle'] = (el) => {
    if (!canWrite()) return;
    const p = store.plan(el.dataset.key); const before = clone(p);
    store.pricingCommit(p.active ? 'Plan switched off' : 'Plan switched on', 'plan', p.key, before, (s) => { const x = s.plans.find((y) => y.key === p.key); x.active = !x.active; return x; });
  };

  LEAD.forms['women-share'] = (fd) => {
    if (!canWrite()) return;
    const res = rules.validateWomenShare(fd.get('pct'));
    if (!res.ok) { say('women', res.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
    const hps = rules.validateHoursPerSeat(fd.get('hps'));
    if (!hps.ok) { say('women', hps.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
    const before = { womenSharePct: store.pricing.settings.womenSharePct, womenHoursPerSeat: store.pricing.settings.womenHoursPerSeat };
    store.pricingCommit('1 Million Women settings set', 'setting', 'womenSharePct', before, (p) => { p.settings.womenSharePct = res.pct; p.settings.womenHoursPerSeat = hps.hours; return { womenSharePct: res.pct, womenHoursPerSeat: hps.hours }; });
    say('women', `Saved. ${res.pct}% of every paid plan goes to 1 Million Women in Design. ${hps.hours} hours of teaching count as one seat.`);
    LEAD.render({ keepScroll: true });
  };

  LEAD.forms['coupon-new'] = (fd) => {
    if (!canWrite()) return;
    const applies = fd.get('applies');
    const f = { code: fd.get('code'), percentOff: fd.get('pct'), appliesKinds: applies === 'ALL' ? [] : [applies], appliesKeys: [], maxRedemptions: fd.get('max'), maxPerOrg: 1, minQty: null, fundedBy: 'UMO', validFrom: new Date().toISOString().slice(0, 10), validUntil: fd.get('until') || null, note: 'Created in the admin.' };
    const res = rules.createCoupon(f, store.pricing.coupons, store.pricing.settings, actor(), Date.now());
    if (!res.ok) { drafts.coupon = Object.fromEntries(fd.entries()); say('coupon', res.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
    delete drafts.coupon;
    store.pricingCommit(res.pending ? 'Coupon created, waiting for approval' : 'Coupon created and live', 'coupon', res.coupon.code, null, (s) => { s.coupons.unshift(res.coupon); return res.coupon; });
    say('c:' + res.coupon.code, res.pending ? `${res.coupon.code} is waiting. A different admin must approve it.` : `${res.coupon.code} is live. Customers can use it now.`, res.pending ? 'warn' : 'ok');
    LEAD.render({ keepScroll: true });
  };

  Object.assign(LEAD.act, {
    'cp-approve'(el) {
      const c = store.pricing.coupons.find((x) => x.code === el.dataset.code);
      const res = rules.approveCoupon(c, actor());
      if (!res.ok) { say('c:' + c.code, res.reason, 'err'); LEAD.render({ keepScroll: true }); ui.toast(res.reason); return; }
      const before = clone(c);
      say('c:' + c.code, `${c.code} approved by ${actor()}. It is live.`);
      store.pricingCommit('Coupon approved (second admin)', 'coupon', c.code, before, (s) => { const x = s.coupons.find((y) => y.code === c.code); Object.assign(x, { status: 'ACTIVE', approvedBy: actor() }); return x; });
    },
    'cp-status'(el) {
      const c = store.pricing.coupons.find((x) => x.code === el.dataset.code);
      const res = rules.setCouponStatus(c, el.dataset.to);
      if (!res.ok) { say('c:' + c.code, res.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
      const before = clone(c);
      store.pricingCommit(`Coupon ${el.dataset.to.toLowerCase()}`, 'coupon', c.code, before, (s) => { const x = s.coupons.find((y) => y.code === c.code); x.status = el.dataset.to; return x; });
    },
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
