/* Rules R1–R8 (spec §17.1), R11–R13 (addendum A15.1) and R24–R25. Run: npm test */
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/rules.js');
const seed = require('../js/data/pricing-seed.js');

const scores = (assessorId, locked, n) => Array.from({ length: n }, (_, i) => ({ submissionId: 's1', assessorId, criterion: i, value: 3, locked }));

test('R1 blind-first: names hidden while any of my scores is unlocked', () => {
  const s = scores('a1', true, 5).concat([{ submissionId: 's1', assessorId: 'a1', criterion: 5, value: 2, locked: false }]);
  assert.equal(R.identitiesVisible('a1', 's1', s, 6), false);
  assert.equal(R.identitiesVisible('a1', 's1', scores('a1', true, 5), 6), false);
  assert.equal(R.identitiesVisible('a1', 's1', scores('a1', true, 6), 6), true);
});

test('R2 two-person approval', () => {
  const entry = { status: 'Proposed', submissionId: 's1', assessorId: 'a1' };
  const steward = { id: 'Admin A', role: 'admin' };
  assert.equal(R.canVerify(entry, scores('a1', false, 6), steward, 6).ok, false);
  assert.equal(R.canVerify(entry, scores('a1', true, 6), { id: 'a1', role: 'admin' }, 6).ok, false);
  assert.equal(R.canVerify(entry, scores('a1', true, 6), { id: 'x', role: 'mentor' }, 6).ok, false);
  assert.equal(R.canVerify(entry, scores('a1', true, 6), steward, 6).ok, true);
});

test('R3 employers see only shared entries; revoking removes access', () => {
  const e = { status: 'Shared', shared: true };
  assert.equal(R.employerCanSee(e), true);
  assert.equal(R.employerCanSee({ status: 'Verified', shared: false }), false);
  assert.equal(R.employerCanSee(Object.assign({}, e, { status: 'Revoked', shared: false })), false);
});

test('R4 groups under 5 are hidden', () => {
  assert.equal(R.aggregate(4).hidden, true);
  assert.equal(R.aggregate(5).hidden, false);
  assert.equal(R.aggregate(5).value, 5);
});

test('R5 conflicts', () => {
  const sprints = [{ teamId: 't1', mentorId: 'm1' }];
  assert.equal(R.canScore('m1', 't1', sprints).ok, false);
  assert.equal(R.canScore('m2', 't1', sprints).ok, true);
  assert.equal(R.canContact({ status: 'Shared', shared: true }, false).ok, false);
  assert.equal(R.canContact({ status: 'Verified', shared: false }, true).ok, false);
  assert.equal(R.canContact({ status: 'Shared', shared: true }, true).ok, true);
});

test('R6 NDA-safe check needs all four', () => {
  const r = R.ndaSafe({ noPersonal: true, noConfidential: true, sanitised: true });
  assert.equal(r.ok, false);
  assert.deepEqual(r.missing, ['IP terms chosen']);
  assert.equal(R.ndaSafe({ noPersonal: true, noConfidential: true, sanitised: true, ipTerms: true }).ok, true);
});

test('R7 AI-use declaration required', () => {
  assert.equal(R.canSubmit({ deliverable: 'https://x', ai: '' }).ok, false);
  assert.equal(R.canSubmit({ deliverable: 'https://x', ai: 'No AI used' }).ok, true);
});

test('R8 audit entries carry before and after', () => {
  const a = R.auditEntry('u1', 'move', 'challenge', 'c1', { status: 'Draft' }, { status: 'Shaped' });
  assert.deepEqual(a.before, { status: 'Draft' });
  assert.deepEqual(a.after, { status: 'Shaped' });
});

test('state machines: legal moves pass, illegal moves throw', () => {
  assert.equal(R.transition('challenge', 'Draft', 'Shaped'), 'Shaped');
  assert.throws(() => R.transition('challenge', 'Draft', 'Live'), /Illegal move/);
  assert.throws(() => R.transition('passport_entry', 'Proposed', 'Shared'), /Illegal move/);
  assert.equal(R.transition('passport_entry', 'Shared', 'Verified'), 'Verified');
  assert.equal(R.transition('demand_signal', 'Reviewed', 'Published'), 'Published');
});

test('R11 coupons over the threshold wait for a different admin', () => {
  const settings = { approvalThresholdPct: 50 };
  const made = R.createCoupon({ code: 'big70', percentOff: 70 }, seed.coupons(), settings, 'Admin A');
  assert.equal(made.ok, true);
  assert.equal(made.coupon.code, 'BIG70');
  assert.equal(made.coupon.status, 'PENDING_APPROVAL');
  assert.equal(R.approveCoupon(made.coupon, 'Admin A').ok, false);
  assert.equal(R.approveCoupon(made.coupon, 'Admin B').coupon.status, 'ACTIVE');
  assert.equal(R.createCoupon({ code: 'HALF50', percentOff: 50 }, [], settings, 'Admin A').coupon.status, 'ACTIVE');
  assert.equal(R.createCoupon({ code: 'FREE100', percentOff: 100 }, [], { approvalThresholdPct: 100 }, 'Admin A').coupon.status, 'PENDING_APPROVAL');
  assert.equal(R.createCoupon({ code: 'founding20', percentOff: 5 }, seed.coupons(), settings, 'A').ok, false);
  assert.equal(R.createCoupon({ code: 'ab', percentOff: 5 }, [], settings, 'A').ok, false);
});

test('R12 a change over ±30% needs a note', () => {
  const plan = seed.plans().find((p) => p.key === 'INDUSTRY_TEAM');
  assert.equal(R.setPrice(plan, { unitPrice: 6000000 }).ok, false);
  assert.equal(R.setPrice(plan, { unitPrice: 6000000, note: 'Pilot pricing reset' }).ok, true);
  assert.equal(R.setPrice(plan, { unitPrice: 4400000 }).ok, true);
  const camp = seed.plans().find((p) => p.key === 'CAMPUS_STANDARD');
  const tiers = camp.versions[0].tiers.map((t) => Object.assign({}, t, { price: t.tier === 'SMALL' ? 30000000 : t.price }));
  assert.equal(R.setPrice(camp, { tiers }).ok, false);
});

test('R13 used keys cannot be renamed or deleted; archive works', () => {
  const signups = [{ planKey: 'PATH_FRAMING', couponCode: 'STUDENT10' }];
  assert.equal(R.canRenameOrDelete(signups, 'planKey', 'PATH_FRAMING').ok, false);
  assert.equal(R.canRenameOrDelete(signups, 'couponCode', 'STUDENT10').ok, false);
  assert.equal(R.canRenameOrDelete(signups, 'planKey', 'PATH_DECISIONS').ok, true);
  const plans = seed.plans();
  plans[2].archived = true;
  const reg = R.registry(plans, seed.coupons(), Date.parse('2026-10-20'));
  assert.ok(reg.plan_keys_archived.includes('PATH_FRAMING'));
  assert.ok(!reg.plan_keys_for_sale.includes('PATH_FRAMING'));
});

test('coupon lifecycle moves', () => {
  const c = { status: 'ACTIVE' };
  assert.equal(R.setCouponStatus(c, 'PAUSED').ok, true);
  assert.equal(R.setCouponStatus({ status: 'PAUSED' }, 'ACTIVE').ok, true);
  assert.equal(R.setCouponStatus({ status: 'ARCHIVED' }, 'ACTIVE').ok, false);
});

test('R24 a referral stays private until the student confirms it', () => {
  const ref = { byId: 'm1', studentId: 's1', orgId: 'harbor', status: 'Waiting' };
  const emp = { role: 'industry', id: 'i3', orgId: 'harbor' };
  assert.equal(R.referralVisible(ref, emp), false);
  assert.equal(R.referralVisible(ref, { role: 'mentor', id: 'm1' }), true);
  assert.equal(R.referralVisible(ref, { role: 'student', id: 's1' }), true);
  assert.equal(R.referralVisible(ref, { role: 'student', id: 's2' }), false);
  assert.equal(R.confirmReferral(ref, 's2', true).ok, false);
  const res = R.confirmReferral(ref, 's1', true);
  assert.equal(res.ok, true);
  const done = Object.assign({}, ref, { status: res.status });
  assert.equal(R.referralVisible(done, emp), true);
  assert.equal(R.referralVisible(done, { role: 'industry', id: 'i1', orgId: 'northwind' }), false);
  assert.equal(R.confirmReferral(done, 's1', false).ok, false);
});

test('R25 a drive reply goes Pending to Accepted or Declined; only the college closes the drive', () => {
  const reply = { orgId: 'northwind', status: 'Pending' };
  assert.equal(R.driveReply(reply, 'Accepted', 'harbor').ok, false);
  assert.equal(R.driveReply(reply, 'Maybe', 'northwind').ok, false);
  assert.equal(R.driveReply(reply, 'Accepted', 'northwind').status, 'Accepted');
  assert.equal(R.driveReply({ orgId: 'northwind', status: 'Accepted' }, 'Declined', 'northwind').ok, false);
  const drive = { orgId: 'campus-a', status: 'Open' };
  assert.equal(R.canCloseDrive(drive, 'northwind').ok, false);
  assert.equal(R.canCloseDrive(drive, 'campus-a').ok, true);
  assert.equal(R.canCloseDrive({ orgId: 'campus-a', status: 'Closed' }, 'campus-a').ok, false);
});

test('R27 only the right login can apply, and only once', () => {
  const role = { id: 'op1', lane: 'role', open: false }; const call = { id: 'op4', lane: 'cohort', open: true };
  const w = (r, applied) => ({ signedIn: true, role: r, applied: !!applied });
  assert.deepEqual(R.applyRoles(role), ['student', 'open']);
  assert.deepEqual(R.applyRoles(call), ['open']);
  assert.equal(R.canApply(role, { signedIn: false, role: 'open' }).why, 'signedOut');
  assert.equal(R.canApply(role, w('student')).ok, true);
  assert.equal(R.canApply(role, w('open')).ok, true);
  for (const r of ['industry', 'faculty', 'mentor', 'head', 'admin']) assert.equal(R.canApply(role, w(r)).why, 'wrongLogin', r);
  assert.equal(R.canApply(call, w('student')).why, 'wrongLogin');
  assert.equal(R.canApply(call, w('open')).ok, true);
  assert.equal(R.canApply(role, w('student', true)).why, 'applied');
});
