/* LEAD · 1 Million Women in Design. A page of its own: the tally, how fees and sign-ups power it, and a way in for every role. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, pricing: P } = LEAD;
  const { esc } = ui;

  const tally = () => P.womenTally(store.pricing.signups, store.pricing.settings);
  const nf = (n) => n.toLocaleString('en-IN');

  /* The small card the homepage and carousel reuse. */
  function tallyCard() {
    const t = tally();
    return `<div class="card women-tally" id="women-tally">
      <span class="eyebrow">Seats funded so far</span>
      <div class="row" style="align-items:baseline;gap:10px"><span class="pxnum" style="font-size:clamp(36px,6vw,56px)">${nf(t.seats)}</span><span class="muted">of ${nf(t.target)}</span></div>
      ${ui.meter(Math.max(1, Math.round(t.pct)), { px: true })}
      <p class="muted tiny">Demo count. It starts from a made-up figure, and every mock sign-up adds to it.</p>
    </div>`;
  }

  function roleCards() {
    const cards = [
      ['Student', 'women-field', 'Join a women’s circle as a step in your path.', [['Join as a student', 'sheet', 'student'], ['Women in Design circle', 'go', 'learn-LM-PL-2']]],
      ['Faculty', 'women-circle', 'Run or join a dedicated session for your studio.', [['See the sessions', 'go', 'calendar']]],
      ['College', 'women-market', 'Pledge seats for women students when you sign up.', [['Pledge at sign-up', 'go', 'join-college']]],
      ['Industry', 'women-work', 'Sponsor a women’s cohort on a real challenge.', [['Sponsor a cohort', 'go', 'join-sponsor']]],
      ['Mentor', 'women-tea', 'Offer a session or an office hour for women designers.', [['Offer your hours', 'sheet', 'mentor']]],
      ['Learn', null, 'Start with LM-SP-5, a free 30-minute module for women entering design.', [['Open LM-SP-5', 'go', 'learn-LM-SP-5']]],
    ];
    const ph = (slot) => { const p = LEAD.photos.bySlot[slot]; return p ? `<figure class="ph door-ph"><img src="${p.src}" alt="${esc(p.alt)}" decoding="async" loading="lazy"><span class="ph-chk" aria-hidden="true"></span><figcaption class="ph-cap">Illustrative · not the person</figcaption></figure>` : ''; };
    return cards.map(([name, slot, line, btns]) => `<article class="card tight women-role">${slot ? ph(slot) : ''}<span class="eyebrow">${esc(name)}</span><p class="ink">${esc(line)}</p>
      <div class="btn-row">${btns.map(([l, k, v], i) => k === 'sheet'
        ? `<button class="btn ${i ? 'ghost' : 'primary'}" data-act="sheet" data-role="${v}">${esc(l)}</button>`
        : `<button class="btn ${i ? 'ghost' : 'primary'}" data-go="${v}">${esc(l)}</button>`).join('')}</div></article>`).join('');
  }

  function sessions() {
    const list = store.loop.events.filter((e) => e.women).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    return `<ul class="list">${list.map((e) => `<li class="row between give-row"><span><b class="ink">${esc(e.title)}</b><br><span class="muted tiny">${esc(ui.fmtDate(e.at))} · ${esc(e.where)}</span></span><a class="btn small ghost" href="#calendar">Calendar</a></li>`).join('') || '<li class="muted">No sessions yet.</li>'}</ul>`;
  }

  LEAD.views.women = {
    title: () => '1 Million Women in Design',
    render() {
      const st = store.pricing.settings;
      const photo = LEAD.photos.bySlot.women;
      return `<div class="page wrap">
        <section class="hero has-aside" aria-labelledby="women-title">
          <span class="dots tr" aria-hidden="true"></span>
          <div class="hero-main"><span class="eyebrow">An initiative of UMO Design Foundation</span>
            <h1 id="women-title">1 Million Women in Design.</h1>
            <p class="lede">Design is stronger when more women shape it. LEAD puts part of every paid plan, and every extra seat you add, toward reaching one million women in design.</p>
            <div class="btn-row"><button class="btn primary big" data-act="sheet" data-role="student">Join LEAD</button><a class="btn big" href="#join">Add a seat when you sign up</a></div></div>
          <div class="hero-aside">${photo ? `<figure class="ph hero-ph"><img src="${photo.src}" alt="${esc(photo.alt)}" decoding="async"><span class="ph-chk" aria-hidden="true"></span><figcaption class="ph-cap">Illustrative · not the person</figcaption></figure>` : ''}</div>
        </section>
        <section class="section" aria-label="Tally">${tallyCard()}</section>
        <section class="section" aria-label="How it is funded">
          ${ui.sectionHead('', 'How it is funded', ui.mockTag(), 'Two ways, and you can use both.')}
          <div class="grid g2">
            <article class="card"><span class="pxnum" style="font-size:40px">${esc(st.womenSharePct)}%</span><h3>Every paid plan gives a share</h3>
              <p>${esc(st.womenSharePct)}% of what a college, company or learner pays goes to this initiative. It comes out of the price. Nobody pays extra. UMO sets the share and changes are logged.</p></article>
            <article class="card"><span class="pxnum" style="font-size:40px">${ui.inr(st.womenSeatPrice)}</span><h3>Add a seat for a woman</h3>
              <p>At sign-up you can add seats for women learners. Each one is ${ui.inr(st.womenSeatPrice)} and counts toward the tally. It is optional.</p></article>
          </div>
        </section>
        <section class="section" aria-label="Ways to take part">
          ${ui.sectionHead('', 'Take part in your role', '', 'Every role has a way in.')}
          <div class="grid g3">${roleCards()}</div>
        </section>
        <section class="section" aria-label="Sessions">
          ${ui.sectionHead('', 'Dedicated sessions', '', 'Circles, faculty sessions and mentor hours for women in design. Demo dates.')}
          <div class="card">${sessions()}</div>
        </section>
      </div>`;
    },
    onPricing() { LEAD.render({ keepScroll: true }); },
  };

  LEAD.womenTallyCard = tallyCard;
})(typeof globalThis !== 'undefined' ? globalThis : this);
