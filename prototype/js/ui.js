/* LEAD · UI helpers and shared components (spec §16.4). Views return HTML strings. */
(function (root) {
  const LEAD = (root.LEAD = root.LEAD || {});
  const P = LEAD.pricing;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const attr = esc;

  function fmtDate(v) {
    if (!v) return '—';
    const d = typeof v === 'number' ? new Date(v) : new Date(v);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function fmtDay(v) {
    const d = new Date(v);
    return { day: d.toLocaleDateString('en-GB', { day: '2-digit' }), mon: d.toLocaleDateString('en-GB', { month: 'short' }), wk: d.toLocaleDateString('en-GB', { weekday: 'short' }), time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) };
  }
  function fmtTime(v) { return new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  function ago(ms) {
    const s = Math.round((Date.now() - ms) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.round(s / 60)} min ago`;
    if (s < 86400) return `${Math.round(s / 3600)} h ago`;
    return fmtDate(ms);
  }

  /* 25654 → "twenty-five thousand six hundred and fifty-four" */
  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function numberWords(n) {
    n = Math.floor(Number(n) || 0);
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
    if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + numberWords(n % 100) : '');
    if (n < 1000000) return numberWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + numberWords(n % 1000) : '');
    return numberWords(Math.floor(n / 1000000)) + ' million' + (n % 1000000 ? ' ' + numberWords(n % 1000000) : '');
  }

  const S = () => LEAD.store;
  const nameOf = (id) => { const u = S().user(id); return u ? u.name : id; };
  const orgName = (id) => { const o = S().org(id); return o ? o.name : id; };
  const capName = (slug) => { const c = S().loop.capabilities.find((x) => x.slug === slug); return c ? c.name : slug; };
  const roleName = (id) => (LEAD.content.roleById[id] || { name: id }).name;

  const STATUS = {
    good: ['Live', 'Verified', 'Shared', 'Complete', 'Published', 'ACTIVE', 'Moderated', 'Filled', 'CONFIRMED_MOCK', 'Scored', 'solved', 'Hired', 'Deployed', 'cosigned', 'Open', 'Accepted'],
    warn: ['Draft', 'Submitted', 'Requested', 'Proposed', 'PENDING_APPROVAL', 'DRAFT', 'Needs an owner', 'partly', 'draft', 'Shortlisting'],
    info: ['In progress', 'In scoring', 'Matched', 'Shaped', 'Booked', 'Reviewed', 'Merged', 'In assessment', 'Reserved', 'QUOTED'],
    bad: ['Revoked', 'PAUSED', 'EXPIRED', 'EXHAUSTED', 'CANCELLED', 'not', 'Closed', 'Declined', 'ARCHIVED'],
  };
  function status(s, label) {
    let cls = '';
    for (const k of Object.keys(STATUS)) if (STATUS[k].includes(s)) cls = 's-' + k;
    const text = label || String(s).replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
    return `<span class="status ${cls}">${esc(text)}</span>`;
  }
  const tag = (text, cls) => `<span class="tag ${cls || ''}">${esc(text)}</span>`;
  const simTag = () => '';
  const mockTag = () => tag('Mock pricing. Not an offer.', 'mock');
  const mode = (m) => `<span class="mode ${esc(m)}">${esc(m)}</span>`;

  function hero(o) {
    const main = `${o.eyebrow ? `<div class="eyebrow">${o.eyebrow}</div>` : ''}
      <h1>${esc(o.title)}</h1>
      ${o.lede ? `<p class="lede">${o.lede}</p>` : ''}
      ${o.meta ? `<div class="hero-meta">${o.meta}</div>` : ''}`;
    return `<section class="hero ${o.compact ? 'compact' : ''} ${o.aside ? 'has-aside' : ''}">
      <span class="dots tr" aria-hidden="true"></span><span class="dots bl" aria-hidden="true"></span>
      ${o.aside ? `<div class="hero-main">${main}</div><div class="hero-aside">${o.aside}</div>` : main}
    </section>`;
  }

  function sectionHead(eyebrow, title, right, sub) {
    return `<div class="section-head"><div>${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h2>${esc(title)}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div>${right ? `<div class="row">${right}</div>` : ''}</div>`;
  }

  function simFrame(title, inner, o) {
    const opts = o || {};
    return `<div class="sim"><div class="sim-bar"><i></i><i></i><i></i><span class="t">${esc(title)}</span></div><div class="sim-body">${inner}</div></div>`;
  }

  function kv(rows) {
    return `<div class="kv">${rows.map(([k, v]) => `<span>${esc(k)}</span><span>${esc(v)}</span>`).join('')}</div>`;
  }

  function kpis(items, cls) {
    return `<div class="kpis ${cls || ''}">${items.map((k) => `<div class="kpi"><span class="label">${esc(k.label)}</span><span class="v ${k.hidden ? 'hidden' : ''}">${k.hidden ? 'Hidden · fewer than 5' : esc(k.v)}</span>${k.d ? `<span class="d">${esc(k.d)}</span>` : ''}</div>`).join('')}</div>`;
  }

  function loopStrip(o) {
    const opts = o || {};
    const stages = LEAD.content.stages;
    const cells = stages.map((s) => {
      const on = opts.active ? opts.active.includes(s.id) : true;
      const cur = opts.cur === s.id;
      const cls = `st ${opts.active ? (on ? 'on' : 'off') : ''} ${cur ? 'cur' : ''}`;
      const inner = `<span class="pxnum">${s.n}</span><b>${esc(s.id)}</b><small>${esc(s.module)}</small>${opts.umo ? `<span class="umo">${esc(s.umo)}</span>` : ''}`;
      return opts.clickable
        ? `<button class="${cls}" data-act="${opts.clickable}" data-stage="${esc(s.id)}" aria-pressed="${cur}">${inner}</button>`
        : `<div class="${cls}">${inner}</div>`;
    }).join('');
    const layers = opts.layers ? `<div class="layers"><div><span class="px indigo"></span><b class="ink">Governance · Codex</b><span class="muted">consent, IP and NDA, ethics, conflicts</span></div><div><span class="px cyan"></span><b class="ink">Measurement · Impact Ledger</b><span class="muted">problems solved; feeds IDENTIFY</span></div></div>` : '';
    return `<div class="loop-wrap"><div class="loop" role="list">${cells}</div>${layers}</div>`;
  }

  /* A small deterministic pixel glyph per role, in the LEAD pixel-square motif. */
  const GLYPHS = {
    student: '0110100110010110', faculty: '1111010001000100', head: '0110111101100110', industry: '1001100111111001',
    mentor: '1010010110100101', open: '0100111001000000', admin: '1110101011100010',
  };
  function glyph(role) {
    const g = GLYPHS[role] || '1001011001101001';
    return `<span class="glyph" aria-hidden="true">${g.split('').map((b) => `<i class="${b === '1' ? '' : 'o'}"></i>`).join('')}</span>`;
  }

  function lvlDots(n) { return `<span class="lvl-dots" aria-label="Level ${n} of 4">${[1, 2, 3, 4].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`; }

  function meter(pct, o) {
    const p = Math.max(0, Math.min(100, pct || 0));
    return `<div class="meter ${(o && o.px) ? 'px-meter' : ''} ${p >= 100 ? 'full' : ''}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><span style="width:${p}%"></span></div>`;
  }

  /* Availability meter (F-PR-13, IxDF “% booked”). */
  function availability(plan) {
    const pct = P.percentBooked(plan);
    if (pct == null) return `<span class="muted" style="font-size:13px">Open to everyone. No cap.</span>`;
    const left = P.remaining(plan);
    const unit = P.unitWord(plan.kind, left);
    return `<div class="stack" style="gap:6px"><div class="row between"><span class="label">${pct}% booked</span><span style="font-size:13px" class="${left === 0 ? '' : 'muted'}">${left === 0 ? '<b class="ink">Closed. Re-opens soon.</b>' : `${left} ${unit} left`}</span></div>${meter(pct, { px: true })}</div>`;
  }

  function guard(roles, title) {
    const me = S().session.role;
    if (roles.includes(me)) return null;
    const r = LEAD.content.roleById[me];
    return `<div class="page wrap"><section class="card" style="max-width:720px">
      <div class="eyebrow">Access · rule check</div>
      <h2>${esc(title)} is not open to ${esc(r.name)}.</h2>
      <p>The prototype checks access as if sign-in existed. ${esc(r.name)} cannot: ${esc(r.cannot.join('; '))}.</p>
      <div class="btn-row">${roles.slice(0, 3).map((x) => `<button class="btn" data-act="as" data-role="${x}">Switch to ${esc(roleName(x))}</button>`).join('')}<a class="btn ghost" href="#w-${me}">Back to my home</a></div>
    </section></div>`;
  }

  /* ---------- toasts ---------- */
  function toast(text) {
    let box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span class="px"></span><span>${esc(text)}</span>`;
    box.appendChild(t);
    setTimeout(() => t.remove(), 3600);
  }

  LEAD.ui = { numberWords, esc, attr, fmtDate, fmtDay, fmtTime, ago, nameOf, orgName, capName, roleName, status, tag, simTag, mockTag, mode, hero, sectionHead, simFrame, kv, kpis, loopStrip, glyph, lvlDots, meter, availability, guard, toast, inr: P.formatINR };
  LEAD.views = LEAD.views || {};
  LEAD.act = LEAD.act || {};
  LEAD.forms = LEAD.forms || {};
  LEAD.on = LEAD.on || {};
})(typeof globalThis !== 'undefined' ? globalThis : this);
