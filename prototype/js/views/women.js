/* LEAD · 1 Million Women in Design. One page: the count of seats funded, where the seats come from,
 * and one clear way for each role to add to it. Seats funded only: money in cash, or hours given in kind. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store } = LEAD;
  const { esc } = ui;

  const tally = () => store.womenTally();
  const nf = (n) => n.toLocaleString('en-IN');
  const CHEER = 'Each seat is one more woman with a new way forward. Add a seat, give an hour or sponsor a cohort, and the next one starts with you.';

  /* The five places seats come from. Order is the order on the bar. */
  const SOURCES = [
    { id: 'share', label: 'Share of paid plans' },
    { id: 'topup', label: 'Top-up seats' },
    { id: 'college', label: 'College pledges' },
    { id: 'sponsor', label: 'Sponsored cohorts' },
    { id: 'hours', label: 'Hours given' },
  ];

  /* The small card the homepage and carousel reuse. */
  function tallyCard() {
    const t = tally();
    const by = t.bySource;
    return `<div class="card women-tally" id="women-tally">
      <span class="eyebrow">Seats funded so far</span>
      <div class="row" style="align-items:baseline;gap:10px"><span class="pxnum" style="font-size:clamp(36px,6vw,56px)" id="women-seats">${nf(t.seats)}</span><span class="muted">of ${nf(t.target)}</span></div>
      <p class="women-words ink" id="women-words"><b>${esc(ui.numberWords(t.seats))}</b> women have a funded seat in design.</p>
      <p class="women-cheer">${esc(CHEER)}</p>
      ${ui.meter(Math.max(1, Math.round(t.pct)), { px: true })}
      <div class="src-bar" id="women-sources" role="img" aria-label="Where the seats come from">${SOURCES.map((s) => `<i class="src src-${s.id}" style="flex:${Math.max(by[s.id], 1)}" title="${esc(s.label)}: ${nf(by[s.id])}"></i>`).join('')}</div>
      <ul class="src-legend">${SOURCES.map((s) => `<li><span class="src-dot src-${s.id}"></span><span>${esc(s.label)}</span><b class="tnum" data-src="${s.id}">${nf(by[s.id])}</b></li>`).join('')}</ul>
      <p class="muted tiny">Demo count. It starts from a made-up figure, and every mock sign-up or finished offer adds to it.</p>
    </div>`;
  }

  /* One card per way in. Each shows what it has added so far and the real action. */
  function roleCards() {
    const s = store.session; const by = tally().bySource;
    const me = s.signedIn ? s.role : null;
    const seatWord = (n) => `${nf(n)} seats`;
    const signIn = (role, label) => `<button class="btn ghost" data-act="as" data-role="${role}" data-to="learn">Sign in as ${esc(label)} to do this</button>`;
    const offer = (role, label, text) => (me === role ? `<button class="btn primary" data-act="lrn-women-offer">${esc(text)}</button>` : signIn(role, label));
    const cards = [
      { role: 'student', name: 'Student', slot: 'women-field', total: seatWord(by.topup), what: 'Top-up seats added at sign-up',
        line: 'Add a seat for a woman when you enrol on a Path. Each seat adds 1. You can also lead a women’s circle: every 10 hours adds a seat.',
        btns: ['<a class="btn primary" href="#join-path">Add a seat when you enrol</a>', offer('student', 'a student', 'Lead a women’s circle')] },
      { role: 'faculty', name: 'Faculty', slot: 'women-circle', total: seatWord(by.hours), what: 'Hours given by mentors and faculty',
        line: 'Offer hours for women in design. Every 10 hours you teach adds a seat once a UMO admin marks it done.',
        btns: [offer('faculty', 'faculty', 'Offer hours for women')] },
      { role: 'head', name: 'College', slot: 'women-market', total: seatWord(by.college), what: 'Seats pledged by colleges',
        line: 'Pledge seats for your women students in the campus sign-up. Each seat you pledge adds 1.',
        btns: ['<a class="btn primary" href="#join-college">Pledge seats at sign-up</a>'] },
      { role: 'industry', name: 'Industry', slot: 'women-work', total: seatWord(by.sponsor), what: 'Seats in sponsored cohorts',
        line: 'Sponsor a women’s cohort on a real live project. One cohort adds 10 seats.',
        btns: ['<a class="btn primary" href="#join-sponsor">Sponsor a cohort</a>'] },
      { role: 'mentor', name: 'Mentor', slot: 'women-tea', total: seatWord(by.hours), what: 'Hours given by mentors and faculty',
        line: 'Offer an office hour or a talk for women designers. Every 10 hours adds a seat once a UMO admin marks it done.',
        btns: [offer('mentor', 'a mentor', 'Offer hours for women')] },
      { role: null, name: 'Everyone', slot: null, total: seatWord(by.share), what: 'Share of paid plans',
        line: `${store.pricing.settings.womenSharePct}% of every paid plan goes to the initiative. Nobody pays extra. It happens when anyone signs up.`,
        btns: ['<a class="btn ghost" href="#join">See the plans</a>'] },
    ];
    cards.sort((a, b) => (b.role === me && me ? 1 : 0) - (a.role === me && me ? 1 : 0));
    const ph = (slot) => { const p = LEAD.photos.bySlot[slot]; return p ? `<figure class="ph door-ph"><img src="${p.src}" alt="${esc(p.alt)}" decoding="async" loading="lazy"><span class="ph-chk" aria-hidden="true"></span><figcaption class="ph-cap">Illustrative purposes only</figcaption></figure>` : ''; };
    return cards.map((c) => `<article class="card tight women-role ${c.role && c.role === me ? 'is-you' : ''}" data-role="${c.role || 'all'}">${c.slot ? ph(c.slot) : ''}
      <div class="row between"><span class="eyebrow">${esc(c.name)}</span>${c.role && c.role === me ? '<span class="tag info">You</span>' : ''}</div>
      <div class="stack" style="gap:2px"><b class="pxnum" style="font-size:30px">${esc(c.total)}</b><span class="muted tiny">${esc(c.what)}</span></div>
      <p class="ink" style="font-size:14px">${esc(c.line)}</p>
      <div class="btn-row">${c.btns.join('')}</div></article>`).join('');
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
      const signed = store.session.signedIn;
      return `<div class="page wrap">
        <section class="hero has-aside" aria-labelledby="women-title">
          <span class="dots tr" aria-hidden="true"></span>
          <div class="hero-main"><span class="eyebrow">An initiative of UMO Design Foundation</span>
            <h1 id="women-title">1 Million Women in Design.</h1>
            <p class="lede">Design is stronger when more women shape it. Every seat funded puts one more woman into learning design. LEAD adds to the count from five places, and every role has a way to add to it.</p>
            <div class="btn-row">${signed ? '<button class="btn primary big" data-act="scroll" data-id="women-roles">What I can do</button>' : '<button class="btn primary big" data-act="sheet" data-role="student">Join LEAD</button><button class="btn big" data-act="scroll" data-id="women-roles">How each role adds seats</button>'}</div></div>
          <div class="hero-aside">${photo ? `<figure class="ph hero-ph"><img src="${photo.src}" alt="${esc(photo.alt)}" decoding="async"><span class="ph-chk" aria-hidden="true"></span><figcaption class="ph-cap">Illustrative purposes only</figcaption></figure>` : ''}</div>
        </section>
        <section class="section" aria-label="Tally">${tallyCard()}</section>
        <section class="section" aria-label="What counts as a seat">
          ${ui.sectionHead('', 'What counts as a seat', ui.mockTag(), 'One seat is one woman’s place in learning. It is funded in money or in hours.')}
          <div class="grid g3">
            <article class="card"><span class="pxnum" style="font-size:40px">${esc(st.womenSharePct)}%</span><h3>A share of every paid plan</h3>
              <p>${esc(st.womenSharePct)}% of what a college, company or learner pays goes to this initiative. It comes out of the price. Nobody pays extra. Every ${ui.inr(st.womenSeatPrice)} funds a seat.</p></article>
            <article class="card"><span class="pxnum" style="font-size:40px">${ui.inr(st.womenSeatPrice)}</span><h3>Add a seat</h3>
              <p>At sign-up you can add seats for women learners, pledge seats for your college, or sponsor a cohort of 10. It is optional.</p></article>
            <article class="card"><span class="pxnum" style="font-size:40px">${esc(st.womenHoursPerSeat)} h</span><h3>Hours given</h3>
              <p>Teaching hours count too. Every ${esc(st.womenHoursPerSeat)} hours you give to women in design counts as one seat, once a UMO admin marks it done.</p></article>
          </div>
        </section>
        <section class="section" id="women-roles" aria-label="How each role adds seats">
          ${ui.sectionHead('', 'How each role adds seats', '', signed ? 'Your role is first. Each card shows what that way has added so far.' : 'Each card shows what that way has added so far, and the step to add more.')}
          <div class="grid g3">${roleCards()}</div>
        </section>
        <section class="section" aria-label="Sessions">
          ${ui.sectionHead('', 'Dedicated sessions', '', 'Circles, faculty sessions and mentor hours for women in design. Demo dates. You can also start with LM-SP-5, a free module for women entering design.')}
          <div class="card">${sessions()}<div class="btn-row"><a class="btn small" href="#learn-LM-SP-5">Open LM-SP-5</a><a class="btn small ghost" href="#learn-LM-PL-2">Women in Design circle · LM-PL-2</a></div></div>
        </section>
      </div>`;
    },
    onPricing() { LEAD.render({ keepScroll: true }); },
  };

  LEAD.womenTallyCard = tallyCard;
})(typeof globalThis !== 'undefined' ? globalThis : this);
