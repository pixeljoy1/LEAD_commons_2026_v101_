/* LEAD · app shell and router. Routes are plain hash tokens (#model, #w-student, #join-college). */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, content } = LEAD;
  const { esc } = ui;

  const NAV = [
    ['model', 'Model'],
    ['lexicon', 'Learn'],
    ['challenges', 'Challenges'],
    ['calendar', 'Community'],
    ['opportunities', 'Opportunities'],
    ['impact', 'Impact'],
  ];
  const NAV_MATCH = {
    model: ['model', 'verdict', 'choose'], lexicon: ['lexicon', 'demand'], challenges: ['challenges', 'challenge', 'team', 'sprints', 'submit', 'assess'],
    calendar: ['calendar', 'provisions'], opportunities: ['opportunities', 'passports', 'passport'], impact: ['impact', 'audit'],
  };

  /* token → [view, param] */
  function parse(token) {
    const t = token || 'model';
    const prefixes = ['w-', 'lexicon-', 'challenge-', 'team-', 'passport-', 'join-path-', 'join-sponsor-', 'admin-plan-'];
    for (const p of prefixes) if (t.startsWith(p)) return [p.slice(0, -1), t.slice(p.length)];
    return [t, null];
  }

  function current() { return parse(decodeURIComponent(location.hash.slice(1))); }

  /* ---------- shell ---------- */
  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function bannerHTML() {
    const b = store.pricing.banner;
    if (!b || !b.active || !b.text) return '';
    const now = Date.now();
    if (b.startsAt && now < Date.parse(b.startsAt)) return '';
    if (b.endsAt && now > Date.parse(b.endsAt + 'T23:59:59')) return '';
    return `<div class="banner" data-banner><div class="wrap"><span>${esc(b.text)}</span>${b.link ? `<a href="${esc(b.link)}">Join</a>` : ''}</div></div>`;
  }

  function headerHTML(view) {
    const active = Object.keys(NAV_MATCH).find((k) => NAV_MATCH[k].includes(view));
    const s = store.session;
    const me = store.me();
    const org = me && me.orgId ? store.org(me.orgId) : null;
    const theme = document.documentElement.getAttribute('data-theme');
    const roleOpts = content.roles.map((r) => `<option value="${r.id}" ${r.id === s.role ? 'selected' : ''}>${esc(r.name)}</option>`).join('');
    return `${bannerHTML()}
    <header class="site-head">
      <div class="wrap head-row">
        <a class="brand" href="#model" aria-label="LEAD by UMO Design Foundation, home">
          <span class="logo-tile"><img src="../public/brand/UMO_logo.png" alt="UMO Design" width="309" height="129"></span>
          <span class="brand-word"><b>LEAD</b><span>Commons · by UMO</span></span>
        </a>
        <nav class="nav" aria-label="Main">${NAV.map(([k, l]) => `<a href="#${k}" ${k === active ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
        <div class="head-tools">
          <button class="icon-btn" data-act="theme" aria-label="Switch theme (now ${theme || 'system'})" title="Theme">${theme === 'light' ? MOON : SUN}</button>
          <a class="btn join" href="#join">Join</a>
        </div>
      </div>
    </header>
    <div class="rolebar"><div class="wrap">
      <label class="role-pick"><span class="label">Acting as</span>
        <select id="role-select" data-on="role" aria-label="Acting as role">${roleOpts}</select></label>
      ${s.role === 'admin'
        ? `<div class="seg" role="group" aria-label="Acting admin">${['Admin A', 'Admin B'].map((a) => `<button data-act="admin-actor" data-actor="${a}" aria-pressed="${s.adminActor === a}">${a}</button>`).join('')}</div>`
        : `<span class="who">${esc(me ? me.name : '')}${org && org.kind !== 'open' ? ` · <span class="muted">${esc(org.name)}</span>` : ''}</span>`}
      <a class="btn small ghost" href="#w-${s.role}">My home</a>
      ${s.role === 'admin' ? '<a class="btn small ghost" href="#admin">Admin</a>' : ''}
      <span class="spacer"></span>
      ${ui.tag('Demo only · nothing saved or charged', 'sim')}
      <button class="btn small ${s.demo ? 'primary' : ''}" data-act="demo-toggle" aria-pressed="${s.demo}">Demo script</button>
      <button class="btn small ghost" data-act="reset" title="Clear demo data and start again">Reset demo</button>
    </div></div>`;
  }

  function footerHTML() {
    return `<footer class="site-foot"><div class="wrap">
      <div class="foot-grid">
        <div class="stack"><p class="mission">Good design for a better living.</p><p class="muted" style="font-size:13px">LEAD connects classrooms and workplaces. Carried by UMO Design Foundation, a non-profit.</p></div>
        <div><h4>Initiatives</h4><ul>
          <li><a href="https://umodesign.school" target="_blank" rel="noopener">UMO Design School</a></li>
          <li><a href="https://umodesign.school" target="_blank" rel="noopener">UMO Design Grads</a></li>
          <li><a href="https://umo.design" target="_blank" rel="noopener">UXI Conf</a></li>
          <li><a href="https://umo.design" target="_blank" rel="noopener">WiDesign Fest</a></li></ul></div>
        <div><h4>Support</h4><ul>
          <li><a href="#join-open">Volunteer</a></li><li><a href="#w-mentor">Become a mentor</a></li>
          <li><a href="#join-industry">Partner with us</a></li><li><a href="#provisions">Provisions board</a></li></ul></div>
        <div><h4>Connect</h4><ul>
          <li><span class="muted">Email</span> <span class="ink" style="user-select:all">team@umo.design</span></li>
          <li><a href="https://uxin.co" target="_blank" rel="noopener">Find a job on UXIN</a></li>
          <li><a href="#calendar">Joint Design Calendar</a></li><li><a href="#verdict">Is it worth building?</a></li></ul></div>
      </div>
      <div class="foot-base">
        <span>UMO Design Foundation · LEAD · Prototype v0.2 · Synthetic data only. No real people or student data.</span>
        <span class="uxi"><span>With</span><span class="logo-tile"><img src="../public/brand/UXINDIA_logo.png" alt="UXINDIA, Design Leadership Week 2026" width="523" height="102"></span></span>
      </div>
    </div></footer>`;
  }

  function demoHTML() {
    const s = store.session;
    if (!s.demo) return '';
    const steps = content.demo;
    const i = Math.min(s.demoStep, steps.length - 1);
    const st = steps[i];
    return `<div class="demo" role="region" aria-label="Demo script">
      <span class="n">${String(i + 1).padStart(2, '0')}/${steps.length}</span>
      <p>${esc(st.say)}</p>
      <button class="btn small" data-act="demo-step" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Previous step">Back</button>
      <button class="btn small primary" data-act="demo-step" data-d="1">${i === steps.length - 1 ? 'Finish' : 'Next'}</button>
    </div>`;
  }

  /* ---------- render ---------- */
  const app = document.getElementById('app');
  let lastView = null;

  function render(opts) {
    const [view, param] = current();
    const v = LEAD.views[view] || LEAD.views.notfound;
    const focusId = document.activeElement && document.activeElement.id;
    const sel = focusId && document.activeElement.selectionStart != null ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
    const y = window.scrollY;
    let body;
    try { body = v.render(param); } catch (e) { console.error(e); body = `<div class="page wrap"><div class="msg err">This screen hit an error: ${esc(e.message)}</div></div>`; }
    app.innerHTML = `${headerHTML(view)}<main id="main" tabindex="-1">${body}</main>${footerHTML()}${demoHTML()}`;
    document.body.classList.toggle('has-demo', !!store.session.demo);
    if (v.after) { try { v.after(param); } catch (e) { console.error(e); } }
    const changed = view !== lastView || (opts && opts.navigated);
    if (changed && !(opts && opts.keepScroll)) { window.scrollTo(0, 0); }
    else window.scrollTo(0, y);
    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) { try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* not text */ } } }
    }
    document.title = `${v.title ? v.title(param) + ' · ' : ''}LEAD Commons`;
    lastView = view;
  }
  LEAD.render = render;

  function go(token, role) {
    if (role && role !== store.session.role) store.setRole(role);
    if (location.hash.slice(1) === token) render({ navigated: true });
    else location.hash = token;
  }
  LEAD.go = go;

  window.addEventListener('hashchange', () => render({ navigated: true }));

  store.subscribe((evt) => {
    if (evt.kind === 'pricing' && evt.remote) {
      const [view] = current();
      const v = LEAD.views[view];
      if (v && v.onPricing) v.onPricing(evt); else render({ keepScroll: true });
      if (/^(join|admin)/.test(view) || view === 'model') ui.toast('Price updated.');
      return;
    }
    if (evt.kind === 'pricing') { render({ keepScroll: true }); return; }
    if (evt.kind === 'reset') { render(); ui.toast('Demo reset to the seed.'); return; }
    render({ keepScroll: true });
  });

  /* ---------- event delegation ---------- */
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('[data-act]');
    if (a && !a.disabled) {
      const fn = LEAD.act[a.getAttribute('data-act')];
      if (fn) { ev.preventDefault(); fn(a, ev); }
      return;
    }
    const g = ev.target.closest('[data-go]');
    if (g) { ev.preventDefault(); go(g.getAttribute('data-go'), g.getAttribute('data-role')); }
  });
  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('form[data-form]');
    if (!f) return;
    ev.preventDefault();
    const fn = LEAD.forms[f.getAttribute('data-form')];
    if (fn) fn(new FormData(f), f, ev);
  });
  const onInput = (ev) => {
    const el = ev.target.closest('[data-on]');
    if (!el) return;
    const fn = LEAD.on[el.getAttribute('data-on')];
    if (fn) fn(el, ev);
  };
  document.addEventListener('input', onInput);
  document.addEventListener('change', (ev) => { const el = ev.target.closest('[data-on]'); if (el && el.tagName === 'SELECT') onInput(ev); });
  document.addEventListener('keydown', (ev) => {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[data-act][role="button"]')) { ev.preventDefault(); ev.target.click(); }
  });

  /* ---------- shell actions ---------- */
  Object.assign(LEAD.act, {
    theme() {
      const r = document.documentElement;
      const cur = r.getAttribute('data-theme');
      const sysDark = !window.matchMedia || !window.matchMedia('(prefers-color-scheme: light)').matches;
      const effective = cur || (sysDark ? 'dark' : 'light');
      r.setAttribute('data-theme', effective === 'dark' ? 'light' : 'dark');
      render({ keepScroll: true });
    },
    as(el) {
      store.setRole(el.getAttribute('data-role'), el.getAttribute('data-user') || undefined);
      const to = el.getAttribute('data-to');
      if (to) go(to); else render({ keepScroll: true });
    },
    'admin-actor'(el) { store.session.adminActor = el.getAttribute('data-actor'); render({ keepScroll: true }); ui.toast(`Acting as ${store.session.adminActor}.`); },
    'demo-toggle'() {
      store.session.demo = !store.session.demo;
      if (store.session.demo) { const st = content.demo[store.session.demoStep]; go(st.route, st.role); } else render({ keepScroll: true });
    },
    'demo-step'(el) {
      const d = Number(el.getAttribute('data-d'));
      const n = store.session.demoStep + d;
      if (n >= content.demo.length) { store.session.demo = false; store.session.demoStep = 0; render({ keepScroll: true }); ui.toast('Demo complete.'); return; }
      store.session.demoStep = Math.max(0, n);
      const st = content.demo[store.session.demoStep];
      go(st.route, st.role);
    },
    reset() { store.resetDemo(); },
  });
  LEAD.on.role = (el) => { store.setRole(el.value); };

  LEAD.views.notfound = { render: () => `<div class="page wrap"><div class="empty"><h2>Nothing here.</h2><a class="btn" href="#model">Go to the service model</a></div></div>` };

  if (!location.hash) history.replaceState(null, '', '#model');
  render();
})(typeof globalThis !== 'undefined' ? globalThis : this);
