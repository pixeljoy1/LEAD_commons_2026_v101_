/* LEAD · UMO admin (mock): plans, price versions, tiers, coupons, sign-ups, enums, banner, audit (addendum A11). */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, pricing: P, rules, enums } = LEAD;
  const { esc } = ui;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const role = () => store.session.role;
  const actor = () => store.session.adminActor;
  const canWrite = () => role() === 'admin';
  const flash = { msg: null, cls: 'ok' };
  const say = (msg, cls) => { flash.msg = msg; flash.cls = cls || 'ok'; };

  const TABS = [['admin', 'Dashboard'], ['admin-plans', 'Plans'], ['admin-coupons', 'Coupons'], ['admin-signups', 'Sign-ups'], ['admin-enums', 'Enumerations'], ['admin-banner', 'Banner'], ['admin-audit', 'Audit']];
  function shell(cur, title, lede, body) {
    if (!['admin', 'steward'].includes(role())) return ui.guard(['admin'], 'The pricing admin');
    const f = flash.msg ? `<div class="msg ${flash.cls}" role="status">${esc(flash.msg)}</div>` : '';
    flash.msg = null;
    return `<div class="page wrap" style="gap:24px">
      <div class="stack" style="gap:14px">
        <div class="row between"><div class="stack" style="gap:6px"><span class="eyebrow">UMO admin (mock) · ${canWrite() ? `acting as <b class="ink">${esc(actor())}</b>` : 'steward, read only'}</span><h1 style="font-size:clamp(34px,5vw,54px)">${esc(title)}</h1></div>
          <div class="row">${ui.mockTag()}${ui.tag(`Epoch ${store.pricing.epoch}`, 'info')}</div></div>
        ${lede ? `<p>${lede}</p>` : ''}
        <nav class="row" aria-label="Admin sections" style="gap:6px">${TABS.map(([k, l]) => `<a class="chip" href="#${k}" ${k === cur ? 'aria-current="page" style="background:var(--ink);color:var(--bg);border-color:var(--ink)"' : ''}>${l}</a>`).join('')}</nav>
      </div>
      ${!canWrite() ? '<div class="msg info">Stewards can read prices, coupons and the sign-up log. Only the UMO admin writes them.</div>' : ''}
      ${f}${body}
    </div>`;
  }
  const dis = () => (canWrite() ? '' : 'disabled');

  const priceText = (p) => {
    const v = P.currentVersion(p);
    if (!P.isPriced(v, p.pricingModel)) return '<span class="status s-bad">No price</span>';
    if (p.pricingModel === 'FREE') return 'Free';
    if (p.pricingModel === 'TIERED_BY_SIZE') return v.tiers.map((t) => `${t.tier[0]} ${ui.inr(t.price)}`).join(' · ');
    return ui.inr(v.unitPrice);
  };
  const planStatus = (p) => (p.archived ? ui.status('ARCHIVED', 'Archived') : !p.active ? ui.status('PAUSED', 'Off') : rules.sellable(p).ok ? ui.status('ACTIVE', 'On sale') : ui.status('DRAFT', rules.sellable(p).reason));
  const joinRoute = (p) => ({ CAMPUS_LICENCE: 'join-college', INDUSTRY_MEMBERSHIP: 'join-industry', PATH_ENROLMENT: 'join-path-' + p.key, CHALLENGE_SPONSORSHIP: 'join-sponsor', OPEN_TIER: 'join-open' }[p.kind]);

  /* ================= Dashboard ================= */
  LEAD.views.admin = {
    title: () => 'Admin',
    render() {
      const pr = store.pricing;
      const live = pr.plans.filter((p) => rules.sellable(p).ok);
      const activeC = pr.coupons.filter((c) => P.effectiveCouponStatus(c) === 'ACTIVE');
      const reds = pr.coupons.reduce((a, c) => a + c.redemptions.length, 0);
      const soon = pr.coupons.filter((c) => c.validUntil && P.effectiveCouponStatus(c) === 'ACTIVE' && Date.parse(c.validUntil) - Date.now() < 14 * 864e5);
      const s = pr.settings;
      return shell('admin', 'Pricing.', 'Set prices and offers once. Every sign-up screen reads them live. Nothing is charged.', `
        ${ui.kpis([{ label: 'Plans on sale', v: live.length, d: `${pr.plans.length} in registry` }, { label: 'Live coupons', v: activeC.length, d: `${pr.coupons.filter((c) => c.status === 'PENDING_APPROVAL').length} waiting for approval` }, { label: 'Redemptions', v: reds }, { label: 'Mock sign-ups', v: pr.signups.length, d: ui.inr(pr.signups.reduce((a, x) => a + x.total, 0)) + ' mock total' }])}
        <div class="split">
          <section class="card"><span class="eyebrow">% booked · F-PR-13</span>${pr.plans.filter((p) => !p.archived).map((p) => `<div class="stack" style="gap:6px;padding:8px 0;border-top:1px solid var(--line)"><div class="row between"><a href="#admin-plan-${p.key}" class="ink" style="font-weight:600">${esc(p.name)}</a><span class="muted tnum" style="font-size:13px">${p.capacity == null ? `${p.booked} joined · no cap` : `${p.booked} of ${p.capacity}`}</span></div>${p.capacity == null ? '' : ui.meter(P.percentBooked(p), { px: true })}</div>`).join('')}</section>
          <aside class="stack" style="gap:16px">
            <form class="card" data-form="settings"><span class="eyebrow">Settings</span>
              <label class="field">Second-approval threshold (%)<span class="hint">Coupons above this, and any 100% coupon, need a different admin (R11)</span><input id="st-th" type="number" min="1" max="100" name="th" value="${s.approvalThresholdPct}" ${dis()}></label>
              <label class="field">Tax rate (basis points)<span class="hint">0 in Phase 1. Policy is a finance decision.</span><input id="st-tax" type="number" min="0" max="10000" name="tax" value="${s.taxRateBps}" ${dis()}></label>
              <label class="field">Quote valid for (minutes)<input id="st-ttl" type="number" min="1" max="120" name="ttl" value="${s.quoteTtlMinutes}" ${dis()}></label>
              <button class="btn" type="submit" ${dis()}>Save settings</button></form>
            <div class="card"><span class="eyebrow">Expiring in 14 days</span>${soon.map((c) => `<div class="row between"><span class="code">${esc(c.code)}</span><span>${P.formatDate(c.validUntil)}</span></div>`).join('') || '<p class="muted">None.</p>'}</div>
          </aside>
        </div>
        <section class="card"><div class="row between"><span class="eyebrow">Last 10 changes</span><a href="#admin-audit">Full audit</a></div>${auditTable(pr.audit.slice(0, 10))}</section>`);
    },
  };
  LEAD.forms.settings = (fd) => {
    const before = clone(store.pricing.settings);
    const next = { approvalThresholdPct: Number(fd.get('th')), taxRateBps: Number(fd.get('tax')), quoteTtlMinutes: Number(fd.get('ttl')) };
    if (!(next.approvalThresholdPct >= 1 && next.approvalThresholdPct <= 100)) { say('Threshold must be 1 to 100.', 'err'); LEAD.render({ keepScroll: true }); return; }
    store.pricingCommit('Settings changed', 'setting', 'pricing', before, (p) => { Object.assign(p.settings, next); return p.settings; });
    ui.toast('Settings saved.');
  };

  function auditTable(rows) {
    return `<div class="table-wrap" style="border:0;background:none"><table><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Key</th><th>Before → after</th></tr></thead><tbody>
      ${rows.map((a) => `<tr><td style="white-space:nowrap">${ui.ago(a.at)}</td><td>${esc(a.actor)}</td><td><b>${esc(a.action)}</b></td><td><span class="code">${esc(a.entityId)}</span></td><td><details class="more"><summary>Show</summary><div class="grid g2" style="margin-top:8px"><pre class="email" style="margin:0">${esc(JSON.stringify(a.before, null, 1) || 'null')}</pre><pre class="email" style="margin:0">${esc(JSON.stringify(a.after, null, 1) || 'null')}</pre></div></details></td></tr>`).join('') || '<tr><td colspan="5" class="muted">No changes yet.</td></tr>'}
    </tbody></table></div>`;
  }

  /* ================= Plans ================= */
  LEAD.views['admin-plans'] = {
    title: () => 'Plans',
    render() {
      const plans = store.pricing.plans;
      return shell('admin-plans', 'Plans.', 'The plan registry. Every plan key is an enumerated value that sign-ups store. A new plan starts with no price and cannot be sold until one is set (R17).', `
        <div class="table-wrap"><table><thead><tr><th>Key</th><th>Name</th><th>Kind · model · period</th><th>Current price</th><th class="num">Booked</th><th>Status</th><th></th></tr></thead><tbody>
          ${plans.map((p) => `<tr class="${p.archived ? 'muted' : ''}"><td><a class="code" href="#admin-plan-${p.key}">${esc(p.key)}</a></td><td><b>${esc(p.name)}</b>${p.isDemo ? `<br>${ui.tag('Demo price', 'mock')}` : ''}</td><td style="font-size:12.5px">${esc(p.kind)}<br>${esc(p.pricingModel)} · ${esc(p.billingPeriod)}</td><td class="tnum" style="font-size:13px">${priceText(p)}</td><td class="num">${p.booked}${p.capacity != null ? ` / ${p.capacity}` : ''}</td><td>${planStatus(p)}</td>
            <td><div class="row" style="flex-wrap:nowrap">${!p.archived ? `<button class="btn small" data-act="plan-toggle" data-key="${p.key}" ${dis()}>${p.active ? 'Switch off' : 'Switch on'}</button>` : ''}<a class="btn small ghost" href="#admin-plan-${p.key}">Open</a></div></td></tr>`).join('')}
        </tbody></table></div>
        <form class="card" data-form="plan-new"><span class="eyebrow">F-PR-01 · New plan</span>
          <div class="form-grid">
            <label class="field">Plan key<span class="hint">UPPER_SNAKE, 3–40 chars</span><input id="pn-key" name="key" value="PATH_TEST" required ${dis()}></label>
            <label class="field">Name<input id="pn-name" name="name" value="Path · Test" required ${dis()}></label>
            <label class="field">Kind<select id="pn-kind" name="kind" ${dis()}>${enums.PlanKind.map((k) => `<option ${k === 'PATH_ENROLMENT' ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
            <label class="field">Pricing model<select id="pn-model" name="model" ${dis()}>${enums.PricingModel.map((k) => `<option ${k === 'PER_SEAT' ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
            <label class="field">Billing period<select id="pn-period" name="period" ${dis()}>${enums.BillingPeriod.map((k) => `<option ${k === 'TERM' ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
            <label class="field">Min quantity<input id="pn-min" type="number" min="1" name="min" value="1" ${dis()}></label>
            <label class="field">Capacity<span class="hint">Blank for no cap</span><input id="pn-cap" type="number" min="1" name="cap" value="20" ${dis()}></label>
            <label class="field">Refund window (days)<input id="pn-ref" type="number" min="0" name="refund" value="14" ${dis()}></label>
          </div>
          <div class="btn-row"><button class="btn primary" type="submit" ${dis()}>Create plan</button><span class="muted" style="font-size:13px">It appears in Enumerations at once, and on sale once priced.</span></div>
        </form>`);
    },
  };
  LEAD.forms['plan-new'] = (fd) => {
    if (!canWrite()) return;
    const f = { key: fd.get('key'), name: String(fd.get('name')).trim(), kind: fd.get('kind'), pricingModel: fd.get('model'), billingPeriod: fd.get('period') };
    const v = rules.validatePlan(f, store.pricing.plans);
    if (!v.ok) { say(v.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
    const plan = { key: v.key, name: f.name, kind: f.kind, pricingModel: f.pricingModel, billingPeriod: f.billingPeriod, minQty: Number(fd.get('min')) || 1, capacity: fd.get('cap') ? Number(fd.get('cap')) : null, booked: 0, refundDays: Number(fd.get('refund')) || 0, active: true, archived: false, isDemo: true, blurb: 'New plan created in the admin.', versions: [] };
    store.pricingCommit('Plan created', 'plan', plan.key, null, (p) => { p.plans.push(plan); return plan; });
    say(`Created ${plan.key}. Set a price to put it on sale.`);
    LEAD.go('admin-plan-' + plan.key);
  };
  LEAD.act['plan-toggle'] = (el) => {
    if (!canWrite()) return;
    const p = store.plan(el.dataset.key); const before = clone(p);
    store.pricingCommit(p.active ? 'Plan switched off' : 'Plan switched on', 'plan', p.key, before, (s) => { const x = s.plans.find((y) => y.key === p.key); x.active = !x.active; return x; });
  };

  /* ================= Plan detail ================= */
  LEAD.views['admin-plan'] = {
    title: (k) => k,
    render(key) {
      const p = store.plan(key);
      if (!p) return shell('admin-plans', 'Not found.', '', `<div class="empty">No plan with key ${esc(key)}.</div>`);
      const v = P.currentVersion(p);
      const latest = (p.versions || []).slice().sort((a, b) => b.version - a.version)[0];
      const used = rules.keyInUse(store.pricing.signups, 'planKey', p.key);
      const tiers = p.pricingModel === 'TIERED_BY_SIZE' ? ((latest && latest.tiers) || enums.TierKey.map((t, i) => ({ tier: t, min: [1, 1001, 3001][i], max: [1000, 3000, null][i], price: null }))) : null;
      const priceForm = p.pricingModel === 'FREE' ? '<p class="muted">Free plans have no price to set.</p>' : `<form class="card" data-form="price" data-key="${p.key}">
        <span class="eyebrow">F-PR-02 · Set a price · creates version ${(latest ? latest.version : 0) + 1}</span>
        ${tiers ? `<div class="form-grid">${tiers.map((t) => `<label class="field">${t.tier} · ${t.min.toLocaleString('en-IN')}–${t.max == null ? 'up' : t.max.toLocaleString('en-IN')} students (₹)<input id="tp-${t.tier}" name="tier-${t.tier}" inputmode="decimal" value="${t.price == null ? '' : t.price / 100}" ${dis()}></label>`).join('')}</div>`
          : `<label class="field">Unit price (₹)<span class="hint">${esc(p.pricingModel === 'PER_SEAT' ? 'per seat or learner' : p.pricingModel === 'PER_CHALLENGE' ? 'per challenge' : 'flat')}</span><input id="pp-price" name="price" inputmode="decimal" value="${latest && latest.unitPrice != null ? latest.unitPrice / 100 : ''}" ${dis()}></label>`}
        <div class="form-grid"><label class="field">Note<span class="hint">Required if the change is over ±30% (R12)</span><input id="pp-note" name="note" placeholder="Why this price" ${dis()}></label>
        <label class="field">Starts<span class="hint">Blank for now; or schedule a date</span><input id="pp-from" type="date" name="from" ${dis()}></label></div>
        <div class="btn-row"><button class="btn primary" type="submit" ${dis()}>Save as new version</button><a class="btn ghost" href="#${joinRoute(p)}">Preview as a customer</a></div>
      </form>`;
      return shell('admin-plans', p.name, `<span class="code">${esc(p.key)}</span> · ${esc(p.kind)} · ${esc(p.pricingModel)} · ${esc(p.billingPeriod)} · min ${p.minQty} · capacity ${p.capacity == null ? 'none' : p.capacity} · refund ${p.refundDays} days`, `
        <div class="split">
          <section class="stack" style="gap:16px">
            ${priceForm}
            <div class="card"><span class="eyebrow">Price version history · R9</span>
              <div class="table-wrap" style="border:0;background:none"><table><thead><tr><th>Version</th><th>Price</th><th>Starts</th><th>Note</th><th>By</th></tr></thead><tbody>
              ${(p.versions || []).slice().sort((a, b) => b.version - a.version).map((x) => `<tr class="${v && x.id === v.id ? 'hl' : ''}"><td><span class="code">${esc(x.id)}</span>${v && x.id === v.id ? ' ' + ui.tag('In force', 'live') : Date.parse(x.effectiveFrom) > Date.now() ? ' ' + ui.tag('Scheduled', 'info') : ''}</td><td class="tnum" style="font-size:13px">${x.tiers ? x.tiers.map((t) => `${t.tier[0]} ${t.price == null ? '—' : ui.inr(t.price)}`).join(' · ') : ui.inr(x.unitPrice || 0)}</td><td>${P.formatDate(x.effectiveFrom)}</td><td>${esc(x.note)}</td><td>${esc(x.by)}</td></tr>`).join('') || '<tr><td colspan="5"><span class="status s-bad">No price yet. This plan cannot be sold (R17).</span></td></tr>'}
              </tbody></table></div><p class="muted" style="font-size:13px">Prices are never edited in place. Past sign-ups keep the version they accepted.</p></div>
          </section>
          <aside class="stack" style="gap:16px">
            <div class="card"><span class="eyebrow">Status</span>${planStatus(p)}${ui.availability(p)}
              <div class="btn-row">${!p.archived ? `<button class="btn small" data-act="plan-toggle" data-key="${p.key}" ${dis()}>${p.active ? 'Switch off' : 'Switch on'}</button><button class="btn small danger" data-act="plan-archive" data-key="${p.key}" ${dis()}>Archive</button>` : `<button class="btn small" data-act="plan-unarchive" data-key="${p.key}" ${dis()}>Restore</button>`}</div></div>
            <form class="card" data-form="plan-rename" data-key="${p.key}"><span class="eyebrow">Key · R13</span>
              <label class="field">Rename key<input id="pr-key" name="key" value="${esc(p.key)}" ${dis()}></label>
              <div class="btn-row"><button class="btn small" type="submit" ${dis()}>Rename</button><button class="btn small danger" type="button" data-act="plan-delete" data-key="${p.key}" ${dis()}>Delete</button></div>
              <span class="muted" style="font-size:12.5px">${used ? 'Used by a sign-up: it cannot be renamed or deleted. Archive it instead.' : 'Not used yet: rename or delete is allowed.'}</span></form>
          </aside>
        </div>`);
    },
  };
  LEAD.forms.price = (fd, form) => {
    if (!canWrite()) return;
    const p = store.plan(form.dataset.key);
    const input = { note: String(fd.get('note') || '').trim(), by: actor(), now: Date.now(), effectiveFrom: fd.get('from') ? new Date(fd.get('from') + 'T00:00:00').toISOString() : null };
    if (p.pricingModel === 'TIERED_BY_SIZE') {
      const latest = (p.versions || []).slice().sort((a, b) => b.version - a.version)[0];
      const base = (latest && latest.tiers) || enums.TierKey.map((t, i) => ({ tier: t, min: [1, 1001, 3001][i], max: [1000, 3000, null][i] }));
      input.tiers = base.map((t) => { const raw = fd.get('tier-' + t.tier); return { tier: t.tier, min: t.min, max: t.max, price: raw === '' || raw == null ? null : P.rupeesToPaise(raw) }; });
    } else {
      input.unitPrice = P.rupeesToPaise(fd.get('price'));
    }
    const res = rules.setPrice(p, input);
    if (!res.ok) { say(res.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
    const before = rules.lastPrice(p);
    store.pricingCommit(`Price set: ${res.version.id}`, 'plan_price_version', p.key, { price: before }, (s) => { s.plans.find((x) => x.key === p.key).versions.push(res.version); return res.version; });
    say(`Saved ${res.version.id}.${res.bigChange ? ' Big change noted.' : ''} Open sign-up screens update within seconds.`);
    LEAD.render({ keepScroll: true });
  };
  Object.assign(LEAD.act, {
    'plan-archive'(el) {
      const p = store.plan(el.dataset.key); const before = clone(p);
      say('Archived. Hidden from sale, kept in the sign-up log.');
      store.pricingCommit('Plan archived', 'plan', p.key, before, (s) => { const x = s.plans.find((y) => y.key === p.key); x.archived = true; x.active = false; return x; });
    },
    'plan-unarchive'(el) {
      const p = store.plan(el.dataset.key); const before = clone(p);
      store.pricingCommit('Plan restored', 'plan', p.key, before, (s) => { const x = s.plans.find((y) => y.key === p.key); x.archived = false; return x; });
    },
    'plan-delete'(el) {
      const key = el.dataset.key;
      const chk = rules.canRenameOrDelete(store.pricing.signups, 'planKey', key);
      if (!chk.ok) { say(chk.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
      const before = clone(store.plan(key));
      store.pricingCommit('Plan deleted', 'plan', key, before, (s) => { s.plans = s.plans.filter((x) => x.key !== key); return null; });
      say(`Deleted ${key}.`);
      LEAD.go('admin-plans');
    },
  });
  LEAD.forms['plan-rename'] = (fd, form) => {
    const key = form.dataset.key; const next = String(fd.get('key')).trim().toUpperCase();
    if (next === key) return;
    const chk = rules.canRenameOrDelete(store.pricing.signups, 'planKey', key);
    if (!chk.ok) { say(chk.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
    if (!enums.PLAN_KEY_RE.test(next) || store.plan(next)) { say('Use a new UPPER_SNAKE key that is not taken.', 'err'); LEAD.render({ keepScroll: true }); return; }
    store.pricingCommit('Plan key renamed', 'plan', key, { key }, (s) => { const x = s.plans.find((y) => y.key === key); x.key = next; x.versions.forEach((v) => { v.id = v.id.replace(key, next); }); return { key: next }; });
    say(`Renamed to ${next}.`);
    LEAD.go('admin-plan-' + next);
  };

  /* ================= Coupons ================= */
  const cf = { status: '' };
  LEAD.views['admin-coupons'] = {
    title: () => 'Coupons',
    render() {
      const all = store.pricing.coupons;
      const list = all.filter((c) => !cf.status || P.effectiveCouponStatus(c) === cf.status);
      const th = store.pricing.settings.approvalThresholdPct;
      const sts = enums.CouponStatus;
      return shell('admin-coupons', 'Coupons.', `Create a coupon by name and percent. Above ${th}%, and any 100% coupon, it waits for a different admin to approve (R11).`, `
        <div class="row" role="group" aria-label="Filter by status"><button class="chip" data-act="cp-filter" data-s="" aria-pressed="${!cf.status}">All · ${all.length}</button>${sts.map((s) => { const n = all.filter((c) => P.effectiveCouponStatus(c) === s).length; return n ? `<button class="chip" data-act="cp-filter" data-s="${s}" aria-pressed="${cf.status === s}">${s.replace('_', ' ').toLowerCase()} · ${n}</button>` : ''; }).join('')}</div>
        <div class="split">
          <section class="stack">${list.map((c) => {
            const st = P.effectiveCouponStatus(c);
            const ownPending = c.status === 'PENDING_APPROVAL' && c.createdBy === actor();
            return `<article class="card">
              <div class="row between"><span class="code" style="font-size:16px">${esc(c.code)}</span>${ui.status(st)}</div>
              <div class="row" style="gap:16px;align-items:baseline"><span class="pxnum" style="font-size:44px">${c.percentOff}%</span><span>off · ${esc(P.appliesText(c, store.pricing.plans))}</span></div>
              ${ui.kv([['Redemptions', `${c.redemptions.length}${c.maxRedemptions != null ? ' of ' + c.maxRedemptions : ''} · ${c.maxPerOrg || 1} per organisation`], ['Valid', `${c.validFrom ? P.formatDate(c.validFrom) : 'now'} to ${c.validUntil ? P.formatDate(c.validUntil) : 'no end'}`], ['Min quantity', c.minQty || '—'], ['Funded by', c.fundedBy], ['Created by', c.createdBy], ['Approved by', c.approvedBy || '—']])}
              ${c.note ? `<p class="muted" style="font-size:13px">${esc(c.note)}</p>` : ''}
              <div class="btn-row">
                ${c.status === 'PENDING_APPROVAL' ? (ownPending ? `<span class="msg warn" style="padding:6px 10px">You created this. Switch to ${actor() === 'Admin A' ? 'Admin B' : 'Admin A'} to approve.</span><button class="btn small" data-act="cp-approve" data-code="${c.code}" ${dis()}>Approve</button>` : `<button class="btn small primary" data-act="cp-approve" data-code="${c.code}" ${dis()}>Approve as ${esc(actor())}</button>`) : ''}
                ${c.status === 'ACTIVE' ? `<button class="btn small" data-act="cp-status" data-code="${c.code}" data-to="PAUSED" ${dis()}>Pause</button>` : ''}
                ${c.status === 'PAUSED' ? `<button class="btn small" data-act="cp-status" data-code="${c.code}" data-to="ACTIVE" ${dis()}>Resume</button>` : ''}
                ${c.status !== 'ARCHIVED' ? `<button class="btn small ghost danger" data-act="cp-status" data-code="${c.code}" data-to="ARCHIVED" ${dis()}>Archive</button>` : ''}
              </div>
            </article>`;
          }).join('') || '<div class="empty">No coupons with this status.</div>'}</section>
          <aside>${newCouponForm()}</aside>
        </div>`);
    },
  };
  function newCouponForm() {
    const th = store.pricing.settings.approvalThresholdPct;
    return `<form class="card" data-form="coupon-new" id="coupon-new"><span class="eyebrow">F-PR-04 · New coupon</span>
      <label class="field">Name (code)<span class="hint">4–20 chars: A–Z, 0–9, - or _</span><input id="cn-code" name="code" value="BIG70" style="text-transform:uppercase" required ${dis()}></label>
      <label class="field">Percent off<input id="cn-pct" type="number" min="1" max="100" name="pct" value="70" required ${dis()}></label>
      <div class="msg info" style="font-size:13px">Above ${th}% or at 100%: waits for a second admin.</div>
      <fieldset style="border:0;padding:0;margin:0;display:grid;gap:4px"><legend class="label" style="margin-bottom:6px">Applies to · leave all unticked for every plan</legend>
        ${enums.PlanKind.map((k) => `<label class="check" style="padding:2px 0"><input type="checkbox" name="kinds" value="${k}" ${dis()}> ${esc(enums.PlanKindLabel[k])}</label>`).join('')}</fieldset>
      <div class="form-grid">
        <label class="field">Max redemptions<span class="hint">Blank: no limit</span><input id="cn-max" type="number" min="1" name="max" value="10" ${dis()}></label>
        <label class="field">Per organisation<input id="cn-org" type="number" min="1" name="perOrg" value="1" ${dis()}></label>
        <label class="field">Min quantity<input id="cn-min" type="number" min="1" name="minQty" ${dis()}></label>
        <label class="field">Funded by<select id="cn-fund" name="funded" ${dis()}>${enums.FundedBy.map((f) => `<option>${f}</option>`).join('')}</select></label>
        <label class="field">Valid from<input id="cn-from" type="date" name="from" value="2026-10-13" ${dis()}></label>
        <label class="field">Valid until<input id="cn-until" type="date" name="until" value="2026-12-31" ${dis()}></label>
      </div>
      <label class="field">Note<input id="cn-note" name="note" value="Board-approved launch offer" ${dis()}></label>
      <label class="field">Kind<select id="cn-kind" name="kind" ${dis()}><option>PERCENT</option>${['FIXED_AMOUNT', 'SCHOLARSHIP', 'GIFT_MATCH', 'PARTNER_CODE'].map((k) => `<option disabled>${k} · reserved</option>`).join('')}</select></label>
      <button class="btn primary" type="submit" ${dis()}>Create coupon</button>
    </form>`;
  }
  LEAD.forms['coupon-new'] = (fd) => {
    if (!canWrite()) return;
    const f = { code: fd.get('code'), percentOff: fd.get('pct'), appliesKinds: fd.getAll('kinds'), appliesKeys: [], maxRedemptions: fd.get('max'), maxPerOrg: fd.get('perOrg'), minQty: fd.get('minQty'), fundedBy: fd.get('funded'), validFrom: fd.get('from') || null, validUntil: fd.get('until') || null, note: fd.get('note') };
    const res = rules.createCoupon(f, store.pricing.coupons, store.pricing.settings, actor(), Date.now());
    if (!res.ok) { say(res.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
    store.pricingCommit(res.pending ? 'Coupon created, waiting for approval' : 'Coupon created and live', 'coupon', res.coupon.code, null, (s) => { s.coupons.unshift(res.coupon); return res.coupon; });
    say(res.pending ? `${res.coupon.code} is waiting. A different admin must approve it.` : `${res.coupon.code} is live. Customers can use it now.`, res.pending ? 'warn' : 'ok');
    LEAD.render({ keepScroll: true });
  };
  Object.assign(LEAD.act, {
    'cp-filter'(el) { cf.status = el.dataset.s; LEAD.render({ keepScroll: true }); },
    'cp-approve'(el) {
      const c = store.pricing.coupons.find((x) => x.code === el.dataset.code);
      const res = rules.approveCoupon(c, actor());
      if (!res.ok) { say(res.reason, 'err'); LEAD.render({ keepScroll: true }); ui.toast(res.reason); return; }
      const before = clone(c);
      say(`${c.code} approved by ${actor()}. It is live.`);
      store.pricingCommit('Coupon approved (second admin)', 'coupon', c.code, before, (s) => { const x = s.coupons.find((y) => y.code === c.code); Object.assign(x, { status: 'ACTIVE', approvedBy: actor() }); return x; });
    },
    'cp-status'(el) {
      const c = store.pricing.coupons.find((x) => x.code === el.dataset.code);
      const res = rules.setCouponStatus(c, el.dataset.to);
      if (!res.ok) { say(res.reason, 'err'); LEAD.render({ keepScroll: true }); return; }
      const before = clone(c);
      store.pricingCommit(`Coupon ${el.dataset.to.toLowerCase()}`, 'coupon', c.code, before, (s) => { const x = s.coupons.find((y) => y.code === c.code); x.status = el.dataset.to; return x; });
    },
  });

  /* ================= Sign-ups ================= */
  LEAD.views['admin-signups'] = {
    title: () => 'Sign-ups',
    render() {
      const su = store.pricing.signups;
      return shell('admin-signups', 'Sign-ups.', 'Every mock sign-up with its snapshot: plan, price version, coupon and amounts, all as enumerated values.', `
        <div class="table-wrap"><table><thead><tr><th>When</th><th>Organisation</th><th>Flow</th><th>Plan · tier</th><th>Version</th><th>Code</th><th class="num">Qty</th><th class="num">List</th><th class="num">Discount</th><th class="num">Total</th><th>Snapshot</th></tr></thead><tbody>
          ${su.map((s) => `<tr><td style="white-space:nowrap">${ui.ago(s.at)}</td><td>${esc(s.orgName || s.orgId)}</td><td><span class="code">${esc(s.flow)}</span></td><td><span class="code">${esc(s.planKey)}</span>${s.tierKey ? ' · ' + esc(s.tierKey) : ''}</td><td><span class="code">${esc(s.priceVersionId)}</span></td><td>${s.couponCode ? `<span class="code">${esc(s.couponCode)}</span>` : '—'}</td><td class="num">${s.quantity}</td><td class="num">${ui.inr(s.listTotal)}</td><td class="num">${ui.inr(s.discount)}</td><td class="num"><b>${ui.inr(s.total)}</b></td><td><details class="more"><summary>JSON</summary><pre class="email" style="max-width:420px;margin-top:8px">${esc(JSON.stringify({ flow: s.flow, plan_key: s.planKey, plan_kind: s.planKind, pricing_model: s.pricingModel, billing_period: s.billingPeriod, tier_key: s.tierKey, price_version_id: s.priceVersionId, coupon_code: s.couponCode, status: s.status, list_total: s.listTotal, discount: s.discount, tax: s.tax, total: s.total }, null, 1))}</pre></details></td></tr>`).join('') || '<tr><td colspan="11" class="muted">No sign-ups yet. Try <a href="#join-college">the college flow</a>.</td></tr>'}
        </tbody></table></div>`);
    },
  };

  /* ================= Enumerations ================= */
  LEAD.views['admin-enums'] = {
    title: () => 'Enumerations',
    render() {
      const reg = rules.registry(store.pricing.plans, store.pricing.coupons);
      const api = { plan_keys: reg.plan_keys_for_sale, coupon_codes: reg.coupon_codes, archived: { plan_keys: reg.plan_keys_archived, coupon_codes: reg.coupon_codes_archived } };
      const list = (title, arr) => `<div class="card tight"><span class="label">${title} · ${arr.length}</span><div class="pill-list">${arr.map((x) => `<span class="code">${esc(x)}</span>`).join('') || '<span class="muted">None</span>'}</div></div>`;
      return shell('admin-enums', 'Enumerations.', 'Sign-ups store keys, never free text. The live registry is the authority; writes with unknown keys are refused.', `
        <div class="split">
          <section class="stack">
            ${list('Plan keys on sale', reg.plan_keys_for_sale)}${list('Plan keys not on sale', reg.plan_keys.filter((k) => !reg.plan_keys_for_sale.includes(k)))}${list('Plan keys archived', reg.plan_keys_archived)}
            ${list('Coupon codes active', reg.coupon_codes)}${list('Coupon codes not active', reg.coupon_codes_other)}${list('Coupon codes archived', reg.coupon_codes_archived)}
            <div class="card tight"><span class="label">Fixed in code · src/lib/enums.ts</span>${['PlanKind', 'PricingModel', 'BillingPeriod', 'SignupFlow', 'SignupStatus', 'CouponStatus', 'TierKey'].map((k) => `<p style="font-size:13px"><b class="ink">${k}</b> · ${enums[k].map((x) => `<span class="code">${x}</span>`).join(' ')}</p>`).join('')}</div>
          </section>
          <aside class="stack"><span class="eyebrow">GET /api/enums · as returned</span><pre class="email">${esc(JSON.stringify(api, null, 2))}</pre></aside>
        </div>`);
    },
  };

  /* ================= Banner ================= */
  LEAD.views['admin-banner'] = {
    title: () => 'Banner',
    render() {
      const b = store.pricing.banner;
      return shell('admin-banner', 'Banner.', 'One announcement above the navigation on every page. It reaches open tabs within seconds.', `
        <div class="split">
          <form class="card" data-form="banner"><span class="eyebrow">F-PR-12</span>
            <label class="check"><input type="checkbox" name="active" id="bn-on" ${b.active ? 'checked' : ''} ${dis()}> Show the banner</label>
            <label class="field">Text<input id="bn-text" name="text" value="${esc(b.text)}" maxlength="140" ${dis()}></label>
            <div class="form-grid"><label class="field">Link<input id="bn-link" name="link" value="${esc(b.link)}" ${dis()}></label>
            <label class="field">Starts<input id="bn-from" type="date" name="from" value="${esc(b.startsAt || '')}" ${dis()}></label>
            <label class="field">Ends<input id="bn-to" type="date" name="to" value="${esc(b.endsAt || '')}" ${dis()}></label></div>
            <button class="btn primary" type="submit" ${dis()}>Save banner</button></form>
          <aside class="stack"><span class="eyebrow">Preview</span><div class="banner" style="border-radius:10px"><div class="wrap" style="padding-inline:12px"><span>${esc(b.text)}</span>${b.link ? '<a href="#">Join</a>' : ''}</div></div><p class="muted" style="font-size:13px">${b.active ? 'Showing now on every page.' : 'Hidden.'}</p></aside>
        </div>`);
    },
  };
  LEAD.forms.banner = (fd) => {
    if (!canWrite()) return;
    const before = clone(store.pricing.banner);
    store.pricingCommit('Banner changed', 'announcement_banner', 'banner', before, (s) => { s.banner = { text: String(fd.get('text')).trim(), link: String(fd.get('link')).trim(), startsAt: fd.get('from') || null, endsAt: fd.get('to') || null, active: !!fd.get('active') }; return s.banner; });
    ui.toast('Banner saved. Open tabs update within seconds.');
  };

  /* ================= Audit ================= */
  LEAD.views['admin-audit'] = {
    title: () => 'Pricing audit',
    render() { return shell('admin-audit', 'Audit.', 'Every admin change and every redemption, with before and after (R16).', `<div class="card">${auditTable(store.pricing.audit.slice(0, 200))}</div><a class="btn ghost" href="#audit">Loop audit log</a>`); },
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
