/* Addendum A8.3 worked examples, plus rounding and coupon checks (A15.1). Run: npm test */
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../js/pricing.js');
const seed = require('../js/data/pricing-seed.js');
const R = require('../js/rules.js');

const NOW = Date.parse('2026-10-20T10:00:00Z');
const L = 100;
const data = () => seed.build();

test('A8.3 #1 campus MEDIUM ₹10,00,000 with FOUNDING20', () => {
  const q = P.quote({ planKey: 'CAMPUS_STANDARD', orgSize: 2000, orgId: 'org-a', couponCode: 'founding20 ', now: NOW }, data());
  assert.equal(q.ok, true);
  assert.equal(q.tierKey, 'MEDIUM');
  assert.equal(q.listTotal, 1000000 * L);
  assert.equal(q.discount, 200000 * L);
  assert.equal(q.total, 800000 * L);
  assert.equal(P.formatINR(q.total), '₹8,00,000');
  assert.equal(q.perMonthEquivalent, P.roundHalfUp(1000000 * L, 12));
});

test('A8.3 #2 industry 5 seats, no coupon', () => {
  const q = P.quote({ planKey: 'INDUSTRY_TEAM', quantity: 5, orgId: 'org-b', now: NOW }, data());
  assert.equal(q.listTotal, 200000 * L);
  assert.equal(q.tax, 0);
  assert.equal(q.total, 200000 * L);
});

test('A8.3 #3 industry 5 seats with PILOT50 is rejected', () => {
  const q = P.quote({ planKey: 'INDUSTRY_TEAM', quantity: 5, orgId: 'org-b', couponCode: 'PILOT50', now: NOW }, data());
  assert.equal(q.ok, true);
  assert.equal(q.coupon.applied, false);
  assert.equal(q.coupon.reason, 'Valid for campus licences only.');
  assert.equal(q.total, 200000 * L);
});

test('A8.3 #4 path, 1 learner, STUDENT10', () => {
  const q = P.quote({ planKey: 'PATH_FRAMING', quantity: 1, orgId: 'org-c', couponCode: 'STUDENT10', now: NOW }, data());
  assert.equal(q.discount, 1200 * L);
  assert.equal(q.total, 10800 * L);
});

test('A8.3 #5 rounding half-up in paise', () => {
  const d = data();
  d.plans.push({ key: 'ROUNDING', name: 'Rounding', kind: 'PATH_ENROLMENT', pricingModel: 'FLAT', billingPeriod: 'ONE_TIME', minQty: 1, capacity: null, booked: 0, active: true, archived: false, versions: [{ id: 'ROUNDING-v1', version: 1, unitPrice: 33333, effectiveFrom: '2026-01-01' }] });
  d.coupons.push({ code: 'FIFTEEN', kind: 'PERCENT', percentOff: 15, appliesKinds: [], appliesKeys: [], status: 'ACTIVE', maxRedemptions: null, maxPerOrg: 1, redemptions: [] });
  const q = P.quote({ planKey: 'ROUNDING', orgId: 'org-r', couponCode: 'FIFTEEN', now: NOW }, d);
  assert.equal(q.discount, 5000);
  assert.equal(q.total, 28333);
  assert.equal(P.formatINR(q.total), '₹283.33');
});

test('A8.3 #6 SPONSORFULL blocked until a different admin approves', () => {
  const d = data();
  let q = P.quote({ planKey: 'SPONSOR_SINGLE', quantity: 1, orgId: 'org-s', couponCode: 'SPONSORFULL', now: NOW }, d);
  assert.equal(q.coupon.applied, false);
  assert.equal(q.coupon.reason, 'Waiting for a second approval.');
  assert.equal(q.total, 250000 * L);
  const c = d.coupons.find((x) => x.code === 'SPONSORFULL');
  assert.equal(R.approveCoupon(c, 'Admin A').ok, false);
  const ap = R.approveCoupon(c, 'Admin B');
  assert.equal(ap.ok, true);
  Object.assign(c, ap.coupon);
  q = P.quote({ planKey: 'SPONSOR_SINGLE', quantity: 1, orgId: 'org-s', couponCode: 'SPONSORFULL', now: NOW }, d);
  assert.equal(q.total, 0);
  assert.equal(q.sponsored, true);
});

test('A8.3 #7 industry 1 seat below min_qty', () => {
  const q = P.quote({ planKey: 'INDUSTRY_TEAM', quantity: 1, orgId: 'org-b', now: NOW }, data());
  assert.equal(q.ok, false);
  assert.equal(q.error, 'Minimum 2 seats.');
});

test('A8.3 #8 plan at capacity is closed', () => {
  const d = data();
  d.plans.find((p) => p.key === 'INDUSTRY_TEAM').booked = 30;
  const q = P.quote({ planKey: 'INDUSTRY_TEAM', quantity: 2, orgId: 'org-b', now: NOW }, d);
  assert.equal(q.ok, false);
  assert.equal(q.error, 'Closed. Re-opens soon.');
});

test('A8.3 #9 max_per_org blocks a second use', () => {
  const d = data();
  d.coupons.find((c) => c.code === 'FOUNDING20').redemptions.push({ orgId: 'org-a', signupId: 'x', discount: 1 });
  const q = P.quote({ planKey: 'PATH_FRAMING', quantity: 1, orgId: 'org-a', couponCode: 'FOUNDING20', now: NOW }, d);
  assert.equal(q.coupon.reason, 'Already used by your organisation.');
});

test('A8.3 #10 price change between quote and confirm asks again (R15)', () => {
  const d = data();
  const q = P.quote({ planKey: 'INDUSTRY_TEAM', quantity: 5, orgId: 'org-b', now: NOW }, d);
  const plan = d.plans.find((p) => p.key === 'INDUSTRY_TEAM');
  const sp = R.setPrice(plan, { unitPrice: 45000 * L, by: 'Admin A', now: NOW + 1000 });
  assert.equal(sp.ok, true);
  plan.versions.push(sp.version);
  const c = P.confirm(q, d, NOW + 2000);
  assert.equal(c.ok, false);
  assert.equal(c.changed, true);
  assert.equal(c.quote.total, 225000 * L);
  const again = P.confirm(c.quote, d, NOW + 3000);
  assert.equal(again.ok, true);
});

test('confirm refuses after the coupon is paused (S15)', () => {
  const d = data();
  const q = P.quote({ planKey: 'CAMPUS_STANDARD', orgSize: 500, orgId: 'org-z', couponCode: 'FOUNDING20', now: NOW }, d);
  assert.equal(q.coupon.applied, true);
  d.coupons.find((c) => c.code === 'FOUNDING20').status = 'PAUSED';
  const c = P.confirm(q, d, NOW + 1000);
  assert.equal(c.ok, false);
  assert.equal(c.quote.total, 500000 * L);
});

test('rounding is half-up and totals are never negative', () => {
  assert.equal(P.roundHalfUp(5, 10), 1);
  assert.equal(P.roundHalfUp(4, 10), 0);
  assert.equal(P.roundHalfUp(15, 10), 2);
  const d = data();
  d.coupons.push({ code: 'FULL100', kind: 'PERCENT', percentOff: 100, appliesKinds: [], appliesKeys: [], status: 'ACTIVE', maxRedemptions: null, maxPerOrg: 1, redemptions: [] });
  const q = P.quote({ planKey: 'PATH_FRAMING', quantity: 2, orgId: 'o', couponCode: 'FULL100', now: NOW }, d);
  assert.equal(q.total, 0);
});

test('R10 each coupon check fails on its own with a plain reason', () => {
  const plan = data().plans.find((p) => p.key === 'PATH_FRAMING');
  const mk = (o) => Object.assign({ code: 'TESTX', kind: 'PERCENT', percentOff: 10, appliesKinds: [], appliesKeys: [], status: 'ACTIVE', maxRedemptions: null, maxPerOrg: 1, redemptions: [] }, o);
  const ctx = { plan, quantity: 1, orgId: 'o1', now: NOW };
  const v = (c, x) => P.validateCoupon([c], 'TESTX', Object.assign({}, ctx, x)).reason;
  assert.equal(P.validateCoupon([], 'NOPE', ctx).reason, 'Code not found.');
  assert.equal(v(mk({ status: 'PAUSED' })), 'This code is paused.');
  assert.equal(v(mk({ validUntil: '2026-10-01' })), 'Expired on 1 Oct 2026.');
  assert.equal(v(mk({ validFrom: '2026-11-01' })), 'Valid from 1 Nov 2026.');
  assert.equal(v(mk({ maxRedemptions: 1, redemptions: [{ orgId: 'x' }] })), 'All redemptions used.');
  assert.equal(v(mk({ redemptions: [{ orgId: 'o1' }] })), 'Already used by your organisation.');
  assert.equal(v(mk({ appliesKinds: ['CAMPUS_LICENCE'] })), 'Valid for campus licences only.');
  assert.equal(v(mk({ minQty: 3 })), 'Needs at least 3 learners.');
  assert.equal(v(mk({}), { codeCount: 2 }), 'One code per sign-up. Codes do not stack.');
  assert.equal(P.validateCoupon([mk({})], ' testx ', ctx).ok, true);
});

test('R17 unpriced plan, or a size with no tier, cannot be quoted', () => {
  const d = data();
  d.plans.push({ key: 'PATH_NEW', name: 'New', kind: 'PATH_ENROLMENT', pricingModel: 'PER_SEAT', billingPeriod: 'TERM', minQty: 1, capacity: 10, booked: 0, active: true, archived: false, versions: [] });
  assert.equal(P.quote({ planKey: 'PATH_NEW', quantity: 1, now: NOW }, d).error, 'No price set. This plan cannot be sold yet.');
  const camp = d.plans.find((p) => p.key === 'CAMPUS_STANDARD');
  camp.versions[0].tiers = camp.versions[0].tiers.filter((t) => t.tier !== 'LARGE');
  assert.equal(P.quote({ planKey: 'CAMPUS_STANDARD', orgSize: 5000, now: NOW }, d).error, 'No price for an organisation of this size.');
});

test('R9 a price change creates a new version; old sign-ups keep theirs', () => {
  const d = data();
  const plan = d.plans.find((p) => p.key === 'PATH_FRAMING');
  const q = P.quote({ planKey: 'PATH_FRAMING', quantity: 1, now: NOW }, d);
  const signup = P.buildSignup(q, { orgId: 'o' });
  const sp = R.setPrice(plan, { unitPrice: 13000 * L, now: NOW + 10 });
  plan.versions.push(sp.version);
  assert.equal(plan.versions.length, 2);
  assert.equal(plan.versions[0].unitPrice, 12000 * L);
  assert.equal(signup.priceVersionId, 'PATH_FRAMING-v1');
  assert.equal(P.quote({ planKey: 'PATH_FRAMING', quantity: 1, now: NOW + 20 }, d).priceVersionId, 'PATH_FRAMING-v2');
});

test('scheduled price applies only from its start date', () => {
  const d = data();
  const plan = d.plans.find((p) => p.key === 'PATH_FRAMING');
  const sp = R.setPrice(plan, { unitPrice: 14000 * L, now: NOW, effectiveFrom: '2027-01-01T00:00:00Z' });
  plan.versions.push(sp.version);
  assert.equal(P.quote({ planKey: 'PATH_FRAMING', quantity: 1, now: NOW }, d).unitPrice, 12000 * L);
  assert.equal(P.quote({ planKey: 'PATH_FRAMING', quantity: 1, now: Date.parse('2027-01-02') }, d).unitPrice, 14000 * L);
});

test('enumerations: unknown keys are rejected; a new key is accepted at once', () => {
  const d = data();
  const reg = () => { const r = R.registry(d.plans, d.coupons, NOW); return { planKeys: r.plan_keys, couponCodes: d.coupons.map((c) => c.code) }; };
  const q = P.quote({ planKey: 'PATH_FRAMING', quantity: 1, now: NOW }, d);
  const s = P.buildSignup(q, {});
  assert.deepEqual(P.validateSignupEnums(s, reg()), []);
  assert.deepEqual(P.validateSignupEnums(Object.assign({}, s, { planKey: 'PATH_TEST' }), reg()), ['Unknown plan key: PATH_TEST.']);
  d.plans.push({ key: 'PATH_TEST', name: 'Test', kind: 'PATH_ENROLMENT', pricingModel: 'PER_SEAT', billingPeriod: 'TERM', versions: [], active: true, archived: false });
  assert.deepEqual(P.validateSignupEnums(Object.assign({}, s, { planKey: 'PATH_TEST' }), reg()), []);
  assert.deepEqual(P.validateSignupEnums(Object.assign({}, s, { couponCode: 'NOPE99' }), reg()), ['Unknown coupon code: NOPE99.']);
});

/* R18 and R19: 1 Million Women in Design */
test('R18 default share is 5% of the amount paid, rounded half up', () => {
  const q = P.quote({ planKey: 'INDUSTRY_TEAM', quantity: 5, orgId: 'org-w', now: NOW }, data());
  assert.equal(q.womenSharePct, 5);
  assert.equal(q.womenShare, 10000 * L);
  assert.equal(q.total, 200000 * L);
});

test('R18 the share follows the discounted price and is zero on free plans', () => {
  const q = P.quote({ planKey: 'INDUSTRY_TEAM', quantity: 5, orgId: 'org-w2', couponCode: 'FOUNDING20', now: NOW }, data());
  assert.equal(q.womenShare, 8000 * L);
  const f = P.quote({ planKey: 'OPEN_FREE', orgId: 'x', now: NOW }, data());
  assert.equal(f.womenShare, 0);
});

test('R18 the share setting is validated', () => {
  assert.equal(R.validateWomenShare(5).ok, true);
  assert.equal(R.validateWomenShare(2.5).ok, true);
  assert.equal(R.validateWomenShare(51).ok, false);
  assert.equal(R.validateWomenShare(-1).ok, false);
  assert.equal(R.validateWomenShare('').ok, false);
  assert.equal(R.validateWomenShare(2.3).ok, false);
});

test('R19 a top-up adds seats at the seat price and is counted in the tally', () => {
  const d = data();
  const q = P.quote({ planKey: 'PATH_FRAMING', quantity: 1, womenSeats: 3, orgId: 'o', now: NOW }, d);
  assert.equal(q.topUp, 3 * d.settings.womenSeatPrice);
  assert.equal(q.total, 12000 * L + 3000 * L);
  const su = P.buildSignup(q, {});
  const before = P.womenTally([], d.settings).seats;
  const after = P.womenTally([su], d.settings);
  assert.equal(after.seats, before + 3 + Math.floor(q.womenShare / d.settings.womenSeatPrice));
  assert.equal(after.target, 1000000);
});

test('R19 confirm notices a changed share setting', () => {
  const d = data();
  const q = P.quote({ planKey: 'INDUSTRY_TEAM', quantity: 2, orgId: 'o', now: NOW }, d);
  d.settings.womenSharePct = 10;
  const c = P.confirm(q, d, NOW + 1000);
  assert.equal(c.ok, false);
  assert.ok(c.diff.some((x) => x.field === 'womenShare'));
});
