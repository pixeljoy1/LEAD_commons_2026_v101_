/* LEAD · business rules R1–R25 and state machines (spec §8.6, §9.1; addendum A13). Pure functions. */
(function (root, factory) {
  const isNode = typeof module === 'object' && module.exports;
  const enums = isNode ? require('./enums.js') : root.LEAD.enums;
  const pricing = isNode ? require('./pricing.js') : root.LEAD.pricing;
  const mod = factory(enums, pricing);
  root.LEAD = root.LEAD || {};
  root.LEAD.rules = mod;
  if (isNode) module.exports = mod;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (enums, pricing) {
  const ok = (extra) => Object.assign({ ok: true }, extra || {});
  const no = (reason, extra) => Object.assign({ ok: false, reason }, extra || {});

  /* ---------- state machines (§8.6) ---------- */

  const MACHINES = {
    demand_signal: ['Submitted', 'Reviewed', 'Merged', 'Published'],
    challenge: ['Draft', 'Shaped', 'Matched', 'Live', 'In assessment', 'Closed'],
    mentor_sprint: ['Requested', 'Booked', 'In progress', 'Complete'],
    submission: ['Draft', 'Submitted', 'In scoring', 'Scored', 'Moderated'],
    passport_entry: ['Proposed', 'Verified', 'Shared', 'Revoked'],
    opportunity: ['Open', 'Shortlisting', 'Filled', 'Closed'],
    learning_request: ['Open', 'Matched', 'Scheduled', 'Done', 'Closed'],
    teaching_offer: ['Proposed', 'Approved', 'Scheduled', 'Done'],
    open_topic: ['Proposed', 'Open', 'Published'],
  };
  /* Extra legal moves beyond "next state". */
  const EXTRA = {
    demand_signal: { Reviewed: ['Published'] }, // kept as its own theme
    passport_entry: { Shared: ['Verified', 'Revoked'], Verified: ['Revoked'] }, // unshare, revoke
    opportunity: { Open: ['Closed'], Shortlisting: ['Closed'] },
    learning_request: { Open: ['Closed'], Matched: ['Closed'], Scheduled: ['Closed'] },
  };

  function canTransition(machine, from, to) {
    const states = MACHINES[machine];
    if (!states) return false;
    const i = states.indexOf(from);
    if (i < 0 || !states.includes(to)) return false;
    if (states[i + 1] === to) return true;
    return !!(EXTRA[machine] && EXTRA[machine][from] && EXTRA[machine][from].includes(to));
  }

  function transition(machine, from, to) {
    if (!canTransition(machine, from, to)) {
      throw new Error(`Illegal move for ${machine.replace('_', ' ')}: ${from} → ${to}.`);
    }
    return to;
  }

  /* ---------- R1 Blind-first ---------- */
  /* An assessor sees names only once every criterion they score on this submission is locked. */
  function identitiesVisible(assessorId, submissionId, scores, criteriaCount) {
    const mine = scores.filter((s) => s.assessorId === assessorId && s.submissionId === submissionId);
    return mine.length >= criteriaCount && mine.every((s) => s.locked);
  }

  /* ---------- R2 Two-person approval ---------- */
  function canVerify(entry, scores, approver, criteriaCount) {
    if (entry.status !== 'Proposed') return no(`Entry is ${entry.status}, not Proposed.`);
    if (!approver || approver.role !== 'admin') return no('Only a UMO admin gives the second approval.');
    if (approver.id === entry.assessorId) return no('The assessor cannot approve their own entry.');
    const assessed = scores.filter((s) => s.submissionId === entry.submissionId && s.assessorId === entry.assessorId);
    if (assessed.length < (criteriaCount || 1) || !assessed.every((s) => s.locked)) {
      return no('The assessor has not locked every score yet.');
    }
    return ok();
  }

  /* ---------- R3 Student controls sharing ---------- */
  function employerCanSee(entry) {
    return !!entry && entry.status === 'Shared' && entry.shared === true;
  }

  /* ---------- R24 A referral stays private until the student confirms it ---------- */
  /* viewer: { role, id, orgId }. The author and the named student can always see it. Employers and others only after the student confirms. */
  function referralVisible(ref, viewer) {
    if (!ref || !viewer) return false;
    if (viewer.role === 'admin') return true;
    if (viewer.id === ref.byId || viewer.id === ref.studentId) return true;
    return ref.status === 'Confirmed' && viewer.role === 'industry' && viewer.orgId === ref.orgId;
  }
  function confirmReferral(ref, actorId, accept) {
    if (ref.status !== 'Waiting') return no(`This referral is already ${ref.status.toLowerCase()}.`);
    if (actorId !== ref.studentId) return no('Only the student named in a referral can confirm or decline it.');
    return ok({ status: accept ? 'Confirmed' : 'Declined' });
  }

  /* ---------- R25 A hiring drive reply moves Pending to Accepted or Declined; only the college closes the drive ---------- */
  function driveReply(reply, to, actorOrgId) {
    if (actorOrgId !== reply.orgId) return no('Only the invited company can answer for itself.');
    if (reply.status !== 'Pending') return no(`This reply is already ${reply.status.toLowerCase()}.`);
    if (!['Accepted', 'Declined'].includes(to)) return no('A reply is Accepted or Declined.');
    return ok({ status: to });
  }
  function canCloseDrive(drive, actorOrgId) {
    if (drive.status === 'Closed') return no('This drive is already closed.');
    if (actorOrgId !== drive.orgId) return no('Only the college that opened a drive can close it.');
    return ok();
  }

  /* ---------- R4 Small groups stay hidden ---------- */
  const MIN_GROUP = 5;
  function aggregate(count) {
    return count < MIN_GROUP ? { hidden: true, label: 'Hidden (fewer than 5)' } : { hidden: false, value: count, label: String(count) };
  }

  /* ---------- R5 Conflicts ---------- */
  function canScore(assessorId, teamId, sprints) {
    const mentored = sprints.some((s) => s.teamId === teamId && s.mentorId === assessorId);
    return mentored ? no('You mentored this team. Someone else scores it.') : ok();
  }
  function canContact(entry, scoresLocked) {
    if (!scoresLocked) return no('Scores are not locked yet.');
    if (!employerCanSee(entry)) return no('The student has not shared this entry.');
    return ok();
  }

  /* ---------- R6 NDA-safe before publishing ---------- */
  const NDA_CHECKS = [
    ['noPersonal', 'No personal data'],
    ['noConfidential', 'No confidential data'],
    ['sanitised', 'Examples sanitised'],
    ['ipTerms', 'IP terms chosen'],
  ];
  function ndaSafe(checks) {
    const c = checks || {};
    const missing = NDA_CHECKS.filter(([k]) => !c[k]).map(([, label]) => label);
    return missing.length ? no(`Not NDA-safe yet: ${missing.join(', ')}.`, { missing }) : ok({ missing: [] });
  }

  /* ---------- R7 AI-use declaration ---------- */
  function canSubmit(sub) {
    if (!sub.deliverable || !String(sub.deliverable).trim()) return no('Add the deliverable link.');
    if (!sub.ai || !String(sub.ai).trim()) return no('Add an AI-use declaration. Say “No AI used” if none was used.');
    return ok();
  }

  /* ---------- R8 / R16 audit ---------- */
  function auditEntry(actor, action, entity, entityId, before, after, at) {
    return {
      id: pricing.makeId('AU'),
      actor, action, entity, entityId,
      before: before === undefined ? null : JSON.parse(JSON.stringify(before)),
      after: after === undefined ? null : JSON.parse(JSON.stringify(after)),
      at: at || Date.now(),
    };
  }

  /* ---------- R9 + R12 Price versioning and warning ---------- */
  function lastPrice(plan) {
    const v = (plan.versions || []).slice().sort((a, b) => b.version - a.version)[0];
    if (!v) return null;
    if (plan.pricingModel === 'TIERED_BY_SIZE') return v.tiers || null;
    return v.unitPrice;
  }

  function changeRatio(before, after) {
    if (before == null || before === 0 || after == null) return 0;
    return Math.abs(after - before) / before;
  }

  /* Returns { ok, version } — a NEW version; old versions are never edited (R9). */
  function setPrice(plan, input) {
    const { unitPrice, tiers, note, by, effectiveFrom, now } = input;
    const prev = lastPrice(plan);
    let big = false;
    if (plan.pricingModel === 'TIERED_BY_SIZE') {
      if (!Array.isArray(tiers) || !tiers.length) return no('Add at least one tier price.');
      if (tiers.some((t) => t.price != null && (!Number.isInteger(t.price) || t.price < 0))) return no('Tier prices must be whole paise, 0 or more.');
      if (Array.isArray(prev)) {
        big = tiers.some((t) => { const p = prev.find((x) => x.tier === t.tier); return p && changeRatio(p.price, t.price) > 0.3; });
      }
    } else if (plan.pricingModel !== 'FREE') {
      if (unitPrice == null || !Number.isInteger(unitPrice) || unitPrice < 0) return no('Enter a price of 0 or more.');
      big = changeRatio(prev, unitPrice) > 0.3;
    }
    if (big && !(note && String(note).trim())) {
      return no('This change is more than 30% against the last price. Add a note saying why.', { needsNote: true });
    }
    const n = (plan.versions || []).reduce((m, v) => Math.max(m, v.version), 0) + 1;
    const version = {
      id: `${plan.key}-v${n}`,
      version: n,
      unitPrice: plan.pricingModel === 'TIERED_BY_SIZE' ? null : (plan.pricingModel === 'FREE' ? 0 : unitPrice),
      tiers: plan.pricingModel === 'TIERED_BY_SIZE' ? tiers.map((t) => Object.assign({}, t)) : null,
      effectiveFrom: effectiveFrom || new Date(pricing.toMs(now)).toISOString(),
      note: note || '',
      by: by || null,
      at: pricing.toMs(now),
    };
    return ok({ version, bigChange: big });
  }

  /* ---------- plan registry ---------- */
  function validatePlan(fields, existingPlans) {
    const key = String(fields.key || '').trim().toUpperCase();
    if (!enums.PLAN_KEY_RE.test(key)) return no('Plan key: 3–40 capitals, digits or underscores, starting with a letter.');
    if (existingPlans.some((p) => p.key === key)) return no('That plan key already exists.');
    if (!fields.name || !String(fields.name).trim()) return no('Give the plan a name.');
    if (!enums.PlanKind.includes(fields.kind)) return no('Pick a plan kind.');
    if (!enums.PricingModel.includes(fields.pricingModel)) return no('Pick a pricing model.');
    if (!enums.BillingPeriod.includes(fields.billingPeriod)) return no('Pick a billing period.');
    return ok({ key });
  }

  /* ---------- R11 Second approval ---------- */
  function needsSecondApproval(percentOff, thresholdPct) {
    return percentOff >= 100 || percentOff > thresholdPct;
  }

  function validateCouponFields(f, existing) {
    const code = enums.normaliseCode(f.code);
    if (!enums.COUPON_CODE_RE.test(code)) return no('Name: 4–20 characters, A–Z, 0–9, hyphen or underscore.');
    if (existing.some((c) => enums.normaliseCode(c.code) === code)) return no('That code already exists.');
    const pct = Number(f.percentOff);
    if (!Number.isInteger(pct) || pct < 1 || pct > 100) return no('Percent off must be a whole number from 1 to 100.');
    if (f.validFrom && f.validUntil && Date.parse(f.validFrom) > Date.parse(f.validUntil)) return no('The end date is before the start date.');
    if (f.maxRedemptions != null && f.maxRedemptions !== '' && !(Number(f.maxRedemptions) >= 1)) return no('Max redemptions must be 1 or more, or blank.');
    return ok({ code, percentOff: pct });
  }

  /* Creates the coupon: ACTIVE at or below the threshold, PENDING_APPROVAL above it. */
  function createCoupon(f, existing, settings, by, now) {
    const v = validateCouponFields(f, existing);
    if (!v.ok) return v;
    const pending = needsSecondApproval(v.percentOff, settings.approvalThresholdPct);
    const coupon = {
      code: v.code,
      kind: 'PERCENT',
      percentOff: v.percentOff,
      appliesKinds: f.appliesKinds || [],
      appliesKeys: f.appliesKeys || [],
      minQty: f.minQty ? Number(f.minQty) : null,
      validFrom: f.validFrom || null,
      validUntil: f.validUntil || null,
      maxRedemptions: f.maxRedemptions === '' || f.maxRedemptions == null ? null : Number(f.maxRedemptions),
      maxPerOrg: f.maxPerOrg ? Number(f.maxPerOrg) : 1,
      status: pending ? 'PENDING_APPROVAL' : 'ACTIVE',
      fundedBy: f.fundedBy || 'UMO',
      note: f.note || '',
      createdBy: by,
      approvedBy: null,
      createdAt: pricing.toMs(now),
      redemptions: [],
    };
    return ok({ coupon, pending });
  }

  function approveCoupon(coupon, by) {
    if (coupon.status !== 'PENDING_APPROVAL') return no('This coupon is not waiting for approval.');
    if (coupon.createdBy === by) return no('You created this coupon. A different admin must approve it.');
    return ok({ coupon: Object.assign({}, coupon, { status: 'ACTIVE', approvedBy: by }) });
  }

  const COUPON_MOVES = {
    DRAFT: ['ACTIVE', 'PENDING_APPROVAL', 'ARCHIVED'],
    PENDING_APPROVAL: ['ACTIVE', 'ARCHIVED'],
    ACTIVE: ['PAUSED', 'EXPIRED', 'EXHAUSTED', 'ARCHIVED'],
    PAUSED: ['ACTIVE', 'ARCHIVED'],
    EXPIRED: ['ARCHIVED'],
    EXHAUSTED: ['ARCHIVED'],
    ARCHIVED: [],
  };
  function setCouponStatus(coupon, to) {
    if (!(COUPON_MOVES[coupon.status] || []).includes(to)) return no(`A ${coupon.status.toLowerCase().replace('_', ' ')} coupon cannot move to ${to.toLowerCase()}.`);
    return ok({ coupon: Object.assign({}, coupon, { status: to }) });
  }

  /* ---------- R13 Key immutability ---------- */
  function keyInUse(signups, field, key) {
    return signups.some((s) => s[field] === key);
  }
  function canRenameOrDelete(signups, field, key) {
    return keyInUse(signups, field, key)
      ? no('This key is used by a sign-up. It cannot be renamed or deleted. Archive it instead.')
      : ok();
  }

  /* ---------- R17 No price, no sale ---------- */
  function sellable(plan, now) {
    if (plan.archived) return no('Archived.');
    if (!plan.active) return no('Switched off.');
    if (!pricing.isPriced(pricing.currentVersion(plan, now), plan.pricingModel)) return no('No price set.');
    if (pricing.remaining(plan) === 0) return no('Closed. Re-opens soon.');
    return ok();
  }

  /* R18 The 1 Million Women share is a whole or half percent between 0 and 50. One setting, audited. */
  function validateWomenShare(raw) {
    const n = Number(raw);
    if (raw === '' || raw == null || !Number.isFinite(n)) return no('Enter a number.');
    if (n < 0 || n > 50) return no('The share must be between 0 and 50 percent.');
    if (Math.round(n * 2) !== n * 2) return no('Use whole or half percents.');
    return Object.assign(ok(), { pct: n });
  }

  /* ---------- R20 Module codes: LM-<mode>-<n>, mode from a fixed list, unique ---------- */
  function moduleCode(mode, n) { return `LM-${mode}-${n}`; }
  function validateModuleCode(code, existing) {
    const m = enums.MODULE_CODE_RE.exec(String(code || '').trim());
    if (!m) return no('A module code looks like LM-SP-1: LM, a mode (SP, IL, PL or CB) and a number.');
    if ((existing || []).includes(code)) return no(`${code} is already in use.`);
    return ok({ mode: m[1], n: Number(m[2]) });
  }

  /* ---------- R21 Progress: any order, never backwards, done only when every lesson is done and the check is passed ---------- */
  function markLesson(rec, mod, lessonId) {
    const r = { done: ((rec && rec.done) || []).slice(), check: rec && rec.check ? Object.assign({}, rec.check) : null, completedAt: rec ? rec.completedAt || null : null };
    if (mod.lessons.some((l) => l.id === lessonId) && !r.done.includes(lessonId)) r.done.push(lessonId);
    return r;
  }
  function scoreCheck(mod, answers) {
    const qs = mod.check || [];
    const score = qs.reduce((n, q, i) => n + (Number(answers[i]) === q.answer ? 1 : 0), 0);
    return { score, total: qs.length, passed: score >= (mod.pass || Math.ceil(qs.length * 2 / 3)) };
  }
  function recordCheck(rec, mod, result) {
    const r = markLesson(rec, mod, null); // a copy
    const prev = r.check;
    r.check = prev && prev.passed ? prev : { score: result.score, total: result.total, passed: result.passed };
    return r;
  }
  function moduleProgress(mod, rec) {
    const lessonsDone = ((rec && rec.done) || []).filter((id) => mod.lessons.some((l) => l.id === id)).length;
    const steps = mod.lessons.length + (mod.check && mod.check.length ? 1 : 0);
    const checkDone = !!(rec && rec.check && rec.check.passed);
    const doneSteps = lessonsDone + (mod.check && mod.check.length && checkDone ? 1 : 0);
    const complete = mod.lessons.length > 0 && lessonsDone === mod.lessons.length && (!(mod.check && mod.check.length) || checkDone);
    return { lessonsDone, steps, doneSteps, pct: steps ? Math.round((doneSteps / steps) * 100) : 0, complete, canCheck: lessonsDone === mod.lessons.length && !!(mod.check && mod.check.length) };
  }

  /* ---------- R22 Giving back: offers, requests, topics ---------- */
  const OFFER_ROLES = ['mentor', 'industry', 'faculty', 'head'];
  function validateOffer(o) {
    const hours = Number(o.hours);
    if (!Number.isInteger(hours) || hours < 1 || hours > 60) return no('Offer between 1 and 60 hours.');
    if (!String(o.topic || '').trim()) return no('Say what you would teach.');
    if (!enums.ModuleMode.includes(o.mode)) return no('Pick a format.');
    if (OFFER_ROLES.includes(o.role)) return ok();
    if (o.role === 'student') {
      if (o.mode !== 'PL') return no('Students can lead a peer circle.');
      if (!o.completed) return no('Finish a module first. Then you can lead a peer circle on it.');
      return ok();
    }
    return no('This role cannot offer teaching hours yet.');
  }
  function validateRequest(o) {
    const title = String(o.title || '').trim();
    const count = Number(o.count);
    if (title.length < 6 || title.length > 120) return no('Describe what you want to learn in 6 to 120 characters.');
    if (!Number.isInteger(count) || count < 1 || count > 500) return no('Say how many people want it (1 to 500).');
    return ok();
  }
  function addVote(votes, userId) {
    if (!userId) return no('Pick a persona first.');
    if ((votes || []).includes(userId)) return no('You already said “me too”.');
    return ok();
  }

  /* R23 Hours of teaching for women in design count as seats: a whole number of hours (1 to 100) makes one seat. */
  function validateHoursPerSeat(raw) {
    const n = Number(raw);
    if (raw === '' || raw == null || !Number.isInteger(n)) return no('Enter a whole number of hours.');
    if (n < 1 || n > 100) return no('Use between 1 and 100 hours.');
    return Object.assign(ok(), { hours: n });
  }

  /* The registry the A4.2 endpoint returns: GET /api/enums. */
  function registry(plans, coupons, now) {
    const live = plans.filter((p) => !p.archived);
    return {
      plan_keys: live.map((p) => p.key),
      plan_keys_for_sale: live.filter((p) => sellable(p, now).ok).map((p) => p.key),
      plan_keys_archived: plans.filter((p) => p.archived).map((p) => p.key),
      coupon_codes: coupons.filter((c) => pricing.effectiveCouponStatus(c, now) === 'ACTIVE').map((c) => c.code),
      coupon_codes_other: coupons.filter((c) => pricing.effectiveCouponStatus(c, now) !== 'ACTIVE' && c.status !== 'ARCHIVED').map((c) => c.code),
      coupon_codes_archived: coupons.filter((c) => c.status === 'ARCHIVED').map((c) => c.code),
    };
  }

  return {
    MACHINES, canTransition, transition,
    identitiesVisible, canVerify, employerCanSee, referralVisible, confirmReferral, driveReply, canCloseDrive, MIN_GROUP, aggregate,
    canScore, canContact, NDA_CHECKS, ndaSafe, canSubmit, auditEntry,
    lastPrice, setPrice, validatePlan,
    needsSecondApproval, validateCouponFields, createCoupon, approveCoupon, setCouponStatus,
    keyInUse, canRenameOrDelete, sellable, registry, validateWomenShare, validateHoursPerSeat,
    moduleCode, validateModuleCode, markLesson, scoreCheck, recordCheck, moduleProgress, OFFER_ROLES, validateOffer, validateRequest, addVote,
  };
});
