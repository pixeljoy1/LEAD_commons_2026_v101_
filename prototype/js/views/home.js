/* LEAD · homepage. A public front door in plain language, student-first. It carries the whole service model:
 * your path, the doors for every role, who is in LEAD, what each gives and gets, the plans, where LEAD is today. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, content, pricing: P } = LEAD;
  const { esc } = ui;
  const M = () => LEAD.modelParts;

  const home = { tab: 'student' };
  const roleChip = (id) => `<span class="chip">${esc(ui.roleName(id))}</span>`;
  const MODE_PLAIN = { Replicate: 'Borrowed', Adapt: 'Adapted', New: 'New here' };

  /* A people photo: grayscale, indigo and cyan tint, a checker corner, and its caption. The caption is part of the figure. */
  function photo(slot, o) {
    const p = LEAD.photos.bySlot[slot];
    if (!p) return '';
    const opts = o || {};
    return `<figure class="ph ${opts.cls || ''}"><img src="${p.src}" alt="${esc(p.alt)}" decoding="async" ${opts.eager ? '' : 'loading="lazy"'}><span class="ph-chk" aria-hidden="true"></span><figcaption class="ph-cap">Illustrative · not the person</figcaption></figure>`;
  }

  function heading(title, sub, right) {
    return ui.sectionHead('', title, right, sub);
  }

  /* ---------- 1. hero ---------- */
  function hero() {
    return `<section class="hero home-hero has-aside" aria-labelledby="home-title">
      <span class="dots tr" aria-hidden="true"></span><span class="dots bl" aria-hidden="true"></span>
      <div class="hero-main">
        <h1 id="home-title">Do real design work before you graduate.</h1>
        <p class="lede">Take on a live brief from a real company, get coached by a practitioner, and leave with proof employers trust.</p>
        <div class="btn-row"><button class="btn primary big" data-act="sheet" data-role="student">Join as a student</button><button class="btn big" data-act="scroll" data-id="path">See your path</button></div>
        <div class="stack" style="gap:8px"><span class="label">LEAD also lets you</span>
          <div class="row" role="group" aria-label="Other ways to take part">${content.heroPromises.map((h) => `<button class="chip" data-act="path-role" data-role="${h.role}">${esc(h.label)}</button>`).join('')}</div></div>
      </div>
      <div class="hero-aside">${photo('hero', { cls: 'hero-ph', eager: true })}</div>
    </section>
    <div class="strip" role="group" aria-label="What LEAD has produced, simulated numbers">
      <div><b>3</b><span>live challenges</span></div><div><b>1</b><span>real problem solved</span></div><div><b>38</b><span>verified Passports</span></div><div><b>62</b><span>mentor hours</span></div>
      ${ui.simTag()}
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
    const tab = content.storyTabs.find((t) => t.role === home.tab) || content.storyTabs[0];
    const steps = content.story[tab.role];
    return `<section class="section" id="path" aria-labelledby="path-h">
      <div class="section-head"><div><h2 id="path-h">Your path</h2><p class="muted">${esc(tab.lede)}</p></div></div>
      <div class="row" role="group" aria-label="Show the path for">${content.storyTabs.map((t) => `<button class="chip" data-act="path-tab" data-role="${t.role}" aria-pressed="${t.role === tab.role}">${esc(t.label)}</button>`).join('')}</div>
      <ol class="story" aria-label="${esc(tab.label)} path">${steps.map((s) => beat(tab.role, s)).join('')}</ol>
      <div class="btn-row"><button class="btn primary" data-act="sheet" data-role="${tab.role}">Join as ${tab.role === 'head' ? 'a college' : (tab.role === 'open' ? 'an open learner' : 'a ' + tab.label.toLowerCase())}</button></div>
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
    return `<section class="section" id="ecosystem" aria-label="Who is in LEAD">
      ${heading('Who is in LEAD', 'Each box is a group of people. Each line is something one group gives another. Pick a box or a line to read about it.')}
      <div class="stack" style="gap:10px"><span class="label">Show the map as it runs</span>
        <div class="phases" role="group" aria-label="Show the map as it runs">${content.phases.map((p) => `<button class="phase" data-act="eco-phase" data-id="${p.id}" aria-pressed="${p.id === m.st.phase}"><b>${esc(content.plainPhase[p.id].label)}</b><small>${esc(content.plainPhase[p.id].when)}</small></button>`).join('')}</div></div>
      <div class="row" role="group" aria-label="Filter by what is given">${content.valueKinds.map((k) => `<button class="chip" data-act="eco-kind" data-id="${k.id}" aria-pressed="${m.st.kinds.has(k.id)}" title="${esc(k.note)}"><span class="vk vk-${k.id}"></span>${esc(k.label)}</button>`).join('')}${m.st.kinds.size ? '<button class="chip" data-act="eco-kind" data-id="">Show all</button>' : ''}</div>
      <div class="eco"><div class="eco-canvas">${m.svg()}</div><div id="eco-detail">${m.detail()}</div></div>
    </section>`;
  }

  function gives() {
    return `<section class="section" aria-label="What everyone gives and gets">
      ${heading('What everyone gives and gets', 'Each coloured square is something one group gives another. Pick a square to read it.')}
      ${M().matrix()}
      <div class="legend">${content.valueKinds.map((k) => `<span class="row" style="gap:6px"><span class="vk vk-${k.id}"></span>${esc(k.label)} <span class="muted">· ${esc(k.note)}</span></span>`).join('')}</div>
    </section>`;
  }

  function stay() {
    return `<section class="section" aria-label="Why people stay">
      ${heading('Why people stay', 'A group stays only if it gets at least as much as it gives. Each card says what a group gives, what it gets, and why it keeps coming back.')}
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

  /* ---------- 9. today ---------- */
  function today() {
    const counts = LEAD.gateCounts || {};
    const gates = content.gates.map((g) => Object.assign({}, g, { count: counts[g.id] != null ? counts[g.id] : g.count }));
    const met = gates.filter((g) => g.count >= g.target).length;
    const reading = met <= 2 ? 'Keep running the loop by hand.' : met <= 4 ? 'Build the first live pilots.' : 'Build the full platform.';
    return `<section class="section" id="today" aria-label="Where LEAD is today">
      ${heading('Where LEAD is today', 'LEAD grows in four steps. Each step starts only when the one before has proved itself.')}
      <div class="grid g4">${content.phases.map((p) => `<article class="card"><span class="eyebrow">${esc(content.plainPhase[p.id].when)}</span><h3>${esc(content.plainPhase[p.id].label)}</h3><p style="font-size:14px">${esc(content.plainPhase[p.id].blurb)}</p>
        <button class="btn small ghost" data-act="phase-map" data-id="${p.id}">Show on the map</button></article>`).join('')}</div>
      <div class="card" style="gap:6px">
        <div class="row between"><h3>Five checks before each next step</h3>${ui.tag(`${met} of 5 met`, met >= 3 ? 'live' : 'sim')}</div>
        ${gates.map((g, i) => {
          const pct = Math.round(Math.min(1, g.count / g.target) * 100);
          return `<div class="gate-row"><span class="pxnum" style="font-size:30px">${i + 1}</span>
            <div class="stack" style="gap:4px"><b class="ink">${esc(content.plainGate[g.id])}</b><span>${esc(g.test)}</span><span class="label">${esc(g.by)}</span></div>
            <div class="stack" style="gap:6px"><span class="tnum ink"><b>${g.count}</b> of ${g.target} ${esc(g.unit)}</span>${ui.meter(pct, { px: true })}</div></div>`;
        }).join('')}
        <div class="notice"><span class="px ${met >= 3 ? 'cyan' : 'red'}"></span><span><b class="ink">${esc(reading)}</b> <span class="muted">Fewer than 3 checks: stay by hand. 3 or 4: pilots. All 5: the full platform.</span></span>
          <a href="#verdict">See the evidence behind this</a></div>
      </div>
    </section>`;
  }

  /* ---------- 10–11. lineage and detail ---------- */
  function builtOn() {
    return `<section class="section" aria-label="Built on what already works">
      ${heading('Built on what already works', 'LEAD borrows its structure from open learning communities, then adds what the room asked for: real industry problems, mentoring and validation.')}
      <div class="table-wrap"><table><thead><tr><th>What good learning communities do</th><th>What LEAD does</th><th>How we use it</th><th>What the room adds</th></tr></thead><tbody>
        ${content.ixdf.map((r) => `<tr><td>${esc(r[0])}</td><td><b>${esc(r[1])}</b></td><td>${ui.mode(r[2]).replace(`>${r[2]}<`, `>${MODE_PLAIN[r[2]]}<`)}</td><td>${esc(r[3])}</td></tr>`).join('')}
      </tbody></table></div>
    </section>`;
  }

  function detail() {
    return `<section class="section" aria-label="Everything, in detail">
      ${heading('Everything, in detail', 'For partners and the board: every exchange, and how it runs at each step.')}
      <details class="more"><summary>Show all ${content.flows.length} exchanges</summary><div style="margin-top:12px">${M().phaseTable()}</div></details>
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
      return `<div class="page wrap">${hero()}${path()}${doors()}${who()}${gives()}${stay()}${together()}${plans()}${today()}${builtOn()}${detail()}${questions()}${closing()}</div>`;
    },
    onPricing() {
      const el = document.getElementById('offers');
      if (el) { el.innerHTML = M().offerings(); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
    },
  };

  const scrollTo = (id) => { const t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  Object.assign(LEAD.act, {
    'path-tab'(el) { home.tab = el.getAttribute('data-role'); LEAD.render({ keepScroll: true }); },
    'path-role'(el) { home.tab = el.getAttribute('data-role'); LEAD.render({ keepScroll: true }); scrollTo('path'); },
    scroll(el) { scrollTo(el.getAttribute('data-id')); },
    'phase-map'(el) { M().st.phase = el.getAttribute('data-id'); LEAD.render({ keepScroll: true }); scrollTo('ecosystem'); },
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
