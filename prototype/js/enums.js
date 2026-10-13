/* LEAD · fixed enumerations (addendum A4.1). Change only with a code release. */
(function (root, factory) {
  const mod = factory();
  root.LEAD = root.LEAD || {};
  root.LEAD.enums = mod;
  if (typeof module === 'object' && module.exports) module.exports = mod;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const freeze = (arr) => Object.freeze(arr.slice());

  const PlanKind = freeze(['CAMPUS_LICENCE', 'INDUSTRY_MEMBERSHIP', 'PATH_ENROLMENT', 'CHALLENGE_SPONSORSHIP', 'OPEN_TIER']);
  const PricingModel = freeze(['FLAT', 'TIERED_BY_SIZE', 'PER_SEAT', 'PER_COHORT', 'PER_CHALLENGE', 'FREE']);
  const BillingPeriod = freeze(['ONE_TIME', 'TERM', 'ANNUAL']);
  const SignupFlow = freeze(['COLLEGE_ONBOARDING', 'INDUSTRY_PARTNERSHIP', 'PATH_ENROLMENT', 'CHALLENGE_SPONSORSHIP', 'OPEN_JOIN']);
  const SignupStatus = freeze(['QUOTED', 'CONFIRMED_MOCK', 'CANCELLED']);
  const CouponStatus = freeze(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'EXPIRED', 'EXHAUSTED', 'ARCHIVED']);
  const CouponKind = freeze(['PERCENT', 'FIXED_AMOUNT', 'SCHOLARSHIP', 'GIFT_MATCH', 'PARTNER_CODE']);
  const CouponKindBuilt = freeze(['PERCENT']);
  const TierKey = freeze(['SMALL', 'MEDIUM', 'LARGE']);
  const FundedBy = freeze(['UMO', 'SPONSOR', 'PARTNER']);

  /* Learning (round 5): the mode letter in a module code, LM-<mode>-<n>. */
  const ModuleMode = freeze(['SP', 'IL', 'PL', 'CB']);
  const ModeLabel = Object.freeze({ SP: 'Self-paced', IL: 'Instructor-led', PL: 'Peer circle', CB: 'Inside a challenge' });
  const ModeWord = Object.freeze({ SP: 'Learn on your own, online', IL: 'Taught live by a person', PL: 'Learn with peers, led by a peer', CB: 'Learn while working on a real challenge' });
  const MODULE_CODE_RE = /^LM-(SP|IL|PL|CB)-([1-9]\d{0,2})$/;

  const PlanKindLabel = Object.freeze({
    CAMPUS_LICENCE: 'campus licences',
    INDUSTRY_MEMBERSHIP: 'industry memberships',
    PATH_ENROLMENT: 'path enrolments',
    CHALLENGE_SPONSORSHIP: 'challenge sponsorships',
    OPEN_TIER: 'the open tier',
  });

  /* What one unit of quantity is called, per plan kind. PER_SEAT means seats or learners. */
  const QuantityUnit = Object.freeze({
    CAMPUS_LICENCE: ['campus', 'campuses'],
    INDUSTRY_MEMBERSHIP: ['seat', 'seats'],
    PATH_ENROLMENT: ['learner', 'learners'],
    CHALLENGE_SPONSORSHIP: ['challenge', 'challenges'],
    OPEN_TIER: ['member', 'members'],
  });

  const FlowForKind = Object.freeze({
    CAMPUS_LICENCE: 'COLLEGE_ONBOARDING',
    INDUSTRY_MEMBERSHIP: 'INDUSTRY_PARTNERSHIP',
    PATH_ENROLMENT: 'PATH_ENROLMENT',
    CHALLENGE_SPONSORSHIP: 'CHALLENGE_SPONSORSHIP',
    OPEN_TIER: 'OPEN_JOIN',
  });

  const PLAN_KEY_RE = /^[A-Z][A-Z0-9_]{2,39}$/;
  const COUPON_CODE_RE = /^[A-Z0-9_-]{4,20}$/;

  function normaliseCode(code) {
    return String(code == null ? '' : code).trim().toUpperCase();
  }

  /* Run-time registry check: the live list is the authority (A4.2). */
  function oneOf(value, list, label) {
    if (!list.includes(value)) {
      return { ok: false, reason: `Unknown ${label}: ${value}.` };
    }
    return { ok: true };
  }

  return {
    ModuleMode, ModeLabel, ModeWord, MODULE_CODE_RE,
    PlanKind, PricingModel, BillingPeriod, SignupFlow, SignupStatus, CouponStatus,
    CouponKind, CouponKindBuilt, TierKey, FundedBy, PlanKindLabel, QuantityUnit, FlowForKind,
    PLAN_KEY_RE, COUPON_CODE_RE, normaliseCode, oneOf,
  };
});
