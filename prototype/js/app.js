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
    if (/^admin-/.test(t)) return ['admin', null]; // old admin routes now live on one page
    const prefixes = ['w-', 'lexicon-', 'challenge-', 'team-', 'passport-', 'join-path-', 'join-sponsor-'];
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
    const items = content.roles.map((x) => `<button class="persona-item" role="menuitemradio" aria-checked="${x.id === s.role}" data-act="as" data-role="${x.id}" data-to="${x.id === 'admin' ? 'admin' : 'w-' + x.id}">
        ${ui.glyph(x.id)}<span><b>${esc(x.name)}</b><small>${esc(x.lens)} lens</small></span>${x.id === s.role ? '<span class="px cyan" aria-hidden="true"></span>' : ''}</button>`).join('');
    return `${bannerHTML()}
    <header class="site-head">
      <div class="wrap head-row">
        <a class="brand" href="#model" aria-label="LEAD Commons, by UMO Design Foundation. Home">
          <span class="logo-tile"><img src="../public/brand/UMO_logo.png" alt="UMO Design" width="309" height="129"></span>
          <span class="brand-div" aria-hidden="true"></span>
          <b class="brand-name">LEAD Commons</b>
        </a>
        <nav class="nav" aria-label="Main">${NAV.map(([k, l]) => `<a href="#${k}" ${k === active ? 'aria-current="page"' : ''}>${l}</a>`).join('')}<a class="nav-join" href="#join">Join</a></nav>
        <div class="head-tools">
          <button class="btn small demo-btn" data-act="demo-toggle" aria-pressed="${s.demo}" title="Walk the current persona through the loop">${s.demo ? 'Exit demo' : 'Demo'}</button>
          <div class="persona-wrap">
            <button class="persona-btn" data-act="persona-menu" aria-haspopup="menu" aria-expanded="${menu.open}" aria-controls="persona-menu" title="Switch persona">
              ${ui.glyph(s.role)}<span class="pname">${esc(r.short)}</span>${CARET}
            </button>
            <div class="persona-menu" id="persona-menu" role="menu" aria-label="Switch persona" ${menu.open ? '' : 'hidden'}>
              <div class="persona-head"><span class="label">Acting as</span><b class="ink">${esc(me ? me.name : '')}</b>${org && org.kind !== 'open' ? `<span class="muted">${esc(org.name)}</span>` : ''}${ui.tag('Demo only · nothing saved or charged', 'sim')}</div>
              ${items}
              <div class="divider"></div>
              <button class="persona-item" role="menuitem" data-act="theme"><span class="glyph-gap">${theme === 'light' ? MOON : SUN}</span><span><b>Switch theme</b><small>Now ${theme || 'system'}</small></span></button>
              <button class="persona-item" role="menuitem" data-act="reset"><span class="glyph-gap"></span><span><b>Reset demo</b><small>Clear demo data and start again</small></span></button>
            </div>
          </div>
          <a class="btn join head-join" href="#join">Join</a>
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
        <span class="row">${ui.tag('Demo only · nothing saved or charged', 'sim')}<span>UMO Design Foundation · LEAD · Prototype v0.3 · Synthetic data only. No real people or student data.</span></span>
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
    if (/^admin-/.test(decodeURIComponent(location.hash.slice(1)))) history.replaceState(null, '', '#admin');
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
    as(el) {
      setMenu(false);
      const role = el.getAttribute('data-role');
      store.setRole(role, el.getAttribute('data-user') || undefined);
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

  LEAD.views.notfound = { render: () => `<div class="page wrap"><div class="empty"><h2>Nothing here.</h2><a class="btn" href="#model">Go to the service model</a></div></div>` };

  if (!location.hash) history.replaceState(null, '', '#model');
  render();
})(typeof globalThis !== 'undefined' ? globalThis : this);
