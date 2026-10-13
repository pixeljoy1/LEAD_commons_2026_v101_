/* LEAD · Learn. One catalogue for every role, a demo course (LM-SP-1), and ways to give back:
 * teach, add to an open topic, ask for something to be taught. Codes: LM-<mode>-<n> module, LP-n path, TP-n topic, RQ-n request, OF-n offer. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, rules, enums, pricing: P } = LEAD;
  const { esc } = ui;
  const Lr = () => store.loop.learning;
  const role = () => store.session.role;
  const me = () => store.me();
  const uid = () => { const m = me(); return m ? m.id : null; };
  const f = { mode: '', skill: '', q: '', all: false };
  const play = { code: null, phase: 'list', lesson: null, result: null };
  const open = { teach: false, topic: false, request: false, women: false };

  const byCode = (c) => Lr().modules.find((m) => m.code === c) || null;
  const rec = (code) => ((Lr().progress[uid()] || {})[code]) || null;
  const prog = (m) => rules.moduleProgress(m, rec(m.code));
  const forYou = (m) => role() === 'admin' || m.for.includes(role());
  const seqOf = () => LEAD.learningData.sequences[role()] || LEAD.learningData.sequences.open;
  const seqIdx = (code) => seqOf().findIndex((x) => x[0] === code);
  const doneCodes = () => seqOf().map((x) => x[0]).filter((c) => { const m = byCode(c); return m && prog(m).complete; });
  const nextCode = () => rules.nextStep(seqOf().map((x) => x[0]), doneCodes()).nextCode;
  const pathOf = (m) => (m.path ? Lr().paths.find((p) => p.code === m.path) : null);
  const completedAny = () => Lr().modules.some((m) => prog(m).complete);
  const nextNum = (list, prefix) => `${prefix}-${list.reduce((n, x) => Math.max(n, Number(String(x.id).split('-')[1]) || 0), 0) + 1}`;
  const pending = () => { const L = Lr(); return L.topics.filter((t) => t.state === 'Proposed').length + L.offers.filter((o) => o.state === 'Proposed').length + L.requests.filter((r) => r.state === 'Open' && (r.teachers || []).length).length; };

  const WHO = { student: 'Student', faculty: 'Faculty', head: 'College', industry: 'Industry', mentor: 'Mentor', open: 'Open learner', admin: 'UMO admin' };
  const SHELF = {
    student: 'Start with LM-SP-1. Then pick a format that suits you: on your own, with a teacher, with peers, or inside a real live project.',
    faculty: 'Bring live briefs into your course, learn how others teach with them, and teach what you know.',
    head: 'Plan learning for your college and your faculty, and help others learn from what you do.',
    industry: 'Upskill your team, learn to assess well, and teach the next generation of designers.',
    mentor: 'Sharpen how you coach and score, and give hours back as a teacher.',
    open: 'Learn the basics free, then try a circle or an open live project.',
    admin: 'Review what people offer and ask for, match teachers to requests, and keep the catalogue healthy.',
  };

  const modeChip = (m) => `<span class="mode mode-${m.mode}">${esc(enums.ModeLabel[m.mode])}</span>`;
  const codeChip = (m) => `<span class="lmcode">${esc(m.code)}</span>`;
  function priceText(m) {
    const p = pathOf(m);
    if (!p) return 'Free';
    const plan = store.plan(p.planKey);
    const from = plan ? P.fromPrice(plan) : null;
    return from ? `${p.code} · from ${ui.inr(from)}` : p.code;
  }
  const mins = (n) => (n >= 120 ? `${Math.round(n / 60)} hours` : `${n} min`);

  /* ---------- catalogue card ---------- */
  function card(m) {
    const pr = prog(m);
    const started = !!rec(m.code);
    return `<a class="card tight lm-card" href="#learn-${m.code}" aria-label="${esc(m.code)} ${esc(m.title)}">
      <div class="row between">${codeChip(m)}${modeChip(m)}</div>
      <h4>${esc(m.title)}</h4><p>${esc(m.line)}</p>
      <div class="row tiny muted">${seqIdx(m.code) >= 0 ? `<span class="tag info">Step ${seqIdx(m.code) + 1} for you</span>` : ''}<span>${esc(m.level)}</span><span>·</span><span>${esc(mins(m.mins))}</span>${m.women ? '<span class="tag">Women in Design</span>' : ''}</div>
      <div class="row between tiny"><span class="muted">For ${m.for.map((r) => esc(WHO[r])).slice(0, 3).join(', ')}${m.for.length > 3 ? '…' : ''}</span><b class="ink">${esc(priceText(m))}</b></div>
      ${started || pr.pct ? `<div class="stack" style="gap:4px">${ui.meter(pr.pct, { px: true })}<span class="tiny muted">${pr.complete ? 'Complete' : pr.pct + '% done'}</span></div>` : ''}
    </a>`;
  }

  /* ---------- the page ---------- */
  /* The signed-in role's own order of learning. The first unfinished step is the next step. */
  function yourSequence() {
    const seq = seqOf(); const ns = rules.nextStep(seq.map((x) => x[0]), doneCodes());
    const items = seq.map(([code, why], i) => {
      const m = byCode(code); const pr = prog(m); const begun = !!rec(code);
      const state = pr.complete ? 'Done' : code === ns.nextCode ? 'Next' : 'Later';
      const full = !!LEAD.learningData.content[code];
      const cta = full ? `<a class="btn ${state === 'Next' ? 'primary' : 'small ghost'}" href="#learn-${code}" data-act="lm-open" data-code="${code}">${pr.complete ? 'Review' : begun ? 'Continue' : 'Start'}</a>` : `<a class="btn ${state === 'Next' ? 'primary' : 'small ghost'}" href="#learn-${code}">${state === 'Next' ? 'Open' : 'About'}</a>`;
      return `<li class="seq-step ${state.toLowerCase()}" data-code="${code}" data-state="${state}">
        <span class="pxnum seq-n" aria-hidden="true">${i + 1}</span>
        <div class="stack" style="gap:4px;min-width:0"><div class="row">${codeChip(m)}${modeChip(m)}<span class="tag ${state === 'Next' ? 'info' : state === 'Done' ? 'live' : ''}">${state === 'Next' ? 'Your next step' : state}</span></div>
          <a href="#learn-${code}"><b class="ink">${esc(m.title)}</b></a><span class="muted tiny">${esc(why)}</span>
          ${begun && !pr.complete ? `<div class="stack" style="gap:4px">${ui.meter(pr.pct, { px: true })}<span class="tiny muted">${pr.pct}% done</span></div>` : ''}</div>
        ${cta}</li>`;
    }).join('');
    return `<section class="card pinned" id="learn-sequence" aria-label="Your learning sequence">
      <div class="row between"><span class="eyebrow">Your learning sequence · ${esc(WHO[role()] || '')}</span><span class="tiny muted">${ns.doneCount} of ${ns.total} done</span></div>
      <ol class="seq">${items}</ol></section>`;
  }

  function iCan() {
    const r = role();
    const teach = rules.OFFER_ROLES.includes(r) || r === 'student';
    return `<div class="ican" role="group" aria-label="What you can do here">
      <button class="btn" data-act="lrn-go" data-id="catalogue">Learn</button>
      ${teach ? '<button class="btn" data-act="lrn-teach">Teach</button>' : ''}
      <button class="btn" data-act="lrn-request">Ask for something to be taught</button>
      <a class="btn ghost" href="#skills">What each skill means</a>
    </div>`;
  }

  function yourLearning() {
    const L = Lr();
    const mine = L.modules.filter((m) => rec(m.code) || L.enrols.some((e) => e.userId === uid() && e.code === m.code));
    if (!mine.length) return '';
    return `<section class="section" aria-label="Your learning">${ui.sectionHead('', 'Your learning', '', 'What you have started or joined.')}
      <div class="grid g3">${mine.map(card).join('')}</div></section>`;
  }

  function filters() {
    const skills = [...new Set(Lr().modules.flatMap((m) => m.skills))];
    return `<div class="stack" style="gap:10px">
      <label class="field"><span class="sr">Search modules</span><input id="lm-q" type="search" data-on="lmq" placeholder="Search by title or skill, for example framing" value="${esc(f.q)}"></label>
      <div class="row" role="group" aria-label="Format">${['', ...enums.ModuleMode].map((k) => `<button class="chip" data-act="lm-mode" data-k="${k}" aria-pressed="${f.mode === k}">${k ? esc(enums.ModeLabel[k]) : 'All formats'}</button>`).join('')}</div>
      <div class="row" role="group" aria-label="Skill"><button class="chip" data-act="lm-skill" data-k="" aria-pressed="${f.skill === ''}">All skills</button>${skills.map((s) => `<button class="chip" data-act="lm-skill" data-k="${esc(s)}" aria-pressed="${f.skill === s}">${esc(ui.capName(s))}</button>`).join('')}</div>
      ${role() === 'admin' ? '' : `<label class="check"><input type="checkbox" data-on="lmall" ${f.all ? 'checked' : ''}> Show modules for every role, not only ${esc(WHO[role()] || 'my role')}</label>`}
    </div>`;
  }

  function catalogue() {
    const q = f.q.trim().toLowerCase();
    let list = Lr().modules.filter((m) => (!f.mode || m.mode === f.mode) && (!f.skill || m.skills.includes(f.skill)) && (!q || (m.code + ' ' + m.title + ' ' + m.line + ' ' + m.skills.map(ui.capName).join(' ')).toLowerCase().includes(q)) && (f.all || forYou(m)));
    list = list.slice().sort((a, b) => ((seqIdx(a.code) < 0 ? 99 : seqIdx(a.code)) - (seqIdx(b.code) < 0 ? 99 : seqIdx(b.code))) || (forYou(b) - forYou(a)) || a.mode.localeCompare(b.mode) || a.n - b.n);
    return `<section class="section" id="catalogue" aria-label="Catalogue">${ui.sectionHead('', 'All learning', '', 'Every module has a code. Read it as: Learning Module · format · number.')}
      <div class="notice" id="code-key"><span class="px"></span><span><b class="ink lmcode">LM-SP-1</b> means Learning Module · <b class="ink">S</b>elf-<b class="ink">P</b>aced · number 1. The format letters: <span class="lmcode">SP</span> self-paced, <span class="lmcode">IL</span> instructor-led, <span class="lmcode">PL</span> peer circle, <span class="lmcode">CB</span> inside a live project. A <span class="lmcode">LP</span> code is a Learning Path: a bundle of modules with one price.</span></div>
      ${filters()}
      <div class="grid g3" id="lm-list">${list.map(card).join('') || '<div class="empty">Nothing matches. Try another word, or show modules for every role.</div>'}</div>
      <div class="notice"><span class="px cyan"></span><span>Longer courses and certificates live at the <a href="https://umodesign.school" target="_blank" rel="noopener">UMO Design School</a>. LEAD links to them and does not duplicate them.</span></div>
    </section>`;
  }

  /* ---------- give back ---------- */
  function topicRow(t) {
    const mine = t.pledges.includes(uid());
    return `<li class="row between give-row"><span><b class="ink">${esc(t.id)}</b> · ${esc(t.title)}<br><span class="muted tiny">${esc(t.why)} ${t.pledges.length} ${t.pledges.length === 1 ? 'person' : 'people'} can help. ${t.state === 'Proposed' ? 'Waiting for UMO admin.' : ''}</span></span>
      <span class="row">${t.state === 'Proposed' && role() === 'admin' ? `<button class="btn small primary" data-act="ct-approve" data-kind="topic" data-id="${t.id}">Approve</button>` : ''}${t.state === 'Open' ? `<button class="btn small" data-act="tp-pledge" data-id="${t.id}" ${mine ? 'disabled' : ''}>${mine ? 'You can help' : 'I can contribute'}</button>` : ''}</span></li>`;
  }
  function requestRow(r) {
    const mineVote = r.votes.includes(uid());
    const teachers = r.teachers || [];
    const canTeach = rules.OFFER_ROLES.includes(role());
    return `<li class="give-row"><div class="row between"><span><b class="ink">${esc(r.id)}</b> · ${esc(r.title)}<br><span class="muted tiny">For ${esc(r.who)} · ${r.count} people · ${r.votes.length} “me too” ${r.teacherId ? '· teacher: ' + esc(ui.nameOf(r.teacherId)) : ''}</span></span>${ui.status(r.state)}</div>
      <div class="row">${r.state === 'Open' ? `<button class="btn small" data-act="rq-me-too" data-id="${r.id}" ${mineVote ? 'disabled' : ''}>${mineVote ? 'You said me too' : 'Me too'}</button>` : ''}
      ${r.state === 'Open' && canTeach ? `<button class="btn small" data-act="rq-teach" data-id="${r.id}" ${teachers.includes(uid()) ? 'disabled' : ''}>${teachers.includes(uid()) ? 'You offered' : 'I can teach this'}</button>` : ''}
      ${role() === 'admin' && r.state === 'Open' ? teachers.map((t) => `<button class="btn small primary" data-act="ct-match" data-id="${r.id}" data-teacher="${t}">Match ${esc(ui.nameOf(t))}</button>`).join('') : ''}
      ${role() === 'admin' && ['Matched', 'Scheduled'].includes(r.state) ? `<button class="btn small" data-act="ct-advance" data-kind="request" data-id="${r.id}">Move to ${r.state === 'Matched' ? 'Scheduled' : 'Done'}</button>` : ''}</div></li>`;
  }
  function offerRow(o) {
    const seats = o.women ? P.seatsFromHours(o.hours, store.pricing.settings.womenHoursPerSeat) : 0;
    return `<li class="row between give-row"><span><b class="ink">${esc(o.id)}</b> · ${esc(o.topic)} ${o.women ? '<span class="tag">Women in Design</span>' : ''}<br><span class="muted tiny">${esc(ui.nameOf(o.by))} · ${esc(enums.ModeLabel[o.mode])} · ${o.hours} hours · ${esc(o.when)}${o.women ? ` · adds ${seats} ${seats === 1 ? 'seat' : 'seats'} to 1 Million Women when done` : ''}</span></span>
      <span class="row">${ui.status(o.state)}${role() === 'admin' && o.state !== 'Done' ? `<button class="btn small ${o.state === 'Proposed' ? 'primary' : ''}" data-act="ct-advance" data-kind="offer" data-id="${o.id}">${o.state === 'Proposed' ? 'Approve' : o.state === 'Approved' ? 'Schedule' : 'Mark done'}</button>` : ''}</span></li>`;
  }

  function teachForm() {
    const r = role();
    const canOffer = rules.OFFER_ROLES.includes(r) || r === 'student';
    if (!canOffer) return '<p class="muted tiny">Your role cannot offer teaching hours yet. You can add to an open topic or ask for something to be taught.</p>';
    const modes = r === 'student' ? ['PL'] : enums.ModuleMode.filter((m) => m !== 'CB');
    return `<details class="more" id="teach-box" ${open.teach ? 'open' : ''}><summary>Offer to teach</summary>
      <form class="stack" data-form="offer-new" style="margin-top:10px">
        ${r === 'student' && !completedAny() ? '<div class="msg info">Finish a module first. Then you can lead a peer circle on it.</div>' : ''}
        <label class="field">What would you teach?<input id="of-topic" name="topic" list="of-topics" required value="${esc(r === 'student' ? 'Framing the problem' : 'Coaching in 45 minutes')}"><datalist id="of-topics">${Lr().modules.map((m) => `<option value="${esc(m.title)}">`).join('')}${Lr().topics.filter((t) => t.state === 'Open').map((t) => `<option value="${esc(t.title)}">`).join('')}</datalist></label>
        <div class="form-grid">
          <label class="field">Format<select id="of-mode" name="mode">${modes.map((m) => `<option value="${m}">${esc(enums.ModeLabel[m])}</option>`).join('')}</select></label>
          <label class="field">Hours you can give<span class="hint">1 to 60</span><input id="of-hours" name="hours" type="number" min="1" max="60" value="4" required></label>
          <label class="field">When<input id="of-when" name="when" value="Nov or Dec"></label>
        </div>
        <label class="check"><input type="checkbox" id="of-women" name="women" ${open.women ? 'checked' : ''}> This is for women in design. ${store.pricing.settings.womenHoursPerSeat} hours count as one seat for <a href="#women">1 Million Women in Design</a>.</label>
        <div class="btn-row"><button class="btn primary" type="submit">Offer my hours</button></div><span class="muted tiny">A UMO admin approves every offer before it is listed.</span>
        ${note('offer')}
      </form></details>`;
  }
  const notes = {};
  const note = (k) => (notes[k] ? `<div class="msg ${notes[k].cls}" role="status">${esc(notes[k].msg)}</div>` : '');
  const say = (k, msg, cls) => { notes[k] = { msg, cls: cls || 'ok' }; };

  function topicForm() {
    return `<details class="more" ${open.topic ? 'open' : ''}><summary>Propose a topic</summary>
      <form class="stack" data-form="topic-new" style="margin-top:10px">
        <label class="field">Topic<input id="tp-title" name="title" required placeholder="For example: designing for low vision"></label>
        <label class="field">Why it matters<input id="tp-why" name="why" required placeholder="One sentence"></label>
        <div class="btn-row"><button class="btn primary" type="submit">Propose it</button></div>${note('topic')}
      </form></details>`;
  }
  function requestForm() {
    return `<details class="more" id="request-box" ${open.request ? 'open' : ''}><summary>Ask for something to be taught</summary>
      <form class="stack" data-form="request-new" style="margin-top:10px">
        <label class="field">What do you want to learn?<input id="rq-title" name="title" required placeholder="For example: how to run user interviews"></label>
        <div class="form-grid"><label class="field">Who is it for?<input id="rq-who" name="who" value="${esc(WHO[role()] || 'Anyone')}s"></label>
        <label class="field">How many people want it?<input id="rq-count" name="count" type="number" min="1" max="500" value="10"></label></div>
        <div class="btn-row"><button class="btn primary" type="submit">Open the request</button></div><span class="muted tiny">Everyone can see it. Others can say “me too”, and a teacher can offer.</span>${note('request')}
      </form></details>`;
  }

  function giveBack() {
    const L = Lr();
    const topics = L.topics.filter((t) => t.state !== 'Published');
    const offers = L.offers.filter((o) => role() === 'admin' || o.state !== 'Proposed' || o.by === uid());
    return `<section class="section" id="give" aria-label="Give back">${ui.sectionHead('', 'Teach, add and ask', '', 'Learning here is built by the people in it. Offer hours, help write an open topic, or ask for something to be taught.')}
      ${role() === 'admin' && pending() ? `<div class="notice"><span class="px red"></span><span><b class="ink">${pending()} waiting for UMO admin.</b> Approve topics and offers, and match teachers to requests below.</span></div>` : ''}
      <div class="grid g3">
        <article class="card"><span class="eyebrow">Teach · OF</span><h3>Hours offered</h3><ul class="list">${offers.map(offerRow).join('')}</ul>${teachForm()}</article>
        <article class="card"><span class="eyebrow">Open topics · TP</span><h3>Help write these</h3><ul class="list">${topics.map(topicRow).join('')}</ul>${topicForm()}</article>
        <article class="card"><span class="eyebrow">Requests · RQ</span><h3>People are asking for</h3><ul class="list">${L.requests.map(requestRow).join('')}</ul>${requestForm()}</article>
      </div></section>`;
  }

  /* ---------- module page ---------- */
  function lessonCards(m) {
    const r = rec(m.code); const full = !!LEAD.learningData.content[m.code];
    return m.lessons.map((l, i) => {
      const done = !!(r && r.done.includes(l.id));
      return `<li class="lesson ${done ? 'done' : ''}"><span class="pxnum">${i + 1}</span><span><b class="ink">${esc(l.title)}</b><br><span class="muted tiny">${l.mins} min${full ? '' : ' · outline'}</span></span>
        ${full ? `<button class="btn small ${done ? '' : 'primary'}" data-act="lm-open" data-code="${m.code}" data-lesson="${l.id}">${done ? 'Review' : 'Open'}</button>` : '<span class="tag">Outline</span>'}</li>`;
    }).join('');
  }

  function sessionsTable(m) {
    if (!m.sessions.length) return '';
    return `<div class="table-wrap"><table><thead><tr><th>When</th><th>Where</th><th>Led by</th></tr></thead><tbody>${m.sessions.map((s) => `<tr><td>${esc(ui.fmtDate(s.at))} · ${esc(ui.fmtTime(s.at))}</td><td>${esc(s.where)}</td><td>${esc(ui.nameOf(s.teacherId))}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function seatMeter(m) {
    if (m.seats == null) return '';
    const left = Math.max(0, m.seats - m.booked);
    return `<div class="stack" style="gap:6px"><div class="row between"><span class="label">${Math.round(m.booked / m.seats * 100)}% booked</span><span class="tiny ${left ? 'muted' : ''}">${left ? left + ' seats left' : '<b class="ink">Full</b>'}</span></div>${ui.meter(Math.round(m.booked / m.seats * 100), { px: true })}</div>`;
  }

  function actionBlock(m) {
    const enrolled = Lr().enrols.some((e) => e.userId === uid() && e.code === m.code);
    const p = pathOf(m);
    if (m.mode === 'SP') {
      const pr = prog(m); const begun = !!rec(m.code);
      if (LEAD.learningData.content[m.code]) {
        return `<div class="btn-row"><button class="btn primary" data-act="lm-open" data-code="${m.code}">${pr.complete ? 'Review the module' : begun ? 'Continue' : 'Start the module'}</button></div>${begun ? `<div class="stack" style="gap:6px">${ui.meter(pr.pct, { px: true })}<span class="tiny muted">${pr.complete ? 'Complete' : pr.pct + '% done'}</span></div>` : ''}`;
      }
      return `<div class="notice"><span class="px"></span><span><b class="ink">Outline only.</b> The lessons for ${esc(m.code)} are being written. Join the list and you will be told.</span></div>
        <div class="btn-row"><button class="btn primary" data-act="lm-enrol" data-code="${m.code}" ${enrolled ? 'disabled' : ''}>${enrolled ? 'You are on the list' : 'Tell me when it is ready'}</button></div>`;
    }
    if (m.mode === 'CB') {
      return `<div class="btn-row"><a class="btn primary" href="#project-${m.challengeId}">Open the live project</a></div><p class="muted tiny">You learn by doing the work, with a team and a mentor. Your progress is your submission.</p>`;
    }
    const full = m.seats != null && m.booked >= m.seats;
    const label = m.mode === 'PL' ? 'Join the circle' : 'Enrol';
    const buy = p ? `<a class="btn primary" href="#join-path-${p.planKey}">Enrol through ${esc(p.code)} · ${esc(priceText(m).split('· ')[1] || '')}</a><button class="btn" data-act="lm-enrol" data-code="${m.code}" ${enrolled || full ? 'disabled' : ''}>${enrolled ? 'You asked for a seat' : 'Ask for a free seat'}</button>` : `<button class="btn primary" data-act="lm-enrol" data-code="${m.code}" ${enrolled || full ? 'disabled' : ''}>${enrolled ? 'You are in' : full ? 'Full' : label}</button>`;
    return `<div class="btn-row">${buy}</div>${p ? '<span class="muted tiny">Mock pricing. Not an offer.</span>' : ''}`;
  }

  function forYouNotice(m) {
    const i = seqIdx(m.code); const seq = seqOf();
    if (i < 0) return `<div class="notice" id="lm-for-you"><span class="px"></span><span>This module is outside your sequence as ${esc((WHO[role()] || 'a learner').toLowerCase())}. <a href="#learn">See your sequence</a>.</span></div>`;
    const nx = nextCode(); const here = nx === m.code;
    return `<div class="notice" id="lm-for-you"><span class="px cyan"></span><span><b class="ink">Step ${i + 1} of ${seq.length} for ${esc(WHO[role()] || '')}.</b> ${esc(seq[i][1])} ${here ? 'This is your next step.' : nx ? `Your next step is <a href="#learn-${nx}">${esc(nx)}</a>.` : 'You have finished your sequence.'}</span></div>`;
  }

  function modulePage(m) {
    const full = !!LEAD.learningData.content[m.code];
    const taught = m.skills.map((s) => `<a class="chip" href="#skills-${s}">${esc(ui.capName(s))}</a>`).join('');
    const teachers = [...new Set(m.sessions.map((s) => s.teacherId))].map(ui.nameOf).join(', ');
    return `<div class="page wrap">
      <nav class="crumbs"><a href="#learn">Learn</a><span>/</span><span>${esc(m.code)}</span></nav>
      ${ui.hero({ compact: true, eyebrow: `${esc(m.code)} · ${esc(enums.ModeLabel[m.mode])}`, title: m.title, lede: esc(m.line), meta: `${m.pinned ? ui.tag('Pinned · Start here', 'info') : ''}${ui.tag(m.level)}${ui.tag(mins(m.mins))}${m.women ? ui.tag('Women in Design') : ''}${ui.tag(priceText(m), m.path ? 'mock' : 'live')}` })}
      ${forYouNotice(m)}
      <div class="split">
        <section class="stack" style="gap:16px">
          ${m.mode === 'SP' ? `<div class="card"><span class="eyebrow">${m.lessons.length} lessons${full ? '' : ' · outline'}</span><ol class="lessons">${lessonCards(m)}</ol></div>` : ''}
          ${m.sessions.length ? `<div class="card"><span class="eyebrow">Sessions</span>${sessionsTable(m)}${seatMeter(m)}</div>` : ''}
          <div class="card" style="gap:12px">${actionBlock(m)}</div>
        </section>
        <aside class="stack" style="gap:16px">
          <div class="card"><span class="eyebrow">How to read the code</span><p class="ink"><b class="lmcode">${esc(m.code)}</b></p><p class="muted tiny">Learning Module · ${esc(enums.ModeLabel[m.mode])} · number ${m.n}. ${esc(enums.ModeWord[m.mode])}.</p></div>
          <div class="card"><span class="eyebrow">Skills this builds</span><div class="row">${taught || '<span class="muted">No skill listed yet.</span>'}</div></div>
          <div class="card"><span class="eyebrow">Who it is for</span><div class="row">${m.for.map((r) => `<span class="chip">${esc(WHO[r])}</span>`).join('')}</div>${teachers ? `<p class="muted tiny">Led by ${esc(teachers)}</p>` : ''}</div>
          <div class="card"><span class="eyebrow">Teach or improve it</span><div class="btn-row"><button class="btn small" data-act="lm-teach-this" data-code="${m.code}">Teach this</button><button class="btn small ghost" data-act="lm-suggest" data-code="${m.code}">Suggest a change</button></div></div>
        </aside>
      </div></div>`;
  }

  function lensNote(m) {
    const t = m.code === 'LM-SP-1' ? ((LEAD.learningData.lens[role()] || {})[play.lesson]) : '';
    return t ? `<div class="notice you" id="lesson-for-you"><span class="px indigo"></span><span><b class="ink">For you as ${esc((WHO[role()] || '').toLowerCase())}:</b> ${esc(t)}</span></div>` : '';
  }

  /* ---------- the lesson player (LM-SP-1) ---------- */
  function player(m) {
    const c = LEAD.learningData.content[m.code];
    const back = `<a class="btn small ghost" href="#learn" data-act="lm-leave">Back to Learn</a>`;
    const pr = prog(m);
    const head = `<nav class="crumbs"><a href="#learn" data-act="lm-leave">Learn</a><span>/</span><a href="#learn-${m.code}" data-act="lm-leave">${esc(m.code)}</a><span>/</span><span>${play.phase === 'check' ? 'Check' : play.phase === 'done' ? 'Done' : 'Lesson'}</span></nav>`;
    const bar = `<div class="stack" style="gap:6px">${ui.meter(pr.pct, { px: true })}<span class="tiny muted">${esc(m.code)} · ${pr.pct}% done</span></div>`;
    if (play.phase === 'lesson') {
      const i = m.lessons.findIndex((l) => l.id === play.lesson); const l = c.lessons[play.lesson]; const lm = m.lessons[i];
      const done = !!(rec(m.code) && rec(m.code).done.includes(play.lesson));
      return `<div class="page wrap">${head}<article class="card lesson-page" aria-labelledby="lp-h">
        <div class="row between"><span class="eyebrow">Lesson ${i + 1} of ${m.lessons.length} · ${lm.mins} min</span>${back}</div>
        <h1 id="lp-h" style="font-size:clamp(28px,4vw,42px)">${esc(l.title)}</h1>
        <p class="lede ink">${esc(l.intro)}</p>
        <ul class="px-list">${l.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        <div class="notice"><span class="px cyan"></span><span>${esc(l.example)}</span></div>
        ${lensNote(m)}
        ${bar}
        <div class="btn-row"><button class="btn primary" data-act="lm-done" data-code="${m.code}">${done ? 'Next' : 'Mark as done and continue'}</button>${i > 0 ? `<button class="btn" data-act="lm-prev" data-code="${m.code}">Previous lesson</button>` : ''}</div>
      </article></div>`;
    }
    if (play.phase === 'check') {
      const r = play.result;
      return `<div class="page wrap">${head}<form class="card lesson-page" data-form="lm-check" data-code="${m.code}">
        <div class="row between"><span class="eyebrow">Check · ${m.check.length} questions · pass with ${m.pass}</span>${back}</div>
        <h1 style="font-size:clamp(28px,4vw,42px)">Quick check</h1>
        ${r && !r.passed ? `<div class="msg warn" role="alert">You got ${r.score} of ${r.total}. You need ${m.pass}. Read the lessons again if you like, then try once more.</div>` : ''}
        ${m.check.map((q, qi) => `<fieldset class="q"><legend><b class="ink">${qi + 1}. ${esc(q.q)}</b></legend>${q.options.map((o, oi) => `<label class="check"><input type="radio" name="q${qi}" value="${oi}" ${qi === 0 && oi === 0 && false ? 'checked' : ''} required> ${esc(o)}</label>`).join('')}</fieldset>`).join('')}
        ${bar}
        <div class="btn-row"><button class="btn primary" type="submit">Check my answers</button></div>
      </form></div>`;
    }
    /* done */
    const nexts = seqOf().map((x) => byCode(x[0])).filter((x) => x && x.code !== m.code && !prog(x).complete).slice(0, 3);
    return `<div class="page wrap">${head}<section class="card lesson-page">
      <span class="eyebrow">${esc(m.code)} · complete</span>
      <h1 style="font-size:clamp(28px,4vw,42px)">You finished Day 1 readiness.</h1>
      <p class="ink">You passed the check with ${play.result ? play.result.score : m.pass} of ${m.check.length}. It is saved in your learning record. When you do real work on a live project, a Passport entry shows it at a verified level.</p>
      <span class="eyebrow">Next</span><div class="grid g3">${nexts.map(card).join('')}</div>
      <div class="btn-row"><a class="btn primary" href="#learn" data-act="lm-leave">Back to Learn</a><a class="btn" href="#projects">See live projects</a></div></section></div>`;
  }

  /* ---------- the view ---------- */
  LEAD.views.learn = {
    title: (code) => (code ? code : 'Learn'),
    render(code) {
      if (code) {
        const m = byCode(code);
        if (!m) return LEAD.views.notfound.render();
        if (play.code === m.code && play.phase !== 'list') return player(m);
        return modulePage(m);
      }
      play.code = null; play.phase = 'list';
      const r = role();
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: `Learn · ${esc(WHO[r] || '')}`, title: 'Learn.', lede: esc(SHELF[r] || ''), meta: iCan() })}
        <div class="split rev">
          <aside class="stack" style="gap:16px">
            <div class="card" id="learn-shelf"><span class="eyebrow">Your shelf</span><p class="ink">${esc(SHELF[r] || '')}</p><div class="stack" style="gap:8px">${seqOf().map((x) => byCode(x[0])).filter((m) => m && !prog(m).complete).slice(0, 4).map((m) => `<a class="shelf-item" href="#learn-${m.code}"><span class="lmcode">${esc(m.code)}</span><span>${esc(m.title)}</span></a>`).join('')}</div></div>
            <div class="card"><span class="eyebrow">Skills Guide</span><p style="font-size:14px">Not sure what a skill means? Each one is explained in plain words, with four levels.</p><a class="btn small" href="#skills">Open the Skills Guide</a></div>
          </aside>
          <section class="stack" style="gap:18px">${yourSequence()}${yourLearning()}</section>
        </div>
        ${catalogue()}
        ${giveBack()}
      </div>`;
    },
  };

  /* ---------- actions ---------- */
  const rerender = () => LEAD.render({ keepScroll: true });
  const scrollTo = (id) => { const t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const setRec = (code, next) => { const bag = Lr().progress[uid()] = Lr().progress[uid()] || {}; bag[code] = next; };

  Object.assign(LEAD.act, {
    'lm-open'(el) {
      const m = byCode(el.dataset.code); if (!m || !LEAD.learningData.content[m.code]) return;
      /* Commit first: a commit re-renders the current page, and that must not undo the state set below. */
      if (!rec(m.code)) store.commit('Module started', 'learning', `${uid()}:${m.code}`, () => { setRec(m.code, { done: [], check: null, completedAt: null }); return { code: m.code }; });
      const r = rec(m.code);
      const first = el.dataset.lesson || (m.lessons.find((l) => !(r && r.done.includes(l.id))) || m.lessons[0]).id;
      const pr = prog(m);
      play.code = m.code; play.result = null; play.lesson = first;
      play.phase = el.dataset.lesson ? 'lesson' : pr.complete ? 'done' : pr.canCheck ? 'check' : 'lesson';
      if (location.hash !== '#learn-' + m.code) location.hash = 'learn-' + m.code; else rerender();
      window.scrollTo(0, 0);
    },
    'lm-leave'(el) { play.code = null; play.phase = 'list'; const h = (el.getAttribute('href') || '#learn').slice(1); if (location.hash.slice(1) !== h) location.hash = h; else rerender(); window.scrollTo(0, 0); },
    'lm-done'(el) {
      const m = byCode(el.dataset.code); const prev = rec(m.code);
      const next = rules.markLesson(prev, m, play.lesson);
      if (!prev || next.done.length !== prev.done.length) store.commit('Lesson completed', 'learning', `${uid()}:${m.code}:${play.lesson}`, () => { setRec(m.code, next); return { lesson: play.lesson }; });
      const i = m.lessons.findIndex((l) => l.id === play.lesson);
      if (i < m.lessons.length - 1) play.lesson = m.lessons[i + 1].id; else play.phase = 'check';
      rerender(); window.scrollTo(0, 0);
    },
    'lm-prev'(el) { const m = byCode(el.dataset.code); const i = m.lessons.findIndex((l) => l.id === play.lesson); if (i > 0) play.lesson = m.lessons[i - 1].id; rerender(); },
    'lm-enrol'(el) {
      const m = byCode(el.dataset.code);
      if (Lr().enrols.some((e) => e.userId === uid() && e.code === m.code)) return;
      store.commit(m.mode === 'SP' ? 'Waiting list joined' : 'Enrolled', 'learning', `${uid()}:${m.code}`, () => { Lr().enrols.push({ userId: uid(), code: m.code, at: Date.now() }); if (m.seats != null) m.booked += 1; return { code: m.code }; });
      ui.toast(m.mode === 'SP' ? 'You are on the list.' : `You are in ${m.code}.`); rerender();
    },
    'lm-teach-this'(el) { const m = byCode(el.dataset.code); open.teach = true; f.q = ''; location.hash = 'learn'; setTimeout(() => { const t = document.getElementById('of-topic'); if (t) { t.value = m.title; } scrollTo('give'); }, 120); },
    'lm-suggest'(el) { ui.toast(`Thanks. Your note on ${el.dataset.code} goes to the UMO admin.`); store.commit('Change suggested', 'learning', el.dataset.code, () => ({ code: el.dataset.code })); },
    'lm-mode'(el) { f.mode = el.dataset.k; rerender(); },
    'lm-skill'(el) { f.skill = el.dataset.k; rerender(); },
    'lrn-go'(el) { scrollTo(el.dataset.id); },
    'lrn-teach'() { open.teach = true; rerender(); scrollTo('give'); },
    'lrn-women-offer'() { open.teach = true; open.women = true; if (location.hash.slice(1) !== 'learn') location.hash = 'learn'; else rerender(); setTimeout(() => scrollTo('give'), 150); },
    'lrn-request'() { open.request = true; rerender(); scrollTo('give'); },
    'tp-pledge'(el) {
      const t = Lr().topics.find((x) => x.id === el.dataset.id); if (!t || t.pledges.includes(uid())) return;
      store.commit('Offered to help with a topic', 'open_topic', t, () => { t.pledges.push(uid()); return t; }); ui.toast(`Thanks. You can help with ${t.id}.`); rerender();
    },
    'rq-me-too'(el) {
      const r = Lr().requests.find((x) => x.id === el.dataset.id); const v = rules.addVote(r.votes, uid());
      if (!v.ok) { ui.toast(v.reason); return; }
      store.commit('Me too on a request', 'learning_request', r, () => { r.votes.push(uid()); return r; }); rerender();
    },
    'rq-teach'(el) {
      const r = Lr().requests.find((x) => x.id === el.dataset.id); r.teachers = r.teachers || [];
      if (r.teachers.includes(uid())) return;
      store.commit('Offered to teach a request', 'learning_request', r, () => { r.teachers.push(uid()); return r; }); ui.toast('Thanks. A UMO admin will match you.'); rerender();
    },
    'ct-approve'(el) {
      if (role() !== 'admin') return;
      const t = Lr().topics.find((x) => x.id === el.dataset.id); if (!t) return;
      store.commit('Topic approved', 'open_topic', t, () => { t.state = rules.transition('open_topic', t.state, 'Open'); return t; }); rerender();
    },
    'ct-match'(el) {
      if (role() !== 'admin') return;
      const r = Lr().requests.find((x) => x.id === el.dataset.id);
      store.commit('Teacher matched to a request', 'learning_request', r, () => { r.teacherId = el.dataset.teacher; r.state = rules.transition('learning_request', r.state, 'Matched'); return r; }); rerender();
    },
    'ct-advance'(el) {
      if (role() !== 'admin') return;
      const kind = el.dataset.kind === 'offer' ? ['teaching_offer', Lr().offers] : ['learning_request', Lr().requests];
      const x = kind[1].find((y) => y.id === el.dataset.id);
      const states = { teaching_offer: ['Proposed', 'Approved', 'Scheduled', 'Done'], learning_request: ['Open', 'Matched', 'Scheduled', 'Done'] }[kind[0]];
      const to = states[states.indexOf(x.state) + 1]; if (!to) return;
      const credit = kind[0] === 'teaching_offer' && x.women && to === 'Done' ? P.seatsFromHours(x.hours, store.pricing.settings.womenHoursPerSeat) : 0;
      store.commit(`${kind[0] === 'teaching_offer' ? 'Offer' : 'Request'} moved to ${to}${credit ? ` · adds ${credit} seats to 1 Million Women` : ''}`, kind[0], x, () => { x.state = rules.transition(kind[0], x.state, to); return x; }); rerender();
    },
  });

  LEAD.on.lmq = (el) => { f.q = el.value; rerender(); const n = document.getElementById('lm-q'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } };
  LEAD.on.lmall = (el) => { f.all = el.checked; rerender(); };

  LEAD.forms['lm-check'] = (fd, form) => {
    const m = byCode(form.dataset.code);
    const answers = m.check.map((q, i) => fd.get('q' + i));
    const res = rules.scoreCheck(m, answers);
    play.result = res;
    store.commit(res.passed ? 'Check passed' : 'Check tried', 'learning', `${uid()}:${m.code}:check`, () => { setRec(m.code, rules.recordCheck(rec(m.code), m, res)); if (res.passed) { const r = rec(m.code); r.completedAt = Date.now(); } return res; });
    play.phase = res.passed ? 'done' : 'check';
    rerender(); window.scrollTo(0, 0);
  };
  LEAD.forms['offer-new'] = (fd) => {
    const o = { topic: String(fd.get('topic')).trim(), mode: fd.get('mode'), hours: fd.get('hours'), when: String(fd.get('when')).trim() || 'To agree', role: role(), completed: completedAny() };
    const v = rules.validateOffer(o);
    if (!v.ok) { say('offer', v.reason, 'err'); open.teach = true; rerender(); return; }
    const item = { id: nextNum(Lr().offers, 'OF'), by: uid(), topic: o.topic, mode: o.mode, hours: Number(o.hours), when: o.when, state: 'Proposed', women: !!fd.get('women'), at: Date.now() };
    store.commit('Teaching offered', 'teaching_offer', item.id, () => { Lr().offers.push(item); return item; });
    say('offer', `Thank you. ${item.id} is with the UMO admin for approval.`); open.teach = true; rerender();
  };
  LEAD.forms['topic-new'] = (fd) => {
    const title = String(fd.get('title')).trim(); const why = String(fd.get('why')).trim();
    if (title.length < 6) { say('topic', 'Give the topic a short name (at least 6 characters).', 'err'); open.topic = true; rerender(); return; }
    const item = { id: nextNum(Lr().topics, 'TP'), title, why, state: 'Proposed', by: uid(), pledges: [uid()], at: Date.now() };
    store.commit('Topic proposed', 'open_topic', item.id, () => { Lr().topics.push(item); return item; });
    say('topic', `Thank you. ${item.id} is with the UMO admin.`); open.topic = true; rerender();
  };
  LEAD.forms['request-new'] = (fd) => {
    const o = { title: fd.get('title'), count: fd.get('count') };
    const v = rules.validateRequest(o);
    if (!v.ok) { say('request', v.reason, 'err'); open.request = true; rerender(); return; }
    const item = { id: nextNum(Lr().requests, 'RQ'), title: String(o.title).trim(), who: String(fd.get('who')).trim() || 'Anyone', count: Number(o.count), by: uid(), state: 'Open', votes: [uid()], teachers: [], teacherId: null, at: Date.now() };
    store.commit('Learning requested', 'learning_request', item.id, () => { Lr().requests.unshift(item); return item; });
    say('request', `${item.id} is open. Everyone can see it now.`); open.request = true; rerender();
  };

  LEAD.learn = { pending, byCode, modules: () => Lr().modules, taughtBy: (slug) => Lr().modules.filter((m) => m.skills.includes(slug)) };
})(typeof globalThis !== 'undefined' ? globalThis : this);
