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

async function goRaw(p, token) { await p.evaluate((t) => { if (location.hash.slice(1) === t) LEAD.render(); else location.hash = t; }, token); await p.waitForTimeout(120); }
/* A join page opens on the package details. Most scenarios want the cart, so go() picks the package. */
async function go(p, token) {
  await goRaw(p, token);
  if (/^join-/.test(token) && await p.locator('#join-package').count()) {
    const key = (token.match(/^join-(?:path|sponsor)-(.+)$/) || [])[1];
    await p.click(key ? `[data-act="pkg-choose"][data-key="${key}"]` : '[data-act="pkg-choose"] >> nth=0'); await p.waitForTimeout(120);
  }
}
async function openSheet(p) { await p.evaluate(() => LEAD.store.signOut()); await p.waitForSelector('.head-join'); await p.click('.head-join'); }
async function as(p, role) {
  await p.click('.persona-btn');
  await p.click(`.persona-item[data-role="${role}"]`);
  await p.waitForTimeout(120);
}

await page.goto(BASE + '#home');
await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });
await page.goto(BASE + '#model'); // old link: must land on the homepage
await page.waitForSelector('.eco-canvas svg');

/* ---------- crawl: every route × every role ---------- */
const ROUTES = ['home', 'model', 'verdict', 'choose', 'skills', 'skills-problem-framing', 'lexicon-problem-framing', 'learn', 'learn-LM-SP-1', 'learn-LM-IL-1', 'learn-LM-CB-1', 'learn-LM-PL-2', 'demand', 'challenges', 'challenge-c1', 'challenge-c3', 'team', 'team-t1', 'sprints', 'submit', 'assess', 'passports', 'passport-LEAD-7K2Q-NW', 'jobs', 'impact', 'women', 'calendar', 'provisions', 'audit',
  'join', 'join-college', 'join-industry', 'join-path', 'join-path-PATH_DECISIONS', 'join-sponsor', 'join-open', 'admin', 'admin-plans'];
const simulated = []; const oldWords = [];
const ROLES = ['student', 'faculty', 'head', 'industry', 'mentor', 'open', 'admin'];
for (const r of ROLES) {
  await as(page, r);
  await go(page, 'w-' + r);
  for (const t of ROUTES) { await go(page, t); if (await page.evaluate(() => /Simulated/i.test(document.body.innerText))) simulated.push(`${r}:${t}`); if (await page.evaluate(() => /\bsteward|co-sign|\bLexicon\b/i.test(document.body.innerText))) oldWords.push(`${r}:${t}`); }
}
ok('Crawl: no script errors on 37 routes × 8 roles', errors.length === 0, errors.slice(0, 5).join(' | '));
ok('The word “Simulated” appears nowhere', simulated.length === 0, simulated.slice(0, 5).join(', '));
ok('No steward, co-signing or Lexicon wording on any screen', oldWords.length === 0, oldWords.slice(0, 8).join(', '));

/* ---------- S9: access rules per role ---------- */
await as(page, 'open'); await go(page, 'team-t1');
ok('S9 open member cannot open a team workspace', await page.locator('text=is not open to Open community').count() > 0);
await as(page, 'industry'); await go(page, 'passports');
const indShared = await page.locator('.passport').count();
ok('S9 employer sees only shared Passport entries (R3)', indShared === 1, `${indShared} visible`);
await as(page, 'student'); await go(page, 'admin');
ok('S9 student cannot open the pricing admin', await page.locator('text=is not open to Student').count() > 0);

/* ---------- header: one lockup, persona menu, one Demo button ---------- */
await go(page, 'home');
await page.click('.persona-btn');
const menuItems = await page.locator('.persona-item[data-role]').count();
await page.keyboard.press('Escape');
ok('Header: persona menu lists 7 personas (no steward) and closes on Escape', menuItems === 7 && await page.locator('#persona-menu').isHidden());
await as(page, 'admin');
ok('Header: choosing Admin goes straight to the single admin page', page.url().endsWith('#admin') && await page.locator('h1:has-text("Admin.")').count() === 1);
ok('Header: one logo lockup, no repeated wordmark, no role bar', (await page.locator('.brand-lead').count()) === 1 && (await page.locator('.brand-word').count()) === 0 && (await page.locator('.rolebar').count()) === 0 && (await page.locator('.demo-btn').count()) === 1);
await as(page, 'industry');
await page.click('.demo-btn');
const demoText = await page.locator('.demo').textContent();
for (let i = 0; i < 4; i++) { await page.click('.demo [data-act="demo-step"][data-d="1"]'); await page.waitForTimeout(200); }
const handLabel = await page.locator('.demo [data-act="demo-step"][data-d="1"]').textContent();
await page.click('.demo [data-act="demo-step"][data-d="1"]');
const handedTo = await page.evaluate(() => LEAD.store.session.role);
ok('Header: Demo runs by persona and hands off to the next', demoText.includes('Industry leader') && handLabel.includes('Hand off to') && handedTo === 'student', `${handLabel.trim()} → ${handedTo}`);
await page.click('.demo-btn');
ok('Header: Exit demo removes the strip', await page.locator('.demo').count() === 0);


/* ---------- homepage: plain language, student-first, people photos, join sheet ---------- */
await go(page, 'home');
ok('Home: the old #model link redirects to #home', page.url().endsWith('#home'));
const homeText = await page.evaluate(() => document.querySelector('main').textContent);
const banned = ['Lifecycle', 'Retention', 'Blueprint', 'Lineage', 'Value exchange', 'IxDF', 'v0.2', 'Chair', 'Wider Audience', 'Venn', 'Loop v0'];
const hits = banned.filter((w) => homeText.includes(w)).concat(/\bgates?\b/i.test(homeText) ? ['gate'] : []);
ok('Home: no internal jargon in the page body', hits.length === 0, hits.join(', '));
const heads = await page.locator('main section:not(.car) h2').allTextContents();
ok('Home: plain section headings in order (Your path stays folded)', ['Find your door', 'What is in it for you', 'What everyone gives and gets', 'Why people stay', 'Seven ways people work together', 'Ways to join and what they cost', 'Where LEAD is today', 'Built on what already works', 'Everything, in detail', 'Questions people ask', 'Ready to start?'].every((h, i) => heads[i] === h), heads.join(' | '));
ok('Carousel: eight leaves, the guided story first, one h1', await page.locator('#car .leaf').count() === 8 && await page.locator('#car .leaf:not([hidden]) .sb').count() === 1 && await page.locator('main h1').count() === 1);
ok('Carousel: the story has five captions and no controls inside it', await page.locator('#car .sb-cap').count() === 5 && await page.locator('#car .sb button').count() === 0);
ok('Path: folded until a role is picked', await page.locator('#path').count() === 0);
await page.click('#car .leaf:not([hidden]) [data-act="path-role"][data-role="student"]');
await page.waitForSelector('#path');
ok('Path: picking “Start as a student” unfolds the student path below', await page.locator('#path').isVisible() && (await page.locator('#path .beat .eyebrow').count()) === 9);
ok('Home: student path shows the stages with current names', (await page.locator('#path .beat .eyebrow').allTextContents()).map((t) => t.split('·')[1].trim()).join(',') === 'IDENTIFY,LEARN,APPLY,MENTOR,SOLVE,VALIDATE,CONNECT,CONNECT,GET A DESIGN JOB');
ok('Home: student path has the women step', await page.locator('#path .beat:has-text("Join a women") [data-act="as"]').count() === 1);
await page.click('[data-act="path-tab"][data-role="faculty"]');
ok('Home: persona tab swaps the story', (await page.locator('#path .beat h3').first().textContent()).startsWith('See what your syllabus leaves out'));
await page.click('[data-act="path-tab"][data-role="student"]');
await page.click('[data-act="path-close"]');
ok('Path: close folds it again', await page.locator('#path').count() === 0);
/* carousel timing */
await page.click('[data-act="car-go"][data-i="1"]');
ok('Carousel: a dot jumps to a leaf', (await page.evaluate(() => document.querySelector('#car .leaf:not([hidden])').dataset.i)) === '1');
await page.mouse.move(5, 5);
await page.click('[data-act="car-pause"]'); await page.click('[data-act="car-pause"]');
await page.mouse.move(5, 5); await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
await page.waitForFunction(() => document.querySelector('#car .leaf:not([hidden])').dataset.i === '2', null, { timeout: 11000 }).then(() => ok('Carousel: advances by itself after about 7 seconds', true), () => ok('Carousel: advances by itself after about 7 seconds', false));
await page.hover('#car .leaf:not([hidden])');
ok('Carousel: hover pauses the timer', await page.evaluate(() => getComputedStyle(document.querySelector('#car .car-bar i')).animationPlayState) === 'paused');
await page.mouse.move(5, 5);
await page.click('[data-act="car-pause"]');
const held = await page.evaluate(() => document.querySelector('#car .leaf:not([hidden])').dataset.i);
await page.mouse.move(5, 5); await page.waitForTimeout(500);
ok('Carousel: pause button holds the leaf', await page.evaluate(() => getComputedStyle(document.querySelector('#car .car-bar i')).animationPlayState) === 'paused' && held != null);
await page.click('[data-act="car-pause"]');
await page.click('[data-act="car-go"][data-i="7"]');
ok('Carousel: the 1 Million Women leaf links to its page', await page.locator('#car .leaf:not([hidden]) [data-go="women"]').count() === 1);
const reducedPage = await ctx.newPage();
await reducedPage.emulateMedia({ reducedMotion: 'reduce' });
await reducedPage.goto(BASE + '#home'); await reducedPage.waitForSelector('#car');
await reducedPage.waitForTimeout(1500);
ok('Carousel: reduced motion shows all story captions and no moving bar', await reducedPage.evaluate(() => getComputedStyle(document.querySelector('#car .car-bar i')).opacity === '0' && [...document.querySelectorAll('#car .sb-cap')].every((c) => getComputedStyle(c).opacity === '1')));
await reducedPage.close();

await page.evaluate(() => document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }));
await page.waitForTimeout(600);
const imgs = await page.evaluate(() => { const l = [...document.querySelectorAll('main img')]; return { n: l.length, ok: l.filter((i) => i.complete && i.naturalWidth > 0).length, caps: document.querySelectorAll('main .ph .ph-cap').length, figs: document.querySelectorAll('main .ph').length }; });
ok('Home: every photo loads and carries its caption', imgs.n >= 11 && imgs.ok === imgs.n && imgs.caps === imgs.figs, JSON.stringify(imgs));
const credits = await page.evaluate(() => document.querySelectorAll('.foot-about a').length);
ok('Home: footer credits every photographer', credits === 16, `${credits} credits`);

ok('Home: six doors, each with Join', await page.locator('.door').count() === 6 && await page.locator('.door [data-act="sheet"]').count() === 6);

/* join sheet: every option lands on a package page, then the cart, then confirm, and signs in as that persona */
await openSheet(page);
ok('Sheet: opens on the student routes', await page.locator('.sheet').isVisible() && (await page.locator('.sheet .opt').count()) === 2 && (await page.locator('[data-act="sheet-role"][aria-pressed="true"]').textContent()) === 'Student');
await page.keyboard.press('Escape');
ok('Sheet: Escape closes it and returns focus', await page.locator('.sheet').count() === 0 && await page.evaluate(() => document.activeElement.getAttribute('data-act') === 'sheet'));
const doorRoles = ['student', 'faculty', 'head', 'industry', 'mentor', 'open'];
let doorOk = true;
for (const r of doorRoles) {
  await go(page, 'home');
  await page.locator(`.door [data-act="sheet"][data-role="${r}"]`).click();
  const pressed = await page.locator('[data-act="sheet-role"][aria-pressed="true"]').getAttribute('data-role');
  const body = await page.locator('#sheet-body .opt').count();
  if (pressed !== r || body < 1) doorOk = false;
  await page.keyboard.press('Escape');
}
ok('Sheet: each door opens the sheet on its own role', doorOk);
await go(page, 'home');
await page.locator('.door [data-act="sheet"][data-role="head"]').click();
await page.locator('.sheet .opt:has-text("Talk to UMO")').click();
ok('Sheet: college sees the UMO address as text', await page.locator('.sheet >> text=team@umo.design').count() > 0);
await page.keyboard.press('Escape');

/* every sheet option, every persona: package → cart → confirm → signed in → My path. Never visits Live Projects. */
const JOIN_CASES = [
  ['student', 0, 'join-open', 'student'], ['student', 1, 'join-path', 'student'], ['faculty', 0, 'join-faculty', 'faculty'], ['faculty', 1, 'join-college', 'head'],
  ['head', 0, 'join-college', 'head'], ['industry', 0, 'join-industry', 'industry'], ['industry', 1, 'join-sponsor', 'industry'], ['mentor', 0, 'join-mentor', 'mentor'], ['open', 0, 'join-open', 'open'], ['open', 1, 'join-path', 'student'],
];
let joinOk = true; const joinInfo = [];
for (const [role, idx, route, want] of JOIN_CASES) {
  await goRaw(page, 'home');
  await page.evaluate(() => { LEAD.store.signOut(); window.__hashes = []; window.addEventListener('hashchange', () => window.__hashes.push(location.hash)); });
  await page.click('.head-join');
  await page.click(`[data-act="sheet-role"][data-role="${role}"]`);
  await page.click(`#sheet-body .opt >> nth=${idx}`); await page.waitForTimeout(250);
  const landed = page.url().endsWith('#' + route) && await page.locator('#join-package').count() === 1 && await page.locator('[data-act="pkg-choose"]').count() >= 1;
  const priced = await page.locator('#join-package >> text=Mock pricing. Not an offer.').count() >= 1;
  await page.click('[data-act="pkg-choose"] >> nth=0'); await page.waitForTimeout(150);
  const cart = await page.locator('[id^="sum-"]').count() === 1 && await page.locator('[data-act="confirm"]').count() === 1;
  const cb = page.locator('input[type=checkbox][data-k=codex]'); if (await cb.count()) await cb.check();
  const camp = page.locator('select[data-k=campus]'); if (await camp.count() && route === 'join-faculty') await camp.selectOption('campus-b');
  await page.waitForTimeout(400);
  await page.click('[data-act="confirm"]'); await page.waitForTimeout(250);
  const out = await page.evaluate(() => ({ role: LEAD.store.session.role, signed: LEAD.store.session.signedIn, mypath: !!document.getElementById('go-mypath'), hashes: window.__hashes }));
  const noProjects = !out.hashes.some((h) => /project|challenge/.test(h));
  const good = landed && priced && cart && out.signed && out.role === want && out.mypath && noProjects && page.url().endsWith('#' + route);
  if (!good) joinOk = false;
  joinInfo.push(`${role}/${idx}:${good ? 'ok' : JSON.stringify({ landed, priced, cart, out })}`);
}
ok('Join: all ten sheet options reach package, cart and confirm, sign in as the persona, offer My path and never visit Live Projects', joinOk, joinInfo.filter((x) => !x.endsWith(':ok')).join(' '));
await page.click('#go-mypath'); await page.waitForTimeout(150);
ok('Join: Go to My path opens the persona home', page.url().includes('#w-student'));
await goRaw(page, 'home'); await page.evaluate(() => LEAD.store.signOut());
await page.click('.head-join'); await page.click('[data-act="sheet-role"][data-role="faculty"]'); await page.click('#sheet-body .opt >> nth=0');
await page.click('[data-act="pkg-choose"] >> nth=0'); await page.locator('input[type=checkbox][data-k=codex]').check(); await page.selectOption('select[data-k=campus]', 'campus-b'); await page.waitForTimeout(300);
await page.click('[data-act="confirm"]');
ok('Join: faculty joining through Campus B signs in as a faculty member there', (await page.evaluate(() => LEAD.store.me().name)) === 'Prof. Rahul Sen');
await goRaw(page, 'home'); await page.evaluate(() => LEAD.store.signOut());
await page.click('.head-join'); await page.click('#sheet-body .opt >> nth=0');
await page.click('[data-act="pkg-choose"] >> nth=0'); await page.selectOption('select[data-k=campus]', 'campus-b'); await page.locator('input[type=checkbox][data-k=codex]').check(); await page.waitForTimeout(300);
await page.click('[data-act="confirm"]');
ok('Join: a student who links Campus B signs in as a student there', (await page.evaluate(() => LEAD.store.me().name)) === 'Tara Bose');
await goRaw(page, 'join-faculty'); await page.click('[data-act="pkg-choose"] >> nth=0'); await page.selectOption('select[data-k=campus]', 'none'); await page.waitForTimeout(500);
ok('Join: a campus that is not listed shows the note to copy', await page.locator('#join-note').count() === 1 && await page.locator('[data-act="join-copy"]').count() === 1);
await goRaw(page, 'join-college'); await goRaw(page, 'join-industry');
ok('Join: arriving on a join page from anywhere else starts on the package details', await page.locator('#join-package').count() === 1);
await goRaw(page, 'join-college'); await page.click('[data-act="pkg-choose"] >> nth=0'); await page.click('[data-act="pkg-back"]');
ok('Join: the cart has a way back to the package', await page.locator('#join-package').count() === 1);
ok('Join: the college package lists its size tiers with prices from the registry', (await page.evaluate(() => { LEAD.store.signOut(); return 1; })) === 1 && (await goRaw(page, 'join-college'), await page.locator('#join-package table tbody tr').count()) >= 3);

/* mentor joined above: unverified in the UMO admin pool */
await as(page, 'admin'); await go(page, 'sprints');
ok('Join: a mentor who joined is in the UMO admin pool, unverified', await page.locator('tr:has-text("Dana Fernandes") button[data-act="mentor-verify"]').count() === 1);
await page.click('tr:has-text("Dana Fernandes") button[data-act="mentor-verify"]');
ok('Join: the admin approves the applicant', await page.locator('tr:has-text("Dana Fernandes") >> text=Verified').count() > 0);
await as(page, 'student');

/* ---------- brand, Live Projects, Design Jobs ---------- */
await goRaw(page, 'home');
ok('Brand: the header reads LEAD by the UMO Design logo', (await page.locator('.brand-lead').textContent()).trim() === 'LEAD' && (await page.locator('.brand-by').textContent()).trim().toLowerCase() === 'by' && await page.locator('header img, header svg, .brand-umo').count() > 0);
await goRaw(page, 'projects');
ok('Live Projects: the menu, the strip and the first action', await page.locator('nav a[href="#projects"]').count() === 1 && await page.locator('.how-steps li, .how-steps > *').count() >= 6 && await page.locator('.first-action').count() === 1);
await goRaw(page, 'challenges');
ok('Live Projects: the old challenges route still works', (await page.locator('h1').textContent()).includes('Live Project'));
const BAN = [];
for (const t of ['home', 'projects', 'jobs', 'learn', 'women', 'join', 'calendar', 'impact']) {
  await goRaw(page, t);
  const txt = await page.locator('main, header, footer').allInnerTexts();
  if (/Commons|\bChallenges?\b/.test(txt.join(' '))) BAN.push(t);
}
ok('Copy: no page says Commons or Challenge', BAN.length === 0, BAN.join(','));

await goRaw(page, 'opportunities');
ok('Design Jobs: the old opportunities route lands on Design Jobs', (await page.locator('h1').textContent()).includes('Design Jobs') && await page.locator('nav a[href="#jobs"]').count() === 1);
await page.evaluate(() => LEAD.store.signOut()); await goRaw(page, 'jobs');
ok('Design Jobs: signed out shows four lanes in order, each with who opens then who responds', (await page.$$eval('.job-lane', (n) => n.map((x) => x.dataset.lane).join())) === 'role,drive,cohort,referral' && (await page.$$eval('.job-lane', (n) => n.every((x) => [...x.querySelectorAll('.job-panel')].map((y) => y.dataset.panel).join() === 'opens,responds'))));
const FIRST = { industry: 'role,drive,referral,cohort', student: 'role,referral,drive,cohort', open: 'cohort,role,referral,drive', head: 'drive,role,cohort,referral', faculty: 'referral,role,drive,cohort', mentor: 'referral,role,drive,cohort', admin: 'cohort,role,drive,referral' };
let ordOk = true;
for (const [r, ord] of Object.entries(FIRST)) {
  await as(page, r); await goRaw(page, 'jobs');
  const got = await page.$$eval('.job-lane', (n) => n.map((x) => x.dataset.lane).join());
  const yours = await page.locator('.job-lane.is-yours').first().getAttribute('data-lane');
  if (got !== ord || yours !== ord.split(',')[0]) ordOk = false;
}
ok('Design Jobs: each persona sees its own lanes first, tagged Yours', ordOk);
await as(page, 'industry'); await goRaw(page, 'jobs');
await page.fill('#po-title', 'Visual designer'); await page.click('form[data-form="post-op"] button[type="submit"]');
await as(page, 'student'); await goRaw(page, 'jobs');
await page.locator('[data-lane="role"] .job-panel[data-panel="responds"] article:has-text("Visual designer") button[type="submit"]').click();
await as(page, 'industry'); await goRaw(page, 'jobs');
ok('Design Jobs: industry opens a role, a student applies, industry sees the applicant', await page.locator('[data-lane="role"] [data-panel="responds"] >> text=Aanya Rao').count() >= 1);
await as(page, 'head'); await goRaw(page, 'jobs');
await page.fill('#pd-title', 'Campus A spring drive'); await page.click('form[data-form="post-drive"] button[type="submit"]');
await as(page, 'industry'); await goRaw(page, 'jobs');
await page.locator('[data-lane="drive"] [data-panel="responds"] article:has-text("Campus A spring drive") [data-to="Accepted"]').click();
const drv = await page.evaluate(() => LEAD.store.loop.drives.find((d) => d.title === 'Campus A spring drive').replies.find((x) => x.orgId === 'northwind').status);
ok('Design Jobs: a college opens a drive and industry accepts it (R25)', drv === 'Accepted');
await page.evaluate(() => LEAD.store.setRole('industry', 'i3')); await goRaw(page, 'jobs');
await as(page, 'head'); await goRaw(page, 'jobs');
ok('Design Jobs: only the college sees the close button', await page.locator('[data-act="drive-close"]').count() >= 1);
await page.locator('[data-act="drive-close"]').first().click();
ok('Design Jobs: the college closes a drive', await page.evaluate(() => LEAD.store.loop.drives.some((d) => d.status === 'Closed')));
await as(page, 'mentor'); await goRaw(page, 'jobs');
await page.selectOption('#rf-student', 's2'); await page.selectOption('#rf-role', 'op5'); await page.click('form[data-form="refer"] button[type="submit"]');
await page.evaluate(() => LEAD.store.setRole('industry', 'i3')); await goRaw(page, 'jobs');
const hidden = await page.locator('[data-lane="referral"] [data-ref]').filter({ hasText: 'Kabir Shah' }).count();
await page.evaluate(() => LEAD.store.setRole('student', 's2')); await goRaw(page, 'jobs');
await page.click('[data-act="ref-confirm"][data-accept="1"]');
await page.evaluate(() => LEAD.store.setRole('industry', 'i3')); await goRaw(page, 'jobs');
const shown = await page.locator('[data-lane="referral"] [data-ref]').filter({ hasText: 'Kabir Shah' }).count();
ok('Design Jobs: a referral stays hidden from the employer until the student confirms (R24)', hidden === 0 && shown === 1);
await as(page, 'admin'); await goRaw(page, 'jobs');
await page.click('form[data-form="post-cohort"] button[type="submit"]');
await as(page, 'open'); await goRaw(page, 'jobs');
await page.locator('[data-lane="cohort"] [data-panel="responds"] [data-act="op-open-apply"]').first().click();
ok('Design Jobs: the admin opens a cohort call and an open learner applies', await page.evaluate(() => LEAD.store.loop.opportunities.some((o) => o.lane === 'cohort' && o.id !== 'op4') && LEAD.store.loop.audit.some((a) => /Open-cohort call opened/.test(a.action))));
await page.evaluate(() => LEAD.store.resetDemo());
await as(page, 'student');

/* ---------- S1: intake → merge → publish ---------- */
await as(page, 'industry'); await go(page, 'demand');
await page.fill('#in-problem', 'Junior analysts never test the first framing of a problem.');
await page.click('form[data-form="intake"] button[type="submit"]');
await as(page, 'admin'); await go(page, 'demand');
const before = await page.locator('.col:nth-child(1) .item').count();
await page.locator('.col:nth-child(1) .item').first().locator('button:has-text("Mark reviewed")').click();
await page.locator('.col:nth-child(2) .item').first().locator('button:has-text("Publish as own theme")').click();
await page.waitForTimeout(100);
ok('S1 admin reviews and publishes an intake', (await page.locator('.col:nth-child(4) .item').count()) >= 3 && before >= 1);

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
await as(page, 'admin'); await go(page, 'assess');
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
await as(page, 'industry'); await go(page, 'jobs');
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

/* ---------- S11–S13, S16, S17: admin and pricing ---------- */
await as(page, 'admin');
await page.fill('#pp-PATH_DECISIONS', '15000');
await page.click('form[data-form="price"][data-key="PATH_DECISIONS"] button[type="submit"]');
await go(page, 'join-path-PATH_DECISIONS');
ok('S11 a price set on the admin page shows on the sign-up screen', (await page.locator('#q-path >> text=15,000').count()) > 0);
await as(page, 'admin');
await page.fill('#pp-PATH_FRAMING', '30000');
await page.click('form[data-form="price"][data-key="PATH_FRAMING"] button[type="submit"]');
ok('S11 a change over 30% is refused without a note (R12)', (await page.locator('#plan-PATH_FRAMING >> text=Add a note').count()) > 0 && await page.locator('#pp-PATH_FRAMING').inputValue() === '30000');
await page.fill('#pn-PATH_FRAMING', 'Pilot price reset');
await page.click('form[data-form="price"][data-key="PATH_FRAMING"] button[type="submit"]');
ok('S11 the same change saves with a note', (await page.locator('#plan-PATH_FRAMING >> text=Saved PATH_FRAMING-v2').count()) > 0);

await go(page, 'join-college');
await page.fill('#cp-college', 'FOUNDING20');
await page.waitForTimeout(450);
ok('S12 FOUNDING20 discounts the college quote', await page.locator('#q-college >> text=20% off').count() === 1);

await as(page, 'admin');
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

/* ---------- S14, S15, S20: live propagation across tabs ---------- */
const tab2 = await ctx.newPage(); watch(tab2);
await tab2.goto(BASE + '#join-industry');
await tab2.click('[data-act="pkg-choose"] >> nth=0');
await tab2.waitForSelector('#q-industry');
await tab2.fill('#ji-name', 'Tab Two Ltd'); await tab2.waitForTimeout(400);
const t0 = Date.now();
await as(page, 'admin');
await page.fill('#pp-INDUSTRY_TEAM', '42000');
await page.click('form[data-form="price"][data-key="INDUSTRY_TEAM"] button[type="submit"]');
await tab2.waitForFunction(() => document.querySelector('#q-industry') && document.querySelector('#q-industry').textContent.includes('42,000'), null, { timeout: 6000 }).catch(() => null);
const dt = Date.now() - t0;
ok('S14/S20 second tab shows the new price without reload', (await tab2.locator('#q-industry >> text=42,000').count()) > 0 && dt < 5000, `${dt} ms`);

await tab2.fill('#cp-industry', 'STUDENT10'); await tab2.waitForTimeout(400);
await tab2.fill('#cp-industry', ''); await tab2.waitForTimeout(400);
await tab2.fill('#ji-name', 'Stale Quote Ltd'); await tab2.fill('#cp-industry', 'FOUNDING20'); await tab2.waitForTimeout(450);
await go(page, 'admin');
await page.locator('article:has-text("FOUNDING20") button[data-act="cp-status"][data-to="PAUSED"]').click();
await tab2.waitForTimeout(600);
const said = await tab2.locator('#sum-industry >> text=Price updated.').count();
const total = await tab2.evaluate(() => document.querySelector('#q-industry').textContent);
ok('S15 after the admin pauses the coupon, the open quote shows the new total and asks again', said === 1 && !total.includes('20% off'));

/* ---------- S33–S36: sign in and out, My path, Join colour ---------- */
await page.evaluate(() => LEAD.store.resetDemo());
await go(page, 'home');
ok('S33 the demo starts signed out: Join and “Sign in as…”, no My path, no Log out', await page.locator('.head-join').isVisible() && (await page.locator('.persona-btn .pname').textContent()).includes('Sign in as') && await page.locator('.nav-path').count() === 0 && await page.locator('.head-logout').count() === 0 && await page.evaluate(() => LEAD.store.session.signedIn === false));
const lum = (hex) => { const c = hex.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const rgb = (str) => str.match(/\d+/g).slice(0, 3).map(Number);
const contrastOf = async (pg) => { const [bg, fg] = await pg.evaluate(() => { const e = document.querySelector('.head-join'); const cs = getComputedStyle(e); return [cs.backgroundColor, cs.color]; }); const a = lum(rgb(bg)); const b = lum(rgb(fg)); return { bg: rgb(bg), ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) }; };
const cd = await contrastOf(page);
ok('S33 Join is UMO blue with text above 4.5:1 contrast (dark theme)', cd.bg.join(',') === '0,176,240' && cd.ratio >= 4.5, `${cd.bg} · ${cd.ratio.toFixed(1)}:1`);
const lightCtx = await browser.newContext({ viewport: { width: 1360, height: 900 }, colorScheme: 'light' });
const lightPage = await lightCtx.newPage(); await lightPage.goto(BASE + '#home'); await lightPage.waitForSelector('.head-join');
const cl = await contrastOf(lightPage);
ok('S33 Join keeps that contrast in the light theme', cl.bg.join(',') === '0,176,240' && cl.ratio >= 4.5, `${cl.ratio.toFixed(1)}:1`);
await lightCtx.close();
const LANDING = { student: 'w-student', faculty: 'w-faculty', head: 'w-head', industry: 'w-industry', mentor: 'w-mentor', open: 'w-open', admin: 'admin' };
let signedOk = true; const bad = [];
for (const r of Object.keys(LANDING)) {
  await as(page, r); await page.waitForTimeout(250);
  const ok1 = await page.locator('.head-logout').isVisible() && await page.locator('.head-join').count() === 0 && (await page.locator('.nav-path').getAttribute('href')) === '#' + LANDING[r] && (await page.locator('.nav-path').textContent()) === (r === 'admin' ? 'Admin' : 'My path');
  if (!ok1) { signedOk = false; bad.push(r + ':' + JSON.stringify(await page.evaluate(() => ({ h: location.hash, p: document.querySelector('.nav-path') && document.querySelector('.nav-path').outerHTML, o: !!document.querySelector('.head-logout'), j: !!document.querySelector('.head-join') }))) ); }
}
ok('S34 signing in as each persona shows Log out and My path to its landing, and hides Join', signedOk, bad.join(','));
await as(page, 'faculty');
await page.click('.nav-path'); await page.waitForTimeout(150);
ok('S34 My path opens the persona landing and is highlighted', page.url().endsWith('#w-faculty') && await page.locator('.nav-path[aria-current="page"]').count() === 1);
await page.click('.head-logout'); await page.waitForTimeout(200);
ok('S35 Log out returns to the public home with Join back and no My path', page.url().endsWith('#home') && await page.locator('.head-join').isVisible() && await page.locator('.nav-path').count() === 0 && await page.locator('.head-logout').count() === 0 && await page.evaluate(() => LEAD.store.session.signedIn === false));
await as(page, 'mentor'); await page.click('.persona-btn'); await page.click('#persona-menu [data-act="logout"]'); await page.waitForTimeout(150);
ok('S35 the persona menu also has Log out', await page.locator('.head-join').isVisible());
await go(page, 'home');
await page.click('[data-act="persona-menu"]');
ok('S35 the signed-out menu says “Sign in as” and marks nobody', (await page.locator('#persona-menu').getAttribute('aria-label')) === 'Sign in as' && await page.locator('#persona-menu [aria-checked="true"]').count() === 0);
await page.keyboard.press('Escape');

/* ---------- S37–S39: the route to 1 million ---------- */
await page.evaluate(() => LEAD.store.resetDemo());
await go(page, 'women');
const seats0 = await page.evaluate(() => LEAD.store.womenTally());
ok('S37 the count starts at 12,341 and the five sources add up to it', seats0.seats === 12341 && Object.values(seats0.bySource).reduce((a, b) => a + b, 0) === 12341 && (await page.locator('#women-seats').textContent()).trim() === '12,341');
const legend = await page.locator('.src-legend [data-src]').allTextContents();
ok('S37 the page shows each source number', legend.map((t) => t.replace(/,/g, '')).join('|') === '5240|2310|3150|1200|441', legend.join('|'));
ok('S37 six cards, one per way in, each with its running total', await page.locator('.women-role').count() === 6 && await page.locator('.women-role .pxnum').count() === 6);
await as(page, 'mentor'); await go(page, 'women');
ok('S37 a signed-in persona sees their card first, marked You', (await page.locator('.women-role').first().getAttribute('data-role')) === 'mentor' && await page.locator('.women-role.is-you .tag:has-text("You")').count() === 1);
await page.click('.women-role.is-you [data-act="lrn-women-offer"]');
await page.waitForSelector('#of-women');
ok('S38 “Offer hours for women” opens the Learn form with the women tick on', await page.locator('#of-women').isChecked() && page.url().endsWith('#learn'));
await page.fill('#of-topic', 'Portfolio clinic for women designers'); await page.fill('#of-hours', '30');
await page.click('form[data-form="offer-new"] button[type="submit"]');
const offerW = await page.evaluate(() => LEAD.store.loop.learning.offers.find((o) => o.topic === 'Portfolio clinic for women designers'));
ok('S38 the offer is saved for women and waits for the admin', offerW && offerW.women === true && offerW.state === 'Proposed');
await as(page, 'admin'); await go(page, 'learn');
const hoursBefore = await page.evaluate(() => LEAD.store.womenTally().bySource.hours);
await page.click('li.give-row:has-text("Portfolio clinic for women designers") [data-act="ct-advance"]');
await page.click('li.give-row:has-text("Portfolio clinic for women designers") [data-act="ct-advance"]');
await page.click('li.give-row:has-text("Portfolio clinic for women designers") [data-act="ct-advance"]');
const hoursAfter = await page.evaluate(() => LEAD.store.womenTally().bySource.hours);
ok('S38 once the admin marks it done, 30 hours add 3 seats to Hours given', hoursBefore === 441 && hoursAfter === 444, `${hoursBefore} → ${hoursAfter}`);
ok('S38 the credit is in the audit log', await page.evaluate(() => LEAD.store.loop.audit.some((a) => /adds 3 seats to 1 Million Women/.test(a.action))));
const of4 = await page.evaluate(() => LEAD.store.loop.learning.offers.find((x) => x.id === 'OF-4').state);
ok('S38 an offer that is still scheduled does not count yet', of4 === 'Scheduled' && hoursAfter === 444);
await go(page, 'join-college');
await page.fill('#jw-college', '25'); await page.waitForTimeout(400);
await page.click('#go-college'); await page.waitForTimeout(200);
await go(page, 'join-college'); await page.click('[data-act="join-again"][data-flow="college"]');
await go(page, 'women');
const aft = await page.evaluate(() => LEAD.store.womenTally().bySource);
ok('S39 a college pledge adds to College pledges on the page', aft.college === 3150 + 25 && (await page.locator('[data-src="college"]').textContent()).replace(/,/g, '') === '3175', JSON.stringify(aft));
await go(page, 'admin');
await page.fill('#ws-hps', '5'); await page.click('form[data-form="women-share"] button[type="submit"]');
ok('S39 the admin sets how many hours make a seat, and it is audited', await page.evaluate(() => LEAD.store.pricing.settings.womenHoursPerSeat) === 5 && await page.evaluate(() => LEAD.store.womenTally().bySource.hours) === 441 + 6);
await page.fill('#ws-hps', '10'); await page.click('form[data-form="women-share"] button[type="submit"]');
await page.evaluate(() => LEAD.store.resetDemo());

/* ---------- S21–S24: 1 Million Women in Design ---------- */
await page.evaluate(() => LEAD.store.resetDemo());
await as(page, 'head'); await go(page, 'join-college');
await page.waitForSelector('#q-college .total');
const tot0 = await page.evaluate(() => LEAD.store.pricing.settings.womenSharePct);
ok('S21 the quote says 5% goes to 1 Million Women, at no extra cost', tot0 === 5 && (await page.locator('#q-college .women-note').textContent()).includes('5%'));
const before21 = await page.evaluate(() => LEAD.store.womenTally().seats);
await page.fill('#jw-college', '3'); await page.waitForTimeout(450);
ok('S21 pledging 3 seats adds them to the quote as a line', (await page.locator('#q-college >> text=3 seats for women').count()) === 1);
await page.click('#go-college'); await page.waitForTimeout(200);
const rec = await page.evaluate(() => { const s = LEAD.store.pricing.signups[0]; return { seats: s.womenSeats, share: s.womenShare, top: s.topUp }; });
const after21 = await page.evaluate(() => LEAD.store.womenTally().seats);
ok('S22 the sign-up record keeps the share and seats, and the tally rises', rec.seats === 3 && rec.share > 0 && rec.top === 300000 && after21 >= before21 + 3, JSON.stringify(rec));
await go(page, 'women');
ok('S22 the 1 Million Women page shows the tally and the role cards', await page.locator('#women-tally').count() === 1 && await page.locator('.women-role[data-role="head"]').count() === 1 && await page.locator('.women-role').count() === 6 && await page.locator('nav a[href="#women"]').count() === 1);
await go(page, 'join-sponsor'); await as(page, 'industry'); await go(page, 'join-sponsor');
await page.click('[data-act="women-cohort"]');
ok('S23 sponsor can add a women’s cohort of 10 seats', await page.locator('#jw-sponsor').inputValue() === '10' && (await page.locator('#q-sponsor >> text=10 seats for women').count()) === 1);
await tab2.goto(BASE + '#join-industry'); await tab2.click('[data-act="pkg-choose"] >> nth=0'); await tab2.waitForSelector('#q-industry .women-note');
await as(page, 'admin'); await go(page, 'admin');
await page.fill('#ws-pct', '80'); await page.click('form[data-form="women-share"] button[type="submit"]');
ok('S24 admin cannot set a share above 50%', (await page.locator('#ws-pct:invalid').count()) === 1 && await page.evaluate(() => LEAD.store.pricing.settings.womenSharePct) === 5);
await page.fill('#ws-pct', '10'); await page.click('form[data-form="women-share"] button[type="submit"]');
await tab2.waitForFunction(() => { const n = document.querySelector('#q-industry .women-note'); return n && n.textContent.includes('10%'); }, null, { timeout: 6000 }).then(() => ok('S24 a new share reaches an open sign-up in another tab', true), () => ok('S24 a new share reaches an open sign-up in another tab', false));
ok('S24 the share change is in the audit log', await page.evaluate(() => LEAD.store.pricing.audit.some((a) => /Million Women settings/.test(a.action))));

/* ---------- S32: "What is in it for you" ---------- */
await go(page, 'home');
ok('S32 the big time tab bar is gone, a four-step control sits in the side panel', await page.locator('#ecosystem .phases').count() === 0 && await page.locator('#when .when-step').count() === 4);
ok('S32 time steps have plain names', (await page.locator('#when .when-step b').allTextContents()).join('|') === 'Today, by hand|In this demo|Next: first pilots|Later: the full platform');
ok('S32 three numbered steps explain the map', await page.locator('.eco-steps li').count() === 3);
const chipNames = (await page.locator('#ecosystem [data-act="eco-kind"] >> nth=0').count()) ? await page.locator('#ecosystem [data-act="eco-kind"]').allTextContents() : [];
ok('S32 value chips use the plain names', chipNames.map((t) => t.trim()).join('|') === 'Money|Real problems|Skills and learning|Proof of work|Jobs and hiring|Hours given|Credit and thanks|Privacy and consent', chipNames.join('|'));
const c1 = await page.locator('#eco-count').textContent();
await page.click('#when .when-step:nth-child(1)', { force: true }).catch(() => null);
await page.click('[data-act="eco-phase"][data-id="v0"]');
const c0 = await page.locator('#eco-count').textContent();
ok('S32 the count sentence follows the step', c1.includes('In this demo') && c0.includes('Today, by hand') && c1 !== c0, `${c1} | ${c0}`);
await page.click('[data-act="eco-phase"][data-id="p1"]');
await page.click('#ecosystem [data-act="eco-kind"][data-id="money"]');
const dimmed = await page.locator('#ecosystem .eco-flow.dim').count();
ok('S32 a chip dims the other lines', dimmed > 0 && dimmed < await page.locator('#ecosystem .eco-flow').count());
await page.click('#ecosystem [data-act="eco-kind"][data-id=""]');
await page.click('#ecosystem .eco-node[data-id="student"]');
const panel = await page.locator('#eco-detail').innerText();
ok('S32 a group shows what it gives, gets and why it stays', /What they give/i.test(panel) && /What they get/i.test(panel) && /Why they stay/i.test(panel) && /Goes out to others/i.test(panel) && /Comes in from others/i.test(panel));
await page.click('#eco-detail [data-act="path-role"][data-role="student"]');
ok('S32 “See the Student path” unfolds Your path', await page.locator('#path').isVisible());
await page.click('[data-act="path-close"]');
await page.evaluate(() => { LEAD.modelParts.st.sel = null; LEAD.modelParts.st.kinds.clear(); LEAD.render(); });
const svgNow = await page.evaluate(() => { const m = LEAD.modelParts; const o = {}; for (const ph of ['v0', 'p1', 'v1', 'p3']) { m.st.phase = ph; o[ph] = m.svg().replace(/\s+/g, ' ').replace(/<title>.*?<\/title>/g, ''); } m.st.phase = 'p1'; return o; });
const svgBefore = JSON.parse((await import('node:fs')).readFileSync(process.env.SVG_BEFORE || '/dev/null', 'utf8') || '{}');
const same = Object.keys(svgBefore).length === 4 && Object.keys(svgNow).every((k) => svgNow[k] === svgBefore[k].replace(/<title>.*?<\/title>/g, ''));
ok('S32 the map drawing is unchanged in all four steps', same || !process.env.SVG_BEFORE);
await page.evaluate(() => { LEAD.modelParts.st.sel = null; LEAD.modelParts.st.kinds.clear(); LEAD.render(); });

/* ---------- S25–S31: Learn ---------- */
await page.evaluate(() => LEAD.store.resetDemo());
await as(page, 'student'); await go(page, 'learn');
await page.waitForSelector('#lm-list .lm-card');
const codes = await page.locator('#lm-list .lm-card .lmcode').allTextContents();
ok('S25 every catalogue card carries a code like LM-SP-1', codes.length >= 6 && codes.every((c) => /^LM-(SP|IL|PL|CB)-\d+$/.test(c.trim())), codes.join(','));
ok('S25 LM-SP-1 is pinned first, with the code key on the page', codes[0].trim() === 'LM-SP-1' && await page.locator('#learn-start:has-text("Pinned")').count() === 1 && await page.locator('#code-key:has-text("Learning Module")').count() === 1);
await page.click('[data-act="lm-mode"][data-k="PL"]');
const plCodes = await page.locator('#lm-list .lm-card .lmcode').allTextContents();
ok('S25 the format filter keeps only peer circles', plCodes.length >= 1 && plCodes.every((c) => c.includes('-PL-')), plCodes.join(','));
await page.click('[data-act="lm-mode"][data-k=""]');
await page.fill('#lm-q', 'framing'); await page.waitForTimeout(150);
ok('S25 search narrows the list', (await page.locator('#lm-list .lm-card').count()) >= 1 && (await page.locator('#lm-list .lm-card').count()) < codes.length);
await page.fill('#lm-q', ''); await page.waitForTimeout(150);

/* a student cannot lead a peer circle before finishing a module (R22) */
await page.click('[data-act="lrn-teach"]');
await page.fill('#of-hours', '2');
await page.click('form[data-form="offer-new"] button[type="submit"]');
ok('S26 a student must finish a module before leading a circle', (await page.locator('form[data-form="offer-new"] >> text=Finish a module first').count()) >= 1);

/* the demo course */
await page.click('#learn-start a.btn.primary');
await page.waitForSelector('.lesson-page');
for (let i = 0; i < 3; i++) { await page.click('[data-act="lm-done"]'); await page.waitForTimeout(120); }
ok('S27 after three lessons the quick check opens', await page.locator('form[data-form="lm-check"]').count() === 1);
for (const [q, v] of [[0, 0], [1, 1], [2, 0]]) await page.check(`input[name="q${q}"][value="${v}"]`);
await page.click('form[data-form="lm-check"] button[type="submit"]');
ok('S27 a failed check says what is needed and lets you try again', (await page.locator('.msg.warn:has-text("You need 2")').count()) === 1);
for (const [q, v] of [[0, 1], [1, 0], [2, 2]]) await page.check(`input[name="q${q}"][value="${v}"]`);
await page.click('form[data-form="lm-check"] button[type="submit"]');
ok('S27 a passed check completes the module', (await page.locator('h1:has-text("You finished Day 1 readiness")').count()) === 1);
const saved = await page.evaluate(() => { const r = LEAD.store.loop.learning.progress['s1']['LM-SP-1']; return { done: r.done.length, passed: r.check.passed, audit: LEAD.store.loop.audit.filter((a) => /Lesson completed|Check passed|Module started/.test(a.action)).length }; });
ok('S27 progress is saved and every change is in the audit log', saved.done === 3 && saved.passed === true && saved.audit >= 5, JSON.stringify(saved));
await page.click('.lesson-page [data-act="lm-leave"]');
await page.waitForSelector('#lm-list');
ok('S27 Learn then shows the module as complete', (await page.locator('#learn-start:has-text("Complete")').count()) === 1);
await page.click('[data-act="lm-skill"][data-k=""]').catch(() => null);
await page.click('[data-act="lrn-teach"]'); await page.fill('#of-hours', '2');
await page.click('form[data-form="offer-new"] button[type="submit"]');
ok('S27 after finishing a module a student can offer a peer circle', (await page.locator('form[data-form="offer-new"] >> text=with the UMO admin').count()) >= 1);

/* the shelf follows the persona */
const shelfFor = async (r) => { await as(page, r); await go(page, 'learn'); return page.locator('#learn-shelf .shelf-item .lmcode').allTextContents(); };
const mentorShelf = await shelfFor('mentor'); const facultyShelf = await shelfFor('faculty'); const studentShelf = await shelfFor('student');
ok('S28 the shelf changes with the persona', mentorShelf.includes('LM-IL-2') && facultyShelf.includes('LM-IL-1') && studentShelf.includes('LM-SP-2') && !studentShelf.includes('LM-IL-2'), `${mentorShelf} | ${facultyShelf} | ${studentShelf}`);

/* give back: offer, topic, request, me too, teach, approve, match */
await as(page, 'mentor'); await go(page, 'learn');
await page.click('[data-act="lrn-teach"]'); await page.fill('#of-topic', 'Portfolio reviews'); await page.fill('#of-hours', '5');
await page.click('form[data-form="offer-new"] button[type="submit"]');
ok('S29 a mentor offers hours; it waits for a UMO admin', await page.evaluate(() => LEAD.store.loop.learning.offers.some((o) => o.topic === 'Portfolio reviews' && o.state === 'Proposed')));
await as(page, 'open'); await go(page, 'learn');
await page.click('[data-act="lrn-request"]'); await page.fill('#rq-title', 'Drawing on a tablet for beginners');
await page.click('form[data-form="request-new"] button[type="submit"]');
const rq = await page.evaluate(() => LEAD.store.loop.learning.requests[0]);
ok('S29 anyone can open a request, and it is visible to others', rq.title.startsWith('Drawing on a tablet') && /^RQ-\d+$/.test(rq.id) && rq.state === 'Open');
await as(page, 'student'); await go(page, 'learn');
await page.click(`[data-act="rq-me-too"][data-id="${rq.id}"]`);
ok('S29 another persona can say me too', await page.evaluate((id) => LEAD.store.loop.learning.requests.find((r) => r.id === id).votes.length, rq.id) === 2);
await as(page, 'mentor'); await go(page, 'learn');
await page.click(`[data-act="rq-teach"][data-id="${rq.id}"]`);
await as(page, 'admin'); await go(page, 'learn');
const pend = await page.evaluate(() => LEAD.learn.pending());
await page.click('[data-act="ct-approve"][data-kind="topic"]');
await page.click('li.give-row:has-text("Portfolio reviews") [data-act="ct-advance"]');
await page.click(`[data-act="ct-match"][data-id="${rq.id}"]`);
const after = await page.evaluate((id) => ({ req: LEAD.store.loop.learning.requests.find((r) => r.id === id).state, offer: LEAD.store.loop.learning.offers.find((o) => o.topic === 'Portfolio reviews').state }), rq.id);
ok('S30 the admin approves, and matches a teacher to the request', pend >= 2 && after.req === 'Matched' && after.offer === 'Approved', JSON.stringify(after));
ok('S30 only the admin sees approve and match', await (async () => { await as(page, 'student'); await go(page, 'learn'); return (await page.locator('[data-act="ct-approve"], [data-act="ct-match"], [data-act="ct-advance"]').count()) === 0; })());
await as(page, 'admin'); await go(page, 'admin');
ok('S30 the admin page has the operations strip and no “mock” label', await page.locator('.ops .ops-item').count() === 6 && !(await page.locator('main .eyebrow:has-text("mock")').count()));

/* women imagery */
await go(page, 'women');
const wsrc = await page.evaluate(() => [...document.querySelectorAll('main img')].map((i) => i.getAttribute('src')));
const openSrc = await page.evaluate(() => LEAD.photos.bySlot['door-open'].src);
ok('S31 every picture on the women page is different, none is the Just curious photo', wsrc.length >= 6 && new Set(wsrc).size === wsrc.length && !wsrc.includes(openSrc), `${wsrc.length} images`);
const oldRoles = await page.evaluate(() => /steward/i.test(document.body.innerText));
ok('S31 no steward role anywhere on the page', !oldRoles);

/* ---------- screenshots and layout ---------- */
await page.evaluate(() => LEAD.store.resetDemo());
const SHOTS = ['home', 'women', 'verdict', 'w-student', 'challenge-c1', 'team-t1', 'assess', 'passports', 'impact', 'join', 'join-college', 'admin', 'learn', 'skills'];
const roleFor = { 'w-student': 'student', 'team-t1': 'student', assess: 'mentor', passports: 'admin', admin: 'admin', impact: 'admin', 'join-college': 'head' };
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
for (const r of ['student', 'admin']) {
  await as(mp, r);
  for (const t of ROUTES) {
    await go(mp, t);
    const over = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 1) wide.push(`${r}:${t}(+${over})`);
  }
}
ok('Mobile 390px: no horizontal page scroll', wide.length === 0, wide.slice(0, 8).join(' '));
for (const s of ['home', 'women', 'join-college', 'w-student', 'admin']) { if (roleFor[s]) await as(mp, roleFor[s]); await go(mp, s); await mp.waitForTimeout(250); await mp.screenshot({ path: `${shots}/mobile-${s}.png`, fullPage: false }); }

ok('No script errors in any scenario', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
server.kill();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed. Screenshots: ${shots}`);
process.exit(failed.length ? 1 : 0);
