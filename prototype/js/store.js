/* LEAD · demo store.
 * Loop data lives in memory and resets on reload.
 * The pricing slice (plans, coupons, sign-ups, banner, settings, epoch) is mirrored to local browser
 * storage only so admin changes can reach a second open tab (addendum A9). Nothing is permanent.
 */
(function (root) {
  const LEAD = (root.LEAD = root.LEAD || {});
  const { rules } = LEAD;
  const KEY = 'lead-demo-pricing-v1';
  const CHANNEL = 'lead-pricing';
  const TAB = Math.random().toString(36).slice(2);

  const clone = (x) => JSON.parse(JSON.stringify(x));

  function readPricing() {
    try {
      const raw = root.localStorage && root.localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && Array.isArray(p.plans) && Array.isArray(p.coupons)) return p;
      }
    } catch (e) { /* storage blocked: stay in memory */ }
    return LEAD.pricingSeed.build();
  }

  function writePricing(p) {
    try { root.localStorage && root.localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* in memory only */ }
  }

  let channel = null;
  try { channel = new BroadcastChannel(CHANNEL); } catch (e) { channel = null; }

  const listeners = new Set();
  function emit(evt) { listeners.forEach((fn) => { try { fn(evt); } catch (e) { console.error(e); } }); }

  const store = {
    loop: LEAD.seed.build(),
    pricing: readPricing(),
    session: { role: 'steward', userId: 'st1', adminActor: 'Admin A', demo: false, demoStep: 0 },

    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    /* ---------- people ---------- */
    user(id) { return this.loop.users.find((u) => u.id === (id || this.session.userId)) || null; },
    me() {
      if (this.session.role === 'admin') return { id: this.session.adminActor, name: this.session.adminActor, role: 'admin', orgId: 'umo' };
      return this.user(this.session.userId);
    },
    org(id) { return this.loop.orgs.find((o) => o.id === id) || null; },
    setRole(role, userId) {
      this.session.role = role;
      this.session.userId = userId || this.loop.defaultUser[role];
      emit({ kind: 'session' });
    },
    actorLabel() {
      const me = this.me();
      return me ? me.name : 'Unknown';
    },

    /* ---------- loop commits (R8) ---------- */
    commit(action, entity, entityId, mutate) {
      const target = typeof entityId === 'object' ? entityId : null;
      const id = target ? (target.id || '') : entityId;
      const before = target ? clone(target) : null;
      const result = mutate();
      const after = target ? clone(target) : (result && typeof result === 'object' ? clone(result) : null);
      this.loop.audit.unshift(rules.auditEntry(this.actorLabel(), action, entity, id || (after && after.id) || '', before, after));
      emit({ kind: 'loop', action, entity });
      return result;
    },

    /* ---------- pricing commits (R16, A9) ---------- */
    pricingCommit(action, entity, entityId, before, mutate) {
      const result = mutate(this.pricing);
      const afterObj = typeof result === 'object' ? result : null;
      this.pricing.audit.unshift(rules.auditEntry(this.actorLabel(), action, entity, entityId, before, afterObj));
      this.pricing.audit = this.pricing.audit.slice(0, 400);
      this.pricing.epoch = (this.pricing.epoch || 0) + 1;
      writePricing(this.pricing);
      const msg = { epoch: this.pricing.epoch, kind: entity, key: entityId, from: TAB };
      try { channel && channel.postMessage(Object.assign({ state: this.pricing }, msg)); } catch (e) { /* ignore */ }
      emit(Object.assign({ kind: 'pricing', remote: false }, msg));
      return result;
    },

    pricingData() { return { plans: this.pricing.plans, coupons: this.pricing.coupons, settings: this.pricing.settings }; },
    plan(key) { return this.pricing.plans.find((p) => p.key === key) || null; },

    resetDemo() {
      try { root.localStorage && root.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      this.loop = LEAD.seed.build();
      this.pricing = LEAD.pricingSeed.build();
      this.pricing.epoch = Date.now() % 100000;
      writePricing(this.pricing);
      try { channel && channel.postMessage({ epoch: this.pricing.epoch, kind: 'reset', key: '', from: TAB, state: this.pricing }); } catch (e) { /* ignore */ }
      emit({ kind: 'reset' });
    },
  };

  function adopt(state, msg) {
    if (!state || !Array.isArray(state.plans)) return;
    if ((state.epoch || 0) === (store.pricing.epoch || 0) && msg.kind !== 'reset') return;
    store.pricing = state;
    emit({ kind: 'pricing', remote: true, epoch: state.epoch, entity: msg.kind, key: msg.key });
  }

  if (channel) {
    channel.onmessage = (ev) => {
      const m = ev.data || {};
      if (m.from === TAB) return;
      adopt(m.state, m);
    };
  }
  root.addEventListener && root.addEventListener('storage', (ev) => {
    if (ev.key !== KEY || !ev.newValue) return;
    try { const s = JSON.parse(ev.newValue); adopt(s, { kind: 'storage', key: '' }); } catch (e) { /* ignore */ }
  });
  /* Polling fallback (A9.3): every 5 s, check the epoch in storage. */
  setInterval(() => {
    try {
      const raw = root.localStorage && root.localStorage.getItem(KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if ((s.epoch || 0) !== (store.pricing.epoch || 0)) adopt(s, { kind: 'poll', key: '' });
    } catch (e) { /* ignore */ }
  }, 5000);

  writePricing(store.pricing);
  LEAD.store = store;
})(typeof globalThis !== 'undefined' ? globalThis : this);
