#!/usr/bin/env node
// One comparison of the built site against the approved reference page (RN-020).
//   node scripts/compare-reference.mjs --reference <reference.html> --out <output dir> [--site <dist dir>]
// The reference file is kept outside this repository. Both pages are opened with ?freeze=1 (the reference's own
// deterministic mode: time 0, seeded random, no smoothing, no mouse). Uses the installed Chrome (no browser download).
// 1. Text: every text node (without script/style/title), whitespace-normalised, must be identical.
// 2. Screenshots at 1440x900 and 390x844 at fixed scroll points; per-shot pixel difference with side-by-side images.
import http from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, a) => (i % 2 === 0 ? [...acc, [v.replace(/^--/, ''), a[i + 1]]] : acc), []),
);
if (!args.reference || !args.out) {
  console.error('usage: compare-reference.mjs --reference <reference.html> --out <dir> [--site <dist dir>]');
  process.exit(2);
}
const reference = resolve(args.reference);
const out = resolve(args.out);
const site = resolve(args.site ?? join(here, '..', 'dist'));
if (!existsSync(join(site, 'index.html'))) throw new Error(`no build found in ${site}; run the build first`);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.json': 'application/json',
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = normalize(join(site, p));
  if (!file.startsWith(site) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '390x844', width: 390, height: 844 },
];

// Reads the text nodes and the layout anchors of a page.
const probe = () => {
  const skip = new Set(['SCRIPT', 'STYLE', 'TITLE', 'NOSCRIPT']);
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const texts = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (skip.has(n.parentElement?.tagName)) continue;
    const t = n.textContent.replace(/\s+/g, ' ').trim();
    if (t) texts.push(t);
  }
  const top = (el) => (el ? el.getBoundingClientRect().top + window.scrollY : null);
  const box = (el) => (el ? { top: top(el), height: el.getBoundingClientRect().height } : null);
  const sec = (id) => document.getElementById(id)?.closest('section');
  return {
    texts,
    fontsOk: ['800 20px Rubik', '600 20px "Open Sans"', '400 20px "Frank Ruhl Libre"'].map((f) => document.fonts.check(f)),
    anchors: {
      about: top(document.getElementById('about')),
      achievements: box(document.getElementById('achievements')),
      domains: top(document.getElementById('domains')),
      projects: top(document.getElementById('projects')),
      path: top(document.getElementById('path')),
      articles: top(document.getElementById('articles')),
      cvA: box(sec('cv-a')),
      cvB: box(sec('cv-b')),
      cvC: box(sec('cv-c')),
      docHeight: document.documentElement.scrollHeight,
    },
  };
};

function shotPoints(info, vh) {
  const a = info.anchors;
  const centre = (b) => Math.max(0, b.top - (vh - b.height) / 2);
  const pts = [['01-top', 0], ['02-about', a.about], ['03-interlude-a', centre(a.cvA)]];
  const ach = a.achievements;
  const run = ach.height - vh;
  const stages = [['04-cube-intact', 0.0], ...[0, 1, 2, 3].map((g) => [`0${5 + g}-cube-group-${g + 1}`, 0.06 + ((g + 0.5) / 4) * 0.86]), ['09-cube-end', 0.99]];
  for (const [name, p] of stages) pts.push([name, ach.top + p * run]);
  pts.push(['10-domains', a.domains], ['11-projects', a.projects], ['12-interlude-b', centre(a.cvB)], ['13-path', a.path],
    ['14-articles', a.articles], ['15-interlude-c', centre(a.cvC)], ['16-footer', a.docHeight]);
  return pts;
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function shoot(page, y, file) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(700); // the IntersectionObserver starts the loop; freeze mode needs no smoothing time
  await page.screenshot({ path: file });
}

function sideBySide(ref, site, diff) {
  const w = ref.width, h = ref.height, gap = 8;
  const o = new PNG({ width: w * 3 + gap * 2, height: h });
  o.data.fill(255);
  [ref, site, diff].forEach((img, i) => PNG.bitblt(img, o, 0, 0, w, h, i * (w + gap), 0));
  return PNG.sync.write(o);
}

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const report = { reference, site, viewports: {}, text: null };
try {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    const refPage = await ctx.newPage();
    const sitePage = await ctx.newPage();
    const consoleErrors = [];
    sitePage.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    sitePage.on('pageerror', (e) => consoleErrors.push(String(e)));
    await refPage.goto(`${pathToFileURL(reference).href}?freeze=1`, { waitUntil: 'load' });
    await sitePage.goto(`${base}/?freeze=1`, { waitUntil: 'load' });
    await settle(refPage);
    await settle(sitePage);
    const [ri, si] = [await refPage.evaluate(probe), await sitePage.evaluate(probe)];
    if (!ri.fontsOk.every(Boolean) || !si.fontsOk.every(Boolean)) {
      console.warn(`warning: fonts not all loaded (reference ${ri.fontsOk}, site ${si.fontsOk})`);
    }
    if (!report.text) {
      const a = ri.texts, b = si.texts;
      const diffs = [];
      for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) diffs.push({ index: i, reference: a[i] ?? null, site: b[i] ?? null });
      report.text = { referenceNodes: a.length, siteNodes: b.length, identical: diffs.length === 0, differences: diffs.slice(0, 20) };
    }
    const dir = join(out, vp.name);
    mkdirSync(dir, { recursive: true });
    const shots = [];
    const points = shotPoints(ri, vp.height);
    const sitePoints = shotPoints(si, vp.height);
    for (let i = 0; i < points.length; i++) {
      const [name, y] = points[i];
      const ysite = sitePoints[i][1];
      await shoot(refPage, y, join(dir, `${name}.ref.png`));
      await shoot(sitePage, ysite, join(dir, `${name}.site.png`));
      const A = PNG.sync.read(readFileSync(join(dir, `${name}.ref.png`)));
      const B = PNG.sync.read(readFileSync(join(dir, `${name}.site.png`)));
      const D = new PNG({ width: A.width, height: A.height });
      const diffPx = A.width === B.width && A.height === B.height ? pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: 0.1 }) : -1;
      writeFileSync(join(dir, `${name}.sbs.png`), sideBySide(A, B, D));
      shots.push({ name, refY: Math.round(y), siteY: Math.round(ysite), diffPixels: diffPx, diffPercent: diffPx < 0 ? null : +((diffPx / (A.width * A.height)) * 100).toFixed(3) });
    }
    report.viewports[vp.name] = { shots, consoleErrorsOnSite: consoleErrors, pageHeight: { reference: ri.anchors.docHeight, site: si.anchors.docHeight } };
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
const lines = [`# Comparison report`, '', `Text: ${report.text.identical ? 'IDENTICAL' : 'DIFFERENT'} (${report.text.referenceNodes} reference nodes, ${report.text.siteNodes} site nodes)`, ''];
for (const [vp, v] of Object.entries(report.viewports)) {
  lines.push(`## ${vp}  (page height: reference ${v.pageHeight.reference}, site ${v.pageHeight.site}; console errors on site: ${v.consoleErrorsOnSite.length})`, '', '| shot | diff % |', '|---|---|');
  for (const s of v.shots) lines.push(`| ${s.name} | ${s.diffPercent ?? 'size mismatch'} |`);
  lines.push('');
}
writeFileSync(join(out, 'report.md'), lines.join('\n'));
console.log(lines.join('\n'));
if (!report.text.identical) console.log('TEXT DIFFERENCES:', JSON.stringify(report.text.differences, null, 2));
