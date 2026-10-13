/* LEAD · Verdict (/), access chooser (/choose) and role homes (/w/[role]). Spec §2, §5, §9. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, content, rules } = LEAD;
  const { esc } = ui;

  /* ---------- verdict ---------- */
  const gateCounts = Object.fromEntries(content.gates.map((g) => [g.id, g.count]));
  LEAD.gateCounts = gateCounts;

  function verdictReading(met) {
    if (met <= 2) return { k: 'Stay manual', d: 'Run Loop v0 by hand. Do not build Phase 2.', cls: 'sim' };
    if (met <= 4) return { k: 'Build a thin v1', d: 'Real accounts and one real loop for a handful of campuses and companies.', cls: 'info' };
    return { k: 'Commission the platform', d: 'All five gates passed.', cls: 'live' };
  }

  LEAD.views.verdict = {
    title: () => 'Verdict',
    render() {
      const met = content.gates.filter((g) => gateCounts[g.id] >= g.target).length;
      const r = verdictReading(met);
      return `<div class="page wrap">
        ${ui.hero({
          eyebrow: 'Decision first · spec §2',
          title: 'Test.',
          lede: 'Worth testing, not yet worth building. The loop is the product; the platform is where it lives.',
          meta: `${ui.tag(`${met} of 5 gates met`, r.cls)}${ui.tag(`Reading: ${r.k}`, 'ind')}<a class="btn" href="#home">Back to the homepage</a>`,
        })}
        <section class="section">
          ${ui.sectionHead('Gates', 'Five tests before any Phase 2 build', '', 'Proposals. Madhukar Joshi and Kaladhar Bapu set the final numbers. Counts here are illustrative; adjust them to rehearse the reading.')}
          <div class="card">
            ${content.gates.map((g) => {
              const c = gateCounts[g.id]; const pct = Math.round(Math.min(1, c / g.target) * 100);
              return `<div class="gate-row">
                <span class="pxnum" style="font-size:30px">${g.id}</span>
                <div class="stack" style="gap:4px"><b class="ink">${esc(g.name)}</b><span>${esc(g.test)}</span><span class="label">${esc(g.by)}</span></div>
                <div class="stack" style="gap:6px">
                  <div class="row between"><span class="tnum ink"><b>${c}</b> of ${g.target} ${esc(g.unit)}</span>${c >= g.target ? ui.status('Met', 'Met') : ''}</div>
                  ${ui.meter(pct, { px: true })}
                  <div class="row" style="gap:6px"><button class="btn small" data-act="gate" data-id="${g.id}" data-d="-1" aria-label="Lower ${esc(g.name)} count">−</button><button class="btn small" data-act="gate" data-id="${g.id}" data-d="1" aria-label="Raise ${esc(g.name)} count">+</button></div>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div class="notice"><span class="px ${met >= 3 ? 'cyan' : 'red'}"></span><b class="ink">${esc(r.k)}.</b> ${esc(r.d)} <span class="muted">0–2 gates: stay manual · 3–4: thin v1 · 5: commission the platform.</span></div>
        </section>
        <section class="section">
          ${ui.sectionHead('Evidence', 'What the room said', '', 'LEAD Commons Roundtable, 26 Sep 2026, Srishti Manipal Institute, Bengaluru. 18–19 of 20 invited leaders present.')}
          <div class="table-wrap"><table><thead><tr><th>#</th><th>The room said</th><th>What it means for the build</th><th>Reading</th></tr></thead><tbody>
            ${content.evidence.map((e) => `<tr><td class="tnum">${e.n}</td><td><b>${esc(e.quote)}</b></td><td>${esc(e.means)}</td><td>${ui.tag(e.reading, e.reading === 'Supports' ? 'live' : e.reading === 'Challenges' ? 'sim' : '')}</td></tr>`).join('')}
          </tbody></table></div>
        </section>
        <section class="section">
          ${ui.sectionHead('Phases', 'Build in order, behind gates')}
          <div class="grid g4">${content.phases.map((p) => `<article class="card"><span class="eyebrow">${esc(p.label)} · ${esc(p.when)}</span><h3>${esc(p.name)}</h3><p style="font-size:14px">${esc(p.blurb)}</p><span class="label">Gate: ${esc(p.gate)}</span></article>`).join('')}</div>
        </section>
        <section class="section">
          <div class="split even">
            <div class="card"><span class="eyebrow">Out of scope for Phase 1</span><h3>Do not build yet</h3><ul class="px-list no">
              <li>Real payments, billing or invoicing (a mock checkout is in)</li><li>Video calls, live chat, a social feed</li><li>Hosting course content (link out)</li>
              <li>Recommendation engines or AI matching</li><li>Real sign-in (a role switcher stands in)</li><li>1 Million Women and Design Pitch (reserved overlays)</li></ul></div>
            <div class="card"><span class="eyebrow">Decisions only people can make</span><h3>Open questions</h3><ul class="px-list">
              <li>Final gate numbers and dates · Madhukar Joshi, Kaladhar Bapu</li><li>UMO as host of the loop (G5) · Kaladhar Bapu</li>
              <li>Who validates the first Passports · UMO with the first employers</li><li>Mentor economics: paid, credited, or both · UMO, sponsors</li>
              <li>Real prices; only the campus band is sourced · Madhukar Joshi, UMO</li><li>LEAD Paths sold in LEAD, via UMO Design School, or both · UMO</li>
              <li>IP terms; student data and consent under India’s data protection law · Counsel</li><li>Tax per plan type and refund windows · Finance, counsel</li></ul></div>
          </div>
        </section>
      </div>`;
    },
  };
  LEAD.act.gate = (el) => {
    const g = el.getAttribute('data-id');
    gateCounts[g] = Math.max(0, gateCounts[g] + Number(el.getAttribute('data-d')));
    LEAD.render({ keepScroll: true });
  };

  /* ---------- access chooser ---------- */
  const ACCESS = [
    ['Skills Guide', 'R', 'R', 'R', 'R', 'R', 'RW', 'R'],
    ['Demand Map', 'R themes', 'R', 'R', 'RW own intakes', 'R', 'RW', 'R public'],
    ['Challenge, published', 'R own campus', 'R', 'R own campus', 'RW own', 'R assigned', 'RW', 'R open cohort'],
    ['Challenge brief, draft', '—', '—', '—', 'RW own', '—', 'RW', '—'],
    ['Team workspace', 'RW own team', 'R own cohort', '—', '—', 'R assigned', 'R agg', '—'],
    ['Feedback thread', 'RW own team', 'R own cohort', '—', '—', 'RW assigned', '—', '—'],
    ['Submission', 'RW own team', 'R own cohort', 'R agg', 'R anonymised', 'R, blind until lock', 'R', '—'],
    ['Passport entry', 'R own; share', 'R if consented', 'R agg', 'R if shared', 'R I assessed', 'RW 2nd approval', '—'],
    ['Opportunities', 'R; apply', 'R', 'R', 'RW own', '—', 'RW', 'R open board'],
    ['Impact Ledger', 'R own', 'R cohort', 'R own inst.', 'R own org', 'R own hours', 'RW', 'R public'],
    ['Calendar', 'R', 'RW own campus', 'RW own', 'RW own', 'R', 'RW', 'R public'],
    ['Audit log', '—', '—', 'R own inst.', 'R own org', '—', 'R', '—'],
  ];

  LEAD.views.choose = {
    title: () => 'Choose a role',
    render() {
      const cur = store.session.role;
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'Access chooser · no sign-in in Phase 1', title: 'Choose.', lede: 'Pick who you are. Each role sees only what the access rules allow. Switch any time from the bar above.' })}
        <div class="grid g4">${content.roles.map((r) => `<button class="card persona ${r.id === cur ? 'active' : ''}" data-act="as" data-role="${r.id}" data-to="w-${r.id}">
          <div class="row between">${ui.glyph(r.id)}<span class="lens">${esc(r.lens)}</span></div>
          <h3>${esc(r.name)}</h3>
          <p style="font-size:14px">${esc(r.goal)}</p>
          <span class="label">${esc(r.access)}</span>
          <span class="muted" style="font-size:13px">${esc(r.person)}</span>
        </button>`).join('')}</div>
        <section class="section">
          ${ui.sectionHead('Access · spec §9', 'Who can see and do what', '', 'R read · RW read and write · agg aggregates only · — no access. Built as if real sign-in existed, so Phase 2 only swaps the login.')}
          <div class="table-wrap"><table><thead><tr><th>Resource</th>${['Student', 'Faculty', 'Inst. head', 'Industry', 'Mentor', 'UMO admin', 'Open'].map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>
            ${ACCESS.map((row) => `<tr><td><b>${esc(row[0])}</b></td>${row.slice(1).map((c) => `<td style="white-space:nowrap" class="${c === '—' ? 'muted' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}
          </tbody></table></div>
        </section>
      </div>`;
    },
  };

  /* ---------- role home ---------- */
  const curStage = {};

  function live(role) {
    const L = store.loop; const me = store.me();
    const pend = L.passports.filter((p) => p.status === 'Proposed').length;
    switch (role) {
      case 'student': {
        const mine = L.passports.filter((p) => p.studentId === me.id);
        const team = L.teams.find((t) => t.memberIds.includes(me.id) && t.id === 't1');
        return [{ label: 'My Passport entries', v: mine.length, d: `${mine.filter((p) => p.shared).length} shared` }, { label: 'Team decisions', v: team ? team.decisions.length : 0, d: team ? team.name : '' }, { label: 'Applications', v: L.applications.filter((a) => a.studentId === me.id).length }];
      }
      case 'admin': return [{ label: 'Intakes to review', v: L.demandSignals.filter((d) => d.status === 'Submitted').length }, { label: 'Briefs to shape or match', v: L.challenges.filter((c) => ['Draft', 'Shaped'].includes(c.status)).length }, { label: 'Pending second approval', v: pend }, { label: 'Live plans', v: store.pricing.plans.filter((p) => p.active && !p.archived).length }];
      case 'industry': return [{ label: 'My intakes', v: L.demandSignals.filter((d) => d.orgId === me.orgId).length }, { label: 'My challenges', v: L.challenges.filter((c) => c.sponsorOrgId === me.orgId).length }, { label: 'Shared Passports', v: L.passports.filter((p) => rules.employerCanSee(p)).length }];
      case 'mentor': {
        const mins = L.sprints.filter((s) => s.mentorId === me.id).flatMap((s) => s.sessions.filter((x) => x.done)).reduce((a, x) => a + x.minutes, 0);
        return [{ label: 'Teams mentored', v: L.sprints.filter((s) => s.mentorId === me.id).length }, { label: 'Hours logged', v: (mins / 60).toFixed(1) }, { label: 'Submissions to score', v: L.submissions.filter((s) => s.status === 'In scoring').length }];
      }
      case 'faculty': return [{ label: 'Challenges mapped', v: L.matches.filter((m) => m.facultyId === me.id && m.mapped).length }, { label: 'Teams in cohort', v: L.teams.filter((t) => L.matches.find((m) => m.id === t.matchId && m.facultyId === me.id)).length }, { label: 'Events this month', v: L.events.length }];
      case 'head': {
        const n = L.passports.filter((p) => ['Verified', 'Shared'].includes(p.status) && store.user(p.studentId).orgId === me.orgId).length;
        const a = rules.aggregate(n);
        return [{ label: 'Verified Passports · live', v: a.value, hidden: a.hidden }, { label: 'Challenges this term', v: L.matches.filter((m) => m.institutionId === me.orgId).length }, { label: 'Mock sign-ups', v: store.pricing.signups.length }];
      }
      case 'open': return [{ label: 'Capabilities followed', v: L.follows.filter((f) => f.userId === me.id).length }, { label: 'Open opportunities', v: L.opportunities.filter((o) => o.open).length }, { label: 'Public events', v: L.events.filter((e) => e.visibility === 'public').length }];
      default: return [];
    }
  }

  LEAD.views.w = {
    title: (role) => ui.roleName(role),
    render(roleId) {
      const r = content.roleById[roleId];
      if (!r) return LEAD.views.notfound.render();
      if (store.session.role !== roleId) { store.session.role = roleId; store.session.userId = store.loop.defaultUser[roleId]; }
      const stagesTouched = r.journey.map((j) => j.stage);
      const cur = curStage[roleId] && stagesTouched.includes(curStage[roleId]) ? curStage[roleId] : stagesTouched[0];
      const j = r.journey.find((x) => x.stage === cur);
      const stage = content.stages.find((s) => s.id === j.stage);
      const feats = j.feats.map((id) => content.featureById[id]).filter(Boolean);
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: `${esc(r.lens)} lens · ${esc(r.access)}`, title: r.name + '.', lede: esc(r.goal), meta: `${ui.tag(r.person, 'ind')}<a class="btn small" href="#choose">Switch role</a>` })}
        ${ui.kpis(live(roleId).map((k) => Object.assign({ d: k.d || 'Live in this demo' }, k)))}
        <section class="section">
          ${ui.sectionHead('Journey', 'Your path through the loop', '', 'Highlighted stages are the ones this role touches. Select a stage.')}
          ${ui.loopStrip({ active: stagesTouched, cur, clickable: 'stage' })}
        </section>
        <div class="split">
          <section class="stack" style="gap:16px">
            <div class="row between"><div class="row"><span class="pxnum" style="font-size:52px">${stage.n}</span><div><div class="eyebrow">${esc(j.moment)}</div><h2>${esc(stage.id)}</h2></div></div>
              <a class="btn primary" href="#${esc(j.route)}">${esc(j.screen.cta)}</a></div>
            <p>${esc(stage.what)}.</p>
            <div class="grid g2">${feats.map((f) => `<article class="card tight">
              <div class="row between"><span class="label">${esc(f.id)}</span><span class="row" style="gap:6px">${ui.mode(f.mode)}<span class="pri">${esc(f.pri)}</span></span></div>
              <h4>${esc(f.name)}</h4><p style="font-size:14px">${esc(f.what)}</p>
              <p class="muted" style="font-size:13px"><b class="ink">Answers:</b> ${esc(f.evidence)}</p>
            </article>`).join('')}</div>
            ${j.handoff.length ? `<div class="stack" style="gap:8px"><span class="label">Hands off to</span><div class="row">${j.handoff.map((h) => `<button class="chip" data-act="as" data-role="${h}" data-to="w-${h}">→ ${esc(ui.roleName(h))}</button>`).join('')}</div></div>` : ''}
            <div class="journey card">${r.journey.map((x) => {
              const s = content.stages.find((y) => y.id === x.stage);
              return `<div class="jstep ${x.stage === cur ? 'cur' : ''}"><span class="pxnum">${s.n}</span><div class="stack" style="gap:6px">
                <div class="jmeta"><b class="ink">${esc(x.stage)}</b><span class="label">${esc(x.moment)}</span></div>
                <span>${x.feats.map((id) => esc((content.featureById[id] || { name: id }).name)).join(' · ')}</span>
                <div class="row"><button class="btn small" data-act="stage" data-stage="${esc(x.stage)}">View</button><a class="btn small ghost" href="#${esc(x.route)}">${esc(x.screen.cta)}</a></div>
              </div></div>`;
            }).join('')}</div>
          </section>
          <aside class="stack" style="gap:16px">
            ${ui.simFrame(j.screen.title, `<h4>${esc(j.screen.title)}</h4>${ui.kv(j.screen.rows)}<button class="btn small primary" data-go="${esc(j.route)}">${esc(j.screen.cta)}</button>`)}
            <div class="access">
              <div><span class="label">Sees</span><ul class="px-list">${r.sees.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
              <div><span class="label">Can do</span><ul class="px-list yes">${r.can.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
              <div><span class="label">Cannot</span><ul class="px-list no">${r.cannot.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
            </div>
          </aside>
        </div>
      </div>`;
    },
  };
  LEAD.act.stage = (el) => {
    curStage[store.session.role] = el.getAttribute('data-stage');
    LEAD.render({ keepScroll: true });
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
