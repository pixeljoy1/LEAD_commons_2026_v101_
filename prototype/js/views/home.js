/* LEAD · homepage. A public front door in plain language, student-first. It carries the whole service model:
 * your path, the doors for every role, who is in LEAD, what each gives and gets, the plans, where LEAD is today. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, content, pricing: P } = LEAD;
  const { esc } = ui;
  const M = () => LEAD.modelParts;

  const home = { tab: null, leaf: 0, hold: false };
  const roleChip = (id) => `<span class="chip">${esc(ui.roleName(id))}</span>`;

  /* A people photo: grayscale, indigo and cyan tint, a checker corner, and its caption. The caption is part of the figure. */
  function photo(slot, o) {
    const p = LEAD.photos.bySlot[slot];
    if (!p) return '';
    const opts = o || {};
    return `<figure class="ph ${opts.cls || ''}"><img src="${p.src}" alt="${esc(p.alt)}" decoding="async" ${opts.eager ? '' : 'loading="lazy"'}><span class="ph-chk" aria-hidden="true"></span><figcaption class="ph-cap">Illustrative purposes only</figcaption></figure>`;
  }

  function heading(title, sub, right) {
    return ui.sectionHead('', title, right, sub);
  }

  /* ---------- 1. hero: a timed carousel. Picking a leaf unfolds "Your path" below. ---------- */
  const reduced = () => !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const roleOf = (r) => content.storyTabs.find((t) => t.role === r);
  const doorOf = (r) => content.doors.find((d) => d.role === r);

  function leafStory(l) {
    return `<div class="leaf-main"><span class="eyebrow">${esc(l.eyebrow)}</span><h1 class="leaf-h" id="home-title">${esc(l.head)}</h1>
        <p class="lede">${esc(l.line)}</p>
        <div class="btn-row"><button class="btn primary big" data-act="path-role" data-role="${l.primary[1]}">${esc(l.primary[0])}</button><button class="btn big" data-act="scroll" data-id="${l.second[1]}">${esc(l.second[0])}</button></div></div>
      <div class="leaf-aside"><div class="sb" aria-label="How the loop works" role="group">
        <ol class="sb-tiles" aria-hidden="true">${l.beats.map((b, i) => `<li class="sb-tile" style="--i:${i}"><span class="pxnum">${i + 1}</span><b>${esc(b.tile)}</b></li>`).join('')}</ol>
        <div class="sb-caps" aria-live="off">${l.beats.map((b, i) => `<p class="sb-cap" style="--i:${i}"><span class="pxnum">${i + 1}</span>${esc(b.cap)}</p>`).join('')}</div>
        <p class="sb-loop tiny muted">Then the loop starts again.</p></div></div>`;
  }

  function leafRole(l) {
    const d = l.role ? doorOf(l.role) : null;
    return `<div class="leaf-main"><span class="eyebrow">${esc(l.label)}</span><h2 class="leaf-h">${esc(l.head)}</h2>
        <p class="lede">${esc(l.line)}</p>
        ${d ? `<ul class="px-list">${d.can.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
        <div class="btn-row"><button class="btn primary big" data-act="path-role" data-role="${l.primary[1]}">${esc(l.primary[0])}</button>${l.second ? `<button class="btn big" data-go="${l.second[1]}">${esc(l.second[0])}</button>` : ''}</div></div>
      <div class="leaf-aside">${photo(l.photo, { cls: 'hero-ph' })}</div>`;
  }

  function leafWomen(l) {
    const t = store.womenTally();
    return `<div class="leaf-main"><span class="eyebrow">An initiative of UMO Design Foundation</span><h2 class="leaf-h">${esc(l.head)}</h2>
        <p class="lede">${esc(l.line)}</p>
        <div class="stack" style="gap:6px"><span class="tnum ink"><b>${t.seats.toLocaleString('en-IN')}</b> of ${t.target.toLocaleString('en-IN')} seats funded</span><span class="women-words ink"><b>${esc(ui.numberWords(t.seats).replace(/^./, (c) => c.toUpperCase()))}</b> women have a funded seat in design.</span><span class="women-cheer">Each seat is one more woman with a new way forward. Add a seat, give an hour or sponsor a cohort, and the next one starts with you.</span>${ui.meter(Math.max(1, Math.round(t.pct)), { px: true })}<span class="muted tiny">Demo count.</span></div>
        <div class="btn-row"><button class="btn primary big" data-go="women">${esc(l.second[0])}</button><button class="btn big" data-act="path-role" data-role="${l.primary[1]}">${esc(l.primary[0])}</button></div></div>
      <div class="leaf-aside">${photo(l.photo, { cls: 'hero-ph' })}</div>`;
  }

  function hero() {
    const L = content.leaves;
    const cur = Math.min(home.leaf, L.length - 1);
    return `<section class="hero home-hero car" id="car" aria-roledescription="carousel" aria-label="What LEAD offers each role" data-n="${L.length}">
      <span class="dots tr" aria-hidden="true"></span><span class="dots bl" aria-hidden="true"></span>
      <div class="car-stage" aria-live="off">${L.map((l, i) => `<div class="leaf leaf-${l.kind} ${i === cur ? 'on' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${L.length}: ${esc(l.label)}" data-i="${i}" ${i === cur ? '' : 'hidden'} style="--ms:${l.ms}ms">${l.kind === 'story' ? leafStory(l) : l.kind === 'women' ? leafWomen(l) : leafRole(l)}</div>`).join('')}</div>
      <div class="car-bar" aria-hidden="true"><i style="--ms:${L[cur].ms}ms"></i></div>
      <div class="car-ctrl" role="group" aria-label="Carousel controls">
        <button class="icon-btn" data-act="car-prev" aria-label="Previous">&#8592;</button>
        <button class="icon-btn" data-act="car-pause" aria-label="${home.hold ? 'Play' : 'Pause'}" aria-pressed="${home.hold}">${home.hold ? '&#9654;' : '&#10074;&#10074;'}</button>
        <button class="icon-btn" data-act="car-next" aria-label="Next">&#8594;</button>
        <div class="car-tabs" role="group" aria-label="Pick a slide">${L.map((l, i) => `<button class="chip" data-act="car-go" data-i="${i}" aria-pressed="${i === cur}">${esc(l.label)}</button>`).join('')}</div>
      </div>
    </section>
    <div class="strip" role="group" aria-label="What LEAD has produced">
      <div><b>3</b><span>live projects</span></div><div><b>1</b><span>real problem solved</span></div><div><b>38</b><span>verified Passports</span></div><div><b>62</b><span>mentor hours</span></div>
    </div>`;
  }

  /* ---------- 2. your path ---------- */
  function beat(role, s) {
    const r = content.roleById[role];
    const j = r.journey.find((x) => x.stage === s.stage);
    const stg = content.stages.find((x) => x.id === s.stage);
    const feats = (s.feats || (j ? j.feats : [])).map((id) => content.featureById[id]).filter(Boolean);
    const hand = s.handoff || (j ? j.handoff : []);
    const sample = s.sample || (j ? j.screen : null);
    const ph = s.photo ? photo(s.photo, { cls: 'beat-ph' }) : '';
    return `<li class="beat ${ph ? 'has-ph' : ''}">
      <div class="beat-rail" aria-hidden="true"><span class="pxnum">${stg.n}</span></div>
      <div class="beat-body">
        <div class="eyebrow">${esc(s.when)} · ${esc(stg.id)}</div>
        <h3>${esc(s.head)}</h3>
        <p>${esc(s.body)}</p>
        ${feats.length ? `<p class="muted tiny">You will use: ${feats.map((f) => esc(f.name)).join(' · ')}</p>` : ''}
        ${hand.length ? `<div class="row tiny"><span class="muted">Then it goes to</span>${hand.map(roleChip).join('')}</div>` : ''}
        <div class="btn-row"><button class="btn" data-act="as" data-role="${role}" data-to="${s.route}">${esc(s.cta)}</button></div>
        ${sample ? `<details class="more"><summary>See a sample screen</summary><div style="margin-top:10px">${ui.simFrame(sample.title, `<h4>${esc(sample.title)}</h4>${ui.kv(sample.rows)}`)}</div></details>` : ''}
      </div>
      ${ph}
    </li>`;
  }

  function path() {
    if (!home.tab) return '';
    const tab = content.storyTabs.find((t) => t.role === home.tab) || content.storyTabs[0];
    const steps = content.story[tab.role];
    return `<section class="section path-open" id="path" aria-labelledby="path-h" tabindex="-1">
      <div class="section-head"><div><h2 id="path-h">Your path</h2><p class="muted">${esc(tab.lede)}</p></div><button class="btn small ghost" data-act="path-close">Close the path</button></div>
      <div class="row" role="group" aria-label="Show the path for">${content.storyTabs.map((t) => `<button class="chip" data-act="path-tab" data-role="${t.role}" aria-pressed="${t.role === tab.role}">${esc(t.label)}</button>`).join('')}</div>
      <ol class="story" aria-label="${esc(tab.label)} path">${steps.map((s) => beat(tab.role, s)).join('')}</ol>
      <div class="btn-row"><button class="btn primary" data-act="sheet" data-role="${tab.role}">Join as ${tab.role === 'head' ? 'a college' : (tab.role === 'open' ? 'an open learner' : (tab.role === 'faculty' ? 'faculty' : 'a ' + tab.label.toLowerCase()))}</button><a class="btn ghost" href="#women">1 Million Women in Design</a></div>
    </section>`;
  }

  /* ---------- 3. doors ---------- */
  function doors() {
    return `<section class="section" id="doors" aria-label="Find your door">
      ${heading('Find your door', 'Pick who you are. Each door shows what you can do and how to join.')}
      <div class="doors-grid">${content.doors.map((d) => {
        const plan = d.plan ? store.plan(d.plan) : null;
        const from = plan ? P.fromPrice(plan) : null;
        return `<article class="door card">
          ${photo(d.photo, { cls: 'door-ph' })}
          <div class="door-body"><span class="eyebrow">${esc(d.name)}</span><h3>${esc(d.line)}</h3>
            <ul class="px-list">${d.can.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
            <div class="row" style="gap:8px"><span class="tag info">${esc(d.price(from == null ? '' : ui.inr(from)))}</span>${plan ? ui.tag('Mock price', 'mock') : ''}</div>
            <div class="btn-row"><button class="btn primary" data-act="sheet" data-role="${d.role}" aria-label="Join as ${esc(d.name)}">Join</button><button class="btn ghost" data-act="path-role" data-role="${d.role}">See the path</button></div>
          </div></article>`;
      }).join('')}</div>
    </section>`;
  }

  /* ---------- 4–7. the model, in plain words ---------- */
  function who() {
    const m = M();
    return `<section class="section" id="ecosystem" aria-label="What is in it for you">
      ${heading('What is in it for you', 'Every group gives something and gets something back. Tap your group, then a line.')}
      <div class="row eco-filter" role="group" aria-label="Show only what moves between groups"><span class="label">Show only</span>${content.valueKinds.map((k) => `<button class="chip" data-act="eco-kind" data-id="${k.id}" aria-pressed="${m.st.kinds.has(k.id)}" title="${esc(k.note)}" aria-label="${esc(k.label)}: ${esc(k.note)}"><span class="vk vk-${k.id}"></span>${esc(k.label)}</button>`).join('')}${m.st.kinds.size ? '<button class="chip" data-act="eco-kind" data-id="">Show all</button>' : ''}</div>
      <div class="eco"><div class="eco-canvas">${m.svg()}</div><div class="eco-side"><div id="eco-detail">${m.detail()}</div></div></div>
    </section>`;
  }

  function gives() {
    return `<section class="section" aria-label="What everyone gives and gets">
      ${heading('What everyone gives and gets', 'The same exchanges as a table. Each coloured square is something one group gives another. Pick a square to read it. Prefer a picture? See the map above.')}
      ${M().matrix()}
      <div class="legend">${content.valueKinds.map((k) => `<span class="row" style="gap:6px"><span class="vk vk-${k.id}"></span>${esc(k.label)} <span class="muted">· ${esc(k.note)}</span></span>`).join('')}</div>
    </section>`;
  }

  function stay() {
    return `<section class="section" aria-label="What keeps you here">
      ${heading('What keeps you here', 'A group stays only if it gets at least as much as it gives. Each card shows what a group gives, what it gets, and why it is worth it.')}
      <div class="grid g4">${M().stayCards()}</div>
    </section>`;
  }

  function together() {
    return `<section class="section" aria-label="Seven ways people work together">
      ${heading('Seven ways people work together', 'Each one passes work from person to person. Start any of them as the first person in the chain.')}
      <div class="grid g3">${content.workflows.map((w) => `<article class="card tight">
        <div class="row between"><span class="pxnum" style="font-size:24px">${w.seq.length}</span><button class="btn small" data-act="as" data-role="${w.seq[0]}" data-to="w-${w.seq[0]}">Start</button></div>
        <h4>${esc(w.name)}</h4>
        <div class="row" style="gap:6px">${w.seq.map((r, i) => `${i ? '<span class="muted">→</span>' : ''}<button class="chip" data-act="as" data-role="${r}" data-to="w-${r}">${esc(ui.roleName(r))}</button>`).join('')}</div>
        <p class="muted" style="font-size:13px">${esc(w.result)}</p></article>`).join('')}</div>
    </section>`;
  }

  /* ---------- 8. plans ---------- */
  function plans() {
    return `<section class="section" id="plans" aria-label="Ways to join and what they cost">
      ${heading('Ways to join and what they cost', 'Prices come from the UMO admin and update here within seconds. Nothing is charged.', ui.mockTag())}
      <div class="grid g3" id="offers">${M().offerings()}</div>
    </section>`;
  }

  /* ---------- 12–13. questions and the last word ---------- */
  function questions() {
    return `<section class="section" id="faq" aria-label="Questions people ask">
      ${heading('Questions people ask')}
      <div class="faq">${content.faq.map(([q, a], i) => `<details class="qa" ${i === 0 ? 'open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    </section>`;
  }

  function closing() {
    return `<section class="band closing" aria-label="Join">
      <div class="stack" style="gap:10px"><h2>Ready to start?</h2><p class="ink">It is free to start. Pick how you want to take part.</p>
        <div class="btn-row"><button class="btn primary big" data-act="sheet" data-role="student">Join as a student</button><button class="btn big" data-act="sheet" data-role="open">Not a student? Choose your role</button></div></div>
    </section>`;
  }

  LEAD.views.home = {
    title: () => '',
    render() {
      return `<div class="page wrap">${hero()}<div id="path-slot">${path()}</div>${doors()}${who()}${gives()}${stay()}${together()}${plans()}${questions()}${closing()}</div>`;
    },
    after() { wireCarousel(); },
    onPricing() {
      const el = document.getElementById('offers');
      if (el) { el.innerHTML = M().offerings(); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
    },
  };

  const scrollTo = (id) => { const t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); };

  /* ---------- carousel controller. The bar's CSS animation is the timer: when it ends, the next leaf shows. ---------- */
  const car = { hover: false, focus: false };
  const carEl = () => document.getElementById('car');
  const holding = () => home.hold || car.hover || car.focus;
  function applyHold() {
    const c = carEl(); if (!c) return;
    c.classList.toggle('paused', holding());
    c.classList.toggle('still', reduced());
    const pb = c.querySelector('[data-act="car-pause"]');
    if (pb) { pb.setAttribute('aria-pressed', String(home.hold)); pb.setAttribute('aria-label', home.hold ? 'Play' : 'Pause'); pb.innerHTML = home.hold ? '&#9654;' : '&#10074;&#10074;'; }
  }
  function showLeaf(i) {
    const c = carEl(); if (!c) return;
    const L = content.leaves; const n = L.length;
    home.leaf = ((i % n) + n) % n;
    c.querySelectorAll('.leaf').forEach((el) => { const on = Number(el.dataset.i) === home.leaf; el.hidden = !on; el.classList.toggle('on', on); });
    c.querySelectorAll('[data-act="car-go"]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.i) === home.leaf)));
    const bar = c.querySelector('.car-bar i');
    if (bar) { bar.style.setProperty('--ms', L[home.leaf].ms + 'ms'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    applyHold();
  }
  function wireCarousel() {
    const c = carEl(); if (!c) return;
    applyHold();
    const bar = c.querySelector('.car-bar i');
    if (bar) bar.addEventListener('animationend', () => { if (!reduced()) showLeaf(home.leaf + 1); });
    c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { car.hover = true; applyHold(); } });
    c.addEventListener('pointerleave', () => { car.hover = false; applyHold(); });
    c.addEventListener('focusin', () => { car.focus = true; applyHold(); });
    c.addEventListener('focusout', (e) => { if (!c.contains(e.relatedTarget)) { car.focus = false; applyHold(); } });
    /* any tap holds the slide until the person presses play */
    c.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' && !home.hold) { home.hold = true; applyHold(); } });
  }

  function openPath(role) {
    home.tab = role;
    const slot = document.getElementById('path-slot');
    if (!slot) { LEAD.render({ keepScroll: true }); return; }
    slot.innerHTML = path();
    scrollTo('path');
    const h = document.getElementById('path-h'); if (h) setTimeout(() => h.focus && h.setAttribute('tabindex', '-1'), 0);
  }

  Object.assign(LEAD.act, {
    'path-tab'(el) { openPath(el.getAttribute('data-role')); },
    'path-role'(el) { openPath(el.getAttribute('data-role')); },
    'path-close'() { home.tab = null; const slot = document.getElementById('path-slot'); if (slot) slot.innerHTML = ''; scrollTo('car'); },
    'car-go'(el) { showLeaf(Number(el.getAttribute('data-i'))); },
    'car-next'() { showLeaf(home.leaf + 1); },
    'car-prev'() { showLeaf(home.leaf - 1); },
    'car-pause'() { home.hold = !home.hold; applyHold(); },
    scroll(el) { scrollTo(el.getAttribute('data-id')); },
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
