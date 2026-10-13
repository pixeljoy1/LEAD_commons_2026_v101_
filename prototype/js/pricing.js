/* LEAD · quote and checkout engine (addendum A5, A7.3, A8). Pure functions. Money is integer paise. */
(function (root, factory) {
  const enums = (typeof module === 'object' && module.exports) ? require('./enums.js') : root.LEAD.enums;
  const mod = factory(enums);
  root.LEAD = root.LEAD || {};
  root.LEAD.pricing = mod;
  if (typeof module === 'object' && module.exports) module.exports = mod;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (enums) {
  const { PlanKindLabel, QuantityUnit, normaliseCode } = enums;

  /* ---------- money ---------- */

  /* round_half_up(num / den) for non-negative integers, exact in integer arithmetic. */
  function roundHalfUp(num, den) {
    if (den <= 0) throw new Error('Denominator must be positive.');
    if (num < 0) return -roundHalfUp(-num, den);
    return Math.floor((2 * num + den) / (2 * den));
  }

  function formatINR(paise) {
    const rupees = paise / 100;
    const whole = paise % 100 === 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2,
    }).format(rupees);
  }

  function rupeesToPaise(r) {
    const n = Number(String(r).replace(/[,₹\s]/g, ''));
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.round(n * 100);
  }

  function toMs(now) {
    if (now == null) return Date.now();
    if (now instanceof Date) return now.getTime();
    if (typeof now === 'string') return Date.parse(now);
    return now;
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }

  function unitWord(kind, n) {
    const u = QuantityUnit[kind] || ['unit', 'units'];
    return n === 1 ? u[0] : u[1];
  }

  /* ---------- plans ---------- */

  /* The price version in force at `now`: the latest one whose effective_from has passed. */
  function currentVersion(plan, now) {
    const t = toMs(now);
    const live = (plan.versions || [])
      .filter((v) => !v.effectiveFrom || Date.parse(v.effectiveFrom) <= t)
      .sort((a, b) => b.version - a.version);
    return live[0] || null;
  }

  function isPriced(version, model) {
    if (!version) return false;
    if (model === 'FREE') return true;
    if (model === 'TIERED_BY_SIZE') return Array.isArray(version.tiers) && version.tiers.some((t) => t.price != null);
    return version.unitPrice != null;
  }

  function tierFor(version, size) {
    if (!version || !Array.isArray(version.tiers)) return null;
    return version.tiers.find((t) => t.price != null && size >= t.min && (t.max == null || size <= t.max)) || null;
  }

  function remaining(plan) {
    if (plan.capacity == null) return Infinity;
    return Math.max(0, plan.capacity - (plan.booked || 0));
  }

  function percentBooked(plan) {
    if (plan.capacity == null || plan.capacity === 0) return null;
    return Math.min(100, Math.round(((plan.booked || 0) / plan.capacity) * 100));
  }

  /* Lowest list price a plan can show on a card ("from ₹…"). */
  function fromPrice(plan, now) {
    const v = currentVersion(plan, now);
    if (!isPriced(v, plan.pricingModel)) return null;
    if (plan.pricingModel === 'FREE') return 0;
    if (plan.pricingModel === 'TIERED_BY_SIZE') return Math.min(...v.tiers.filter((t) => t.price != null).map((t) => t.price));
    return v.unitPrice;
  }

  /* ---------- coupons ---------- */

  function findCoupon(coupons, code) {
    const c = normaliseCode(code);
    return coupons.find((x) => normaliseCode(x.code) === c) || null;
  }

  /* Status as a customer would experience it: dates and caps can expire an ACTIVE code. */
  function effectiveCouponStatus(coupon, now) {
    const t = toMs(now);
    if (coupon.status !== 'ACTIVE') return coupon.status;
    if (coupon.validUntil && t > endOfDay(coupon.validUntil)) return 'EXPIRED';
    const used = (coupon.redemptions || []).length;
    if (coupon.maxRedemptions != null && used >= coupon.maxRedemptions) return 'EXHAUSTED';
    return 'ACTIVE';
  }

  function endOfDay(iso) {
    const d = new Date(iso);
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) return Date.parse(iso + 'T23:59:59.999Z');
    return d.getTime();
  }

  function appliesTo(coupon, plan) {
    const kinds = coupon.appliesKinds || [];
    const keys = coupon.appliesKeys || [];
    if (!kinds.length && !keys.length) return true; // ALL
    return kinds.includes(plan.kind) || keys.includes(plan.key);
  }

  function appliesText(coupon, plans) {
    const kinds = coupon.appliesKinds || [];
    const keys = coupon.appliesKeys || [];
    if (!kinds.length && !keys.length) return 'All plans';
    const parts = kinds.map((k) => PlanKindLabel[k] || k)
      .concat(keys.map((k) => { const p = (plans || []).find((x) => x.key === k); return p ? p.name : k; }));
    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
  }

  /*
   * The eight checks of A7.3. Returns { ok, reason, coupon }.
   * ctx: { plan, quantity, orgId, now, codeCount, plans }
   */
  function validateCoupon(coupons, code, ctx) {
    const fail = (reason, coupon) => ({ ok: false, reason, coupon: coupon || null });
    if (ctx.codeCount && ctx.codeCount > 1) return fail('One code per sign-up. Codes do not stack.');
    const raw = normaliseCode(code);
    if (!raw) return fail('Enter a code.');
    const c = findCoupon(coupons, raw);
    if (!c) return fail('Code not found.');
    const t = toMs(ctx.now);

    switch (c.status) {
      case 'PENDING_APPROVAL': return fail('Waiting for a second approval.', c);
      case 'DRAFT': return fail('This code is not live yet.', c);
      case 'PAUSED': return fail('This code is paused.', c);
      case 'ARCHIVED': return fail('This code is no longer offered.', c);
      case 'EXPIRED': return fail(`Expired on ${formatDate(c.validUntil)}.`, c);
      case 'EXHAUSTED': return fail('All redemptions used.', c);
      default: break;
    }
    if (c.validFrom && t < Date.parse(c.validFrom)) return fail(`Valid from ${formatDate(c.validFrom)}.`, c);
    if (c.validUntil && t > endOfDay(c.validUntil)) return fail(`Expired on ${formatDate(c.validUntil)}.`, c);

    const reds = c.redemptions || [];
    if (c.maxRedemptions != null && reds.length >= c.maxRedemptions) return fail('All redemptions used.', c);
    const perOrg = c.maxPerOrg == null ? 1 : c.maxPerOrg;
    if (ctx.orgId && reds.filter((r) => r.orgId === ctx.orgId).length >= perOrg) {
      return fail('Already used by your organisation.', c);
    }
    if (ctx.plan && !appliesTo(c, ctx.plan)) return fail(`Valid for ${appliesText(c, ctx.plans)} only.`, c);
    if (c.minQty && ctx.plan && (ctx.quantity || 0) < c.minQty) {
      return fail(`Needs at least ${c.minQty} ${unitWord(ctx.plan.kind, c.minQty)}.`, c);
    }
    return { ok: true, reason: `${c.percentOff}% off applied.`, coupon: c };
  }

  /* ---------- quote ---------- */

  let seq = 0;
  function makeId(prefix) {
    seq += 1;
    return `${prefix}-${Date.now().toString(36).toUpperCase()}${seq.toString(36).toUpperCase()}`;
  }

  /*
   * quote(input, data) → Quote
   * input: { flow, planKey, quantity, orgSize, orgId, couponCode, couponCodes, now, quoteId }
   * data:  { plans, coupons, settings: { taxRateBps, quoteTtlMinutes } }
   */
  function quote(input, data) {
    const now = toMs(input.now);
    const settings = data.settings || {};
    const fail = (error, extra) => Object.assign({ ok: false, error, input: Object.assign({}, input) }, extra || {});
    const plan = data.plans.find((p) => p.key === input.planKey);
    if (!plan) return fail('Plan not found.');
    if (plan.archived) return fail('This plan is no longer offered.', { plan });
    if (!plan.active) return fail('This plan is switched off.', { plan });

    const qty = plan.pricingModel === 'TIERED_BY_SIZE' || plan.pricingModel === 'FLAT' || plan.pricingModel === 'FREE'
      ? Math.max(1, input.quantity || 1)
      : Math.floor(Number(input.quantity) || 0);
    const left = remaining(plan);
    if (left === 0) return fail('Closed. Re-opens soon.', { plan, closed: true });

    const version = currentVersion(plan, now);
    if (!isPriced(version, plan.pricingModel)) return fail('No price set. This plan cannot be sold yet.', { plan });

    const minQty = plan.minQty || 1;
    if (qty < minQty) return fail(`Minimum ${minQty} ${unitWord(plan.kind, minQty)}.`, { plan });
    if (qty > left) return fail(`Only ${left} ${unitWord(plan.kind, left)} left.`, { plan });

    let unitPrice = 0;
    let tierKey = null;
    switch (plan.pricingModel) {
      case 'FREE': unitPrice = 0; break;
      case 'TIERED_BY_SIZE': {
        const size = Number(input.orgSize);
        if (!Number.isFinite(size) || size <= 0) return fail('Enter the number of students.', { plan });
        const tier = tierFor(version, size);
        if (!tier) return fail('No price for an organisation of this size.', { plan });
        unitPrice = tier.price; tierKey = tier.tier; break;
      }
      default: unitPrice = version.unitPrice;
    }
    const multiplies = ['PER_SEAT', 'PER_COHORT', 'PER_CHALLENGE'].includes(plan.pricingModel);
    const listTotal = multiplies ? unitPrice * qty : unitPrice;

    const codes = Array.isArray(input.couponCodes) ? input.couponCodes.filter(Boolean) : [];
    const code = input.couponCode || codes[0] || '';
    let couponResult = null;
    let discount = 0;
    if (code || codes.length) {
      couponResult = validateCoupon(data.coupons || [], code, {
        plan, quantity: qty, orgId: input.orgId, now, codeCount: codes.length, plans: data.plans,
      });
      if (couponResult.ok) discount = roundHalfUp(listTotal * couponResult.coupon.percentOff, 100);
    }
    discount = Math.min(discount, listTotal);
    const taxable = listTotal - discount;
    const taxRateBps = settings.taxRateBps || 0;
    const tax = roundHalfUp(taxable * taxRateBps, 10000);
    /* 1 Million Women in Design (R18, R19): a share of what the payer pays, plus an optional top-up of seats. */
    const sharePct = Number.isFinite(Number(settings.womenSharePct)) ? Number(settings.womenSharePct) : 0;
    const womenShare = unitPrice === 0 ? 0 : roundHalfUp(taxable * Math.round(sharePct * 100), 10000);
    const seatPrice = settings.womenSeatPrice == null ? 0 : settings.womenSeatPrice;
    const womenSeats = Math.max(0, Math.min(500, Math.floor(Number(input.womenSeats) || 0)));
    const topUp = womenSeats * seatPrice;
    const total = Math.max(0, taxable + tax) + topUp;
    const ttl = (settings.quoteTtlMinutes || 15) * 60000;

    const lines = [];
    if (plan.pricingModel === 'TIERED_BY_SIZE') lines.push({ label: `${plan.name} · ${tierKey} tier`, amount: listTotal });
    else if (multiplies) lines.push({ label: `${qty} ${unitWord(plan.kind, qty)} × ${formatINR(unitPrice)}`, amount: listTotal });
    else lines.push({ label: plan.name, amount: listTotal });

    return {
      ok: true,
      quoteId: input.quoteId || makeId('Q'),
      input: Object.assign({}, input, { couponCode: code ? normaliseCode(code) : '' }),
      flow: input.flow || enums.FlowForKind[plan.kind],
      planKey: plan.key,
      planName: plan.name,
      planKind: plan.kind,
      pricingModel: plan.pricingModel,
      billingPeriod: plan.billingPeriod,
      tierKey,
      priceVersionId: version.id,
      priceVersion: version.version,
      unitPrice,
      quantity: qty,
      listTotal,
      discount,
      taxRateBps,
      tax,
      womenSharePct: sharePct,
      womenShare,
      womenSeats,
      womenSeatPrice: seatPrice,
      topUp,
      total,
      coupon: couponResult ? {
        code: normaliseCode(code),
        applied: couponResult.ok,
        reason: couponResult.reason,
        percentOff: couponResult.coupon ? couponResult.coupon.percentOff : null,
      } : null,
      couponCode: couponResult && couponResult.ok ? normaliseCode(code) : null,
      sponsored: !!(couponResult && couponResult.ok && total === 0 && listTotal > 0),
      perMonthEquivalent: plan.billingPeriod === 'ANNUAL' ? roundHalfUp(listTotal, 12) : null,
      lines,
      computedAt: now,
      expiresAt: now + ttl,
    };
  }

  const COMPARED = ['listTotal', 'discount', 'tax', 'womenShare', 'topUp', 'total', 'priceVersionId', 'couponCode'];

  /*
   * confirm(previousQuote, data, now) → re-runs the quote on current data (A8.2, R15).
   * { ok: true, quote } when nothing changed; otherwise { ok: false, changed, quote, diff, error }.
   */
  function confirm(prev, data, now) {
    const t = toMs(now);
    const fresh = quote(Object.assign({}, prev.input, { now: t, quoteId: prev.quoteId }), data);
    if (!fresh.ok) return { ok: false, changed: true, error: fresh.error, quote: fresh, diff: [] };
    const diff = COMPARED.filter((k) => fresh[k] !== prev[k]).map((k) => ({ field: k, before: prev[k], after: fresh[k] }));
    const couponChanged = (prev.coupon && prev.coupon.applied) !== (fresh.coupon && fresh.coupon.applied);
    if (couponChanged && !diff.some((d) => d.field === 'couponCode')) {
      diff.push({ field: 'coupon', before: prev.coupon && prev.coupon.reason, after: fresh.coupon && fresh.coupon.reason });
    }
    if (diff.length) {
      return { ok: false, changed: true, error: 'The price changed since your quote. Check the new total and confirm again.', quote: fresh, diff };
    }
    if (t > prev.expiresAt) {
      return { ok: false, changed: true, error: 'Your quote expired. Check it and confirm again.', quote: fresh, diff: [] };
    }
    return { ok: true, quote: fresh };
  }

  /* The enumerated sign-up record (A4.3). Validated against the live registries. */
  function buildSignup(q, extra) {
    const e = extra || {};
    return {
      id: e.id || makeId('SU'),
      flow: q.flow,
      orgId: e.orgId || q.input.orgId || null,
      orgName: e.orgName || null,
      planKey: q.planKey,
      planKind: q.planKind,
      pricingModel: q.pricingModel,
      billingPeriod: q.billingPeriod,
      tierKey: q.tierKey,
      priceVersionId: q.priceVersionId,
      couponCode: q.couponCode,
      quantity: q.quantity,
      listTotal: q.listTotal,
      discount: q.discount,
      tax: q.tax,
      womenShare: q.womenShare || 0,
      womenSeats: q.womenSeats || 0,
      topUp: q.topUp || 0,
      total: q.total,
      status: 'CONFIRMED_MOCK',
      sponsored: q.sponsored,
      quoteId: q.quoteId,
      quoteSnapshot: JSON.parse(JSON.stringify(q)),
      details: e.details || {},
      at: e.at || Date.now(),
    };
  }

  function validateSignupEnums(signup, registry) {
    const errors = [];
    const chk = (v, list, label) => { if (v != null && !list.includes(v)) errors.push(`Unknown ${label}: ${v}.`); };
    chk(signup.flow, enums.SignupFlow, 'flow');
    chk(signup.planKind, enums.PlanKind, 'plan kind');
    chk(signup.pricingModel, enums.PricingModel, 'pricing model');
    chk(signup.billingPeriod, enums.BillingPeriod, 'billing period');
    chk(signup.tierKey, enums.TierKey, 'tier');
    chk(signup.status, enums.SignupStatus, 'status');
    chk(signup.planKey, registry.planKeys, 'plan key');
    if (signup.couponCode != null) chk(signup.couponCode, registry.couponCodes, 'coupon code');
    return errors;
  }

  /* R23: hours of teaching count as seats, a fixed number of hours to a seat. */
  function seatsFromHours(hours, perSeat) {
    const per = Number(perSeat) || 0;
    const h = Number(hours) || 0;
    return per > 0 && h > 0 ? Math.floor(h / per) : 0;
  }

  /*
   * R19 and R23: the running tally of seats funded, by source.
   * signups: confirmed sign-ups (share, top-up seats, college pledges, sponsored cohorts).
   * doneOffers: teaching offers for women in design that an admin marked Done (hours become seats).
   */
  function womenTally(signups, settings, doneOffers) {
    const st = settings || {};
    const seatPrice = st.womenSeatPrice || 0;
    const base = st.womenBase || {};
    const by = { share: base.share || 0, topup: base.topup || 0, college: base.college || 0, sponsor: base.sponsor || 0, hours: base.hours || 0 };
    let sharePaise = 0;
    (signups || []).forEach((s) => {
      sharePaise += s.womenShare || 0;
      const n = s.womenSeats || 0;
      if (s.flow === 'COLLEGE_ONBOARDING') by.college += n;
      else if (s.flow === 'CHALLENGE_SPONSORSHIP') by.sponsor += n;
      else by.topup += n;
    });
    const fromShare = seatPrice > 0 ? Math.floor(sharePaise / seatPrice) : 0;
    by.share += fromShare;
    (doneOffers || []).forEach((o) => { by.hours += seatsFromHours(o.hours, st.womenHoursPerSeat); });
    const seats = by.share + by.topup + by.college + by.sponsor + by.hours;
    const target = st.womenTarget || 1000000;
    return { seats, fromShare, bySource: by, target, pct: Math.min(100, (seats / target) * 100) };
  }

  return {
    womenTally, seatsFromHours,
    roundHalfUp, formatINR, rupeesToPaise, formatDate, unitWord, toMs,
    currentVersion, isPriced, tierFor, remaining, percentBooked, fromPrice,
    findCoupon, effectiveCouponStatus, appliesTo, appliesText, validateCoupon,
    quote, confirm, buildSignup, validateSignupEnums, makeId,
  };
});
