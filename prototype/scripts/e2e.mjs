/* LEAD · end-to-end checks with Playwright (spec §17.2, addendum A15.2).
 * Serves the repo root, then: crawls every route as every role for script errors and horizontal scroll,
 * runs the demo scenarios, and saves screenshots.
 * Usage: node prototype/scripts/e2e.mjs [screenshotDir]
 */
import { createRequire } from 'node:module';
import { execSync, spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const { chromium } = pw;

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const shots = resolve(process.argv[2] || resolve(root, 'prototype', 'dist', 'shots'));
mkdirSync(shots, { recursive: true });
const PORT = 4179;
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const BASE = `http://127.0.0.1:${PORT}/prototype/index.html`;

const results = [];
const ok = (name, cond, info) => { results.push({ name, pass: !!cond, info }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined }).catch(() => chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }));
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, colorScheme: 'dark' });
const errors = [];
const watch = (page) => { page.on('pageerror', (e) => errors.push(`${page.url()} :: ${e.message}`)); page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(`${page.url()} :: console: ${m.text()}`); }); };
const page = await ctx.newPage();
watch(page);

async function go(p, token) { await p.evaluate((t) => { if (location.hash.slice(1) === t) LEAD.render(); else location.hash = t; }, token); await p.waitForTimeout(120); }
async function as(p, role) { await p.selectOption('#role-select', role); await p.waitForTimeout(80); }

await page.goto(BASE + '#model');
await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });
await page.goto(BASE + '#model');
await page.waitForSelector('.eco-canvas svg');

/* ---------- crawl: every route × every role ---------- */
const ROUTES = ['model', 'verdict', 'choose', 'lexicon', 'lexicon-problem-framing', 'demand', 'challenges', 'challenge-c1', 'challenge-c3', 'team', 'team-t1', 'sprints', 'submit', 'assess', 'passports', 'passport-LEAD-7K2Q-NW', 'opportunities', 'impact', 'calendar', 'provisions', 'audit',
  'join', 'join-college', 'join-industry', 'join-path', 'join-path-PATH_DECISIONS', 'join-sponsor', 'join-open', 'admin', 'admin-plans', 'admin-plan-CAMPUS_STANDARD', 'admin-coupons', 'admin-signups', 'admin-enums', 'admin-banner', 'admin-audit'];
const ROLES = ['student', 'faculty', 'head', 'industry', 'mentor', 'steward', 'open', 'admin'];
for (const r of ROLES) {
  await as(page, r);
  await go(page, 'w-' + r);
  for (const t of ROUTES) await go(page, t);
}
ok('Crawl: no script errors on 36 routes × 8 roles', errors.length === 0, errors.slice(0, 5).join(' | '));

/* ---------- S9: access rules per role ---------- */
await as(page, 'open'); await go(page, 'team-t1');
ok('S9 open member cannot open a team workspace', await page.locator('text=is not open to Open community').count() > 0);
await as(page, 'industry'); await go(page, 'passports');
const indShared = await page.locator('.passport').count();
ok('S9 employer sees only shared Passport entries (R3)', indShared === 1, `${indShared} visible`);
await as(page, 'student'); await go(page, 'admin');
ok('S9 student cannot open the pricing admin', await page.locator('text=is not open to Student').count() > 0);

/* ---------- S1: intake → merge → publish ---------- */
await as(page, 'industry'); await go(page, 'demand');
await page.fill('#in-problem', 'Junior analysts never test the first framing of a problem.');
await page.click('form[data-form="intake"] button[type="submit"]');
await as(page, 'steward'); await go(page, 'demand');
const before = await page.locator('.col:nth-child(1) .item').count();
await page.locator('.col:nth-child(1) .item').first().locator('button:has-text("Mark reviewed")').click();
await page.locator('.col:nth-child(2) .item').first().locator('button:has-text("Publish as own theme")').click();
await page.waitForTimeout(100);
ok('S1 steward reviews and publishes an intake', (await page.locator('.col:nth-child(4) .item').count()) >= 3 && before >= 1);

/* ---------- S2: shape (R6) → match → map → Live ---------- */
await go(page, 'challenge-c3');
ok('S2 R6 blocks shaping until NDA-safe', await page.locator('button:has-text("Mark shaped")').isDisabled());
await page.check('#nda-noConfidential'); await page.check('#nda-sanitised');
await page.selectOption('#cf-ip', 'Shared licence');
await page.waitForTimeout(80);
await page.click('button:has-text("Mark shaped")');
await page.selectOption('#mt-campus', 'campus-b');
await page.selectOption('#mt-fac', 'f2');
await page.click('form[data-form="match"] button[type="submit"]');
await as(page, 'faculty');
await page.evaluate(() => { LEAD.store.session.userId = 'f2'; });
await go(page, 'challenge-c3');
await page.click('form[data-form="map"] button[type="submit"]');
const c3 = await page.evaluate(() => LEAD.store.loop.challenges.find((c) => c.id === 'c3').status);
ok('S2 challenge is Live after faculty mapping', c3 === 'Live', c3);
await as(page, 'student'); await go(page, 'challenges');
ok('S2 Campus A student does not see the Campus B challenge', await page.locator('text=Explain a lab result').count() === 0);

/* ---------- S3: decisions and private thread ---------- */
await go(page, 'team');
for (let i = 1; i <= 3; i++) {
  await page.fill('#dl-dec', `Decision ${i}`); await page.fill('#dl-why', `Because ${i}`);
  await page.click('form[data-form="decision"] button[type="submit"]');
}
const decs = await page.evaluate(() => LEAD.store.loop.teams.find((t) => t.id === 't1').decisions.length);
ok('S3 three decisions logged', decs === 9, `${decs} entries`);
await as(page, 'head'); await go(page, 'team-t1');
ok('S3 thread is private: institution head is refused', await page.locator('text=is not open to Institution head').count() > 0);

/* ---------- S4: complete the sprint ---------- */
await as(page, 'student'); await go(page, 'sprints');
await page.click('button[data-act="sp-book"]');
await as(page, 'mentor'); await go(page, 'sprints');
await page.locator('button[data-act="sp-held"]').first().click();
const sp = await page.evaluate(() => LEAD.store.loop.sprints.find((s) => s.id === 'sp1').status);
ok('S4 sprint complete after three sessions', sp === 'Complete', sp);

/* ---------- S5: submission needs AI declaration (R7) ---------- */
await as(page, 'student'); await go(page, 'submit');
ok('S5 submit disabled without AI-use declaration', await page.locator('#sb-go').isDisabled());
await page.fill('#sb-ai', 'No AI used.');
await page.click('#sb-go');
const sub = await page.evaluate(() => (LEAD.store.loop.submissions.find((s) => s.teamId === 't1') || {}).status);
ok('S5 submission is In scoring', sub === 'In scoring', sub);

/* ---------- S6: blind scoring by two assessors ---------- */
async function scoreAll(user) {
  await page.evaluate((u) => { LEAD.store.session.userId = u; }, user);
  await go(page, 'assess');
  const cards = page.locator('article.card', { has: page.locator('button[data-act="lock"]') });
  const card = cards.first();
  for (const c of ['r1', 'r2', 'r3', 'r4', 'r5', 'r6']) await card.locator(`button[data-c="${c}"][data-v="3"]`).click();
  return card;
}
await as(page, 'mentor');
let card = await scoreAll('m3');
const hiddenBefore = await card.locator('.redacted').count();
await card.locator('button[data-act="lock"]').click();
await page.waitForTimeout(80);
ok('S6 names hidden until scores lock (R1)', hiddenBefore > 0 && (await page.locator('text=Names shown').count()) > 0);
card = await scoreAll('m2');
await card.locator('button[data-act="lock"]').click();
await as(page, 'steward'); await go(page, 'assess');
ok('S6 moderator sees the spread between assessors', await page.locator('text=Spread between assessors').count() > 0);

/* ---------- S7: second approval, share, public link ---------- */
await go(page, 'passports');
const pending = await page.locator('button[data-act="pp-approve"]:not([disabled])').count();
await page.locator('button[data-act="pp-approve"]:not([disabled])').first().click();
await as(page, 'student'); await go(page, 'passports');
await page.locator('button[data-act="pp-share"]').first().click();
const code = await page.evaluate(() => LEAD.store.loop.passports.find((p) => p.studentId === 's1' && p.status === 'Shared').code);
await go(page, 'passport-' + code);
ok('S7 approval → share → public verification link works', pending > 0 && (await page.locator('text=LEAD Skills Passport · verified').count()) === 1, code);

/* ---------- S8: shortlist, outcome, problem solved ---------- */
await as(page, 'industry'); await go(page, 'opportunities');
await page.locator('button[data-act="op-short"]').first().click();
await page.locator('button[data-act="op-out"][data-r="Hired"]').first().click();
await go(page, 'impact');
await page.click('button[data-act="pr"][data-r="solved"]');
const solved = await page.evaluate(() => LEAD.store.loop.problemRecords.filter((p) => p.result === 'solved').length);
ok('S8 Impact Ledger counts 1 problem solved and the hire', solved === 1 && (await page.locator('.pxnum:has-text("01")').count()) > 0);

/* ---------- S10: provisions ---------- */
await go(page, 'provisions');
await page.fill('#pv-title', 'Regional-language Lexicon');
await page.click('form[data-form="provision"] button[type="submit"]');
ok('S10 provision appears on the board', await page.locator('h3:has-text("Regional-language Lexicon")').count() === 1);

/* ---------- S11–S13, S16–S18: admin and pricing ---------- */
await as(page, 'admin'); await go(page, 'admin-plans');
await page.click('form[data-form="plan-new"] button[type="submit"]');
await page.fill('#pp-price', '9000');
await page.click('form[data-form="price"] button[type="submit"]');
await go(page, 'admin-enums');
ok('S11 new plan PATH_TEST appears in enumerations', await page.locator('.code:has-text("PATH_TEST")').count() > 0);
await go(page, 'join-path');
ok('S11 new plan appears in the path dropdown', await page.locator('#jp-key option[value="PATH_TEST"]').count() === 1);

await go(page, 'join-college');
await page.fill('#cp-college', 'FOUNDING20');
await page.waitForTimeout(450);
ok('S12 FOUNDING20 discounts the college quote', await page.locator('#q-college >> text=20% off').count() === 1);

await as(page, 'admin'); await go(page, 'admin-coupons');
await page.click('form[data-form="coupon-new"] button[type="submit"]');
const big = () => page.evaluate(() => LEAD.store.pricing.coupons.find((c) => c.code === 'BIG70').status);
const s1 = await big();
await page.locator('article:has-text("BIG70") button[data-act="cp-approve"]').click();
const s2 = await big();
await page.click('button[data-act="admin-actor"][data-actor="Admin B"]');
await page.locator('article:has-text("BIG70") button[data-act="cp-approve"]').click();
const s3 = await big();
ok('S13 BIG70 pending; Admin A refused; Admin B approves', s1 === 'PENDING_APPROVAL' && s2 === 'PENDING_APPROVAL' && s3 === 'ACTIVE', `${s1} → ${s2} → ${s3}`);

await as(page, 'head'); await go(page, 'join-college');
let confirmed = 0;
for (let i = 0; i < 8; i++) {
  await page.fill('#jc-name', `Pilot Campus ${i}`);
  await page.fill('#cp-college', '');
  await page.waitForTimeout(400);
  const btn = page.locator('#go-college');
  if (await btn.isDisabled()) break;
  await btn.click(); await page.waitForTimeout(80);
  if (await page.locator('text=Mock sign-up. Nothing was charged.').count()) { confirmed += 1; await page.click('button[data-act="join-again"]'); }
}
const camp = await page.evaluate(() => { const p = LEAD.store.plan('CAMPUS_STANDARD'); return `${p.booked}/${p.capacity}`; });
ok('S16 campus pilot closes at 10 of 10; the next is refused', camp === '10/10' && confirmed === 7 && (await page.locator('text=Closed. Re-opens soon.').count()) > 0, `${confirmed} confirmed · ${camp}`);

await go(page, 'join-industry');
await page.fill('#ji-name', 'Repeat Org'); await page.fill('#cp-industry', 'FOUNDING20'); await page.waitForTimeout(450);
await page.click('#go-industry'); await page.click('button[data-act="join-again"]');
await page.fill('#ji-name', 'Repeat Org'); await page.fill('#cp-industry', 'FOUNDING20'); await page.waitForTimeout(450);
ok('S17 same organisation cannot reuse a max-per-org coupon', await page.locator('#cm-industry >> text=Already used by your organisation.').count() === 1);

await as(page, 'admin'); await go(page, 'admin-plan-INDUSTRY_TEAM');
await page.click('button[data-act="plan-archive"]');
await page.fill('#pr-key', 'INDUSTRY_RENAMED');
await page.click('form[data-form="plan-rename"] button[type="submit"]');
ok('S18 archived used key is refused a rename and stays in the log', (await page.locator('text=cannot be renamed or deleted').count()) > 0 && (await page.evaluate(() => LEAD.store.pricing.signups.some((s) => s.planKey === 'INDUSTRY_TEAM'))));
await page.click('button[data-act="plan-unarchive"]');
await page.click('button[data-act="plan-toggle"]');

/* ---------- S14, S15, S19, S20: live propagation across tabs ---------- */
const tab2 = await ctx.newPage(); watch(tab2);
await tab2.goto(BASE + '#join-industry');
await tab2.waitForSelector('#q-industry');
await tab2.fill('#ji-name', 'Tab Two Ltd'); await tab2.waitForTimeout(400);
const t0 = Date.now();
await go(page, 'admin-plan-INDUSTRY_TEAM');
await page.fill('#pp-price', '42000');
await page.click('form[data-form="price"] button[type="submit"]');
await tab2.waitForFunction(() => document.querySelector('#q-industry') && document.querySelector('#q-industry').textContent.includes('42,000'), null, { timeout: 6000 }).catch(() => null);
const dt = Date.now() - t0;
ok('S14/S20 second tab shows the new price without reload', (await tab2.locator('#q-industry >> text=42,000').count()) > 0 && dt < 5000, `${dt} ms`);

await tab2.fill('#cp-industry', 'STUDENT10'); await tab2.waitForTimeout(400);
await tab2.fill('#cp-industry', ''); await tab2.waitForTimeout(400);
await tab2.fill('#ji-name', 'Stale Quote Ltd'); await tab2.fill('#cp-industry', 'FOUNDING20'); await tab2.waitForTimeout(450);
await go(page, 'admin-coupons');
await page.locator('article:has-text("FOUNDING20") button[data-act="cp-status"][data-to="PAUSED"]').click();
await tab2.waitForTimeout(600);
const said = await tab2.locator('#sum-industry >> text=Price updated.').count();
const total = await tab2.evaluate(() => document.querySelector('#q-industry').textContent);
ok('S15 after the admin pauses the coupon, the open quote shows the new total and asks again', said === 1 && !total.includes('20% off'));

await go(page, 'admin-banner');
await page.fill('#bn-text', 'Assessment day on 14 Nov. Book an assessor seat.');
await page.click('form[data-form="banner"] button[type="submit"]');
await tab2.waitForFunction(() => (document.querySelector('[data-banner]') || {}).textContent?.includes('14 Nov'), null, { timeout: 6000 }).catch(() => null);
ok('S19 banner reaches the other tab', await tab2.locator('[data-banner] >> text=14 Nov').count() === 1);

/* ---------- screenshots and layout ---------- */
await page.evaluate(() => LEAD.store.resetDemo());
const SHOTS = ['model', 'verdict', 'w-student', 'challenge-c1', 'team-t1', 'assess', 'passports', 'impact', 'join', 'join-college', 'admin-coupons', 'lexicon'];
const roleFor = { 'w-student': 'student', 'team-t1': 'student', assess: 'mentor', passports: 'steward', 'admin-coupons': 'admin', impact: 'steward', 'join-college': 'head' };
for (const scheme of ['dark', 'light']) {
  const c = await browser.newContext({ viewport: { width: 1360, height: 900 }, colorScheme: scheme });
  const p = await c.newPage(); watch(p);
  await p.goto(BASE + '#model'); await p.waitForTimeout(600);
  for (const s of SHOTS) {
    if (roleFor[s]) await as(p, roleFor[s]);
    await go(p, s); await p.waitForTimeout(250);
    await p.screenshot({ path: `${shots}/${scheme}-${s}.png`, fullPage: false });
  }
  await c.close();
}
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', isMobile: true, hasTouch: true });
const mp = await m.newPage(); watch(mp);
await mp.goto(BASE + '#model'); await mp.waitForTimeout(600);
const wide = [];
for (const r of ['steward', 'student', 'admin']) {
  await as(mp, r);
  for (const t of ROUTES) {
    await go(mp, t);
    const over = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 1) wide.push(`${r}:${t}(+${over})`);
  }
}
ok('Mobile 390px: no horizontal page scroll', wide.length === 0, wide.slice(0, 8).join(' '));
for (const s of ['model', 'join-college', 'w-student', 'admin-coupons']) { if (roleFor[s]) await as(mp, roleFor[s]); await go(mp, s); await mp.waitForTimeout(250); await mp.screenshot({ path: `${shots}/mobile-${s}.png`, fullPage: false }); }

ok('No script errors in any scenario', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
server.kill();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed. Screenshots: ${shots}`);
process.exit(failed.length ? 1 : 0);
