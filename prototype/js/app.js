/* LEAD · app shell and router. Routes are plain hash tokens (#home, #w-student, #join-college). */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, content } = LEAD;
  const { esc } = ui;

  const NAV = [
    ['learn', 'Learn'],
    ['projects', 'Live Projects'],
    ['calendar', 'Community'],
    ['opportunities', 'Opportunities'],
    ['impact', 'Impact'],
    ['women', '1M Women'],
  ];
  const NAV_MATCH = {
    learn: ['learn', 'skills', 'demand'], projects: ['challenges', 'challenge', 'team', 'sprints', 'submit', 'assess'],
    calendar: ['calendar', 'provisions'], opportunities: ['opportunities', 'passports', 'passport'], impact: ['impact', 'audit'],
  };

  /* token → [view, param] */
  function parse(token) {
    let t = !token || token === 'model' ? 'home' : token; // the homepage is the model
    if (t === 'lexicon' || t.startsWith('lexicon-')) t = 'skills' + t.slice(7); // the Lexicon is now the Skills Guide
    if (t === 'projects') t = 'challenges'; // Live Projects are the old Challenges; both routes work
    if (t.startsWith('project-')) t = 'challenge-' + t.slice(8);
    if (/^admin-/.test(t)) return ['admin', null]; // old admin routes now live on one page
    const prefixes = ['w-', 'learn-', 'skills-', 'challenge-', 'team-', 'passport-', 'join-path-', 'join-sponsor-'];
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

  const CARET = '<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 4.5l4 4 4-4"/></svg>';
  const menu = { open: false };

  function setMenu(open) {
    menu.open = open;
    const m = document.getElementById('persona-menu');
    const b = document.querySelector('.persona-btn');
    if (m) m.hidden = !open;
    if (b) b.setAttribute('aria-expanded', String(open));
  }

  function headerHTML(view) {
    const active = Object.keys(NAV_MATCH).find((k) => NAV_MATCH[k].includes(view));
    const s = store.session;
    const me = store.me();
    const org = me && me.orgId ? store.org(me.orgId) : null;
    const r = content.roleById[s.role];
    const theme = document.documentElement.getAttribute('data-theme');
    const on = s.signedIn;
    const items = content.roles.map((x) => `<button class="persona-item" role="menuitemradio" aria-checked="${on && x.id === s.role}" data-act="as" data-role="${x.id}" data-to="${x.id === 'admin' ? 'admin' : 'w-' + x.id}">
        ${ui.glyph(x.id)}<span><b>${esc(x.name)}</b><small>${esc(x.lens)}</small></span>${on && x.id === s.role ? '<span class="px cyan" aria-hidden="true"></span>' : ''}</button>`).join('');
    const myPath = on ? (s.role === 'admin' ? ['admin', 'Admin'] : ['w-' + s.role, 'My path']) : null;
    const pathActive = on && (view === 'w' || (s.role === 'admin' && view === 'admin'));
    const USER = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/></svg>';
    return `${bannerHTML()}
    <header class="site-head">
      <div class="wrap head-row">
        <a class="brand" href="#home" aria-label="LEAD by UMO Design. Home">
          <b class="brand-lead">LEAD</b>
          <span class="brand-by" aria-hidden="true">by</span>
          <span class="logo-tile"><img src="../public/brand/UMO_logo.png" alt="UMO Design" width="309" height="129"></span>
        </a>
        <nav class="nav" aria-label="Main">${myPath ? `<a class="nav-path" href="#${myPath[0]}" ${pathActive ? 'aria-current="page"' : ''}>${myPath[1]}</a>` : ''}${NAV.map(([k, l]) => `<a href="#${k}" ${k === active ? 'aria-current="page"' : ''}>${l}</a>`).join('')}${on ? '<a class="nav-join nav-out" href="#home" data-act="logout">Log out</a>' : '<a class="nav-join" href="#join" data-act="sheet" data-role="student">Join</a>'}</nav>
        <div class="head-tools">
          <button class="btn small demo-btn" data-act="demo-toggle" aria-pressed="${s.demo}" title="Walk the current persona through the loop">${s.demo ? 'Exit demo' : 'Demo'}</button>
          <div class="persona-wrap">
            <button class="persona-btn" data-act="persona-menu" aria-haspopup="menu" aria-expanded="${menu.open}" aria-controls="persona-menu" title="${on ? 'Switch persona' : 'Sign in as one of the demo personas'}" aria-label="${on ? 'Signed in as ' + esc(r.short) + '. Switch persona' : 'Sign in as…'}">
              ${on ? ui.glyph(s.role) : USER}<span class="pname">${on ? esc(r.short) : 'Sign in as…'}</span>${CARET}
            </button>
            <div class="persona-menu" id="persona-menu" role="menu" aria-label="${on ? 'Switch persona' : 'Sign in as'}" ${menu.open ? '' : 'hidden'}>
              <div class="persona-head">${on ? `<span class="label">Signed in as</span><b class="ink">${esc(me ? me.name : '')}</b>${org && org.kind !== 'open' ? `<span class="muted">${esc(org.name)}</span>` : ''}` : '<span class="label">Demo sign-in</span><b class="ink">Pick who you want to be</b>'}${ui.tag('Demo only · nothing saved or charged', 'sim')}</div>
              ${items}
              <div class="divider"></div>
              ${on ? '<button class="persona-item" role="menuitem" data-act="logout"><span class="glyph-gap"></span><span><b>Log out</b><small>Back to the public view</small></span></button>' : ''}
              <button class="persona-item" role="menuitem" data-act="theme"><span class="glyph-gap">${theme === 'light' ? MOON : SUN}</span><span><b>Switch theme</b><small>Now ${theme || 'system'}</small></span></button>
              <button class="persona-item" role="menuitem" data-act="reset"><span class="glyph-gap"></span><span><b>Reset demo</b><small>Clear demo data and start again</small></span></button>
            </div>
          </div>
          ${on ? '<a class="btn head-logout" href="#home" data-act="logout">Log out</a>' : '<a class="btn join head-join" href="#join" data-act="sheet" data-role="student">Join</a>'}
        </div>
      </div>
    </header>`;
  }

  function footerHTML() {
    return `<footer class="site-foot"><div class="wrap">
      <div class="foot-grid">
        <div class="stack"><p class="mission">Good design for a better living.</p><p class="muted" style="font-size:13px">LEAD connects classrooms and workplaces. Carried by UMO Design Foundation, a non-profit.</p></div>
        <div><h4>Initiatives</h4><ul>
          <li><a href="https://umodesign.school" target="_blank" rel="noopener">UMO Design School</a></li>
          <li><a href="https://umodesign.school" target="_blank" rel="noopener">UMO Design Grads</a></li>
          <li><a href="https://umo.design" target="_blank" rel="noopener">UXI Conf</a></li>
          <li><a href="https://umo.design" target="_blank" rel="noopener">WiDesign Fest</a></li><li><a href="#women">1 Million Women in Design</a></li></ul></div>
        <div><h4>Support</h4><ul>
          <li><a href="#join-open">Volunteer</a></li><li><a href="#w-mentor">Become a mentor</a></li>
          <li><a href="#join-industry">Partner with us</a></li><li><a href="#provisions">Provisions board</a></li></ul></div>
        <div><h4>Connect</h4><ul>
          <li><span class="muted">Email</span> <span class="ink" style="user-select:all">team@umo.design</span></li>
          <li><a href="https://uxin.co" target="_blank" rel="noopener">Find a job on UXIN</a></li>
          <li><a href="#calendar">Joint Design Calendar</a></li><li><a href="#verdict">Is it worth building?</a></li></ul></div>
      </div>
      <details class="foot-about"><summary>About the model and photo credits</summary>
        <p>LEAD borrows its structure from open learning communities such as the Interaction Design Foundation (IxDF), and adds real industry problems, mentoring and validation. No IxDF content, branding or text is used.</p>
        <p>People photos are illustrative stock from Unsplash. They do not show members of LEAD. Photographers: ${[...new Map(LEAD.photos.list.map((p) => [p.by, p])).values()].map((p) => `<a href="${p.link}" target="_blank" rel="noopener">${esc(p.by)}</a>`).join(', ')}.</p>
      </details>
      <div class="foot-base">
        <span class="row">${ui.tag('Demo only · nothing saved or charged', 'sim')}<span>UMO Design Foundation · LEAD · Prototype v0.8 · Synthetic data only. No real people or student data.</span></span>
        <span class="uxi"><span>With</span><span class="logo-tile"><img src="../public/brand/UXINDIA_logo.png" alt="UXINDIA, Design Leadership Week 2026" width="523" height="102"></span></span>
      </div>
    </div></footer>`;
  }

  /* ---------- demo mode, run by persona ---------- */
  const script = (role) => content.demoByRole[role] || [];
  const nextPersona = (role) => { const o = content.demoOrder; return o[o.indexOf(role) + 1] || null; };

  function demoHTML() {
    const s = store.session;
    if (!s.demo) return '';
    const steps = script(s.role);
    const i = Math.min(s.demoStep, steps.length - 1);
    const st = steps[i];
    const last = i === steps.length - 1;
    const nxt = nextPersona(s.role);
    const r = content.roleById[s.role];
    return `<div class="demo" role="region" aria-label="Demo, ${esc(r.name)}">
      <span class="n">${i + 1}/${steps.length}</span>
      <p><b>${esc(r.name)} · ${esc(st.stage)}.</b> ${esc(st.say)}</p>
      <button class="btn small" data-act="demo-step" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Previous step">Back</button>
      <button class="btn small primary" data-act="demo-step" data-d="1">${last ? (nxt ? 'Hand off to ' + esc(content.roleById[nxt].short) : 'Finish') : 'Next'}</button>
    </div>`;
  }

  /* ---------- render ---------- */
  const app = document.getElementById('app');
  let lastView = null;

  function render(opts) {
    const rawHash = decodeURIComponent(location.hash.slice(1));
    if (/^admin-/.test(rawHash)) history.replaceState(null, '', '#admin');
    if (rawHash === 'model') history.replaceState(null, '', '#home');
    const [view, param] = current();
    LEAD.prevView = lastView; LEAD.curView = view;
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
    const pageTitle = v.title ? v.title(param) : '';
    document.title = pageTitle ? `${pageTitle} · LEAD by UMO Design` : 'LEAD by UMO Design';
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
      if (/^(join|admin)/.test(view) || view === 'home') ui.toast('Price updated.');
      return;
    }
    if (evt.kind === 'pricing') { render({ keepScroll: true }); return; }
    if (evt.kind === 'reset') { render(); ui.toast('Demo reset to the seed.'); return; }
    render({ keepScroll: true });
  });

  /* ---------- event delegation ---------- */
  document.addEventListener('click', (ev) => {
    if (menu.open && !ev.target.closest('.persona-wrap')) setMenu(false);
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
    if (!menu.open) return;
    if (ev.key === 'Escape') { setMenu(false); const b = document.querySelector('.persona-btn'); if (b) b.focus(); return; }
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      const items = [...document.querySelectorAll('#persona-menu button')];
      const i = items.indexOf(document.activeElement);
      const n = ev.key === 'ArrowDown' ? (i + 1) % items.length : (i <= 0 ? items.length - 1 : i - 1);
      ev.preventDefault(); items[n].focus();
    }
  });
  document.addEventListener('focusin', (ev) => { if (menu.open && !ev.target.closest('.persona-wrap')) setMenu(false); });

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
    logout() {
      setMenu(false);
      store.signOut();
      go('home');
      ui.toast('You are logged out.');
    },
    as(el) {
      setMenu(false);
      const role = el.getAttribute('data-role');
      const was = store.session.signedIn;
      store.setRole(role, el.getAttribute('data-user') || undefined);
      if (!was) ui.toast(`Demo: signed in as ${store.me() ? store.me().name : content.roleById[role].name}.`);
      if (store.session.demo) { store.session.demoStep = 0; go(script(role)[0].route); return; }
      const to = el.getAttribute('data-to');
      if (to) go(to); else render({ keepScroll: true });
    },
    'admin-actor'(el) { store.session.adminActor = el.getAttribute('data-actor'); render({ keepScroll: true }); ui.toast(`Acting as ${store.session.adminActor}.`); },
    'persona-menu'() {
      setMenu(!menu.open);
      if (menu.open) { const cur = document.querySelector('.persona-item[aria-checked="true"]'); if (cur) cur.focus(); }
    },
    'demo-toggle'() {
      if (store.session.demo) { store.session.demo = false; render({ keepScroll: true }); return; }
      if (!store.session.signedIn) store.setRole(content.demoOrder[0]);
      store.session.demo = true; store.session.demoStep = 0;
      go(script(store.session.role)[0].route);
    },
    'demo-step'(el) {
      const s = store.session;
      const n = s.demoStep + Number(el.getAttribute('data-d'));
      if (n >= script(s.role).length) {
        const nxt = nextPersona(s.role);
        if (!nxt) { s.demo = false; s.demoStep = 0; render({ keepScroll: true }); ui.toast('Demo complete.'); return; }
        store.setRole(nxt); s.demoStep = 0;
        go(script(nxt)[0].route);
        ui.toast(`Handed off to ${content.roleById[nxt].name}.`);
        return;
      }
      s.demoStep = Math.max(0, n);
      go(script(s.role)[s.demoStep].route);
    },
    reset() { setMenu(false); store.resetDemo(); },
  });
  LEAD.on.role = (el) => { store.setRole(el.value); };

  LEAD.views.notfound = { render: () => `<div class="page wrap"><div class="empty"><h2>Nothing here.</h2><a class="btn" href="#home">Go to the homepage</a></div></div>` };

  if (!location.hash) history.replaceState(null, '', '#home');
  render();
})(typeof globalThis !== 'undefined' ? globalThis : this);
