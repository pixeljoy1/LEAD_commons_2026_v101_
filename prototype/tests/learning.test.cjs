/* Round 5: module codes (R20), progress (R21), giving back (R22). Run: npm test */
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/rules.js');

const mod = { code: 'LM-SP-1', lessons: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], check: [{ answer: 0 }, { answer: 1 }, { answer: 2 }], pass: 2 };

test('R20 module codes follow LM-<mode>-<n>', () => {
  assert.equal(R.moduleCode('SP', 1), 'LM-SP-1');
  assert.equal(R.validateModuleCode('LM-IL-12', []).ok, true);
  assert.equal(R.validateModuleCode('LM-XX-1', []).ok, false);
  assert.equal(R.validateModuleCode('LM-SP-0', []).ok, false);
  assert.equal(R.validateModuleCode('lm-sp-1', []).ok, false);
  assert.equal(R.validateModuleCode('LM-SP-1', ['LM-SP-1']).ok, false);
});

test('R21 lessons count in any order and never go backwards', () => {
  let rec = R.markLesson(null, mod, 'c');
  rec = R.markLesson(rec, mod, 'a');
  rec = R.markLesson(rec, mod, 'a');
  assert.deepEqual(rec.done.sort(), ['a', 'c']);
  assert.equal(R.markLesson(rec, mod, 'nope').done.length, 2);
  const p = R.moduleProgress(mod, rec);
  assert.equal(p.lessonsDone, 2); assert.equal(p.complete, false); assert.equal(p.canCheck, false);
});

test('R21 a module is done only when every lesson is done and the check is passed (2 of 3)', () => {
  let rec = ['a', 'b', 'c'].reduce((r, id) => R.markLesson(r, mod, id), null);
  assert.equal(R.moduleProgress(mod, rec).canCheck, true);
  assert.equal(R.moduleProgress(mod, rec).complete, false);
  const bad = R.scoreCheck(mod, [1, 0, 2]);
  assert.equal(bad.score, 1); assert.equal(bad.passed, false);
  rec = R.recordCheck(rec, mod, bad);
  assert.equal(R.moduleProgress(mod, rec).complete, false);
  const good = R.scoreCheck(mod, [0, 1, 0]);
  assert.equal(good.passed, true);
  rec = R.recordCheck(rec, mod, good);
  assert.equal(R.moduleProgress(mod, rec).complete, true);
  assert.equal(R.moduleProgress(mod, rec).pct, 100);
  rec = R.recordCheck(rec, mod, bad); // a later bad try never undoes a pass
  assert.equal(R.moduleProgress(mod, rec).complete, true);
});

test('R22 offers: 1 to 60 hours, a topic, a format, and the right role', () => {
  const base = { hours: 6, topic: 'Coaching in 45 minutes', mode: 'IL', role: 'mentor' };
  assert.equal(R.validateOffer(base).ok, true);
  assert.equal(R.validateOffer(Object.assign({}, base, { hours: 0 })).ok, false);
  assert.equal(R.validateOffer(Object.assign({}, base, { hours: 61 })).ok, false);
  assert.equal(R.validateOffer(Object.assign({}, base, { topic: ' ' })).ok, false);
  assert.equal(R.validateOffer(Object.assign({}, base, { mode: 'ZZ' })).ok, false);
  assert.equal(R.validateOffer(Object.assign({}, base, { role: 'open' })).ok, false);
});

test('R22 a student leads a peer circle only after finishing a module', () => {
  const s = { hours: 2, topic: 'Framing', mode: 'PL', role: 'student', completed: false };
  assert.equal(R.validateOffer(s).ok, false);
  assert.equal(R.validateOffer(Object.assign({}, s, { completed: true })).ok, true);
  assert.equal(R.validateOffer(Object.assign({}, s, { completed: true, mode: 'IL' })).ok, false);
});

test('R22 requests, votes and states', () => {
  assert.equal(R.validateRequest({ title: 'Design for low-literacy users', count: 20 }).ok, true);
  assert.equal(R.validateRequest({ title: 'Hi', count: 20 }).ok, false);
  assert.equal(R.validateRequest({ title: 'Design for low-literacy users', count: 0 }).ok, false);
  assert.equal(R.addVote(['u1'], 'u1').ok, false);
  assert.equal(R.addVote(['u1'], 'u2').ok, true);
  assert.equal(R.canTransition('learning_request', 'Open', 'Matched'), true);
  assert.equal(R.canTransition('learning_request', 'Open', 'Done'), false);
  assert.equal(R.canTransition('learning_request', 'Scheduled', 'Closed'), true);
  assert.equal(R.canTransition('teaching_offer', 'Proposed', 'Approved'), true);
  assert.equal(R.canTransition('open_topic', 'Proposed', 'Published'), false);
});

test('R21 a module with no lessons is never complete', () => {
  const empty = { code: 'LM-IL-9', lessons: [] };
  assert.equal(R.moduleProgress(empty, null).complete, false);
  assert.equal(R.moduleProgress(empty, { done: [] }).pct, 0);
});

test('R26 the next step is the first unfinished module in the sequence', () => {
  const seq = ['LM-SP-1', 'LM-SP-2', 'LM-PL-1'];
  assert.deepEqual(R.nextStep(seq, []), { total: 3, doneCount: 0, nextCode: 'LM-SP-1', complete: false, position: 1 });
  assert.equal(R.nextStep(seq, ['LM-SP-1']).nextCode, 'LM-SP-2');
  assert.equal(R.nextStep(seq, ['LM-SP-2']).nextCode, 'LM-SP-1');
  const all = R.nextStep(seq, seq);
  assert.equal(all.complete, true); assert.equal(all.nextCode, null); assert.equal(all.doneCount, 3);
  assert.equal(R.nextStep([], []).complete, false);
});

test('every role has a sequence of real modules that role may take', () => {
  globalThis.LEAD = globalThis.LEAD || {};
  require('../js/data/learning.js');
  const d = globalThis.LEAD.learningData; const mods = d.build().modules;
  for (const role of ['student', 'faculty', 'head', 'industry', 'mentor', 'open', 'admin']) {
    assert.ok(d.sequences[role] && d.sequences[role].length >= 4, role);
    assert.equal(d.sequences[role][0][0], 'LM-SP-1');
    for (const [code] of d.sequences[role]) {
      const m = mods.find((x) => x.code === code);
      assert.ok(m, code);
      if (role !== 'admin') assert.ok(m.for.includes(role), `${role} ${code}`);
    }
  }
  assert.notDeepEqual(d.sequences.student.map((x) => x[0]), d.sequences.mentor.map((x) => x[0]));
});
