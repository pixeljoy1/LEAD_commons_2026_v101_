/* LEAD · join sheet. One dialog, opened from every Join button. It lives outside #app so page renders never close it. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, content } = LEAD;
  const { esc } = ui;

  const st = { open: false, role: 'student', step: 'options', campus: null, opener: null, done: null };

  const el = () => {
    let e = document.getElementById('sheet-root');
    if (!e) { e = document.createElement('div'); e.id = 'sheet-root'; document.body.appendChild(e); }
    return e;
  };

  /* Every option opens the package page of a join flow. Nothing here routes anywhere else. */
  function options(role) {
    const go = (flow, persona, title, desc) => `<button class="opt" data-act="sheet-go" data-flow="${flow}" data-persona="${persona}"><b>${esc(title)}</b><span>${esc(desc)}</span></button>`;
    switch (role) {
      case 'student': return [
        go('open', 'student', 'Start with a free account', 'Read the Skills Guide, join circles and try an open live project. Link your campus if it is on LEAD.'),
        go('path', '', 'Enrol on a Path', 'Short modules tied to a live project, with one mentor session. Mock price.'),
      ].join('');
      case 'faculty': return [
        go('faculty', '', 'Join through my campus', 'Free. Your college is already on LEAD. See the live projects and your cohort.'),
        go('college', '', 'Ask my college to join', 'Start the campus sign-up for your institution.'),
      ].join('');
      case 'head': return [
        go('college', '', 'Start a campus licence', 'Priced by number of students. Mock price, and nothing is charged.'),
        `<button class="opt" data-act="sheet-step" data-step="contact"><b>Talk to UMO first</b><span>Ask questions before you decide.</span></button>`,
      ].join('');
      case 'industry': return [
        go('industry', '', 'Become a member', 'Seats for your team, scorer seats and verified shortlists.'),
        go('sponsor', '', 'Sponsor a live project', 'Bring one real problem into a campus term.'),
      ].join('');
      case 'mentor': return go('mentor', '', 'Offer my hours as a mentor', 'Free. Coach a student team. A UMO admin checks every practitioner first.');
      case 'open': return [
        go('open', 'open', 'Start with a free account', 'The Skills Guide, circles and open live projects.'),
        go('path', '', 'Take a Path', 'Short modules tied to a live project. Mock price.'),
      ].join('');
      default: return '';
    }
  }

  function body() {
    if (st.step === 'contact') {
      return `<div class="stack"><button class="btn small ghost" data-act="sheet-step" data-step="options">Back</button>
        <h3>Talk to UMO</h3><p style="font-size:14px">Write to the UMO team. They reply within a week.</p>
        <p class="ink" style="font-size:20px;font-family:var(--f-display);user-select:all">team@umo.design</p>
        <div class="btn-row"><button class="btn" data-act="sheet-copy" data-text="team@umo.design">Copy the address</button></div></div>`;
    }
    return `<div class="opts">${options(st.role)}</div>`;
  }

  function draw() {
    const root_el = el();
    if (!st.open) { root_el.innerHTML = ''; document.body.classList.remove('sheet-open'); return; }
    document.body.classList.add('sheet-open');
    root_el.innerHTML = `<div class="sheet-back" data-act="sheet-close"></div>
      <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div class="sheet-top"><div class="stack" style="gap:4px"><span class="eyebrow">Join LEAD by UMO Design</span><h2 id="sheet-title" style="font-size:clamp(24px,3vw,30px)">How would you like to join?</h2></div>
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

    Object.assign(LEAD.act, {
    sheet(a) { open(a.getAttribute('data-role') || 'student', a); },
    'sheet-close'() { close(); },
    'sheet-role'(a) { st.role = a.getAttribute('data-role'); st.step = 'options'; st.done = null; draw(); const n = el().querySelector('[data-act="sheet-role"][aria-pressed="true"]'); if (n) n.focus(); },
    'sheet-step'(a) { st.step = a.getAttribute('data-step'); if (st.step === 'role-mentor') st.role = 'mentor'; draw(); const n = el().querySelector('#sheet-body button, #sheet-body input'); if (n) n.focus(); },
    'sheet-go'(a) { const flow = a.getAttribute('data-flow'); const persona = a.getAttribute('data-persona'); st.opener = null; st.open = false; draw(); LEAD.join.start(flow, persona); },
    'sheet-copy'(a) {
      const text = a.getAttribute('data-text') || '';
      try { navigator.clipboard.writeText(text).then(() => ui.toast('Copied.'), () => ui.toast('Select and copy the text.')); } catch (e) { ui.toast('Select and copy the text.'); }
    },
  });

})(typeof globalThis !== 'undefined' ? globalThis : this);
