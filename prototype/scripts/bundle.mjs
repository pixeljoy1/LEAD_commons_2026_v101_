/* Bundles prototype/index.html into one self-contained HTML file for publishing as an Artifact.
 * Inlines styles.css, every local <script src>, and the brand logos as data URIs.
 * Output has no <!doctype>/<html>/<head>/<body> wrapper: the Artifact host adds its own.
 * Usage: node prototype/scripts/bundle.mjs [outFile]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const proto = resolve(here, '..');
const out = resolve(process.argv[2] || join(proto, 'dist', 'lead-commons.html'));

let html = readFileSync(join(proto, 'index.html'), 'utf8');
const css = readFileSync(join(proto, 'styles.css'), 'utf8');

const logo = (f) => `data:image/png;base64,${readFileSync(join(proto, '..', 'public', 'brand', f)).toString('base64')}`;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
let js = scripts.map((src) => `/* ${src} */\n${readFileSync(join(proto, src), 'utf8')}`).join('\n');
js = js.replaceAll('../public/brand/UMO_logo.png', logo('UMO_logo.png')).replaceAll('../public/brand/UXINDIA_logo.png', logo('UXINDIA_logo.png'));
if (js.includes('</script')) throw new Error('A script contains a closing script tag.');

const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>\s*/, '')
  .replace(/<meta name="viewport"[^>]*>\s*/, '')
  .replace('<link rel="stylesheet" href="styles.css">', `<style>\n${css}\n</style>`);
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1]
  .replace(/\s*<script src="[^"]+"><\/script>/g, '')
  .trim();

const page = `${head.trim()}\n${body}\n<script>\n${js}\n</script>\n`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page);
console.log(`Wrote ${out} (${(page.length / 1024).toFixed(0)} KB, ${scripts.length} scripts inlined)`);
