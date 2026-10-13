/* LEAD · pricing seed (addendum A6, A7.4). Only the campus band ₹5–15 lakh is sourced; all else is demo. */
(function (root, factory) {
  const mod = factory();
  root.LEAD = root.LEAD || {};
  root.LEAD.pricingSeed = mod;
  if (typeof module === 'object' && module.exports) module.exports = mod;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const L = 100; // paise per rupee
  const SEED_AT = '2026-10-01T00:00:00.000Z';

  function v1(key, unitPrice, tiers, note) {
    return [{ id: `${key}-v1`, version: 1, unitPrice, tiers: tiers || null, effectiveFrom: SEED_AT, note: note || 'Seed', by: 'seed', at: Date.parse(SEED_AT) }];
  }

  function plans() {
    return [
      {
        key: 'CAMPUS_STANDARD', name: 'LEAD Campus', kind: 'CAMPUS_LICENCE', pricingModel: 'TIERED_BY_SIZE', billingPeriod: 'ANNUAL',
        minQty: 1, capacity: 10, booked: 3, refundDays: 14, active: true, archived: false, isDemo: true,
        blurb: 'Student and faculty access, Live Projects, mentors, assessment days and the Skills Passport for one institution.',
        includes: ['Student and faculty access', 'Live Projects in your term', 'Industry mentors and assessment days', 'Skills Passport for every learner', 'Faculty development', 'Placement readiness view'],
        versions: v1('CAMPUS_STANDARD', null, [
          { tier: 'SMALL', min: 1, max: 1000, price: 500000 * L },
          { tier: 'MEDIUM', min: 1001, max: 3000, price: 1000000 * L },
          { tier: 'LARGE', min: 3001, max: null, price: 1500000 * L },
        ], 'Band ₹5–15 lakh a year (Madhukar Joshi, 12 Oct 2026). Tier limits are placeholders.'),
      },
      {
        key: 'INDUSTRY_TEAM', name: 'Industry Membership', kind: 'INDUSTRY_MEMBERSHIP', pricingModel: 'PER_SEAT', billingPeriod: 'ANNUAL',
        minQty: 2, capacity: 30, booked: 12, refundDays: 14, active: true, archived: false, isDemo: true,
        blurb: 'Seats for your team: sponsor live projects, send assessors, see verified shortlists.',
        includes: ['Sponsor-desk access', 'Assessor seats (free)', 'Verified shortlist', 'Impact report for your live projects'],
        versions: v1('INDUSTRY_TEAM', 40000 * L),
      },
      {
        key: 'PATH_FRAMING', name: 'Path · Framing the problem', kind: 'PATH_ENROLMENT', pricingModel: 'PER_SEAT', billingPeriod: 'TERM',
        minQty: 1, capacity: 40, booked: 31, refundDays: 14, active: true, archived: false, isDemo: true,
        blurb: 'Short modules tied to a live project, with one mentor sprint.',
        includes: ['5 short modules', 'One live project', 'One mentor sprint', 'Passport entry if validated'],
        versions: v1('PATH_FRAMING', 12000 * L),
      },
      {
        key: 'PATH_DECISIONS', name: 'Path · Defending a decision', kind: 'PATH_ENROLMENT', pricingModel: 'PER_SEAT', billingPeriod: 'TERM',
        minQty: 1, capacity: 40, booked: 18, refundDays: 14, active: true, archived: false, isDemo: true,
        blurb: 'Practise making a design decision, recording why, and defending it.',
        includes: ['4 short modules', 'Decision-log practice', 'One mentor sprint', 'Passport entry if validated'],
        versions: v1('PATH_DECISIONS', 12000 * L),
      },
      {
        key: 'SPONSOR_SINGLE', name: 'Live Project Sponsorship', kind: 'CHALLENGE_SPONSORSHIP', pricingModel: 'PER_CHALLENGE', billingPeriod: 'ONE_TIME',
        minQty: 1, capacity: 6, booked: 2, refundDays: 0, active: true, archived: false, isDemo: true,
        blurb: 'Bring one real, scoped problem into a term. The UMO team shapes it NDA-safe and matches it to campuses.',
        includes: ['Brief shaping with the UMO team', 'Matched to 1–3 campuses', 'Assessment day', 'Problems-solved record'],
        versions: v1('SPONSOR_SINGLE', 250000 * L),
      },
      {
        key: 'OPEN_FREE', name: 'Open Community', kind: 'OPEN_TIER', pricingModel: 'FREE', billingPeriod: 'ONE_TIME',
        minQty: 1, capacity: null, booked: 214, refundDays: 0, active: true, archived: false, isDemo: true,
        blurb: 'The Skills Guide, public showcases, Circles and open-cohort calls. Free.',
        includes: ['The Skills Guide', 'Circles near you', 'Open-cohort live projects', 'Career-path awareness'],
        versions: v1('OPEN_FREE', 0),
      },
    ];
  }

  function coupons() {
    const base = { kind: 'PERCENT', minQty: null, validFrom: '2026-10-01', validUntil: '2026-12-31', maxPerOrg: 1, approvedBy: null, createdAt: Date.parse(SEED_AT) };
    return [
      Object.assign({}, base, { code: 'FOUNDING20', percentOff: 20, appliesKinds: [], appliesKeys: [], maxRedemptions: 50, status: 'ACTIVE', fundedBy: 'UMO', note: 'Founding members, 2026 pilot.', createdBy: 'Admin A', approvedBy: null, redemptions: [{ orgId: 'org-seed-1', signupId: 'SU-SEED-1', discount: 8000 * L, at: Date.parse(SEED_AT) }] }),
      Object.assign({}, base, { code: 'PILOT50', percentOff: 50, appliesKinds: ['CAMPUS_LICENCE'], appliesKeys: [], maxRedemptions: 3, status: 'ACTIVE', fundedBy: 'UMO', note: 'First three pilot campuses.', createdBy: 'Admin A', redemptions: [] }),
      Object.assign({}, base, { code: 'STUDENT10', percentOff: 10, appliesKinds: ['PATH_ENROLMENT'], appliesKeys: [], maxRedemptions: 200, status: 'ACTIVE', fundedBy: 'UMO', note: 'Students. Eligibility check reserved (P2).', createdBy: 'Admin B', redemptions: [] }),
      Object.assign({}, base, { code: 'SPONSORFULL', percentOff: 100, appliesKinds: ['CHALLENGE_SPONSORSHIP'], appliesKeys: [], maxRedemptions: 1, status: 'PENDING_APPROVAL', fundedBy: 'SPONSOR', note: 'Pooled sponsor covers one live project in full.', createdBy: 'Admin A', redemptions: [] }),
    ];
  }

  function settings() {
    return { approvalThresholdPct: 50, taxRateBps: 0, quoteTtlMinutes: 15, womenSharePct: 5, womenSeatPrice: 1000 * L, womenBase: { share: 10800, topup: 4700, college: 6200, sponsor: 2400, hours: 1554 }, womenHoursPerSeat: 10, womenTarget: 1000000 };
  }

  function banner() {
    return { text: 'Founding partners: 20% off any plan with FOUNDING20 until 31 Dec 2026.', link: '#join', active: true, startsAt: '2026-10-01', endsAt: '2026-12-31' };
  }

  function build() {
    return { plans: plans(), coupons: coupons(), settings: settings(), banner: banner(), signups: [], audit: [], epoch: 1 };
  }

  return { build, plans, coupons, settings, banner, SEED_AT };
});
