/* LEAD · join sheet. One dialog, opened from every Join button. It lives outside #app so page renders never close it. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, content } = LEAD;
  const { esc } = ui;

  const st = { open: false, role: 'student', step: 'options', campus: null, opener: null, done: null };
  const CAMPUS_USERS = { 'campus-a': { student: 's1', faculty: 'f1' }, 'campus-b': { student: 's8', faculty: 'f2' }, 'campus-c': { student: 's12', faculty: 'f3' } };
  const NOTE = 'Hello, I would like our college to join LEAD Commons, a programme of UMO Design Foundation that connects design classrooms with real company projects. Could we look at the campus sign-up together? Contact for details: team@umo.design';

  const el = () => {
    let e = document.getElementById('sheet-root');
    if (!e) { e = document.createElement('div'); e.id = 'sheet-root'; document.body.appendChild(e); }
    return e;
  };

  /* Every option is a plain button with one data-act. */
  function options(role) {
    const go = (to, title, desc) => `<button class="opt" data-act="sheet-go" data-to="${to}"><b>${esc(title)}</b><span>${esc(desc)}</span></button>`;
    const step = (s, title, desc) => `<button class="opt" data-act="sheet-step" data-step="${s}"><b>${esc(title)}</b><span>${esc(desc)}</span></button>`;
    switch (role) {
      case 'student': return [
        go('join-open', 'Start with a free account', 'Read the Lexicon, join circles and try an open challenge. You agree to the Codex first.'),
        step('campus', 'Link my campus', 'If your college is on LEAD, you see the challenges running in your term.'),
        go('join-path', 'Enrol on a Path', 'Short modules tied to a live challenge, with one mentor sprint. Mock price.'),
      ].join('');
      case 'faculty': return [
        step('campus', 'Join through my campus', 'Your college is already on LEAD. See the challenges and your cohort.'),
        go('join-college', 'Ask my college to join', 'Start the campus sign-up for your institution.'),
        go('join-open', 'Start with a free account', 'Read the Lexicon and join circles while your college decides.'),
      ].join('');
      case 'head': return [
        go('join-college', 'Start a campus licence', 'Priced by number of students. Mock price, and nothing is charged.'),
        step('contact', 'Talk to UMO first', 'Ask questions before you decide.'),
      ].join('');
      case 'industry': return [
        go('join-industry', 'Become a member', 'Seats for your team, assessor seats and verified shortlists.'),
        go('join-sponsor', 'Sponsor a challenge', 'Bring one real problem into a campus term.'),
        step('role-mentor', 'Offer your own hours as a mentor', 'Coach a team yourself.'),
      ].join('');
      case 'open': return [
        go('join-open', 'Start with a free account', 'The Lexicon, circles and open challenges.'),
        go('join-path', 'Take a Path', 'Short modules tied to a live challenge. Mock price.'),
      ].join('');
      default: return '';
    }
  }

  function body() {
    const role = st.role;
    if (st.done === 'mentor') {
      return `<div class="stack"><div class="msg ok">Thank you. Your application is with the UMO steward. Practitioners are checked before they are listed.</div>
        <p class="muted" style="font-size:13.5px">In this demo you can play the steward and approve yourself.</p>
        <div class="btn-row"><button class="btn primary" data-act="sheet-steward">See the mentor pool as steward</button><button class="btn ghost" data-act="sheet-close">Close</button></div></div>`;
    }
    if (st.step === 'campus') {
      return `<div class="stack"><button class="btn small ghost" data-act="sheet-step" data-step="options">Back</button>
        <h3>Which campus?</h3><p class="muted" style="font-size:14px">Demo campuses. Choosing one signs you in as a made-up ${role === 'faculty' ? 'faculty member' : 'student'} there.</p>
        <div class="opts">${store.loop.orgs.filter((o) => o.kind === 'institution').map((o) => `<button class="opt" data-act="sheet-campus" data-campus="${o.id}"><b>${esc(o.name)}</b><span>${esc(o.city)}</span></button>`).join('')}
        <button class="opt" data-act="sheet-step" data-step="notlisted"><b>My campus is not listed</b><span>See what to send your college.</span></button></div></div>`;
    }
    if (st.step === 'notlisted') {
      return `<div class="stack"><button class="btn small ghost" data-act="sheet-step" data-step="campus">Back</button>
        <h3>Ask your college to join</h3><p style="font-size:14px">Send this to your head of department or placement cell.</p>
        <div class="email" id="sheet-note">${esc(NOTE)}</div>
        <div class="btn-row"><button class="btn" data-act="sheet-copy">Copy the note</button><button class="btn primary" data-act="sheet-go" data-to="join-open">Start with a free account meanwhile</button></div></div>`;
    }
    if (st.step === 'contact') {
      return `<div class="stack"><button class="btn small ghost" data-act="sheet-step" data-step="options">Back</button>
        <h3>Talk to UMO</h3><p style="font-size:14px">Write to the UMO team. They reply within a week.</p>
        <p class="ink" style="font-size:20px;font-family:var(--f-display);user-select:all">team@umo.design</p>
        <div class="btn-row"><button class="btn" data-act="sheet-copy" data-text="team@umo.design">Copy the address</button></div></div>`;
    }
    if (role === 'mentor' || st.step === 'role-mentor') {
      return `<form class="stack" data-form="mentor-apply"><h3>Offer your hours</h3>
        <p class="muted" style="font-size:14px">Three 45-minute sessions per team. A UMO steward checks every practitioner before they are listed.</p>
        <label class="field">Your name<input id="sh-name" name="name" required autocomplete="name" value="Dana Fernandes"></label>
        <label class="field">What you do<input id="sh-practice" name="practice" required value="Senior product designer, healthtech"></label>
        <label class="field">Hours you can give this term<input id="sh-hours" name="hours" type="number" min="1" max="60" value="6" required></label>
        <label class="check"><input type="checkbox" name="codex" id="sh-codex" required> I agree to the LEAD Codex: consent, IP and ethics rules.</label>
        <div class="btn-row"><button class="btn primary" type="submit">Offer my hours</button></div></form>`;
    }
    return `<div class="opts">${options(role)}</div>`;
  }

  function draw() {
    const root_el = el();
    if (!st.open) { root_el.innerHTML = ''; document.body.classList.remove('sheet-open'); return; }
    document.body.classList.add('sheet-open');
    root_el.innerHTML = `<div class="sheet-back" data-act="sheet-close"></div>
      <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div class="sheet-top"><div class="stack" style="gap:4px"><span class="eyebrow">Join LEAD Commons</span><h2 id="sheet-title" style="font-size:clamp(24px,3vw,30px)">How would you like to join?</h2></div>
          <button class="icon-btn" data-act="sheet-close" aria-label="Close">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'}</button></div>
        <div class="stack" style="gap:8px"><span class="label">I am a</span>
          <div class="row" role="group" aria-label="Who are you">${content.storyTabs.map((t) => `<button class="chip" data-act="sheet-role" data-role="${t.role}" aria-pressed="${t.role === st.role}">${esc(t.label)}</button>`).join('')}</div></div>
        <div id="sheet-body" class="stack">${body()}</div>
        <p class="muted" style="font-size:12.5px">${ui.tag('Demo only · nothing saved or charged', 'sim').replace(/\n/g, '')} Prices are mock and are not an offer.</p>
      </section>`;
  }

  function open(role, opener) {
    st.open = true; st.role = role || 'student'; st.step = 'options'; st.done = null; st.opener = opener || document.activeElement;
    draw();
    const first = el().querySelector('.sheet [data-act="sheet-role"][aria-pressed="true"]') || el().querySelector('.sheet button');
    if (first) first.focus();
  }
  function close() {
    st.open = false; draw();
    if (st.opener && document.body.contains(st.opener) && st.opener.focus) st.opener.focus();
    st.opener = null;
  }
  LEAD.sheet = { open, close, state: st };

  document.addEventListener('keydown', (ev) => {
    if (!st.open) return;
    if (ev.key === 'Escape') { ev.preventDefault(); close(); return; }
    if (ev.key !== 'Tab') return;
    const items = [...el().querySelectorAll('.sheet button, .sheet input, .sheet select, .sheet a[href]')].filter((n) => !n.disabled && n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0]; const last = items[items.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });

  const finish = (to) => { st.opener = null; st.open = false; draw(); if (to) LEAD.go(to); };

  Object.assign(LEAD.act, {
    sheet(a) { open(a.getAttribute('data-role') || 'student', a); },
    'sheet-close'() { close(); },
    'sheet-role'(a) { st.role = a.getAttribute('data-role'); st.step = 'options'; st.done = null; draw(); const n = el().querySelector('[data-act="sheet-role"][aria-pressed="true"]'); if (n) n.focus(); },
    'sheet-step'(a) { st.step = a.getAttribute('data-step'); if (st.step === 'role-mentor') st.role = 'mentor'; draw(); const n = el().querySelector('#sheet-body button, #sheet-body input'); if (n) n.focus(); },
    'sheet-go'(a) { if (['student', 'faculty', 'head', 'industry', 'open'].includes(st.role)) store.setRole(st.role); finish(a.getAttribute('data-to')); },
    'sheet-campus'(a) {
      const c = a.getAttribute('data-campus'); const role = st.role === 'faculty' ? 'faculty' : 'student';
      const uid = CAMPUS_USERS[c][role];
      store.setRole(role, uid);
      const u = store.user(uid);
      ui.toast(`Demo: you are now ${u.name} at ${ui.orgName(c)}.`);
      finish(role === 'faculty' ? 'w-faculty' : 'challenges');
    },
    'sheet-copy'(a) {
      const text = a.getAttribute('data-text') || NOTE;
      const fallback = () => { const n = document.getElementById('sheet-note'); if (n) { const r = document.createRange(); r.selectNodeContents(n); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } ui.toast('Select and copy the text.'); };
      try { navigator.clipboard.writeText(text).then(() => ui.toast('Copied.'), fallback); } catch (e) { fallback(); }
    },
    'sheet-steward'() { store.setRole('steward'); finish('sprints'); },
  });

  LEAD.forms['mentor-apply'] = (fd) => {
    const name = String(fd.get('name')).trim(); const practice = String(fd.get('practice')).trim();
    if (!name || !practice) { ui.toast('Add your name and what you do.'); return; }
    const id = 'm' + Date.now().toString(36);
    store.commit('Mentor application', 'mentor_profile', id, () => {
      const u = { id, name, role: 'mentor', orgId: 'umo', title: practice, verified: false, hoursOffered: Number(fd.get('hours')) || 4 };
      store.loop.users.push(u); return u;
    });
    st.done = 'mentor'; draw();
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
