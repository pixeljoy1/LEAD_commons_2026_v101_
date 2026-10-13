/* LEAD · working loop, part A: Demand Map (W1), live projects and briefs, team workspace, sprints (W2), submission. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, content, rules } = LEAD;
  const { esc } = ui;
  const L = () => store.loop;
  const me = () => store.me();
  const role = () => store.session.role;
  const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

  /* Move an entity through its state machine with an audit entry; show a plain error if illegal. */
  function move(machine, obj, to, label) {
    try {
      store.commit(label || `${machine}: ${obj.status} → ${to}`, machine, obj, () => { obj.status = rules.transition(machine, obj.status, to); return obj; });
      return true;
    } catch (e) { ui.toast(e.message); return false; }
  }
  LEAD.move = move;

  const challengeOf = (team) => { const m = L().matches.find((x) => x.id === team.matchId); return m ? L().challenges.find((c) => c.id === m.challengeId) : null; };
  const matchOf = (team) => L().matches.find((x) => x.id === team.matchId);
  function myTeams() {
    const u = me();
    if (!u) return [];
    if (role() === 'student') return L().teams.filter((t) => t.memberIds.includes(u.id));
    if (role() === 'mentor') return L().teams.filter((t) => L().sprints.some((s) => s.teamId === t.id && s.mentorId === u.id));
    if (role() === 'faculty') return L().teams.filter((t) => { const m = matchOf(t); return m && m.facultyId === u.id; });
    if (role() === 'admin') return L().teams.slice();
    return [];
  }
  function activeTeam() {
    const ts = myTeams();
    return ts.find((t) => { const c = challengeOf(t); return c && ['Live', 'In assessment'].includes(c.status); }) || ts[0] || null;
  }
  LEAD.loopHelpers = { challengeOf, matchOf, myTeams, activeTeam };

  /* ================= Demand Map ================= */
  LEAD.views.demand = {
    title: () => 'Demand Map',
    render() {
      const r = role();
      const sig = L().demandSignals;
      const caps = L().capabilities;
      const asks = (slug) => sig.filter((d) => d.capSlug === slug).length + (caps.find((c) => c.slug === slug) || {}).asks;
      const themes = L().themes.filter((t) => t.published || r === 'admin');
      const top = caps.slice().sort((a, b) => asks(b.slug) - asks(a.slug)).slice(0, 6);
      const maxA = Math.max(...top.map((c) => asks(c.slug)));
      const intake = r === 'industry' ? intakeForm() : '';
      const mine = r === 'industry' ? sig.filter((d) => d.orgId === me().orgId) : [];
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'What employers need', title: 'Demand.', lede: 'What employers asked LEAD to build this term, in plain words. Industry states the need; the UMO team merges and publishes it.', meta: ui.simTag() })}
        <div class="split">
          <section class="section">
            ${ui.sectionHead('Skills Opportunity Map', 'Asked for this term')}
            <div class="card">${top.map((c) => `<div class="stack" style="gap:6px;padding:6px 0">
              <div class="row between"><a href="#skills-${c.slug}" class="ink" style="font-weight:600">${esc(c.name)}</a><span class="tnum ink">${asks(c.slug)} <span class="muted">companies</span></span></div>
              ${ui.meter(Math.round((asks(c.slug) / maxA) * 100))}
            </div>`).join('')}</div>
            <div class="grid g3">${themes.map((t) => `<article class="card tight"><div class="row between"><span class="label">Theme</span>${ui.status(t.published ? 'Published' : 'Draft', t.published ? 'Published' : 'Not published')}</div><h4>${esc(t.name)}</h4><p class="muted" style="font-size:13px">${t.capSlugs.map(ui.capName).join(', ')} · ${sig.filter((d) => d.themeId === t.id).length} intakes</p></article>`).join('')}</div>
          </section>
          <aside class="stack" style="gap:16px">
            ${intake}
            ${r === 'industry' ? `<div class="card"><span class="eyebrow">My intakes</span>${mine.map((d) => `<div class="row between" style="padding:8px 0;border-top:1px solid var(--line)"><span>${esc(ui.capName(d.capSlug))}<br><span class="muted" style="font-size:12.5px">${esc(d.problem)}</span></span>${ui.status(d.status)}</div>`).join('') || '<p class="muted">None yet.</p>'}</div>` : ''}
            ${r !== 'industry' && r !== 'admin' ? `<div class="card"><span class="eyebrow">Your view</span><p>${r === 'student' ? 'Pick a capability, then find a live project that needs it.' : 'Themes are public once the UMO team publishes them.'}</p><a class="btn" href="#projects">Open live projects</a></div>` : ''}
          </aside>
        </div>
        ${r === 'admin' ? opsQueue() : ''}
      </div>`;
    },
  };

  function intakeForm() {
    const opts = L().capabilities.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join('');
    return `<form class="card" data-form="intake">
      <span class="eyebrow">Five minutes</span><h3>State your capability need</h3>
      <label class="field">Capability<select id="in-cap" name="cap">${opts}</select></label>
      <label class="field">The problem, in your words<textarea id="in-problem" name="problem" required>Analysts accept the first framing of a problem and never test it.</textarea></label>
      <div class="form-grid"><label class="field">Needed by<input id="in-need" type="date" name="needBy" value="2027-03-31" required></label>
      <label class="field">Assessor seats you can offer<input id="in-seats" type="number" min="0" max="20" name="seats" value="3"></label>
      <label class="field">Mentor hours you can offer<input id="in-hours" type="number" min="0" name="hours" value="6"></label></div>
      <label class="check"><input type="checkbox" name="sensitive" id="in-sens"> Some data or IP is sensitive</label>
      <button class="btn primary" type="submit">Submit to UMO</button>
    </form>`;
  }

  LEAD.forms.intake = (fd) => {
    const u = me();
    const d = { id: uid('d'), orgId: u.orgId, by: u.id, capSlug: fd.get('cap'), problem: String(fd.get('problem') || '').trim(), needBy: fd.get('needBy'), seats: Number(fd.get('seats') || 0), mentorHours: Number(fd.get('hours') || 0), sensitive: !!fd.get('sensitive'), status: 'Submitted', themeId: null, at: Date.now() };
    if (!d.problem) { ui.toast('Describe the problem in a sentence.'); return; }
    store.commit('Intake submitted', 'demand_signal', d.id, () => { L().demandSignals.unshift(d); return d; });
    ui.toast('Submitted to the UMO team.');
  };

  function opsQueue() {
    const cols = ['Submitted', 'Reviewed', 'Merged', 'Published'];
    const themes = L().themes;
    return `<section class="section">
      ${ui.sectionHead('UMO queue', 'Review, merge, publish')}
      <div class="board">${cols.map((col) => {
        const items = L().demandSignals.filter((d) => d.status === col);
        return `<div class="col"><header><span class="label">${col}</span><span class="tnum muted">${items.length}</span></header>${items.map((d) => `<div class="item">
          <div class="row between"><span class="label">${esc(ui.orgName(d.orgId))}</span>${d.sensitive ? ui.tag('Sensitive', 'sim') : ''}</div>
          <h4>${esc(ui.capName(d.capSlug))}</h4><p style="font-size:13px">${esc(d.problem)}</p>
          <span class="muted" style="font-size:12px">Need by ${ui.fmtDate(d.needBy)} · ${d.seats} assessor seats · ${d.mentorHours} mentor h</span>
          ${col === 'Submitted' ? `<button class="btn small" data-act="dm-review" data-id="${d.id}">Mark reviewed</button>` : ''}
          ${col === 'Reviewed' ? `<label class="field"><span class="label">Merge into theme</span><select id="theme-${d.id}">${themes.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label>
            <div class="row"><button class="btn small" data-act="dm-merge" data-id="${d.id}">Merge</button><button class="btn small ghost" data-act="dm-own" data-id="${d.id}">Publish as own theme</button></div>` : ''}
          ${col === 'Merged' ? `<button class="btn small" data-act="dm-publish" data-id="${d.id}">Publish theme</button>` : ''}
          ${col === 'Published' ? `<button class="btn small ghost" data-act="dm-brief" data-id="${d.id}">Draft a brief</button>` : ''}
        </div>`).join('') || '<p class="muted" style="font-size:13px">Empty.</p>'}</div>`;
      }).join('')}</div>
    </section>`;
  }

  const sigById = (id) => L().demandSignals.find((d) => d.id === id);
  Object.assign(LEAD.act, {
    'dm-review'(el) { if (move('demand_signal', sigById(el.dataset.id), 'Reviewed', 'Intake reviewed')) ui.toast('Marked reviewed.'); },
    'dm-merge'(el) {
      const d = sigById(el.dataset.id); const sel = document.getElementById('theme-' + d.id);
      d.themeId = sel ? sel.value : L().themes[0].id;
      if (move('demand_signal', d, 'Merged', 'Intake merged into theme')) ui.toast('Merged into theme.');
    },
    'dm-own'(el) {
      const d = sigById(el.dataset.id);
      const t = { id: uid('th'), name: ui.capName(d.capSlug), capSlugs: [d.capSlug], published: true };
      store.commit('Theme created', 'demand_theme', t.id, () => { L().themes.push(t); return t; });
      d.themeId = t.id;
      if (move('demand_signal', d, 'Published', 'Intake published as its own theme')) ui.toast('Published on the Demand Map.');
    },
    'dm-publish'(el) {
      const d = sigById(el.dataset.id);
      const t = L().themes.find((x) => x.id === d.themeId);
      if (t && !t.published) store.commit('Theme published', 'demand_theme', t, () => { t.published = true; return t; });
      if (move('demand_signal', d, 'Published', 'Intake published')) ui.toast('Published. Students can see the theme.');
    },
    'dm-brief'(el) {
      const d = sigById(el.dataset.id);
      const owner = store.user(d.by);
      const c = { id: uid('c'), code: nextPj(), title: d.problem.length > 70 ? d.problem.slice(0, 67) + '…' : d.problem, sponsorOrgId: d.orgId, owner: owner ? owner.name : '', caps: [d.capSlug], status: 'Draft', context: '', problem: d.problem, solved: '', constraints: '', data: d.sensitive ? 'Sensitive. Must be sanitised before shaping.' : 'No sensitive data declared.', ambiguity: '', seats: d.seats, nda: { noPersonal: false, noConfidential: false, sanitised: false, ipTerms: false }, ipTerms: '', term: 'Winter 2026' };
      store.commit('Brief drafted from intake', 'challenge', c.id, () => { L().challenges.unshift(c); return c; });
      LEAD.go('project-' + c.id);
    },
  });

  /* ================= Live Projects ================= */
  function visibleChallenges() {
    const r = role(); const u = me(); const all = L().challenges;
    const campusOf = (c) => L().matches.filter((m) => m.challengeId === c.id).map((m) => m.institutionId);
    switch (r) {
      case 'student': case 'head': return all.filter((c) => ['Live', 'In assessment', 'Closed'].includes(c.status) && campusOf(c).includes(u.orgId));
      case 'faculty': return all.filter((c) => !['Draft'].includes(c.status));
      case 'industry': return all.filter((c) => c.sponsorOrgId === u.orgId);
      case 'mentor': return all.filter((c) => myTeams().some((t) => { const x = challengeOf(t); return x && x.id === c.id; }));
      case 'admin': return all;
      default: return null;
    }
  }

  const PIPE = rules.MACHINES.challenge;
  /* Plain names for the six project states. The state keys stay as the rules know them. */
  const PLAIN = { Draft: 'Being shaped', Shaped: 'Ready', Matched: 'Matched to a campus', Live: 'Running', 'In assessment': 'Being scored', Closed: 'Finished' };
  const plain = (s) => PLAIN[s] || s;
  const pjCode = (c) => c.code || 'PJ-?';
  function nextPj() { return 'PJ-' + (L().challenges.reduce((n, c) => Math.max(n, Number(String(c.code || '').split('-')[1]) || 0), 0) + 1); }
  function pipeline(status) {
    const i = PIPE.indexOf(status);
    return `<div class="stepper" aria-label="Status ${esc(plain(status))}">${PIPE.map((s, k) => `<span class="${k <= i ? 'on' : ''}">${esc(plain(s))}</span>`).join('')}</div>`;
  }

  /* "How a Live Project works": six steps, each one a page. */
  const HOW = [
    ['A company brings a problem', 'Companies say what they need.', '#demand'],
    ['UMO shapes it', 'The brief is made safe to share and matched to a campus.', '#projects'],
    ['A team forms', 'Students join a team and open the brief.', '#team'],
    ['A mentor coaches', 'Three short sessions with a practitioner.', '#sprints'],
    ['The team hands in', 'Deliverable, decision log and a note on AI use.', '#submit'],
    ['Professionals score it', 'Scored blind. A verified Passport is earned.', '#assess'],
  ];
  function howItWorks(cur) {
    return `<section class="section" aria-label="How a Live Project works">${ui.sectionHead('', 'How a Live Project works', '', 'A Live Project is a real problem from a real company, worked on by a student team with a mentor, then scored by professionals.')}
      <ol class="how-steps">${HOW.map((h, i) => `<li class="${cur === i ? 'cur' : ''}"><a href="${h[2]}"><span class="pxnum">${i + 1}</span><b>${esc(h[0])}</b><small>${esc(h[1])}</small></a></li>`).join('')}</ol></section>`;
  }
  const FIRST = {
    student: ['Find a project', 'Open one that is running on your campus, then join its team.', '#projects'],
    faculty: ['Fit one into your module', 'Open a project, map it to your module and credit window.', '#projects'],
    head: ['See your campus projects', 'Every project running on your campus, with its outcome when it finishes.', '#projects'],
    industry: ['Bring a problem', 'Tell UMO what you need. It becomes a brief for a student team.', '#demand'],
    mentor: ['Coach a team', 'See the teams you mentor and book the next session.', '#sprints'],
    open: ['Try an open project', 'Open-cohort projects are free and need no campus.', '#jobs'],
    admin: ['Shape and match', 'Make briefs safe to share and match them to campuses.', '#projects'],
  };
  function firstAction(r) {
    const f = FIRST[r]; if (!f) return '';
    return `<div class="card first-action"><span class="eyebrow">What you can do first</span><h3>${esc(f[0])}</h3><p>${esc(f[1])}</p><a class="btn primary" href="${f[2]}">${esc(f[0])}</a></div>`;
  }

  LEAD.views.challenges = {
    title: () => 'Live Projects',
    render() {
      const list = visibleChallenges();
      if (list === null) {
        return `<div class="page wrap">${ui.hero({ compact: true, eyebrow: 'Live Projects', title: 'Live Projects.', lede: 'Campus live projects are for enrolled teams. The open community sees open-cohort live projects only.' })}
          ${howItWorks(-1)}<div class="card"><h3>Open cohort · Framing project</h3><p>Applications open to the open community.</p><a class="btn primary" href="#jobs">Apply</a></div></div>`;
      }
      const r = role();
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'Live Projects · real work with a team and a mentor', title: 'Live Projects.', lede: 'A real problem from a real company, worked on by a student team with a mentor, then scored by professionals. Each one is shaped by the UMO team and matched to a campus.', meta: `${ui.simTag()}${r === 'industry' ? '<a class="btn primary" href="#demand">State a new need</a><a class="btn" href="#join-sponsor">Sponsor a live project</a>' : ''}` })}
        ${howItWorks(-1)}${firstAction(r)}
        <div class="grid g2" id="project-list">${list.map((c) => `<a class="card" href="#project-${c.id}">
          <div class="row between"><span class="row" style="gap:8px"><span class="lmcode">${esc(pjCode(c))}</span><span class="label">${esc(ui.orgName(c.sponsorOrgId))}</span></span>${ui.status(c.status, plain(c.status))}</div>
          <h3>${esc(c.title)}</h3>
          <p style="font-size:14px">${esc(c.problem)}</p>
          <div class="pill-list">${c.caps.map((s) => `<span class="chip">${esc(ui.capName(s))}</span>`).join('')}</div>
          <div style="overflow-x:auto">${pipeline(c.status)}</div>
        </a>`).join('') || '<div class="empty">No live projects for this role yet.</div>'}</div>
      </div>`;
    },
  };

  LEAD.views.challenge = {
    title: () => 'Live Project brief',
    render(id) {
      const c = L().challenges.find((x) => x.id === id);
      if (!c) return LEAD.views.notfound.render();
      const vis = visibleChallenges();
      if (vis === null || !vis.some((x) => x.id === c.id)) return ui.guard(['admin', 'industry', 'faculty'], 'This brief');
      const r = role(); const u = me();
      const nda = rules.ndaSafe(c.nda);
      const matches = L().matches.filter((m) => m.challengeId === c.id);
      const teams = L().teams.filter((t) => matches.some((m) => m.id === t.matchId));
      const canEdit = (r === 'admin' || (r === 'industry' && c.sponsorOrgId === u.orgId)) && ['Draft', 'Shaped'].includes(c.status);
      const field = (k, label, long) => canEdit
        ? `<label class="field">${label}${long ? `<textarea id="cf-${k}" data-on="cfield" data-id="${c.id}" data-k="${k}">${esc(c[k])}</textarea>` : `<input id="cf-${k}" data-on="cfield" data-id="${c.id}" data-k="${k}" value="${esc(c[k])}">`}</label>`
        : `<div class="stack" style="gap:4px"><span class="label">${label}</span><p class="${c[k] ? 'ink' : 'muted'}">${esc(c[k] || 'Not written yet.')}</p></div>`;
      const myFacultyMatch = r === 'faculty' ? matches.find((m) => m.facultyId === u.id && !m.mapped) : null;
      return `<div class="page wrap">
        <nav class="crumbs"><a href="#projects">Live Projects</a><span>/</span><span>${esc(pjCode(c))}</span></nav>
        <div class="row between"><div class="stack" style="gap:6px"><span class="eyebrow">${esc(pjCode(c))} · ${esc(ui.orgName(c.sponsorOrgId))} · owner ${esc(c.owner || '—')} · ${esc(c.term)}</span><h1 style="font-size:clamp(30px,4.6vw,48px)">${esc(c.title)}</h1></div>${ui.status(c.status)}</div>
        <div style="overflow-x:auto">${pipeline(c.status)}</div>
        <div class="split">
          <section class="card" style="gap:18px">
            <div class="row between"><span class="eyebrow">One-page brief</span>${canEdit ? ui.tag('Editable', 'info') : ''}</div>
            ${field('context', 'Context', true)}
            ${field('problem', 'The problem as the company sees it', true)}
            ${field('solved', 'What “solved” means (success criteria)', true)}
            ${field('constraints', 'Constraints', true)}
            ${field('data', 'Sanitised data note', true)}
            ${field('ambiguity', 'Deliberate ambiguity', true)}
            <div class="row" style="gap:20px"><span><span class="label">Capabilities</span><br>${c.caps.map((s) => `<a href="#skills-${s}">${esc(ui.capName(s))}</a>`).join(', ')}</span><span><span class="label">Assessor seats</span><br><b class="ink">${c.seats}</b></span><span><span class="label">IP terms</span><br><b class="ink">${esc(c.ipTerms || 'Not chosen')}</b></span></div>
          </section>
          <aside class="stack" style="gap:16px">
            <div class="card">
              <div class="row between"><span class="eyebrow">R6 · NDA-safe check</span>${nda.ok ? ui.status('Live', 'Passes') : ui.status('Draft', `${nda.missing.length} to fix`)}</div>
              ${rules.NDA_CHECKS.map(([k, label]) => `<label class="check"><input type="checkbox" id="nda-${k}" data-on="nda" data-id="${c.id}" data-k="${k}" ${c.nda[k] ? 'checked' : ''} ${canEdit ? '' : 'disabled'}> ${esc(label)}</label>`).join('')}
              ${canEdit ? `<label class="field">IP terms<select id="cf-ip" data-on="ipterms" data-id="${c.id}"><option value="">Choose…</option>${['Sponsor licence, student credit', 'Shared licence', 'Student owns, sponsor may use'].map((o) => `<option ${c.ipTerms === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>` : ''}
              ${!nda.ok ? `<div class="msg err">${esc(nda.reason)}</div>` : ''}
              ${c.status === 'Draft' && canEdit ? `<button class="btn primary" data-act="ch-shape" data-id="${c.id}" ${nda.ok ? '' : 'disabled'}>Mark shaped</button>` : ''}
            </div>
            ${r === 'admin' && ['Shaped', 'Matched', 'Live'].includes(c.status) ? `<form class="card" data-form="match" data-id="${c.id}">
              <span class="eyebrow">Match to a campus</span>
              <div class="form-grid"><label class="field">Campus<select name="campus" id="mt-campus">${L().orgs.filter((o) => o.kind === 'institution').map((o) => `<option value="${o.id}">${esc(o.name)}</option>`).join('')}</select></label>
              <label class="field">Faculty lead<select name="faculty" id="mt-fac">${L().users.filter((x) => x.role === 'faculty').map((f) => `<option value="${f.id}">${esc(f.name)} · ${esc(ui.orgName(f.orgId))}</option>`).join('')}</select></label></div>
              <button class="btn primary" type="submit">Match</button>
            </form>` : ''}
            ${myFacultyMatch ? `<form class="card" data-form="map" data-id="${myFacultyMatch.id}">
              <span class="eyebrow">Live Project-in-a-course kit</span><h3>Map it to a module</h3>
              <label class="field">Module<input name="module" id="map-mod" value="Studio 3" required></label>
              <label class="field">Credit window<select name="credit" id="map-credit"><option>Industry-taught credit window · 2 credits</option><option>Studio elective · 4 credits</option></select></label>
              <button class="btn primary" type="submit">Confirm mapping</button><span class="muted" style="font-size:13px">Confirming makes the live project Live for your campus.</span>
            </form>` : ''}
            <div class="card"><span class="eyebrow">Matched campuses</span>${matches.map((m) => `<div class="row between" style="padding:8px 0;border-top:1px solid var(--line)"><span><b class="ink">${esc(ui.orgName(m.institutionId))}</b> · ${esc(m.cohort)}<br><span class="muted" style="font-size:12.5px">${esc(ui.nameOf(m.facultyId))} · ${esc(m.module || 'module not mapped')}</span></span>${m.mapped ? ui.status('Live', 'Mapped') : ui.status('Matched', 'Awaiting faculty')}</div>`).join('') || '<p class="muted">Not matched yet.</p>'}</div>
            ${teams.length && (r !== 'industry') ? `<div class="card"><span class="eyebrow">Teams</span>${teams.map((t) => `<a class="row between" style="padding:8px 0;border-top:1px solid var(--line);text-decoration:none" href="#team-${t.id}"><span class="ink">${esc(t.name)}</span><span class="muted">${t.memberIds.length} members</span></a>`).join('')}</div>` : ''}
            ${r === 'admin' && c.status === 'Live' ? `<button class="btn" data-act="ch-assess" data-id="${c.id}">Open assessment</button>` : ''}
            ${r === 'admin' && c.status === 'In assessment' ? `<button class="btn" data-act="ch-close" data-id="${c.id}">Close and ask the sponsor</button>` : ''}
          </aside>
        </div>
      </div>`;
    },
  };

  const chById = (id) => L().challenges.find((c) => c.id === id);
  LEAD.on.cfield = (el) => { const c = chById(el.dataset.id); c[el.dataset.k] = el.value; };
  LEAD.on.nda = (el) => {
    const c = chById(el.dataset.id);
    store.commit(`NDA check: ${el.dataset.k} ${el.checked ? 'ticked' : 'cleared'}`, 'challenge', c, () => { c.nda[el.dataset.k] = el.checked; return c; });
  };
  LEAD.on.ipterms = (el) => {
    const c = chById(el.dataset.id);
    store.commit('IP terms chosen', 'challenge', c, () => { c.ipTerms = el.value; c.nda.ipTerms = !!el.value; return c; });
  };
  Object.assign(LEAD.act, {
    'ch-shape'(el) {
      const c = chById(el.dataset.id);
      const chk = rules.ndaSafe(c.nda);
      if (!chk.ok) { ui.toast(chk.reason); return; }
      if (move('challenge', c, 'Shaped', 'Brief shaped')) ui.toast('Shaped. Ready to match.');
    },
    'ch-assess'(el) { if (move('challenge', chById(el.dataset.id), 'In assessment')) ui.toast('Assessment open.'); },
    'ch-close'(el) {
      const c = chById(el.dataset.id);
      if (move('challenge', c, 'Closed')) {
        if (!L().problemRecords.some((p) => p.challengeId === c.id)) store.commit('Problem record opened', 'problem_record', c.id, () => { const p = { id: uid('pr'), challengeId: c.id, result: null, confirmedBy: null, note: 'Awaiting the sponsor’s named owner.' }; L().problemRecords.push(p); return p; });
        ui.toast('Closed. The sponsor confirms what it solved.');
      }
    },
  });
  LEAD.forms.match = (fd, form) => {
    const c = chById(form.dataset.id);
    const m = { id: uid('mt'), challengeId: c.id, institutionId: fd.get('campus'), cohort: 'Cohort ' + ui.orgName(fd.get('campus')).slice(-1), term: c.term, facultyId: fd.get('faculty'), module: '', mapped: false };
    store.commit('Live Project matched to campus', 'challenge_match', m.id, () => { L().matches.push(m); return m; });
    if (c.status === 'Shaped') move('challenge', c, 'Matched');
    ui.toast(`Matched to ${ui.orgName(m.institutionId)}. Faculty maps it next.`);
  };
  LEAD.forms.map = (fd, form) => {
    const m = L().matches.find((x) => x.id === form.dataset.id);
    store.commit('Live Project mapped to module', 'challenge_match', m, () => { m.module = fd.get('module'); m.credit = fd.get('credit'); m.mapped = true; return m; });
    const c = chById(m.challengeId);
    if (c.status === 'Matched') move('challenge', c, 'Live', 'Live Project is live');
    if (!L().teams.some((t) => t.matchId === m.id)) {
      const studs = L().users.filter((x) => x.role === 'student' && x.orgId === m.institutionId).slice(0, 3).map((x) => x.id);
      store.commit('Team formed', 'team', m.id, () => { const t = { id: uid('t'), matchId: m.id, name: 'Team Plover', memberIds: studs, milestones: [{ t: 'Frame the problem', done: false }, { t: 'Interview', done: false }, { t: 'Prototype', done: false }, { t: 'Test', done: false }, { t: 'Defend at review', done: false }], decisions: [], thread: [] }; L().teams.push(t); return t; });
    }
    ui.toast('Mapped. The live project is Live for your campus.');
  };

  /* ================= Team workspace ================= */
  LEAD.views.team = {
    title: () => 'My team',
    render(id) {
      const r = role();
      if (!['student', 'mentor', 'faculty', 'admin'].includes(r)) return ui.guard(['student', 'mentor', 'faculty'], 'My team');
      const t = id ? L().teams.find((x) => x.id === id) : activeTeam();
      if (!t) return `<div class="page wrap"><div class="empty"><h3>No team yet.</h3><p>Join a live project on your campus first.</p><a class="btn" href="#projects">Open live projects</a></div></div>`;
      if (!myTeams().some((x) => x.id === t.id)) return ui.guard(['student', 'mentor', 'faculty'], 'This team’s workspace');
      const c = challengeOf(t); const m = matchOf(t);
      const sprint = L().sprints.find((s) => s.teamId === t.id);
      const canWrite = r === 'student';
      const canThread = r === 'student' || (r === 'mentor' && sprint && sprint.mentorId === me().id);
      const doneN = t.milestones.filter((x) => x.done).length;
      const sub = L().submissions.find((s) => s.teamId === t.id);
      return `<div class="page wrap">
        <nav class="crumbs"><a href="#projects">Live Projects</a><span>/</span><a href="#project-${c.id}">${esc(c.title)}</a><span>/</span><span>${esc(t.name)}</span></nav>
        ${ui.hero({ compact: true, eyebrow: `${esc(pjCode(c))} · My team · ${esc(ui.orgName(m.institutionId))} · ${esc(m.module || '')}`, title: t.name + '.', lede: esc(c.ambiguity || c.problem), meta: `${ui.status(c.status)}${ui.tag(`Milestone ${Math.min(doneN + 1, t.milestones.length)} of ${t.milestones.length}`, 'ind')}${ui.tag(`${t.memberIds.length} of 4 joined`, '')}${r === 'faculty' ? ui.tag('Read only · own cohort', 'info') : ''}` })}
        <div class="split">
          <section class="stack" style="gap:20px">
            <div class="card">
              <div class="row between"><span class="eyebrow">Decision log · ${t.decisions.length} entries</span><span class="muted" style="font-size:13px">Defended at review</span></div>
              ${canWrite ? `<form class="grid" style="gap:10px" data-form="decision" data-id="${t.id}">
                <label class="field">Decision<input id="dl-dec" name="decision" placeholder="What did you choose?" required></label>
                <div class="form-grid"><label class="field">Why<input id="dl-why" name="reason" placeholder="The reason, with evidence" required></label>
                <label class="field">Alternatives considered<input id="dl-alt" name="alt" placeholder="What you did not choose"></label></div>
                <div><button class="btn primary" type="submit">Add a decision</button></div></form>` : ''}
              <div class="table-wrap" style="border:0"><table><thead><tr><th>#</th><th>Decision</th><th>Why</th><th>Instead of</th><th>By</th></tr></thead><tbody>
                ${t.decisions.map((d, i) => `<tr><td class="tnum">${i + 1}</td><td><b>${esc(d.decision)}</b></td><td>${esc(d.reason)}</td><td class="muted">${esc(d.alt || '—')}</td><td style="white-space:nowrap">${esc(ui.nameOf(d.by))}<br><span class="muted" style="font-size:12px">${ui.fmtDate(d.at)}</span></td></tr>`).join('') || '<tr><td colspan="5" class="muted">No decisions yet.</td></tr>'}
              </tbody></table></div>
            </div>
            <div class="card">
              <div class="row between"><span class="eyebrow">Private feedback thread</span>${ui.tag('Team + assigned mentor only', 'ind')}</div>
              <div class="thread">${t.thread.map((x) => { const u = store.user(x.by); return `<div class="bubble ${u && u.role === 'mentor' ? 'mentor' : ''}"><span class="label">${esc(u ? u.name : x.by)} · ${u ? esc(ui.roleName(u.role)) : ''} · ${ui.fmtDate(x.at)}</span><p>${esc(x.body)}</p></div>`; }).join('') || '<p class="muted">No messages yet.</p>'}</div>
              ${canThread ? `<form class="row" data-form="thread" data-id="${t.id}" style="flex-wrap:nowrap"><label class="sr" for="th-body">Message</label><input id="th-body" name="body" placeholder="Write to your ${r === 'mentor' ? 'team' : 'mentor'}" required><button class="btn" type="submit">Send</button></form>` : '<p class="muted" style="font-size:13px">You can read this thread, not write to it.</p>'}
            </div>
          </section>
          <aside class="stack" style="gap:16px">
            <div class="card"><span class="eyebrow">Milestones</span>${t.milestones.map((x, i) => `<label class="check"><input type="checkbox" id="ms-${t.id}-${i}" data-on="milestone" data-id="${t.id}" data-i="${i}" ${x.done ? 'checked' : ''} ${canWrite ? '' : 'disabled'}> ${esc(x.t)}</label>`).join('')}${ui.meter(Math.round((doneN / Math.max(1, t.milestones.length)) * 100))}</div>
            <div class="card"><span class="eyebrow">Team</span><ul class="px-list">${t.memberIds.map((x) => `<li>${esc(ui.nameOf(x))}</li>`).join('')}</ul>${sprint ? `<p style="font-size:14px">Mentor: <b class="ink">${esc(ui.nameOf(sprint.mentorId))}</b> · sprint ${ui.status(sprint.status)}</p>` : ''}</div>
            <div class="card"><span class="eyebrow">Path for this live project</span><ul class="px-list"><li>Problem framing · done</li><li>Interviewing stakeholders · in progress</li><li>Defending a decision · next</li></ul><a class="btn small" href="https://umodesign.school" target="_blank" rel="noopener">Course content at UMO Design School</a></div>
            <div class="btn-row"><a class="btn" href="#sprints">Mentor session</a>${r === 'student' ? `<a class="btn primary" href="#submit">${sub ? 'View submission' : 'Submit'}</a>` : ''}</div>
          </aside>
        </div>
      </div>`;
    },
  };
  const teamById = (id) => L().teams.find((t) => t.id === id);
  LEAD.forms.decision = (fd, form) => {
    const t = teamById(form.dataset.id);
    const d = { by: me().id, decision: String(fd.get('decision')).trim(), reason: String(fd.get('reason')).trim(), alt: String(fd.get('alt') || '').trim(), at: Date.now() };
    if (!d.decision || !d.reason) { ui.toast('Write the decision and why.'); return; }
    store.commit('Decision logged', 'decision_log_entry', t.id, () => { t.decisions.push(d); return d; });
    ui.toast('Decision added to the log.');
  };
  LEAD.forms.thread = (fd, form) => {
    const t = teamById(form.dataset.id);
    const body = String(fd.get('body') || '').trim();
    if (!body) return;
    store.commit('Thread message', 'message', t.id, () => { const x = { by: me().id, body, at: Date.now() }; t.thread.push(x); return x; });
  };
  LEAD.on.milestone = (el) => {
    const t = teamById(el.dataset.id); const i = Number(el.dataset.i);
    store.commit(`Milestone ${el.checked ? 'done' : 'reopened'}`, 'milestone', t.id, () => { t.milestones[i].done = el.checked; return t.milestones[i]; });
  };

  /* ================= Mentor sessions ================= */
  LEAD.views.sprints = {
    title: () => 'Mentor sessions',
    render() {
      const r = role(); const u = me();
      if (!['student', 'mentor', 'admin', 'faculty'].includes(r)) return ui.guard(['student', 'mentor', 'admin'], 'Mentor sessions');
      const hoursOf = (mid) => L().sprints.filter((s) => s.mentorId === mid).flatMap((s) => s.sessions.filter((x) => x.done)).reduce((a, x) => a + x.minutes, 0) / 60;
      let main = '';
      if (r === 'student' || r === 'faculty') {
        const t = activeTeam();
        const sp = t && L().sprints.find((s) => s.teamId === t.id);
        main = !t ? '<div class="empty">No team yet.</div>' : !sp
          ? `<div class="card"><h3>No mentor session yet</h3><p>Three 45-minute sessions with an industry mentor.</p>${r === 'student' ? `<button class="btn primary" data-act="sp-request" data-team="${t.id}">Request a mentor session</button>` : ''}</div>`
          : sprintCard(sp, r === 'student');
      } else if (r === 'mentor') {
        main = L().sprints.filter((s) => s.mentorId === u.id).map((s) => sprintCard(s, false, true)).join('') || '<div class="empty">No teams assigned yet.</div>';
      } else {
        main = `<div class="stack">${L().sprints.map((s) => sprintCard(s, false, false, true)).join('')}</div>`;
      }
      const mentors = L().users.filter((x) => x.role === 'mentor');
      const pool = r === 'admin' ? `<section class="section">${ui.sectionHead('Mentor pool and credit ledger', 'Mentor pool')}
        <div class="table-wrap"><table><thead><tr><th>Mentor</th><th>Practice</th><th>Verified</th><th class="num">Hours offered</th><th class="num">Hours logged</th><th class="num">Teams</th><th></th></tr></thead><tbody>
          ${mentors.map((x) => `<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.title || '')}</td><td>${x.verified ? ui.status('Verified') : ui.status('Proposed', 'Not yet')}</td><td class="num">${x.hoursOffered || 0}</td><td class="num">${hoursOf(x.id).toFixed(1)}</td><td class="num">${L().sprints.filter((s) => s.mentorId === x.id).length}</td><td>${x.verified ? '' : `<button class="btn small" data-act="mentor-verify" data-id="${x.id}">Approve</button>`}</td></tr>`).join('')}
        </tbody></table></div><p class="muted" style="font-size:13px">Seed the pool from UMO Mentors & Catalysts, each person by consent.</p></section>` : '';
      const ledger = r === 'mentor' ? `<div class="card"><span class="eyebrow">Hours ledger</span><div class="kpi" style="padding:0;background:none"><span class="v">${hoursOf(u.id).toFixed(1)} h</span><span class="d">This term · ${L().sprints.filter((s) => s.mentorId === u.id).length} teams</span></div>
        <span class="label">Distinctions</span><div class="pill-list"><span class="chip">Mentor · ${Math.floor(hoursOf(u.id))} h</span><span class="chip">Assessor · 1 day</span></div></div>` : '';
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'Live Projects · step 4 of 6', title: 'Mentor sessions.', lede: 'Three 45-minute sessions with a practitioner. Every hour is counted.', meta: ui.simTag() })}
        <div class="split"><section class="stack">${main}</section><aside class="stack">${ledger}<div class="card"><span class="eyebrow">Conflict rule · R5</span><p>A mentor never scores the team they mentored. The scoring screen checks this.</p></div></aside></div>
        ${pool}
      </div>`;
    },
  };

  function sprintCard(sp, student, mentor, steward) {
    const t = teamById(sp.teamId); const c = challengeOf(t);
    const done = sp.sessions.filter((x) => x.done).length;
    return `<article class="card">
      <div class="row between"><span class="eyebrow">${esc(t.name)} · ${esc(c ? c.title : '')}</span>${ui.status(sp.status)}</div>
      <h3>Mentor: ${sp.mentorId ? esc(ui.nameOf(sp.mentorId)) : '<span class="muted">not assigned</span>'}</h3>
      <div class="stack" style="gap:0">${sp.sessions.map((s, i) => `<div class="score-row"><span><b class="ink">Session ${i + 1}</b> · ${s.minutes} min<br><span class="muted" style="font-size:13px">${s.at ? ui.fmtTime(s.at) : 'Not booked'}</span></span>
        <span class="row">${s.done ? ui.status('Complete', 'Held') : (s.at ? ui.status('Booked') : '')}
          ${student && !s.at && sp.mentorId ? `<input type="datetime-local" id="bk-${sp.id}-${i}" value="2026-10-27T16:00" aria-label="Session time" style="width:auto"><button class="btn small primary" data-act="sp-book" data-id="${sp.id}" data-i="${i}">Book</button>` : ''}
          ${mentor && s.at && !s.done ? `<button class="btn small primary" data-act="sp-held" data-id="${sp.id}" data-i="${i}">Mark held</button>` : ''}
        </span></div>`).join('')}</div>
      ${ui.meter(Math.round((done / 3) * 100), { px: true })}
      ${steward && !sp.mentorId ? `<div class="row"><select id="as-${sp.id}" aria-label="Mentor">${L().users.filter((x) => x.role === 'mentor' && x.verified).map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select><button class="btn small" data-act="sp-assign" data-id="${sp.id}">Assign mentor</button></div>` : ''}
      ${student || mentor ? `<a class="btn small ghost" href="#team-${t.id}">Open team notes</a>` : ''}
    </article>`;
  }

  const spById = (id) => L().sprints.find((s) => s.id === id);
  Object.assign(LEAD.act, {
    'sp-request'(el) {
      const sp = { id: uid('sp'), teamId: el.dataset.team, mentorId: null, status: 'Requested', sessions: [0, 1, 2].map(() => ({ at: null, minutes: 45, done: false })) };
      store.commit('Mentor session requested', 'mentor_sprint', sp.id, () => { L().sprints.push(sp); return sp; });
      ui.toast('Requested. The UMO team assigns a mentor.');
    },
    'sp-assign'(el) {
      const sp = spById(el.dataset.id); const sel = document.getElementById('as-' + sp.id);
      store.commit('Mentor assigned', 'mentor_sprint', sp, () => { sp.mentorId = sel.value; return sp; });
      move('mentor_sprint', sp, 'Booked');
    },
    'sp-book'(el) {
      const sp = spById(el.dataset.id); const i = Number(el.dataset.i);
      const v = document.getElementById(`bk-${sp.id}-${i}`).value;
      if (!v) { ui.toast('Pick a time.'); return; }
      store.commit(`Session ${i + 1} booked`, 'session', sp, () => { sp.sessions[i].at = Date.parse(v); return sp; });
      if (sp.status === 'Requested') move('mentor_sprint', sp, 'Booked');
      ui.toast(`Session ${i + 1} booked with ${ui.nameOf(sp.mentorId)}.`);
    },
    'sp-held'(el) {
      const sp = spById(el.dataset.id); const i = Number(el.dataset.i);
      store.commit(`Session ${i + 1} held`, 'session', sp, () => { sp.sessions[i].done = true; return sp; });
      if (sp.status === 'Booked') move('mentor_sprint', sp, 'In progress');
      if (sp.sessions.every((x) => x.done) && sp.status === 'In progress') { move('mentor_sprint', sp, 'Complete'); ui.toast('Sprint complete. Hours added to your ledger.'); }
    },
    'mentor-verify'(el) {
      const m = store.user(el.dataset.id);
      store.commit('Mentor approved', 'mentor_profile', m, () => { m.verified = true; return m; });
    },
  });

  /* ================= Submission pack ================= */
  const drafts = {};
  LEAD.views.submit = {
    title: () => 'Hand in',
    render() {
      if (role() !== 'student') return ui.guard(['student'], 'The submission pack');
      const t = activeTeam();
      if (!t) return '<div class="page wrap"><div class="empty">No team yet.</div></div>';
      const c = challengeOf(t);
      const sub = L().submissions.find((s) => s.teamId === t.id);
      const d = drafts[t.id] || (drafts[t.id] = { deliverable: 'https://example.org/kestrel-onboarding', reflection: 'We chose first-time account holders. With one sprint less we would cut the desktop flow.', ai: '' });
      if (sub) {
        return `<div class="page wrap">${ui.hero({ compact: true, eyebrow: `Live Projects · step 5 of 6 · ${esc(t.name)}`, title: 'Handed in.', lede: 'Your pack is with the assessors. They score blind: no names, no institution, until every score is locked.', meta: ui.status(sub.status) })}
          <div class="card">${ui.kv([['Deliverable', sub.deliverable], ['Decision log', `${t.decisions.length} entries attached`], ['AI-use declaration', sub.ai], ['Submitted', ui.fmtDate(sub.at)]])}</div></div>`;
      }
      const check = rules.canSubmit(d);
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: `Live Projects · step 5 of 6 · ${esc(c.title)}`, title: 'Hand in.', lede: 'Deliverable, decision log, reflection and a note on how you used AI. You cannot hand in without the AI note.' })}
        <form class="card" data-form="submit" data-id="${t.id}" style="max-width:820px">
          <label class="field">Deliverable link<input id="sb-del" name="deliverable" data-on="subdraft" data-id="${t.id}" data-k="deliverable" value="${esc(d.deliverable)}" required></label>
          <div class="notice"><span class="px"></span>Decision log attached automatically · <b class="ink">${t.decisions.length} entries</b></div>
          <label class="field">Reflection<span class="hint">What would you cut with one sprint less?</span><textarea id="sb-ref" name="reflection" data-on="subdraft" data-id="${t.id}" data-k="reflection">${esc(d.reflection)}</textarea></label>
          <label class="field">AI-use declaration<span class="hint">Say how AI was used. Write “No AI used” if none was.</span><textarea id="sb-ai" name="ai" data-on="subdraft" data-id="${t.id}" data-k="ai" placeholder="For example: used an AI tool to cluster interview notes; every quote checked against recordings.">${esc(d.ai)}</textarea></label>
          <div id="sb-check">${check.ok ? '<div class="msg ok">Ready to submit.</div>' : `<div class="msg err">${esc(check.reason)}</div>`}</div>
          <div class="btn-row"><button class="btn primary" type="submit" id="sb-go" ${check.ok ? '' : 'disabled'}>Submit</button><span class="muted" style="font-size:13px">Submitting locks edits while scoring runs.</span></div>
        </form>
      </div>`;
    },
  };
  LEAD.on.subdraft = (el) => {
    const d = drafts[el.dataset.id]; d[el.dataset.k] = el.value;
    const check = rules.canSubmit(d);
    const box = document.getElementById('sb-check'); const btn = document.getElementById('sb-go');
    if (box) box.innerHTML = check.ok ? '<div class="msg ok">Ready to submit.</div>' : `<div class="msg err">${esc(check.reason)}</div>`;
    if (btn) btn.disabled = !check.ok;
  };
  LEAD.forms.submit = (fd, form) => {
    const t = teamById(form.dataset.id); const d = drafts[t.id];
    const check = rules.canSubmit(d);
    if (!check.ok) { ui.toast(check.reason); return; }
    const sub = { id: uid('sub'), teamId: t.id, deliverable: d.deliverable, reflection: d.reflection, ai: d.ai, status: 'Draft', at: Date.now() };
    store.commit('Submission created', 'submission', sub.id, () => { L().submissions.push(sub); return sub; });
    move('submission', sub, 'Submitted');
    move('submission', sub, 'In scoring');
    ui.toast('Submitted. Now in scoring.');
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
