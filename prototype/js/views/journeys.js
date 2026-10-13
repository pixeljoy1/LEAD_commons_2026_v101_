/* LEAD · role homes (My path, /w/[role]). */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, content, rules } = LEAD;
  const { esc } = ui;

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
      case 'industry': return [{ label: 'My intakes', v: L.demandSignals.filter((d) => d.orgId === me.orgId).length }, { label: 'My live projects', v: L.challenges.filter((c) => c.sponsorOrgId === me.orgId).length }, { label: 'Shared Passports', v: L.passports.filter((p) => rules.employerCanSee(p)).length }];
      case 'mentor': {
        const mins = L.sprints.filter((s) => s.mentorId === me.id).flatMap((s) => s.sessions.filter((x) => x.done)).reduce((a, x) => a + x.minutes, 0);
        return [{ label: 'Teams mentored', v: L.sprints.filter((s) => s.mentorId === me.id).length }, { label: 'Hours logged', v: (mins / 60).toFixed(1) }, { label: 'Submissions to score', v: L.submissions.filter((s) => s.status === 'In scoring').length }];
      }
      case 'faculty': return [{ label: 'Live Projects mapped', v: L.matches.filter((m) => m.facultyId === me.id && m.mapped).length }, { label: 'Teams in cohort', v: L.teams.filter((t) => L.matches.find((m) => m.id === t.matchId && m.facultyId === me.id)).length }, { label: 'Events this month', v: L.events.length }];
      case 'head': {
        const n = L.passports.filter((p) => ['Verified', 'Shared'].includes(p.status) && store.user(p.studentId).orgId === me.orgId).length;
        const a = rules.aggregate(n);
        return [{ label: 'Verified Passports · live', v: a.value, hidden: a.hidden }, { label: 'Live Projects this term', v: L.matches.filter((m) => m.institutionId === me.orgId).length }, { label: 'Mock sign-ups', v: store.pricing.signups.length }];
      }
      case 'open': return [{ label: 'Capabilities followed', v: L.follows.filter((f) => f.userId === me.id).length }, { label: 'Open-cohort calls', v: L.opportunities.filter((o) => o.open).length }, { label: 'Public events', v: L.events.filter((e) => e.visibility === 'public').length }];
      default: return [];
    }
  }

  LEAD.views.w = {
    title: (role) => ui.roleName(role),
    render(roleId) {
      const r = content.roleById[roleId];
      if (!r) return LEAD.views.notfound.render();
      const s = store.session;
      const other = s.role !== roleId || !s.signedIn;
      const stagesTouched = r.journey.map((j) => j.stage);
      const cur = curStage[roleId] && stagesTouched.includes(curStage[roleId]) ? curStage[roleId] : stagesTouched[0];
      const j = r.journey.find((x) => x.stage === cur);
      const stage = content.stages.find((s) => s.id === j.stage);
      const feats = j.feats.map((id) => content.featureById[id]).filter(Boolean);
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: `${esc(r.lens)} lens · ${esc(r.access)}`, title: r.name + '.', lede: esc(r.goal), meta: `${ui.tag(r.person, 'ind')}<a class="btn small" href="#choose">Switch persona</a>` })}
        ${other ? `<div class="notice"><span class="px cyan"></span><span>${s.signedIn ? `You are signed in as ${esc(ui.roleName(s.role))}. This is the ${esc(r.name)} path.` : `This is the ${esc(r.name)} path. Sign in to use it.`}</span><button class="btn small primary" data-act="as" data-role="${roleId}" data-to="w-${roleId}">Sign in as ${esc(r.short)}</button></div>` : ''}
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
