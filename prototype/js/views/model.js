/* LEAD · Service model hub: ecosystem, value exchange, lifecycle (the centrepiece). */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, content, pricing: P } = LEAD;
  const { esc } = ui;

  const st = { phase: 'p1', sel: null, kinds: new Set() };
  const STATE_LABEL = { manual: 'By hand', sim: 'In prototype', real: 'Live', none: 'Not yet', reserved: 'Later' };
  const STATE_CLS = { manual: 'mock', sim: 'sim', real: 'live', none: '', reserved: 'ind' };
  const actorById = Object.fromEntries(content.actors.map((a) => [a.id, a]));
  const kindLabel = Object.fromEntries(content.valueKinds.map((k) => [k.id, k.label]));

  function size(a) {
    const w = Math.max(132, Math.round(a.label.length * 8.6 + 32));
    return { w: a.hub ? w + 30 : w, h: a.hub ? 66 : 54 };
  }

  function edge(a, tx, ty) {
    const { w, h } = size(a);
    const dx = tx - a.x; const dy = ty - a.y;
    if (!dx && !dy) return [a.x, a.y];
    const s = 1 / Math.max(Math.abs(dx) / (w / 2 + 6), Math.abs(dy) / (h / 2 + 6));
    return [a.x + dx * s, a.y + dy * s];
  }

  function flowPath(f, i) {
    const A = actorById[f.from]; const B = actorById[f.to];
    const mx = (A.x + B.x) / 2; const my = (A.y + B.y) / 2;
    const dx = B.x - A.x; const dy = B.y - A.y; const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len; const ny = dx / len;
    /* Opposite directions bend to opposite sides; parallel flows fan out. */
    const same = content.flows.filter((g) => (g.from === f.from && g.to === f.to));
    const k = same.indexOf(f);
    const bend = 34 + k * 26;
    const cx = mx + nx * bend; const cy = my + ny * bend;
    const [sx, sy] = edge(A, cx, cy); const [ex, ey] = edge(B, cx, cy);
    const lx = 0.25 * sx + 0.5 * cx + 0.25 * ex; const ly = 0.25 * sy + 0.5 * cy + 0.25 * ey;
    return { d: `M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`, lx, ly };
  }

  function visibleFlow(f) { return !st.kinds.size || st.kinds.has(f.kind); }

  function svg() {
    const sel = st.sel;
    const related = (f) => sel && ((sel.type === 'actor' && (f.from === sel.id || f.to === sel.id)) || (sel.type === 'flow' && f.id === sel.id));
    const markers = content.valueKinds.map((k) => `<marker id="ar-${k.id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--vk-${k.id})"/></marker>`).join('');
    const flows = content.flows.map((f, i) => {
      const state = f.phase[st.phase];
      const { d, lx, ly } = flowPath(f, i);
      const dim = (!visibleFlow(f)) || (sel && !related(f));
      const showLabel = sel && related(f);
      return `<g class="eco-flow ${state} ${dim ? 'dim' : ''} ${showLabel ? 'sel' : ''}" data-act="eco-flow" data-id="${f.id}">
        <path class="line" d="${d}" style="stroke:var(--vk-${f.kind})" marker-end="url(#ar-${f.kind})"></path>
        <path class="hit" d="${d}"><title>${esc(f.label)} · ${esc(actorById[f.from].label)} → ${esc(actorById[f.to].label)} · ${STATE_LABEL[state]}</title></path>
        ${showLabel ? `<text x="${lx.toFixed(0)}" y="${(ly - 6).toFixed(0)}" text-anchor="middle" paint-order="stroke" style="stroke:var(--panel);stroke-width:5px">${esc(f.label)}</text>` : ''}
      </g>`;
    }).join('');
    const nodes = content.actors.map((a) => {
      const { w, h } = size(a);
      const isSel = sel && sel.type === 'actor' && sel.id === a.id;
      const dim = sel && sel.type === 'actor' && !isSel && !content.flows.some((f) => (f.from === sel.id && f.to === a.id) || (f.to === sel.id && f.from === a.id));
      return `<g class="eco-node ${a.hub ? 'hub' : ''} ${a.ext ? 'ext' : ''} ${isSel ? 'sel' : ''} ${dim ? 'dim' : ''}" data-act="eco-actor" data-id="${a.id}" tabindex="0" role="button" aria-pressed="${!!isSel}" aria-label="${esc(a.label)}, ${esc(a.group)}">
        <rect class="box" x="${a.x - w / 2}" y="${a.y - h / 2}" width="${w}" height="${h}" rx="${a.hub ? 14 : 10}"></rect>
        <text class="grp" x="${a.x}" y="${a.y - (a.hub ? 8 : 6)}" text-anchor="middle">${esc(a.group)}</text>
        <text x="${a.x}" y="${a.y + (a.hub ? 14 : 12)}" text-anchor="middle" style="${a.hub ? 'font-size:17px' : ''}">${esc(a.label)}</text>
      </g>`;
    }).join('');
    return `<svg viewBox="0 0 1000 640" role="img" aria-label="LEAD ecosystem map: actors and the value that flows between them">
      <defs>${markers}</defs>
      <ellipse class="eco-ring" cx="500" cy="385" rx="250" ry="150"></ellipse>
      <text class="eco-zone" x="24" y="160">College</text>
      <text class="eco-zone" x="976" y="160" text-anchor="end">Employer</text>
      <text class="eco-zone" x="500" y="22" text-anchor="middle">Partner services · LEAD links to them and does not copy them</text>
      <text class="eco-zone" x="500" y="628" text-anchor="middle">Open to all</text>
      ${flows}${nodes}
    </svg>`;
  }

  function phaseRow(f) {
    return `<div class="row" style="gap:6px">${content.phases.map((p) => `<span class="tag ${STATE_CLS[f.phase[p.id]]}" title="${esc(content.plainPhase[p.id].label)}">${esc(content.plainPhase[p.id].label)}: ${STATE_LABEL[f.phase[p.id]]}</span>`).join('')}</div>`;
  }

  function detail() {
    const sel = st.sel;
    if (sel && sel.type === 'flow') {
      const f = content.flows.find((x) => x.id === sel.id);
      const A = actorById[f.from]; const B = actorById[f.to];
      return `<div class="card detail">
        <div class="row between"><span class="eyebrow">Value flow · ${esc(f.stage)}</span><button class="btn small ghost" data-act="eco-clear">Clear</button></div>
        <div class="row"><span class="vk vk-${f.kind}"></span><span class="label">${esc(kindLabel[f.kind])}</span></div>
        <h3>${esc(f.label)}</h3>
        <p class="ink"><b>${esc(A.label)}</b> → <b>${esc(B.label)}</b></p>
        <p>${esc(f.detail)}</p>
        <div class="stack" style="gap:8px"><span class="label">How it runs over time</span>${phaseRow(f)}</div>
        <div class="btn-row">${A.role ? `<button class="btn small" data-act="as" data-role="${A.role}" data-to="w-${A.role}">Walk as ${esc(A.label)}</button>` : ''}${B.role ? `<button class="btn small" data-act="as" data-role="${B.role}" data-to="w-${B.role}">Walk as ${esc(B.label)}</button>` : ''}</div>
      </div>`;
    }
    if (sel && sel.type === 'actor') {
      const a = actorById[sel.id];
      const s = content.stays[a.id] || {};
      const outs = content.flows.filter((f) => f.from === a.id && visibleFlow(f));
      const ins = content.flows.filter((f) => f.to === a.id && visibleFlow(f));
      const li = (f, other) => `<button class="flow-item" data-act="eco-flow" data-id="${f.id}"><span class="vk vk-${f.kind}"></span><span><b>${esc(f.label)}</b><br><span class="muted">${esc(actorById[other].label)}</span></span>${ui.tag(STATE_LABEL[f.phase[st.phase]], STATE_CLS[f.phase[st.phase]])}</button>`;
      return `<div class="card detail">
        <div class="row between"><span class="eyebrow">${esc(a.group)}</span><button class="btn small ghost" data-act="eco-clear">Clear</button></div>
        <h3>${esc(a.label)}</h3>
        ${s.why ? `<p class="ink">${esc(s.why)}</p>` : ''}
        ${s.quote ? `<p class="quote" style="font-size:15px">${esc(s.quote)}</p>` : ''}
        <div class="grid g2" style="gap:10px">
          <div class="stack" style="gap:6px"><span class="label">Gives</span><p>${esc(s.gives || '')}</p></div>
          <div class="stack" style="gap:6px"><span class="label">Gets</span><p>${esc(s.gets || '')}</p></div>
        </div>
        ${s.risk ? `<div class="msg warn"><span>Risk: ${esc(s.risk)}</span></div>` : ''}
        <div><span class="label">Gives out · ${outs.length}</span><div class="flow-list">${outs.map((f) => li(f, f.to)).join('') || '<p class="muted">None in view.</p>'}</div></div>
        <div><span class="label">Receives · ${ins.length}</span><div class="flow-list">${ins.map((f) => li(f, f.from)).join('') || '<p class="muted">None in view.</p>'}</div></div>
        ${a.role ? `<button class="btn primary" data-act="as" data-role="${a.role}" data-to="w-${a.role}">Walk this role</button>` : ''}
        ${a.href ? `<a class="btn" href="${a.href}" target="_blank" rel="noopener">Open ${esc(a.label)}</a>` : ''}
      </div>`;
    }
    const counts = { real: 0, sim: 0, manual: 0, none: 0, reserved: 0 };
    content.flows.forEach((f) => { counts[f.phase[st.phase]] += 1; });
    return `<div class="card detail">
      <span class="eyebrow">How to read the map</span>
      <p>Each box is a party to the service. Each line is something of value moving from one party to another. Select a box or a line.</p>
      <div class="legend" style="display:grid;gap:8px">
        <span><span class="sw" style="color:var(--ink)"></span>Live now</span>
        <span><span class="sw d" style="color:var(--ink)"></span>By hand: people and spreadsheets</span>
        <span><span class="sw p" style="color:var(--ink)"></span>In this prototype only</span>
        <span class="muted">Faint: not there yet</span>
      </div>
      <div class="kpis" style="grid-template-columns:repeat(2,1fr)">
        <div class="kpi"><span class="label">Live</span><span class="v">${counts.real}</span></div>
        <div class="kpi"><span class="label">In prototype</span><span class="v">${counts.sim}</span></div>
        <div class="kpi"><span class="label">By hand</span><span class="v">${counts.manual}</span></div>
        <div class="kpi"><span class="label">Not yet or later</span><span class="v">${counts.none + counts.reserved}</span></div>
      </div>
      <p class="muted" style="font-size:13px">Counts are for “${esc(content.plainPhase[st.phase].label)}”, across ${content.flows.length} exchanges.</p>
    </div>`;
  }

  function matrix() {
    const core = content.actors.filter((a) => !a.ext);
    const short = (a) => a.label.replace('Institution head', 'Inst. head').replace('Mentor & assessor', 'Mentor').replace('Industry leader', 'Industry').replace('Industry Challenge', 'Challenge').replace('Open community', 'Open').replace('UMO admin', 'Admin');
    const head = `<tr><th>Gives ↓ · Gets →</th>${core.map((a) => `<th>${esc(short(a))}</th>`).join('')}</tr>`;
    const rows = core.map((g) => `<tr><td><b>${esc(short(g))}</b></td>${core.map((r) => {
      if (g.id === r.id) return '<td class="self"></td>';
      const fs = content.flows.filter((f) => f.from === g.id && f.to === r.id && visibleFlow(f));
      return `<td>${fs.length ? `<span class="cell">${fs.map((f) => `<button class="vk vk-${f.kind}" style="border:0;cursor:pointer;width:12px;height:12px" data-act="eco-flow" data-id="${f.id}" title="${esc(f.label)}" aria-label="${esc(f.label)}"></button>`).join('')}</span>` : ''}</td>`;
    }).join('')}</tr>`).join('');
    return `<div class="table-wrap"><table class="matrix"><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
  }

  function phaseTable() {
    const head = `<tr><th>What moves</th><th>Step</th>${content.phases.map((p) => `<th>${esc(content.plainPhase[p.id].label)}</th>`).join('')}</tr>`;
    const rows = content.flows.map((f) => `<tr><td><span class="row" style="gap:8px;flex-wrap:nowrap"><span class="vk vk-${f.kind}"></span><span><b>${esc(f.label)}</b><br><span class="muted" style="font-size:12.5px">${esc(actorById[f.from].label)} → ${esc(actorById[f.to].label)}</span></span></span></td><td><span class="label">${esc(f.stage)}</span></td>${content.phases.map((p) => `<td>${ui.tag(STATE_LABEL[f.phase[p.id]], STATE_CLS[f.phase[p.id]])}</td>`).join('')}</tr>`).join('');
    return `<div class="table-wrap"><table><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
  }

  function offerings() {
    const plans = store.pricing.plans.filter((p) => !p.archived && p.active);
    const route = { CAMPUS_LICENCE: 'join-college', INDUSTRY_MEMBERSHIP: 'join-industry', PATH_ENROLMENT: 'join-path-', CHALLENGE_SPONSORSHIP: 'join-sponsor', OPEN_TIER: 'join-open' };
    return plans.map((p) => {
      const from = P.fromPrice(p);
      const r = route[p.kind] === 'join-path-' ? 'join-path-' + p.key : route[p.kind];
      const per = { TIERED_BY_SIZE: 'a year, by size', PER_SEAT: p.kind === 'PATH_ENROLMENT' ? 'per learner, per term' : 'per seat, a year', PER_CHALLENGE: 'per challenge', FREE: '', FLAT: '', PER_COHORT: 'per cohort' }[p.pricingModel];
      return `<article class="card plan-card">
        <div class="row between"><span class="label">${esc(p.kind.replace(/_/g, ' '))}</span>${p.isDemo && p.kind !== 'CAMPUS_LICENCE' ? ui.tag('Demo price', 'mock') : (p.kind === 'CAMPUS_LICENCE' ? ui.tag('Band sourced · untested', 'info') : '')}</div>
        <h3>${esc(p.name)}</h3>
        <p style="font-size:14px">${esc(p.blurb || '')}</p>
        <div><span class="from">${from == null ? 'Not priced' : (from === 0 ? 'Free' : (p.pricingModel === 'TIERED_BY_SIZE' ? 'from ' : '') + ui.inr(from))}</span> <span class="muted" style="font-size:13px">${esc(per)}</span></div>
        ${ui.availability(p)}
        <a class="btn ${p.kind === 'OPEN_TIER' ? '' : 'primary'}" href="#${r}">${p.kind === 'OPEN_TIER' ? 'Join free' : 'Join'}</a>
      </article>`;
    }).join('');
  }

  function stayCards() {
    return ['student', 'faculty', 'head', 'industry', 'mentor', 'admin', 'open', 'challenge'].map((id) => {
      const a = actorById[id]; const s = content.stays[id];
      return `<button class="card" data-act="eco-actor" data-id="${id}" data-scroll="1">
        <span class="label">${esc(a.group)}</span>
        <h3>${esc(a.label)}</h3>
        <div class="grid" style="gap:8px;font-size:14px">
          <div><span class="label">Gives</span><p>${esc(s.gives)}</p></div>
          <div><span class="label">Gets</span><p>${esc(s.gets)}</p></div>
          <div><span class="label">Stays because</span><p class="ink">${esc(s.why)}</p></div>
        </div>
      </button>`;
    }).join('');
  }

  LEAD.modelParts = { st, svg, detail, matrix, phaseTable, offerings, stayCards, STATE_LABEL, STATE_CLS };

  Object.assign(LEAD.act, {
    'eco-phase'(el) { st.phase = el.getAttribute('data-id'); LEAD.render({ keepScroll: true }); },
    'eco-kind'(el) {
      const id = el.getAttribute('data-id');
      if (!id) st.kinds.clear(); else if (st.kinds.has(id)) st.kinds.delete(id); else st.kinds.add(id);
      LEAD.render({ keepScroll: true });
    },
    'eco-actor'(el) {
      const id = el.getAttribute('data-id');
      st.sel = st.sel && st.sel.type === 'actor' && st.sel.id === id ? null : { type: 'actor', id };
      LEAD.render({ keepScroll: true });
      if (el.getAttribute('data-scroll')) document.getElementById('ecosystem').scrollIntoView({ behavior: 'smooth' });
    },
    'eco-flow'(el) {
      st.sel = { type: 'flow', id: el.getAttribute('data-id') };
      LEAD.render({ keepScroll: true });
      if (el.closest('.matrix')) document.getElementById('ecosystem').scrollIntoView({ behavior: 'smooth' });
    },
    'eco-clear'() { st.sel = null; LEAD.render({ keepScroll: true }); },
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
