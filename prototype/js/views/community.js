/* LEAD · Skills Guide (what each design skill means) and the Community page (calendar, circles, ways to give back). */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store } = LEAD;
  const { esc } = ui;
  const L = () => store.loop;
  const me = () => store.me();
  const role = () => store.session.role;
  const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

  const lex = { q: '' };
  const LEVEL_TEXT = [
    (n) => `Not yet: can describe ${n.toLowerCase()} when shown an example.`,
    (n) => `Developing: applies ${n.toLowerCase()} with guidance on a scoped brief.`,
    (n) => `Secure: applies ${n.toLowerCase()} unaided on a real, ambiguous problem.`,
    (n) => `Strong: defends choices about ${n.toLowerCase()} to industry reviewers and coaches others.`,
  ];
  const asksOf = (c) => c.asks + L().demandSignals.filter((d) => d.capSlug === c.slug).length;

  /* Plain tags for where a skill sits. The room's own codes stay in the data, not on screen. */
  const plainPos = (pos) => (/Do First/.test(pos) ? 'Core skill' : /Plan For/.test(pos) ? 'Build over time' : /Quick Wins/.test(pos) ? 'Quick win' : /Bud/.test(pos) ? 'Growing skill' : 'On our watch list');
  const agreed = (c) => c.status === 'cosigned';

  /* ================= Skills Guide ================= */
  LEAD.views.skills = {
    title: (slug) => (slug ? ui.capName(slug) : 'Skills Guide'),
    render(slug) {
      if (slug) return detail(slug);
      const q = lex.q.trim().toLowerCase();
      const list = L().capabilities.filter((c) => !q || (c.name + ' ' + c.definition).toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
      const groups = {};
      list.forEach((c) => { const k = c.name[0].toUpperCase(); (groups[k] = groups[k] || []).push(c); });
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'Learn · Skills Guide', title: 'Skills Guide.', lede: 'What each design skill means, in plain words, and how many employers ask for it. Every skill has four levels, so you can see where you are.', meta: `${ui.tag('Being reviewed with employers and colleges', 'info')}<a class="btn small" href="#learn">Back to Learn</a><a class="btn small" href="#demand">What employers ask for</a>` })}
        <div class="split rev">
          <aside class="stack" style="gap:16px">
            <div class="card"><span class="eyebrow">Start here · LM-SP-1</span><h3>Day 1 readiness, defined</h3>
              <p style="font-size:14px">A graduate is Day 1 ready when they show, on real work, at level 2 or above:</p>
              <ul class="px-list">${['Problem framing', 'Design Decision Training', 'Trust and Compliance', 'Soft-skills + Ownership'].map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
              <a class="btn small primary" href="#learn-LM-SP-1">Take the 25-minute module</a></div>
            <div class="card"><span class="eyebrow">A–Z</span><div class="pill-list">${Object.keys(groups).map((k) => `<a class="chip" href="#lx-${k}" data-act="lx-jump" data-k="${k}">${k}</a>`).join('')}</div></div>
          </aside>
          <section class="stack" style="gap:18px">
            <label class="field"><span class="sr">Search the Skills Guide</span><input id="lex-q" type="search" data-on="lexq" placeholder="Search skills, for example framing" value="${esc(lex.q)}"></label>
            ${Object.keys(groups).map((k) => `<div class="stack" id="lx-${k}" style="gap:10px"><span class="pxnum" style="font-size:34px">${k}</span><div class="grid g2">${groups[k].map((c) => `<a class="card tight" href="#skills-${c.slug}">
              <div class="row between"><span class="label">${esc(plainPos(c.position))}</span>${ui.status(c.status, agreed(c) ? 'Agreed' : 'In review')}</div>
              <h4 style="font-size:17px">${esc(c.name)}</h4><p style="font-size:14px">${esc(c.definition)}</p>
              <span class="muted" style="font-size:12.5px">${asksOf(c)} employers ask for this${L().follows.some((f) => f.slug === c.slug && f.userId === me().id) ? ' · following' : ''}</span></a>`).join('')}</div></div>`).join('') || '<div class="empty">Nothing matches. Try a shorter word.</div>'}
          </section>
        </div>
      </div>`;
    },
  };

  function detail(slug) {
    const c = L().capabilities.find((x) => x.slug === slug);
    if (!c) return LEAD.views.notfound.render();
    const following = L().follows.some((f) => f.slug === slug && f.userId === me().id);
    const chs = L().challenges.filter((x) => x.caps.includes(slug) && ['Live', 'In assessment', 'Closed'].includes(x.status));
    return `<div class="page wrap">
      <nav class="crumbs"><a href="#learn">Learn</a><span>/</span><a href="#skills">Skills Guide</a><span>/</span><span>${esc(c.name)}</span></nav>
      ${ui.hero({ compact: true, eyebrow: `${esc(plainPos(c.position))} · ${asksOf(c)} employers ask for this`, title: c.name, lede: esc(c.definition), meta: `${ui.status(c.status, agreed(c) ? 'Agreed by employers and colleges' : 'Being reviewed')}${role() !== 'admin' ? `<button class="btn ${following ? '' : 'primary'}" data-act="follow" data-slug="${slug}">${following ? 'Following' : 'Follow'}</button>` : ''}${role() === 'admin' && c.status !== 'cosigned' ? `<button class="btn" data-act="cosign" data-slug="${slug}">Record co-signing</button>` : ''}` })}
      <div class="split">
        <section class="card"><span class="eyebrow">Four levels · plain descriptors</span>
          ${LEVEL_TEXT.map((f, i) => `<div class="score-row"><span class="row" style="gap:12px;flex-wrap:nowrap"><span class="pxnum" style="font-size:28px">${i + 1}</span><span>${esc(f(c.name))}</span></span>${ui.lvlDots(i + 1)}</div>`).join('')}
        </section>
        <aside class="stack" style="gap:16px">
          <div class="card"><span class="eyebrow">Agreed by</span>${ui.kv([['An employer', c.cosignedIndustry || 'Not yet'], ['A college', c.cosignedAcademia || 'Not yet']])}</div>
          <div class="card"><span class="eyebrow">Practised in</span>${chs.map((x) => `<a href="#project-${x.id}">${esc(x.title)}</a>`).join('<br>') || '<p class="muted">No live project yet.</p>'}</div>
          <div class="card"><span class="eyebrow">Learn this skill</span>${(LEAD.learn ? LEAD.learn.taughtBy(slug) : []).map((m) => `<a class="shelf-item" href="#learn-${m.code}"><span class="lmcode">${esc(m.code)}</span><span>${esc(m.title)}</span></a>`).join('') || '<p class="muted" style="font-size:14px">No module yet. Ask for one in Learn.</p>'}<p style="font-size:13px" class="muted">Longer courses live at the UMO Design School. LEAD links to them.</p><a class="btn small" href="https://umodesign.school" target="_blank" rel="noopener">UMO Design School</a></div>
        </aside>
      </div>
    </div>`;
  }

  LEAD.on.lexq = (el) => { lex.q = el.value; LEAD.render({ keepScroll: true }); };
  Object.assign(LEAD.act, {
    'lx-jump'(el) { const t = document.getElementById('lx-' + el.dataset.k); if (t) t.scrollIntoView({ behavior: 'smooth' }); },
    follow(el) {
      const slug = el.dataset.slug; const u = me();
      const i = L().follows.findIndex((f) => f.slug === slug && f.userId === u.id);
      store.commit(i >= 0 ? 'Unfollowed capability' : 'Followed capability', 'follow', slug, () => { if (i >= 0) L().follows.splice(i, 1); else L().follows.push({ slug, userId: u.id }); return { slug }; });
    },
    cosign(el) {
      const c = L().capabilities.find((x) => x.slug === el.dataset.slug);
      store.commit('Definition agreed', 'capability', c, () => { c.status = 'cosigned'; c.cosignedIndustry = c.cosignedIndustry || 'Northwind Bank'; c.cosignedAcademia = c.cosignedAcademia || 'Campus A'; return c; });
      ui.toast('Recorded: agreed by an employer and a college.');
    },
  });

  /* ================= Joint Design Calendar ================= */
  const cal = { kind: '', edit: null };
  const KINDS = ['Industry circle', 'Guest session', 'Assessment day', 'Project milestone', 'Circle', 'Sync'];
  function visibleEvents() {
    const r = role(); const u = me();
    return L().events.filter((e) => {
      if (e.visibility === 'public') return true;
      if (r === 'admin') return true;
      if (['student', 'faculty', 'head'].includes(r)) return e.host === u.orgId;
      if (r === 'industry' || r === 'mentor') return e.host === u.orgId || e.kind === 'Assessment day';
      return false;
    }).filter((e) => !cal.kind || e.kind === cal.kind).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  }
  const canWriteCal = () => ['faculty', 'head', 'industry', 'admin'].includes(role());

  LEAD.views.community = {
    title: () => 'Community',
    render() {
      const evs = visibleEvents();
      const ed = cal.edit ? L().events.find((e) => e.id === cal.edit) : null;
      const months = {};
      evs.forEach((e) => { const k = new Date(e.at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); (months[k] = months[k] || []).push(e); });
      const r = role(); const signed = store.session.signedIn;
      const circles = L().events.filter((e) => ['Circle', 'Industry circle', 'Guest session'].includes(e.kind) && e.visibility === 'public').sort((x, y) => Date.parse(x.at) - Date.parse(y.at));
      const give = [
        ['Teach', 'Offer a session, a circle or a topic in Learn.', '#learn', 'Open Learn'],
        ['Mentor', 'Give hours to a student team on a live project.', signed && r === 'mentor' ? '#sprints' : '#join-mentor', signed && r === 'mentor' ? 'Open mentor sessions' : 'Offer your hours'],
        ['Fund a seat', 'Add a seat for a woman in design, or give hours.', '#women', 'Open 1 Million Women'],
      ];
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'Community', title: 'Community.', lede: 'Where students, faculty, colleges, companies and mentors meet. See what is on, find a circle, and give something back.' })}
        <section class="section" id="community-on" aria-label="What is on">
          ${ui.sectionHead('', 'What is on', '', 'One calendar for campus and industry. First meeting at 30 days, then 90, then regular online meetings.')}
        <div class="split">
          <section class="stack" style="gap:16px">
            <div class="row" role="group" aria-label="Filter by kind"><button class="chip" data-act="cal-kind" data-k="" aria-pressed="${!cal.kind}">All</button>${KINDS.map((k) => `<button class="chip" data-act="cal-kind" data-k="${k}" aria-pressed="${cal.kind === k}">${k}</button>`).join('')}</div>
            ${Object.keys(months).map((m) => `<div class="card"><span class="eyebrow">${esc(m)}</span>${months[m].map((e) => { const d = ui.fmtDay(e.at); return `<div class="cal-row">
              <div class="stack" style="gap:2px"><span class="cal-day">${d.day}</span><span class="label">${d.wk} · ${d.time}</span></div>
              <div class="stack" style="gap:4px;min-width:0"><b class="ink">${esc(e.title)}</b><span class="muted" style="font-size:13px">${esc(e.kind)} · ${esc(e.where)} · host ${esc(ui.orgName(e.host))}</span></div>
              <div class="row">${ui.tag(e.visibility === 'public' ? 'Public' : 'Campus', e.visibility === 'public' ? 'info' : 'ind')}${canWriteCal() && (role() === 'admin' || e.host === me().orgId) ? `<button class="btn small ghost" data-act="cal-edit" data-id="${e.id}">Edit</button>` : ''}<button class="btn small" data-act="toast" data-msg="RSVP saved for ${esc(e.title)}.">RSVP</button></div>
            </div>`; }).join('')}</div>`).join('') || '<div class="empty">No events for this filter.</div>'}
          </section>
          <aside>${canWriteCal() ? `<form class="card" data-form="event" ${ed ? `data-id="${ed.id}"` : ''}>
            <span class="eyebrow">${ed ? 'Edit event' : 'Add event'}</span>
            <label class="field">Title<input id="ev-title" name="title" required value="${esc(ed ? ed.title : 'Industry circle · Business context')}"></label>
            <div class="form-grid"><label class="field">Date and time<input id="ev-at" type="datetime-local" name="at" required value="${esc(ed ? ed.at.slice(0, 16) : '2026-11-04T17:30')}"></label>
            <label class="field">Kind<select id="ev-kind" name="kind">${KINDS.map((k) => `<option ${ed && ed.kind === k ? 'selected' : ''}>${k}</option>`).join('')}</select></label></div>
            <div class="form-grid"><label class="field">Where<input id="ev-where" name="where" value="${esc(ed ? ed.where : 'Online')}"></label>
            <label class="field">Who can see it<select id="ev-vis" name="visibility"><option value="public" ${ed && ed.visibility === 'public' ? 'selected' : ''}>Public</option><option value="campus" ${ed && ed.visibility === 'campus' ? 'selected' : ''}>My organisation</option></select></label></div>
            <div class="btn-row"><button class="btn primary" type="submit">${ed ? 'Save' : 'Add event'}</button>${ed ? '<button class="btn ghost" type="button" data-act="cal-cancel">Cancel</button><button class="btn danger" type="button" data-act="cal-del">Delete</button>' : ''}</div>
          </form>` : `<div class="card"><span class="eyebrow">Your access</span><p>${esc(ui.roleName(role()))} can read the calendar. Faculty, institution heads, industry and the UMO team add events.</p></div>`}</aside>
        </div>
        </section>
        <section class="section" id="community-circles" aria-label="Circles and sessions">
          ${ui.sectionHead('', 'Circles and sessions', '', 'Open to everyone. Small groups that learn and share together.')}
          <div class="card"><ul class="list">${circles.map((e) => `<li class="row between give-row"><span><b class="ink">${esc(e.title)}</b><br><span class="muted tiny">${esc(ui.fmtDate(e.at))} · ${esc(e.where)}</span></span>${e.women ? ui.tag('Women in design', 'info') : ''}</li>`).join('') || '<li class="muted">No circles yet.</li>'}</ul>
            <div class="btn-row"><a class="btn small" href="#learn-LM-PL-2">Women in Design circle · LM-PL-2</a><a class="btn small ghost" href="#learn">All peer circles in Learn</a></div></div>
        </section>
        <section class="section" id="community-give" aria-label="Give back">
          ${ui.sectionHead('', 'Give back', '', 'Three ways to put something in.')}
          <div class="grid g3">${give.map(([t, d, href, cta]) => `<article class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p><a class="btn" href="${href}">${esc(cta)}</a></article>`).join('')}</div>
        </section>
      </div>`;
    },
  };
  Object.assign(LEAD.act, {
    'cal-kind'(el) { cal.kind = el.dataset.k; LEAD.render({ keepScroll: true }); },
    'cal-edit'(el) { cal.edit = el.dataset.id; LEAD.render({ keepScroll: true }); },
    'cal-cancel'() { cal.edit = null; LEAD.render({ keepScroll: true }); },
    'cal-del'() {
      const i = L().events.findIndex((e) => e.id === cal.edit);
      if (i >= 0) store.commit('Event deleted', 'calendar_event', L().events[i].id, () => L().events.splice(i, 1)[0]);
      cal.edit = null; ui.toast('Event deleted.');
    },
  });
  LEAD.forms.event = (fd, form) => {
    const data = { title: String(fd.get('title')).trim(), at: fd.get('at'), kind: fd.get('kind'), where: fd.get('where'), visibility: fd.get('visibility') };
    if (!data.title || !data.at) { ui.toast('Add a title and a time.'); return; }
    if (form.dataset.id) {
      const e = L().events.find((x) => x.id === form.dataset.id);
      store.commit('Event edited', 'calendar_event', e, () => Object.assign(e, data));
      cal.edit = null; ui.toast('Saved.');
    } else {
      const e = Object.assign({ id: uid('e'), host: me().orgId }, data);
      store.commit('Event added', 'calendar_event', e.id, () => { L().events.push(e); return e; });
      ui.toast('Added to the Joint Design Calendar.');
    }
  };

})(typeof globalThis !== 'undefined' ? globalThis : this);
