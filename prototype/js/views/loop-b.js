/* LEAD · working loop, part B: blind scoring, Passport, verification, opportunities (W4), Impact Ledger, audit. */
(function (root) {
  const LEAD = root.LEAD;
  const { ui, store, rules } = LEAD;
  const { esc } = ui;
  const L = () => store.loop;
  const me = () => store.me();
  const role = () => store.session.role;
  const move = (...a) => LEAD.move(...a);
  const { challengeOf, matchOf } = LEAD.loopHelpers;
  const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const LEVELS = ['Not yet', 'Developing', 'Secure', 'Strong'];

  const teamOf = (sub) => L().teams.find((t) => t.id === sub.teamId);
  const scoresFor = (subId, aid) => L().scores.filter((s) => s.submissionId === subId && (!aid || s.assessorId === aid));
  function weighted(subId, aid) {
    const sc = scoresFor(subId, aid); if (!sc.length) return null;
    const w = L().rubric.reduce((a, c) => { const s = sc.find((x) => x.criterion === c.id); return a + (s ? s.value * c.weight : 0); }, 0);
    return w / 100;
  }
  const lockedBy = (subId) => [...new Set(scoresFor(subId).map((s) => s.assessorId))].filter((a) => rules.identitiesVisible(a, subId, L().scores, L().rubric.length));

  /* ================= Assessment day ================= */
  LEAD.views.assess = {
    title: () => 'Scoring',
    render() {
      const r = role(); const u = me();
      if (!['mentor', 'industry', 'admin', 'faculty'].includes(r)) return ui.guard(['mentor', 'industry', 'admin'], 'Scoring');
      const ad = L().assessmentDays[0];
      const subs = L().submissions.filter((s) => ['In scoring', 'Scored', 'Moderated'].includes(s.status) && challengeOf(teamOf(s)).id === ad.challengeId);
      const scorer = r === 'mentor' || r === 'industry';
      const rubric = L().rubric;
      const body = scorer ? subs.map((s, i) => scoreCard(s, i, u)).join('') : moderation(subs);
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: `Live Projects · step 6 of 6 · ${ui.fmtDate(ad.date)} · ${esc(ad.mode)}`, title: 'Scoring.', lede: 'Industry assessors score against a shared rubric, published in advance. Names and institutions stay hidden until each assessor locks every score .', meta: ui.simTag() })}
        <div class="split">
          <section class="stack" style="gap:16px">${body || '<div class="empty">No submissions in scoring yet. A team submits first.</div>'}</section>
          <aside class="stack" style="gap:16px">
            <div class="card"><div class="row between"><span class="eyebrow">Rubric ${esc(ad.rubricVersion)}</span>${ui.tag('Shared in advance', 'info')}</div>
              <div class="table-wrap" style="border:0;background:none"><table><tbody>${rubric.map((c) => `<tr><td>${esc(c.name)}</td><td class="num"><b>${c.weight}%</b></td></tr>`).join('')}</tbody></table></div>
              <p class="muted" style="font-size:13px">Levels: ${LEVELS.join(' · ')}</p>
              ${r === 'faculty' ? '<button class="btn small" data-act="rubric-ok">Approve rubric</button>' : ''}</div>
            <div class="card"><span class="eyebrow">Codex · conflicts</span><ul class="px-list no"><li>No scoring a team you mentored</li><li>No recruiting while assessing</li><li>No contact until scores lock and the student shares</li></ul></div>
          </aside>
        </div>
      </div>`;
    },
  };

  function scoreCard(s, i, u) {
    const t = teamOf(s); const m = matchOf(t);
    const conflict = rules.canScore(u.id, t.id, L().sprints);
    if (!conflict.ok) {
      return `<article class="card"><div class="row between"><span class="eyebrow">Submission ${i + 1}</span>${ui.tag('Conflict', 'sim')}</div><h3>You cannot score this one.</h3><p>${esc(conflict.reason)}</p></article>`;
    }
    const mine = scoresFor(s.id, u.id);
    const visible = rules.identitiesVisible(u.id, s.id, L().scores, L().rubric.length);
    const locked = mine.length && mine.every((x) => x.locked);
    const all = L().rubric.every((c) => mine.some((x) => x.criterion === c.id));
    const w = weighted(s.id, u.id);
    return `<article class="card">
      <div class="row between"><span class="eyebrow">Submission ${i + 1} of ${L().submissions.filter((x) => x.status !== 'Draft').length}</span>${visible ? ui.tag('Names shown', 'live') : ui.tag('Blind · names hidden', 'ind')}</div>
      <h3>${visible ? `${esc(t.name)} · ${esc(ui.orgName(m.institutionId))}` : `Team <span class="redacted">${esc(t.name)}</span> · <span class="redacted">${esc(ui.orgName(m.institutionId))}</span>`}</h3>
      <p style="font-size:14px">${visible ? '' : '<span class="muted">Deliverable and reflection. Identities appear after you lock every score.</span><br>'}<a href="${esc(s.deliverable)}" target="_blank" rel="noopener">Open deliverable</a> · ${esc(s.reflection)}</p>
      <p class="muted" style="font-size:13px"><b class="ink">AI use:</b> ${esc(s.ai)}</p>
      <div class="score-grid">${L().rubric.map((c) => {
        const cur = mine.find((x) => x.criterion === c.id);
        return `<div class="score-row"><span><b class="ink">${esc(c.name)}</b> <span class="muted">· ${c.weight}%</span>${cur ? `<br><span class="muted" style="font-size:12.5px">${LEVELS[cur.value - 1]}</span>` : ''}</span>
          <span class="score-btns" role="group" aria-label="${esc(c.name)}">${[1, 2, 3, 4].map((v) => `<button data-act="score" data-sub="${s.id}" data-c="${c.id}" data-v="${v}" aria-pressed="${cur && cur.value === v}" ${locked ? 'disabled' : ''} title="${LEVELS[v - 1]}">${v}</button>`).join('')}</span></div>`;
      }).join('')}</div>
      <div class="row between"><span class="ink">Weighted: <b class="tnum">${w == null ? '—' : w.toFixed(2)}</b> / 4</span>
        ${locked ? ui.status('Complete', 'Locked') : `<button class="btn primary" data-act="lock" data-sub="${s.id}" ${all ? '' : 'disabled'}>Lock scores</button>`}</div>
    </article>`;
  }

  function moderation(subs) {
    return subs.map((s, i) => {
      const t = teamOf(s);
      const assessors = [...new Set(scoresFor(s.id).map((x) => x.assessorId))];
      const ws = assessors.map((a) => ({ a, w: weighted(s.id, a), locked: lockedBy(s.id).includes(a) }));
      const lockedW = ws.filter((x) => x.locked).map((x) => x.w);
      const spread = lockedW.length > 1 ? Math.max(...lockedW) - Math.min(...lockedW) : null;
      return `<article class="card">
        <div class="row between"><span class="eyebrow">Moderator view · submission ${i + 1}</span>${ui.status(s.status)}</div>
        <h3>${esc(t.name)}</h3>
        <div class="table-wrap" style="border:0;background:none"><table><thead><tr><th>Assessor</th><th>State</th><th class="num">Weighted</th></tr></thead><tbody>
          ${ws.map((x) => `<tr><td>${esc(ui.nameOf(x.a))}</td><td>${x.locked ? ui.status('Complete', 'Locked') : ui.status('In progress', 'Scoring')}</td><td class="num">${x.w == null ? '—' : x.w.toFixed(2)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">No scores yet.</td></tr>'}
        </tbody></table></div>
        <div class="row between"><span>Spread between assessors: <b class="ink tnum">${spread == null ? 'needs two locked assessors' : spread.toFixed(2)}</b>${spread != null && spread > 0.75 ? ' ' + ui.tag('Review', 'sim') : ''}</span>
        ${role() === 'admin' && s.status === 'Scored' ? `<button class="btn small" data-act="moderate" data-sub="${s.id}">Mark moderated</button>` : ''}</div>
      </article>`;
    }).join('');
  }

  Object.assign(LEAD.act, {
    score(el) {
      const subId = el.dataset.sub; const c = el.dataset.c; const v = Number(el.dataset.v); const aid = me().id;
      const sub = L().submissions.find((x) => x.id === subId);
      const chk = rules.canScore(aid, sub.teamId, L().sprints);
      if (!chk.ok) { ui.toast(chk.reason); return; }
      let s = L().scores.find((x) => x.submissionId === subId && x.assessorId === aid && x.criterion === c);
      if (s && s.locked) { ui.toast('Scores are locked.'); return; }
      store.commit('Score saved', 'score', subId, () => { if (s) s.value = v; else { s = { submissionId: subId, assessorId: aid, criterion: c, value: v, locked: false }; L().scores.push(s); } return s; });
    },
    lock(el) {
      const subId = el.dataset.sub; const aid = me().id;
      const sub = L().submissions.find((x) => x.id === subId);
      const mine = scoresFor(subId, aid);
      if (mine.length < L().rubric.length) { ui.toast('Score every criterion first.'); return; }
      store.commit('Scores locked', 'score', subId, () => { mine.forEach((x) => { x.locked = true; }); return { locked: mine.length }; });
      const t = teamOf(sub); const c = challengeOf(t);
      const level = Math.max(1, Math.min(4, Math.round(weighted(subId, aid))));
      t.memberIds.forEach((sid) => {
        if (L().passports.some((p) => p.studentId === sid && p.submissionId === subId)) return;
        const e = { id: uid('pe'), code: null, studentId: sid, submissionId: subId, challengeId: c.id, capSlug: c.caps[0], level, status: 'Proposed', assessorId: aid, approverId: null, shared: false, at: Date.now() };
        store.commit('Passport entry proposed', 'passport_entry', e.id, () => { L().passports.push(e); return e; });
      });
      if (lockedBy(subId).length >= 2 && sub.status === 'In scoring') move('submission', sub, 'Scored');
      ui.toast('Locked. Names are now shown. Passport entries proposed for the UMO team.');
    },
    moderate(el) { const s = L().submissions.find((x) => x.id === el.dataset.sub); if (move('submission', s, 'Moderated')) ui.toast('Moderated.'); },
    'rubric-ok'() { store.commit('Rubric v2 approved', 'rubric', 'v2', () => ({ approvedBy: me().name })); ui.toast('Rubric approved.'); },
  });

  /* ================= Passports ================= */
  function passportCard(p, o) {
    const opts = o || {};
    const c = L().challenges.find((x) => x.id === p.challengeId);
    return `<article class="passport">
      <span class="dots tr" aria-hidden="true" style="position:absolute;width:160px;height:160px;z-index:-1"></span>
      <div class="row between"><span class="eyebrow">Skills Passport</span>${ui.status(p.status)}</div>
      <div class="stack" style="gap:4px"><h3 style="font-size:22px">${esc(ui.capName(p.capSlug))}</h3><span class="ink">${opts.anon ? 'Student hidden (aggregate)' : esc(ui.nameOf(p.studentId))} · ${esc(ui.orgName(store.user(p.studentId).orgId))}</span></div>
      <div class="row between"><span class="lvl" aria-label="Level ${p.level} of 4">${[1, 2, 3, 4].map((i) => `<i class="${i <= p.level ? 'on' : ''}"></i>`).join('')}</span><b class="ink">${LEVELS[p.level - 1]}</b></div>
      <div class="kv" style="font-size:13.5px"><span>Live Project</span><span>${esc(c ? c.title : '')}</span><span>Sponsor</span><span>${esc(c ? ui.orgName(c.sponsorOrgId) : '')}</span><span>Assessed by</span><span>${esc(ui.nameOf(p.assessorId))} (blind)</span><span>Second approval</span><span>${p.approverId ? esc(ui.nameOf(p.approverId)) : 'Pending'}</span></div>
      ${p.code ? `<div class="row between"><span class="code">${esc(p.code)}</span><a href="#passport-${esc(p.code)}">Open verification link</a></div>` : ''}
      ${opts.actions || ''}
    </article>`;
  }
  LEAD.passportCard = passportCard;

  const PURPOSES = [['share_passport', 'Share my Passport with employers I choose'], ['record_sessions', 'Record mentor session notes'], ['analytics', 'Use my activity in aggregate analytics']];

  LEAD.views.passports = {
    title: () => 'Passports',
    render() {
      const r = role(); const u = me();
      const P = L().passports;
      let body = '';
      if (r === 'student') {
        const mine = P.filter((p) => p.studentId === u.id);
        const cons = L().consents.filter((c) => c.userId === u.id);
        body = `<div class="split"><section class="grid g2">${mine.map((p) => passportCard(p, {
          actions: p.status === 'Verified' ? `<button class="btn primary" data-act="pp-share" data-id="${p.id}">Share with employers</button>`
            : p.status === 'Shared' ? `<button class="btn" data-act="pp-unshare" data-id="${p.id}">Stop sharing</button>` : `<span class="muted" style="font-size:13px">Waiting for the UMO team’s second approval.</span>`,
        })).join('') || '<div class="empty">No entries yet. They appear after assessment.</div>'}</section>
        <aside class="card"><span class="eyebrow">Consent manager</span><p style="font-size:14px">You control what is shared. Revoking takes effect at once.</p>
          ${PURPOSES.map(([k, l]) => { const c = cons.find((x) => x.purpose === k); return `<label class="check"><input type="checkbox" id="cs-${k}" data-on="consent" data-k="${k}" ${c && c.granted ? 'checked' : ''}> ${esc(l)}</label>`; }).join('')}
          <span class="muted" style="font-size:12.5px">Retention and lawful basis: decision for counsel under India’s data protection law.</span></aside></div>`;
      } else if (r === 'admin') {
        const queue = P.filter((p) => p.status === 'Proposed');
        body = `<section class="section">${ui.sectionHead('Integrity', 'Waiting for second approval', ui.tag(`${queue.length} pending`, queue.length ? 'mock' : 'live'))}
          <div class="grid g3">${queue.map((p) => { const chk = rules.canVerify(p, L().scores, u, L().rubric.length); return passportCard(p, { actions: `${chk.ok ? '' : `<div class="msg err">${esc(chk.reason)}</div>`}<button class="btn primary" data-act="pp-approve" data-id="${p.id}" ${chk.ok ? '' : 'disabled'}>Approve</button>` }); }).join('') || '<div class="empty">Queue clear.</div>'}</div></section>
          <section class="section">${ui.sectionHead('Register', 'Verified and shared')}<div class="table-wrap"><table><thead><tr><th>Code</th><th>Student</th><th>Capability</th><th>Level</th><th>Status</th><th></th></tr></thead><tbody>
          ${P.filter((p) => p.status !== 'Proposed').map((p) => `<tr><td><a class="code" href="#passport-${esc(p.code)}">${esc(p.code)}</a></td><td>${esc(ui.nameOf(p.studentId))}</td><td>${esc(ui.capName(p.capSlug))}</td><td>${ui.lvlDots(p.level)}</td><td>${ui.status(p.status)}</td><td>${p.status !== 'Revoked' ? `<button class="btn small danger" data-act="pp-revoke" data-id="${p.id}">Revoke</button>` : ''}</td></tr>`).join('')}
          </tbody></table></div></section>`;
      } else if (r === 'industry') {
        const shared = P.filter((p) => rules.employerCanSee(p));
        body = `<section class="section">${ui.sectionHead('Verified shortlist', 'Shared with you', '', `Only entries a student chose to share. ${P.length - shared.length} other entries exist; you cannot see them.`)}<div class="grid g3">${shared.map((p) => passportCard(p)).join('') || '<div class="empty">No student has shared an entry yet.</div>'}</div></section>`;
      } else if (r === 'mentor') {
        body = `<div class="grid g3">${P.filter((p) => p.assessorId === u.id).map((p) => passportCard(p)).join('') || '<div class="empty">You have not assessed any entries yet.</div>'}</div>`;
      } else if (r === 'faculty' || r === 'head') {
        const campus = u.orgId;
        const ofCampus = P.filter((p) => store.user(p.studentId).orgId === campus);
        const consented = ofCampus.filter((p) => (L().consents.find((c) => c.userId === p.studentId && c.purpose === 'share_passport') || {}).granted);
        const agg = (st) => rules.aggregate(ofCampus.filter((p) => st.includes(p.status)).length);
        body = `${ui.kpis([{ label: 'Verified or shared', v: agg(['Verified', 'Shared']).value, hidden: agg(['Verified', 'Shared']).hidden, d: 'R4 hides groups under 5' }, { label: 'Proposed', v: agg(['Proposed']).value, hidden: agg(['Proposed']).hidden }, { label: 'Students consenting to share', v: consented.length }])}
          ${r === 'faculty' ? `<section class="section">${ui.sectionHead('Cohort', 'Entries your students consented to share')}<div class="grid g3">${consented.map((p) => passportCard(p)).join('') || '<div class="empty">No consented entries.</div>'}</div></section>` : '<p class="muted">Institution heads see aggregates only. An individual’s feedback needs their consent.</p>'}`;
      } else {
        return ui.guard(['student', 'admin', 'industry'], 'Passports');
      }
      return `<div class="page wrap">${ui.hero({ compact: true, eyebrow: 'Passport', title: 'Passport.', lede: 'Verified evidence of what a student can do. An assessor proposes; a UMO admin gives the second approval; the student decides who sees it.', meta: ui.simTag() })}${body}</div>`;
    },
  };

  const ppById = (id) => L().passports.find((p) => p.id === id);
  function setConsent(uidv, purpose, granted) {
    let c = L().consents.find((x) => x.userId === uidv && x.purpose === purpose);
    store.commit(`Consent ${granted ? 'granted' : 'revoked'}: ${purpose}`, 'consent', uidv, () => { if (!c) { c = { userId: uidv, purpose }; L().consents.push(c); } c.granted = granted; c.at = Date.now(); return c; });
  }
  Object.assign(LEAD.act, {
    'pp-approve'(el) {
      const p = ppById(el.dataset.id); const u = me();
      const chk = rules.canVerify(p, L().scores, u, L().rubric.length);
      if (!chk.ok) { ui.toast(chk.reason); return; }
      const c = L().challenges.find((x) => x.id === p.challengeId);
      const code = `LEAD-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${ui.orgName(c.sponsorOrgId).split(' ').map((w) => w[0]).join('').toUpperCase()}`;
      p.approverId = u.id; p.code = code;
      if (move('passport_entry', p, 'Verified', 'Passport entry verified')) ui.toast(`Verified. Link ${code} is live.`);
    },
    'pp-share'(el) {
      const p = ppById(el.dataset.id);
      setConsent(p.studentId, 'share_passport', true);
      p.shared = true;
      if (move('passport_entry', p, 'Shared', 'Passport shared by student')) ui.toast('Shared. Employers can now see this entry.');
    },
    'pp-unshare'(el) {
      const p = ppById(el.dataset.id); p.shared = false;
      if (move('passport_entry', p, 'Verified', 'Sharing stopped by student')) ui.toast('Sharing stopped. Employers lost access at once.');
    },
    'pp-revoke'(el) { const p = ppById(el.dataset.id); p.shared = false; if (move('passport_entry', p, 'Revoked')) ui.toast('Revoked. The link now says so.'); },
  });
  LEAD.on.consent = (el) => {
    const u = me(); setConsent(u.id, el.dataset.k, el.checked);
    if (el.dataset.k === 'share_passport' && !el.checked) {
      L().passports.filter((p) => p.studentId === u.id && p.status === 'Shared').forEach((p) => { p.shared = false; move('passport_entry', p, 'Verified', 'Sharing stopped: consent revoked'); });
    }
  };

  /* ================= Public verification ================= */
  LEAD.views.passport = {
    title: () => 'Verify a Passport',
    render(code) {
      const p = L().passports.find((x) => x.code === code);
      const top = `<div class="notice"><span class="px cyan"></span>Public verification page. It works without sign-in; anyone with the link sees this and nothing else.</div>`;
      if (!p) return `<div class="page wrap" style="max-width:720px">${top}<div class="card"><h2>No entry with this code.</h2><p>Check the link. Codes look like <span class="code">LEAD-7K2Q-NW</span>.</p></div></div>`;
      if (p.status === 'Revoked') return `<div class="page wrap" style="max-width:720px">${top}<div class="card"><span class="eyebrow">${esc(code)}</span><h2>This entry was revoked.</h2><p>It is no longer valid evidence.</p></div></div>`;
      const c = L().challenges.find((x) => x.id === p.challengeId); const sub = L().submissions.find((s) => s.id === p.submissionId);
      return `<div class="page wrap" style="max-width:760px">${top}
        <div class="passport" style="padding:clamp(22px,4vw,40px)">
          <span class="dots tr" aria-hidden="true" style="position:absolute;width:220px;height:220px;z-index:-1"></span>
          <div class="row between"><span class="eyebrow">LEAD Skills Passport · verified</span>${ui.status('Verified', 'Valid')}</div>
          <span class="code" style="font-size:28px;font-family:var(--f-pixel);background:none;padding:0">${esc(p.code)}</span>
          <h1 style="font-size:clamp(30px,5vw,48px)">${esc(ui.capName(p.capSlug))}</h1>
          <p class="ink" style="font-size:17px">${esc(ui.nameOf(p.studentId))} showed this capability at level ${p.level} of 4, <b>${LEVELS[p.level - 1]}</b>, on a real industry live project.</p>
          <div class="kv"><span>Live Project</span><span>${esc(c.title)}</span><span>Sponsor</span><span>${esc(ui.orgName(c.sponsorOrgId))}</span><span>Scored</span><span>Blind-first, shared rubric</span><span>Approved by</span><span>UMO admin (second approval)</span><span>Evidence</span><span><a href="${esc(sub ? sub.deliverable : '#')}" target="_blank" rel="noopener">Deliverable</a> · decision log</span><span>Issued</span><span>${ui.fmtDate(p.at)}</span></div>
          <p class="muted" style="font-size:13px">Issued under the LEAD Codex by UMO Design Foundation. Synthetic demo record.</p>
        </div></div>`;
    },
  };

  /* ================= Design Jobs ================= */
  /* Four lanes. Each lane has the same two panels in the same order: who opens, then who responds. */
  const LANES = [
    { id: 'role', n: 1, title: 'Roles and internships', opens: 'Industry', responds: 'Students and open learners', yours: ['industry', 'student', 'open'] },
    { id: 'drive', n: 2, title: 'Campus hiring drives', opens: 'Colleges', responds: 'Industry', yours: ['head', 'industry'] },
    { id: 'cohort', n: 3, title: 'Open-cohort calls', opens: 'UMO admin', responds: 'Open learners', yours: ['admin', 'open'] },
    { id: 'referral', n: 4, title: 'Referrals', opens: 'Mentors and faculty', responds: 'The student, then the employer', yours: ['mentor', 'faculty', 'student', 'industry'] },
  ];
  const LANE_ORDER = {
    industry: ['role', 'drive', 'referral', 'cohort'], student: ['role', 'referral', 'drive', 'cohort'], open: ['cohort', 'role', 'referral', 'drive'],
    head: ['drive', 'role', 'cohort', 'referral'], faculty: ['referral', 'role', 'drive', 'cohort'], mentor: ['referral', 'role', 'drive', 'cohort'], admin: ['cohort', 'role', 'drive', 'referral'],
  };
  const JOBS_LINE = {
    industry: 'You open roles and internships, answer campus hiring drives, and see students referred to you.',
    student: 'You apply to roles with your Passport and confirm referrals made for you.',
    open: 'You apply to open-cohort calls first, then to open roles.',
    head: 'You open hiring drives for your campus and close them when they are done.',
    faculty: 'You refer a student to a role. The student confirms before any employer sees it.',
    mentor: 'You refer a student to a role. The student confirms before any employer sees it.',
    admin: 'You open open-cohort calls and see every lane.',
  };
  const REF_STATUS = { Waiting: 'Waiting for the student', Confirmed: 'Confirmed by the student', Declined: 'Declined by the student' };
  const INDUSTRY_ORGS = ['northwind', 'harbor', 'lumen'];

  LEAD.views.jobs = {
    title: () => 'Design Jobs',
    render() {
      const signed = store.session.signedIn; const r = signed ? role() : null; const u = signed ? me() : null;
      const D = L(); const ops = D.opportunities;
      const laneOf = (o) => o.lane || (o.open ? 'cohort' : 'role');
      const viewer = u ? { role: r, id: u.id, orgId: u.orgId } : null;
      const is = (...rs) => !!r && rs.includes(r);
      const signin = (roleKey, label, verb) => (signed ? '' : `<button class="btn small" data-act="as" data-role="${roleKey}" data-to="jobs">Sign in as ${esc(label)} to ${esc(verb)}</button>`);
      const note = (t) => `<p class="muted" style="font-size:13.5px">${esc(t)}</p>`;
      const lc = (o) => D.learningContracts.find((x) => x.id === o.learningContractId);
      const row = (o, extra) => `<article class="item job" data-job="${o.id}">
        <div class="row between"><span class="label">${esc(ui.orgName(o.orgId))} · ${esc(o.kind)}</span>${ui.status(o.status)}</div>
        <b class="ink">${esc(o.title)}</b>
        <div class="pill-list">${o.caps.map((c) => `<span class="chip">${esc(ui.capName(c))}</span>`).join('')}</div>
        ${o.kind === 'internship' && lc(o) ? `<span class="muted" style="font-size:13px">Learning contract · mentor ${esc(lc(o).mentor)} · ${esc(lc(o).duration)} · ${esc(lc(o).stipend)}</span>` : ''}
        ${extra || ''}</article>`;
      const panel = (kind, who, inner) => `<div class="card job-panel" data-panel="${kind}"><span class="eyebrow">${kind === 'opens' ? 'Who opens' : 'Who responds'} · ${esc(who)}</span>${inner}</div>`;
      const pe = (id) => D.passports.filter((p) => p.studentId === id && ['Verified', 'Shared'].includes(p.status));
      const capSelect = (id) => `<label class="field">Capability<select id="${id}" name="cap">${D.capabilities.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join('')}</select></label>`;

      /* ---- lane 1: roles and internships ---- */
      function laneRole(l) {
        const roles = ops.filter((o) => laneOf(o) === 'role').sort((a, b) => (is('industry') && b.orgId === u.orgId) - (is('industry') && a.orgId === u.orgId));
        const opens = roles.map((o) => row(o)).join('') || note('No roles yet.');
        const post = is('industry') ? `<form class="stack" data-form="post-op"><span class="eyebrow">Open a role</span>
          <label class="field">Title<input id="po-title" name="title" value="Junior service designer" required></label>
          <div class="form-grid"><label class="field">Kind<select id="po-kind" name="kind"><option value="internship">Internship</option><option value="role">Role</option></select></label>${capSelect('po-cap')}</div>
          <span class="label">Learning contract (required for internships)</span>
          <label class="field">Mentor<input id="po-mentor" name="mentor" value="Priya Shah"></label>
          <label class="field">Learning plan<textarea id="po-plan" name="plan">Weeks 1–4 shadow research; weeks 5–12 own one experiment.</textarea></label>
          <label class="field">Stipend note<input id="po-stipend" name="stipend" value="Field only; policy not set"></label>
          <button class="btn primary" type="submit">Post the role</button></form>` : note(signed ? 'Industry opens these.' : 'Companies open these. ') + signin('industry', 'industry', 'open a role');
        let resp;
        if (is('industry')) {
          const mine = roles.filter((o) => o.orgId === u.orgId);
          resp = mine.map((o) => {
            const apps = D.applications.filter((a) => a.opportunityId === o.id);
            return `<article class="item"><b class="ink">${esc(o.title)}</b><span class="label">Applicants · ${apps.length}</span>${apps.map((a) => {
              const ents = a.passportIds.map(ppById).filter(Boolean); const seen = ents.filter((p) => rules.employerCanSee(p)); const out = D.outcomes.find((x) => x.applicationId === a.id);
              return `<div class="item flat"><div class="row between"><b class="ink">${esc(ui.nameOf(a.studentId))}</b>${a.shortlisted ? ui.status('Shortlisting', 'Shortlisted') : ''}</div>
                ${seen.map((p) => `<span class="row" style="gap:8px">${ui.lvlDots(p.level)} ${esc(ui.capName(p.capSlug))} · <a href="#passport-${esc(p.code)}">verify</a></span>`).join('') || '<span class="muted" style="font-size:13px">No shared evidence. Entries stay hidden until the student shares.</span>'}
                <div class="row">${!a.shortlisted ? `<button class="btn small" data-act="op-short" data-id="${a.id}">Shortlist</button>` : ''}
                ${a.shortlisted && !out ? `<button class="btn small primary" data-act="op-out" data-id="${a.id}" data-r="Hired">Hired</button><button class="btn small" data-act="op-out" data-id="${a.id}" data-r="Deployed">Deployed</button><button class="btn small ghost" data-act="op-out" data-id="${a.id}" data-r="None">No hire</button>` : ''}
                ${out ? ui.status(out.result) : ''}</div></div>`;
            }).join('') || note('No applicants yet.')}</article>`;
          }).join('') || note('You have no open roles yet.');
        } else if (is('student')) {
          const apps = D.applications.filter((a) => a.studentId === u.id); const mineE = pe(u.id);
          resp = roles.map((o) => {
            const ap = apps.find((a) => a.opportunityId === o.id);
            return `<article class="item"><b class="ink">${esc(o.title)}</b>${ap ? `<div class="notice">Applied ${ui.fmtDate(ap.at)} · ${ap.shortlisted ? '<b class="ink">Shortlisted</b>' : 'In review'}${(D.outcomes.find((x) => x.applicationId === ap.id) || {}).result ? ' · outcome recorded' : ''}</div>`
              : `<form class="stack" data-form="apply" data-id="${o.id}"><span class="label">Attach Passport entries</span>${mineE.map((p) => `<label class="check"><input type="checkbox" name="pe" value="${p.id}" checked> ${esc(ui.capName(p.capSlug))} · ${LEVELS[p.level - 1]} ${p.shared ? ui.tag('Shared', 'live') : ui.tag('Not shared', 'sim')}</label>`).join('') || '<p class="muted" style="font-size:13px">No verified entries yet.</p>'}<span class="muted" style="font-size:12.5px">The employer sees an entry only if you share it.</span><button class="btn primary" type="submit">Apply</button></form>`}</article>`;
          }).join('');
        } else if (is('open')) {
          resp = roles.map((o) => `<article class="item"><b class="ink">${esc(o.title)}</b>${D.applications.some((a) => a.opportunityId === o.id && a.studentId === u.id) ? '<div class="notice">Applied. The UMO team replies within a week.</div>' : `<button class="btn primary" data-act="op-open-apply" data-id="${o.id}">Apply</button>`}</article>`).join('');
        } else {
          resp = note(signed ? 'Students and open learners apply with a Passport.' : 'Students and open learners apply here, with a Passport.') + `<div class="btn-row">${signin('student', 'a student', 'apply')}${signin('open', 'an open learner', 'apply')}</div>`;
        }
        return [panel('opens', l.opens, opens + post), panel('responds', l.responds, resp)];
      }

      /* ---- lane 2: campus hiring drives ---- */
      function laneDrive(l) {
        const drives = D.drives.slice().sort((a, b) => (is('head') && b.orgId === u.orgId) - (is('head') && a.orgId === u.orgId));
        const sum = (d) => ['Accepted', 'Pending', 'Declined'].map((k) => [k, d.replies.filter((x) => x.status === k).length]).filter(([, n]) => n).map(([k, n]) => `${n} ${k.toLowerCase()}`).join(' · ');
        const opens = drives.map((d) => `<article class="item job" data-drive="${d.id}"><div class="row between"><span class="label">${esc(ui.orgName(d.orgId))} · ${esc(ui.fmtDate(d.when))}</span>${ui.status(d.status === 'Open' ? 'Open' : 'Closed')}</div><b class="ink">${esc(d.title)}</b><span class="muted" style="font-size:13px">${d.seats} students ready · ${esc(d.caps.map(ui.capName).join(', '))}</span></article>`).join('') || note('No drives yet.');
        const post = is('head') ? `<form class="stack" data-form="post-drive"><span class="eyebrow">Open a hiring drive</span>
          <label class="field">Title<input id="pd-title" name="title" value="Campus placement week" required></label>
          <div class="form-grid"><label class="field">Date<input id="pd-when" name="when" type="date" value="2026-12-05" required></label><label class="field">Students ready<input id="pd-seats" name="seats" type="number" min="1" value="30" required></label></div>
          ${capSelect('pd-cap')}<button class="btn primary" type="submit">Open the drive</button></form>
          <div class="card tight flat"><span class="eyebrow">Placement readiness · cohort A</span>${ui.kpis([{ label: 'Shortlisted by employers', v: 21 }, { label: 'Interviews', v: 14 }, { label: 'Offers', v: 5 }])}<span class="muted tiny">Demo count · illustrative</span></div>` : note(signed ? 'Colleges open these.' : 'Colleges open these. ') + signin('head', 'a college', 'open a drive');
        let resp;
        if (is('industry')) {
          resp = drives.map((d) => { const rp = d.replies.find((x) => x.orgId === u.orgId); if (!rp) return ''; return `<article class="item"><b class="ink">${esc(d.title)}</b><span class="muted" style="font-size:13px">${esc(ui.orgName(d.orgId))}</span>${rp.status === 'Pending' ? `<div class="row"><button class="btn small primary" data-act="drive-reply" data-id="${d.id}" data-to="Accepted">Accept</button><button class="btn small ghost" data-act="drive-reply" data-id="${d.id}" data-to="Declined">Decline</button></div>` : `<div class="row">${ui.status(rp.status)}</div>`}</article>`; }).join('') || note('No drive has invited you yet.');
        } else if (is('head')) {
          resp = drives.filter((d) => d.orgId === u.orgId).map((d) => `<article class="item"><b class="ink">${esc(d.title)}</b>${d.replies.map((x) => `<div class="row between"><span>${esc(ui.orgName(x.orgId))}</span>${ui.status(x.status)}</div>`).join('') || note('No replies yet.')}${d.status === 'Open' ? `<button class="btn small" data-act="drive-close" data-id="${d.id}">Close the drive</button>` : ui.status('Closed')}</article>`).join('') || note('Open a drive to invite companies.');
        } else {
          resp = note('Companies accept or decline each drive. Only the college can close it.') + drives.map((d) => `<div class="row between"><span>${esc(d.title)}</span><span class="muted tiny">${esc(sum(d)) || 'No replies yet'}</span></div>`).join('') + `<div class="btn-row">${signin('industry', 'industry', 'answer a drive')}</div>`;
        }
        return [panel('opens', l.opens, opens + post), panel('responds', l.responds, resp)];
      }

      /* ---- lane 3: open-cohort calls ---- */
      function laneCohort(l) {
        const calls = ops.filter((o) => laneOf(o) === 'cohort');
        const opens = calls.map((o) => row(o, `<span class="muted" style="font-size:13px">${esc(o.note || '')}</span>`)).join('') || note('No calls yet.');
        const post = is('admin') ? `<form class="stack" data-form="post-cohort"><span class="eyebrow">Open a cohort call</span><label class="field">Title<input id="pc-title" name="title" value="Open cohort · Decision-log project" required></label>${capSelect('pc-cap')}<button class="btn primary" type="submit">Open the call</button></form>` : note(signed ? 'UMO admin opens these.' : 'UMO opens these. ') + signin('admin', 'UMO admin', 'open a call');
        let resp;
        if (is('open')) resp = calls.map((o) => `<article class="item"><b class="ink">${esc(o.title)}</b>${D.applications.some((a) => a.opportunityId === o.id && a.studentId === u.id) ? '<div class="notice">Applied. The UMO team replies within a week.</div>' : `<button class="btn primary" data-act="op-open-apply" data-id="${o.id}">Apply</button>`}</article>`).join('');
        else if (is('admin')) resp = calls.map((o) => { const apps = D.applications.filter((a) => a.opportunityId === o.id); return `<article class="item"><b class="ink">${esc(o.title)}</b><span class="label">Applicants · ${apps.length}</span>${apps.map((a) => `<div class="row between"><span>${esc(ui.nameOf(a.studentId))}</span><span class="muted tiny">${esc(ui.fmtDate(a.at))}</span></div>`).join('') || note('No applicants yet.')}</article>`; }).join('');
        else resp = note('Open learners apply to these calls. Free.') + `<div class="btn-row">${signin('open', 'an open learner', 'apply')}</div>`;
        return [panel('opens', l.opens, opens + post), panel('responds', l.responds, resp)];
      }

      /* ---- lane 4: referrals ---- */
      function laneReferral(l) {
        const refs = D.referrals.filter((x) => viewer && rules.referralVisible(x, viewer));
        const roleOf = (x) => ops.find((o) => o.id === x.opportunityId);
        const line = (x, extra) => `<article class="item" data-ref="${x.id}"><div class="row between"><b class="ink">${esc(ui.nameOf(x.studentId))} → ${esc(roleOf(x) ? roleOf(x).title : '')}</b>${ui.status(x.status === 'Waiting' ? 'Requested' : x.status === 'Confirmed' ? 'Verified' : 'Closed', REF_STATUS[x.status])}</div><span class="muted" style="font-size:13px">Referred by ${esc(ui.nameOf(x.byId))} · ${esc(ui.orgName(x.orgId))}</span><p style="font-size:14px">${esc(x.note)}</p>${extra || ''}</article>`;
        let opens;
        if (is('mentor', 'faculty')) {
          const students = D.users.filter((x) => x.role === 'student');
          opens = `<form class="stack" data-form="refer"><span class="eyebrow">Refer a student</span>
            <label class="field">Student<select id="rf-student" name="student">${students.map((x) => `<option value="${x.id}">${esc(x.name)} · ${esc(ui.orgName(x.orgId))}</option>`).join('')}</select></label>
            <label class="field">Role<select id="rf-role" name="role">${ops.filter((o) => laneOf(o) === 'role' && o.status !== 'Closed').map((o) => `<option value="${o.id}">${esc(o.title)} · ${esc(ui.orgName(o.orgId))}</option>`).join('')}</select></label>
            <label class="field">Why this student<textarea id="rf-note" name="note" required>Clear thinking in review and careful with decisions.</textarea></label>
            <span class="muted" style="font-size:12.5px">The student confirms first. Until then no employer sees it.</span><button class="btn primary" type="submit">Send the referral</button></form>${refs.filter((x) => x.byId === u.id).map((x) => line(x)).join('')}`;
        } else if (is('admin')) {
          opens = refs.map((x) => line(x)).join('') || note('No referrals yet.');
        } else {
          opens = note('Mentors and faculty refer a student to a role. A referral stays private until the student confirms it.') + `<div class="btn-row">${signin('mentor', 'a mentor', 'refer a student')}</div>`;
        }
        let resp;
        if (is('student')) resp = refs.filter((x) => x.studentId === u.id).map((x) => line(x, x.status === 'Waiting' ? `<div class="row"><button class="btn small primary" data-act="ref-confirm" data-id="${x.id}" data-accept="1">Confirm</button><button class="btn small ghost" data-act="ref-confirm" data-id="${x.id}" data-accept="0">Decline</button></div>` : '')).join('') || note('No one has referred you yet.');
        else if (is('industry')) resp = refs.filter((x) => x.status === 'Confirmed').map((x) => { const seen = D.passports.filter((p) => p.studentId === x.studentId && rules.employerCanSee(p)); return line(x, seen.map((p) => `<span class="row" style="gap:8px">${ui.lvlDots(p.level)} ${esc(ui.capName(p.capSlug))} · <a href="#passport-${esc(p.code)}">verify</a></span>`).join('') || '<span class="muted" style="font-size:13px">No shared evidence yet.</span>'); }).join('') || note('No confirmed referrals for your roles yet.');
        else if (is('admin')) resp = note(`${D.referrals.filter((x) => x.status === 'Confirmed').length} confirmed · ${D.referrals.filter((x) => x.status === 'Waiting').length} waiting for a student.`);
        else resp = note('The student confirms a referral. Only then does the employer see it.') + `<div class="btn-row">${signin('student', 'a student', 'confirm a referral')}</div>`;
        return [panel('opens', l.opens, opens), panel('responds', l.responds, resp)];
      }

      const build = { role: laneRole, drive: laneDrive, cohort: laneCohort, referral: laneReferral };
      const order = signed ? LANE_ORDER[r] : ['role', 'drive', 'cohort', 'referral'];
      const lanes = order.map((id) => LANES.find((x) => x.id === id)).map((l) => {
        const mine = signed && l.yours.includes(r);
        const [a, b] = build[l.id](l);
        return `<section class="job-lane ${mine ? 'is-yours' : ''}" id="lane-${l.id}" data-lane="${l.id}" aria-labelledby="lane-t-${l.id}">
          <header class="lane-head"><span class="lane-num pxnum" aria-hidden="true">${l.n}</span><div class="stack" style="gap:2px"><h2 id="lane-t-${l.id}">${esc(l.title)}</h2><span class="muted tiny">${esc(l.opens)} open it · ${esc(l.responds)} respond</span></div>${mine ? '<span class="tag info">Yours</span>' : ''}</header>
          <div class="lane-panels">${a}${b}</div></section>`;
      }).join('');
      const intro = signed ? JOBS_LINE[r] : 'Four ways a design job starts. In each one, one side opens it and the other side responds. Sign in as a role to take part.';
      return `<div class="page wrap">${ui.hero({ compact: true, eyebrow: 'Design Jobs', title: 'Design Jobs.', lede: intro, meta: ui.simTag() })}
        ${lanes}
        <div class="notice"><span class="px cyan"></span><span>Looking for any design job? <a href="https://uxin.co" target="_blank" rel="noopener">UXIN</a> carries general jobs. LEAD lists only evidence-backed roles.</span></div></div>`;
    },
  };

  const appById = (id) => L().applications.find((a) => a.id === id);
  LEAD.forms.apply = (fd, form) => {
    const a = { id: uid('ap'), opportunityId: form.dataset.id, studentId: me().id, passportIds: fd.getAll('pe'), shortlisted: false, at: Date.now() };
    store.commit('Applied', 'application', a.id, () => { L().applications.push(a); return a; });
    ui.toast('Applied.');
  };
  LEAD.forms['post-op'] = (fd) => {
    const kind = fd.get('kind');
    if (kind === 'internship' && !(String(fd.get('mentor')).trim() && String(fd.get('plan')).trim())) { ui.toast('An internship needs a mentor and a learning plan.'); return; }
    const lc = kind === 'internship' ? { id: uid('lc'), mentor: fd.get('mentor'), plan: fd.get('plan'), stipend: fd.get('stipend'), duration: '3 months' } : null;
    if (lc) L().learningContracts.push(lc);
    const o = { id: uid('op'), orgId: me().orgId, title: fd.get('title'), kind, caps: [fd.get('cap')], status: 'Open', open: false, learningContractId: lc ? lc.id : null };
    store.commit('Role opened', 'opportunity', o.id, () => { L().opportunities.unshift(o); return o; });
    ui.toast('Posted.');
  };
  LEAD.forms['post-cohort'] = (fd) => {
    const title = String(fd.get('title')).trim(); if (!title) { ui.toast('Add a title.'); return; }
    const o = { id: uid('op'), orgId: 'umo', title, kind: 'open cohort', caps: [fd.get('cap')], status: 'Open', open: true, lane: 'cohort', note: 'Applications open to the open community' };
    store.commit('Open-cohort call opened', 'opportunity', o.id, () => { L().opportunities.unshift(o); return o; });
    ui.toast('Call opened.');
  };
  LEAD.forms['post-drive'] = (fd) => {
    const title = String(fd.get('title')).trim(); const seats = Number(fd.get('seats'));
    if (!title || !(seats > 0)) { ui.toast('Add a title and a number of students.'); return; }
    const d = { id: uid('dr'), orgId: me().orgId, title, when: String(fd.get('when')), seats, caps: [fd.get('cap')], status: 'Open', replies: INDUSTRY_ORGS.map((o) => ({ id: uid('rp'), orgId: o, status: 'Pending', at: null })) };
    store.commit('Hiring drive opened', 'drive', d.id, () => { L().drives.unshift(d); return d; });
    ui.toast('Drive opened. Companies can now answer.');
  };
  LEAD.forms.refer = (fd) => {
    const o = L().opportunities.find((x) => x.id === fd.get('role')); const note = String(fd.get('note')).trim();
    if (!o || !fd.get('student') || !note) { ui.toast('Choose a student and a role, and say why.'); return; }
    const ref = { id: uid('rf'), byId: me().id, studentId: fd.get('student'), opportunityId: o.id, orgId: o.orgId, note, status: 'Waiting', at: Date.now() };
    store.commit('Referral sent (private until the student confirms)', 'referral', ref.id, () => { L().referrals.unshift(ref); return ref; });
    ui.toast('Sent. The student confirms before any employer sees it.');
  };
  Object.assign(LEAD.act, {
    'op-short'(el) {
      const a = appById(el.dataset.id);
      store.commit('Candidate shortlisted', 'application', a, () => { a.shortlisted = true; return a; });
      const o = L().opportunities.find((x) => x.id === a.opportunityId);
      if (o.status === 'Open') move('opportunity', o, 'Shortlisting');
    },
    'op-out'(el) {
      const a = appById(el.dataset.id); const result = el.dataset.r;
      const out = { id: uid('oc'), applicationId: a.id, result, recordedBy: me().id, at: Date.now() };
      store.commit(`Outcome recorded: ${result}`, 'outcome', out.id, () => { L().outcomes.push(out); return out; });
      const o = L().opportunities.find((x) => x.id === a.opportunityId);
      if (result !== 'None' && o.status === 'Shortlisting') move('opportunity', o, 'Filled');
      ui.toast(`Outcome recorded: ${result}. It counts in the Impact Ledger.`);
    },
    'op-open-apply'(el) {
      if (L().applications.some((x) => x.opportunityId === el.dataset.id && x.studentId === me().id)) return;
      const a = { id: uid('ap'), opportunityId: el.dataset.id, studentId: me().id, passportIds: [], shortlisted: false, at: Date.now() };
      store.commit('Application sent', 'application', a.id, () => { L().applications.push(a); return a; });
      ui.toast('Applied.');
    },
    'drive-reply'(el) {
      const d = L().drives.find((x) => x.id === el.dataset.id); const rp = d && d.replies.find((x) => x.orgId === me().orgId);
      if (!rp) return;
      const res = rules.driveReply(rp, el.dataset.to, me().orgId);
      if (!res.ok) { ui.toast(res.reason); return; }
      store.commit(`Hiring drive reply: ${res.status}`, 'drive', d, () => { rp.status = res.status; rp.at = Date.now(); return d; });
      ui.toast(`${res.status}. The college can see your answer.`);
    },
    'drive-close'(el) {
      const d = L().drives.find((x) => x.id === el.dataset.id);
      const res = rules.canCloseDrive(d, me().orgId);
      if (!res.ok) { ui.toast(res.reason); return; }
      store.commit('Hiring drive closed', 'drive', d, () => { d.status = 'Closed'; return d; });
      ui.toast('Drive closed.');
    },
    'ref-confirm'(el) {
      const ref = L().referrals.find((x) => x.id === el.dataset.id);
      const res = rules.confirmReferral(ref, me().id, el.dataset.accept === '1');
      if (!res.ok) { ui.toast(res.reason); return; }
      store.commit(`Referral ${res.status.toLowerCase()} by the student`, 'referral', ref, () => { ref.status = res.status; return ref; });
      ui.toast(res.status === 'Confirmed' ? 'Confirmed. The employer can now see this referral.' : 'Declined. No employer saw it.');
    },
    toast(el) { ui.toast(el.dataset.msg); },
  });

  /* ================= Impact Ledger ================= */
  LEAD.views.impact = {
    title: () => 'Impact Ledger',
    render() {
      const r = role(); const u = me(); const D = L();
      const solved = D.problemRecords.filter((p) => p.result === 'solved').length;
      const partly = D.problemRecords.filter((p) => p.result === 'partly').length;
      const verified = D.passports.filter((p) => ['Verified', 'Shared'].includes(p.status)).length;
      const shortlisted = D.applications.filter((a) => a.shortlisted).length;
      const hired = D.outcomes.filter((o) => ['Hired', 'Deployed'].includes(o.result)).length;
      const mins = D.sprints.flatMap((s) => s.sessions.filter((x) => x.done)).reduce((a, x) => a + x.minutes, 0);
      const byState = (s) => D.challenges.filter((c) => c.status === s).length;
      const spreads = D.submissions.map((s) => { const ws = lockedBy(s.id).map((a) => weighted(s.id, a)); return ws.length > 1 ? Math.max(...ws) - Math.min(...ws) : null; }).filter((x) => x != null);
      const agree = spreads.length ? (spreads.reduce((a, b) => a + b, 0) / spreads.length).toFixed(2) : '—';
      const scope = { student: 'Your own record', faculty: 'Your cohort', head: 'Your institution', industry: 'Your organisation', mentor: 'Your hours', open: 'Public totals', admin: 'The whole loop' }[r];
      const fsi = D.capabilities.map((c) => {
        const demand = c.asks + D.demandSignals.filter((d) => d.capSlug === c.slug).length;
        const supply = D.passports.filter((p) => p.capSlug === c.slug && p.level >= 3 && ['Verified', 'Shared'].includes(p.status)).length;
        return { c, demand, supply, gap: supply ? demand / supply : null };
      }).sort((a, b) => b.demand - a.demand).slice(0, 8);
      const maxD = Math.max(...fsi.map((x) => x.demand));
      const sponsorRecords = D.problemRecords.filter((p) => { const c = D.challenges.find((x) => x.id === p.challengeId); return r === 'admin' || (r === 'industry' && c && c.sponsorOrgId === u.orgId); });
      return `<div class="page wrap">
        ${ui.hero({ compact: true, eyebrow: 'Impact', title: 'Impact.', lede: 'The headline is industry problems solved, confirmed by the sponsor’s named owner. Programmes run do not count.', meta: `${ui.tag(`Scope: ${scope}`, 'ind')}${ui.simTag()}` })}
        <section class="section">
          <div class="row between"><div class="stack" style="gap:2px"><span class="eyebrow">Headline</span><span class="pxnum" style="font-size:clamp(56px,8vw,96px)">${String(solved).padStart(2, '0')}</span><b class="ink" style="font-size:20px">industry problems solved</b><span class="muted">${partly} partly solved, counted separately. Each live project counts once.</span></div>
          ${r === 'admin' ? '<button class="btn primary" data-act="report">Publish day-30 report</button>' : ''}</div>
          ${ui.kpis([
            { label: 'Live Projects live', v: byState('Live') + byState('In assessment'), d: `${D.challenges.length} posted · ${byState('Closed')} closed` },
            { label: 'Verified Passports', v: verified, d: 'Verified or shared' },
            { label: 'Shortlisted', v: shortlisted }, { label: 'Hired or deployed', v: hired },
            { label: 'Mentor hours', v: (mins / 60).toFixed(1) }, { label: 'Calendar touchpoints', v: D.events.length },
            { label: 'Assessor spread (avg)', v: agree, d: 'Lower means more agreement' }, { label: 'Median days, intake to live', v: 18, d: 'Illustrative' },
          ], 'k4')}
        </section>
        ${sponsorRecords.length ? `<section class="section">${ui.sectionHead('Problems solved', 'Sponsor confirmation', '', 'Solved means the sponsor’s named owner confirms at least one submission meets the success criteria in the brief.')}
          <div class="grid g2">${sponsorRecords.map((p) => { const c = D.challenges.find((x) => x.id === p.challengeId); return `<article class="card"><div class="row between"><span class="label">${esc(ui.orgName(c.sponsorOrgId))}</span>${p.result ? ui.status(p.result, { solved: 'Solved', partly: 'Partly solved', not: 'Not solved' }[p.result]) : ui.status('Draft', 'Awaiting sponsor')}</div><h3>${esc(c.title)}</h3><p style="font-size:14px"><b class="ink">Solved means:</b> ${esc(c.solved)}</p>
            ${r === 'industry' && !p.result ? `<div class="row"><button class="btn small primary" data-act="pr" data-id="${p.id}" data-r="solved">Confirm solved</button><button class="btn small" data-act="pr" data-id="${p.id}" data-r="partly">Partly</button><button class="btn small ghost" data-act="pr" data-id="${p.id}" data-r="not">Not solved</button></div>` : (p.confirmedBy ? `<span class="muted" style="font-size:13px">Confirmed by ${esc(ui.nameOf(p.confirmedBy))}</span>` : `<span class="muted" style="font-size:13px">${esc(p.note)}</span>`)}</article>`; }).join('')}</div></section>` : ''}
        <section class="section">
          ${ui.sectionHead('Future Skills Index', 'Demand against supply', ui.tag('Concept · not validated', 'sim'), 'Demand: employer asks this period. Supply: verified entries at level 3 or above. Seeded data.')}
          <div class="card">${fsi.map((x) => `<div class="stack" style="gap:6px;padding:8px 0;border-top:1px solid var(--line)">
            <div class="row between"><span class="ink">${esc(x.c.name)}</span><span class="tnum muted">${x.demand} asks · ${x.supply} verified · gap ${x.gap == null ? '∞' : x.gap.toFixed(1)}×</span></div>
            <div style="display:grid;gap:3px"><div class="meter"><span style="width:${Math.round((x.demand / maxD) * 100)}%;background:var(--red)"></span></div><div class="meter"><span style="width:${Math.round((x.supply / maxD) * 100)}%"></span></div></div>
          </div>`).join('')}<div class="legend"><span><span class="vk" style="background:var(--red)"></span> Demand</span><span><span class="vk" style="background:var(--cyan)"></span> Verified supply</span></div></div>
        </section>
        ${r === 'head' || r === 'admin' ? `<section class="section">${ui.sectionHead('Outcomes · cohort A', 'Outcomes view', ui.simTag(), 'No student names. Groups under 5 are hidden.')}
          ${ui.kpis([{ label: 'Passports validated', v: '38 of 60' }, { label: 'Live Projects completed', v: 12 }, { label: 'Faculty hours', v: 54 }, (() => { const a = rules.aggregate(D.passports.filter((p) => store.user(p.studentId).orgId === 'campus-c').length); return { label: 'Campus C · live entries', v: a.value, hidden: a.hidden }; })()])}</section>` : ''}
      </div>`;
    },
  };
  Object.assign(LEAD.act, {
    pr(el) {
      const p = L().problemRecords.find((x) => x.id === el.dataset.id);
      store.commit(`Problem record: ${el.dataset.r}`, 'problem_record', p, () => { p.result = el.dataset.r; p.confirmedBy = me().id; p.confirmedAt = Date.now(); return p; });
      ui.toast(el.dataset.r === 'solved' ? 'Confirmed solved. The headline counts it.' : 'Recorded.');
    },
    report() { store.commit('Day-30 report published', 'report', 'day-30', () => ({ published: true })); ui.toast('Day-30 report published (mock). Sent to institution heads and sponsors.'); },
  });

  /* ================= Audit log ================= */
  LEAD.views.audit = {
    title: () => 'Audit log',
    render() {
      if (role() !== 'admin') return ui.guard(['admin'], 'The audit log');
      const rows = L().audit.map((a) => Object.assign({ src: 'Loop' }, a)).concat(store.pricing.audit.map((a) => Object.assign({ src: 'Pricing' }, a))).sort((a, b) => b.at - a.at).slice(0, 200);
      return `<div class="page wrap">${ui.hero({ compact: true, eyebrow: 'Audit', title: 'Audit.', lede: 'Every state change, with who did it and what it was before and after.' })}
        <div class="table-wrap"><table><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Entity</th><th>Source</th></tr></thead><tbody>
        ${rows.map((a) => `<tr><td style="white-space:nowrap">${ui.ago(a.at)}</td><td>${esc(a.actor)}</td><td><b>${esc(a.action)}</b></td><td><span class="code">${esc(a.entity)}${a.entityId ? ' · ' + esc(a.entityId) : ''}</span></td><td>${ui.tag(a.src, a.src === 'Pricing' ? 'mock' : 'ind')}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">No changes yet. Do something in the loop.</td></tr>'}
        </tbody></table></div></div>`;
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
