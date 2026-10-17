import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const script = join(root, 'scripts', 'check-allowlist.mjs');
const realRules = join(root, 'scripts', 'forbidden.txt');

// Forbidden samples are assembled at run time so this file contains none of them literally
// and needs no exemption from the content scan.
const EMAIL = ['some', 'one', '@', 'gmail', '.com'].join('');
const MOBILE = ['054', '-', '123', '-', '4567'].join('');
const VOIP = ['077', '-', '123', '-', '4567'].join('');
const LANDLINE = ['03', '-', '123', '-', '4567'].join('');
const INTL = ['+972', '-', '54', '-', '123', '-', '4567'].join('');
const TOWN_EN = ['Ga', 'nei'].join('');
const TOWN_EN_FULL = `${TOWN_EN} Tikva`;
const TOWN_HE_FULL = ['גני', 'תקווה'].join(' ');
const PLACEHOLDER = ['[', 'email', ']'].join('');

function git(dir, ...args) {
  const r = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
}

function makeRepo(files) {
  const dir = mkdtempSync(join(tmpdir(), 'allowlist-test-'));
  git(dir, 'init', '-q', '-b', 'main');
  for (const [name, content] of Object.entries(files)) {
    const full = join(dir, name);
    mkdirSync(dirname(full), { recursive: true });
    if (typeof content === 'string') writeFileSync(full, content, 'utf8');
    else writeFileSync(full, content); // raw bytes, e.g. UTF-16
    git(dir, 'add', '--', name);
  }
  return dir;
}

const utf16le = (s) => Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(s, 'utf16le')]);
const utf16leNoBom = (s) => Buffer.from(s, 'utf16le');
const utf16be = (s) => {
  const le = Buffer.from(s, 'utf16le');
  le.swap16();
  return Buffer.concat([Buffer.from([0xfe, 0xff]), le]);
};

function exec(args) {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}` };
}

// Explicit mode: allowlist and rules passed as files outside the repository.
function run(files, allowlist) {
  const dir = makeRepo(files);
  try {
    const listFile = join(dir, '.test-allowlist');
    writeFileSync(listFile, allowlist, 'utf8');
    return exec(['--repo', dir, '--allowlist', listFile, '--forbidden', realRules]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Default mode: allowlist.txt and scripts/forbidden.txt come from the repository itself (its index).
function runDefault(files, mutate) {
  const dir = makeRepo({ 'scripts/forbidden.txt': readFileSync(realRules, 'utf8'), ...files });
  try {
    if (mutate) mutate(dir);
    return exec(['--repo', dir]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const ALLOW = 'README.md\nsrc/\n';
const DEFAULT_ALLOW = 'README.md\nallowlist.txt\nscripts/\n';

test('tracked file outside the allowlist fails and is named', () => {
  const r = run({ 'README.md': 'hello\n', 'docs/secret-plan.md': 'x\n' }, ALLOW);
  assert.equal(r.status, 1);
  assert.match(r.out, /ALLOWLIST FAIL: docs\/secret-plan\.md/);
});

test('tracked files inside the allowlist (exact and directory prefix) pass', () => {
  const r = run({ 'README.md': 'hello\n', 'src/pages/index.astro': '<h1>hi</h1>\n' }, ALLOW);
  assert.equal(r.status, 0);
  assert.match(r.out, /ALLOWLIST OK/);
});

test('allowed file containing an email address fails', () => {
  const r = run({ 'README.md': `contact: ${EMAIL}\n` }, ALLOW);
  assert.equal(r.status, 1);
  assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
});

test('allowed file containing an Israeli phone number fails', () => {
  const r = run({ 'README.md': `call ${MOBILE}\n` }, ALLOW);
  assert.equal(r.status, 1);
  assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
});

test('allowed file containing the home town fails (English and Hebrew)', () => {
  const en = run({ 'README.md': `lives in ${TOWN_EN_FULL}\n` }, ALLOW);
  assert.equal(en.status, 1);
  assert.match(en.out, /FORBIDDEN FAIL: README\.md/);
  const he = run({ 'README.md': `${TOWN_HE_FULL}\n` }, ALLOW);
  assert.equal(he.status, 1);
  assert.match(he.out, /FORBIDDEN FAIL: README\.md/);
});

test('bracketed placeholders from the profile source fail', () => {
  const r = run({ 'README.md': `Ron Negrin ${PLACEHOLDER}\n` }, ALLOW);
  assert.equal(r.status, 1);
  assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
});

test('an empty allowlist rejects everything (default deny)', () => {
  const r = run({ 'README.md': 'hello\n' }, '# nothing allowed\n');
  assert.equal(r.status, 1);
  assert.match(r.out, /ALLOWLIST FAIL: README\.md/);
});

// --- regression tests for review RN-003.1 ---

test('review 1: a binary-looking extension does not exempt content from the scan', () => {
  const r = run({ 'src/leak.pdf': `${EMAIL}\n` }, ALLOW);
  assert.equal(r.status, 1);
  assert.match(r.out, /FORBIDDEN FAIL: src\/leak\.pdf/);
});

test('review 1: a NUL byte does not hide content from the scan', () => {
  const r = run({ 'README.md': `x\u0000${EMAIL}\n` }, ALLOW);
  assert.equal(r.status, 1);
  assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
});

test('review 1: the test file and the rules file get no exemption from the scan', () => {
  const t = run({ 'tests/allowlist.test.mjs': `// ${EMAIL}\n` }, 'tests/\n');
  assert.equal(t.status, 1);
  assert.match(t.out, /FORBIDDEN FAIL: tests\/allowlist\.test\.mjs/);
  const f = run({ 'scripts/forbidden.txt': `# ${EMAIL}\n` }, 'scripts/\n');
  assert.equal(f.status, 1);
  assert.match(f.out, /FORBIDDEN FAIL: scripts\/forbidden\.txt/);
});

test('review 1: the real rules file and this test file pass their own scan', () => {
  const r = run(
    {
      'scripts/forbidden.txt': readFileSync(realRules, 'utf8'),
      'tests/allowlist.test.mjs': readFileSync(join(here, 'allowlist.test.mjs'), 'utf8'),
    },
    'scripts/\ntests/\n',
  );
  assert.equal(r.status, 0, r.out);
});

test('review 2: the town name alone fails', () => {
  const r = run({ 'README.md': `${TOWN_EN}\n` }, ALLOW);
  assert.equal(r.status, 1);
  assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
});

test('review 3: 077 VoIP, landline and +972 forms all fail', () => {
  for (const sample of [VOIP, LANDLINE, INTL]) {
    const r = run({ 'README.md': `call ${sample}\n` }, ALLOW);
    assert.equal(r.status, 1, `expected failure for a phone-shaped sample`);
    assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
  }
});

test('review 3: ordinary numbers and years do not trigger the phone rule', () => {
  const r = run({ 'README.md': 'Published 2026, built with 3 languages, 12 pieces, 43 units.\n' }, ALLOW);
  assert.equal(r.status, 0, r.out);
});

test('review 4: an unstaged allowlist edit cannot approve a path', () => {
  const r = runDefault(
    { 'allowlist.txt': DEFAULT_ALLOW, 'README.md': 'hello\n', 'docs/private.md': 'x\n' },
    (dir) => writeFileSync(join(dir, 'allowlist.txt'), `${DEFAULT_ALLOW}docs/\n`, 'utf8'),
  );
  assert.equal(r.status, 1);
  assert.match(r.out, /ALLOWLIST FAIL: docs\/private\.md|RULES FAIL: allowlist\.txt/);
});

test('review 4: an unstaged rules edit cannot disable the scan', () => {
  // The repository's own staged rules carry an extra marker rule that the shipped rules lack,
  // so a script that ignores the repository's rules cannot pass this by accident.
  const marker = ['zzz', 'marker'].join('');
  const r = runDefault(
    {
      'allowlist.txt': DEFAULT_ALLOW,
      'README.md': `note ${marker}\n`,
      'scripts/forbidden.txt': `${readFileSync(realRules, 'utf8')}\n${marker}\n`,
    },
    (dir) => writeFileSync(join(dir, 'scripts', 'forbidden.txt'), '# no rules\n', 'utf8'),
  );
  assert.equal(r.status, 1);
  assert.match(r.out, /FORBIDDEN FAIL: README\.md|RULES FAIL: scripts\/forbidden\.txt/);
});

test('review 4: the repository staged rules are the ones applied in default mode', () => {
  const marker = ['zzz', 'marker'].join('');
  const r = runDefault({
    'allowlist.txt': DEFAULT_ALLOW,
    'README.md': `note ${marker}\n`,
    'scripts/forbidden.txt': `${readFileSync(realRules, 'utf8')}\n${marker}\n`,
  });
  assert.equal(r.status, 1);
  assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
});

test('review 4: default mode passes when rule files match the index', () => {
  const r = runDefault({ 'allowlist.txt': DEFAULT_ALLOW, 'README.md': 'hello\n' });
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /ALLOWLIST OK/);
});

// --- regression tests for review RN-003.2 ---

test('review 2.1: UTF-16 content (LE with BOM, LE without BOM, BE with BOM) is decoded and scanned', () => {
  for (const [label, bytes] of [
    ['le+bom', utf16le(`contact ${EMAIL}\n`)],
    ['le', utf16leNoBom(`contact ${EMAIL}\n`)],
    ['be+bom', utf16be(`contact ${EMAIL}\n`)],
    ['town le+bom', utf16le(`${TOWN_EN}\n`)],
    ['phone le+bom', utf16le(`call ${MOBILE}\n`)],
  ]) {
    const r = run({ 'README.md': bytes }, ALLOW);
    assert.equal(r.status, 1, `UTF-16 variant "${label}" must fail`);
    assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
  }
});

test('review 2.1: clean UTF-16 content still passes', () => {
  const r = run({ 'README.md': utf16le('hello world\n') }, ALLOW);
  assert.equal(r.status, 0, r.out);
});

test('review 2.2: phone numbers with parentheses, dots, spaces or other digit grouping fail', () => {
  const samples = [
    ['(054)', ' ', '123', '-', '4567'].join(''),
    ['(054)', ' ', '123', ' ', '4567'].join(''),
    ['054', '-', '123', '-', '45', '-', '67'].join(''),
    ['054', ' ', '12', ' ', '34', ' ', '567'].join(''),
    ['054', '.', '123', '.', '4567'].join(''),
    ['+972', ' ', '(54)', ' ', '123', ' ', '4567'].join(''),
    ['972', '541234567'].join(''),
    ['(03)', ' ', '123', '-', '4567'].join(''),
  ];
  for (const sample of samples) {
    const r = run({ 'README.md': `call ${sample}\n` }, ALLOW);
    assert.equal(r.status, 1, 'a phone-shaped sample must fail');
    assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
  }
});

test('review 2.3: a value split across lines is still caught', () => {
  const townSplit = run({ 'README.md': `${['גני', 'תקווה'].join('\n')}\n` }, ALLOW);
  assert.equal(townSplit.status, 1);
  assert.match(townSplit.out, /FORBIDDEN FAIL: README\.md/);
  const phoneSplit = run({ 'README.md': `${['054-', '123-4567'].join('\n')}\n` }, ALLOW);
  assert.equal(phoneSplit.status, 1);
  assert.match(phoneSplit.out, /FORBIDDEN FAIL: README\.md/);
});

test('review 2.3: the reported line number is the line where the match starts', () => {
  const r = run({ 'README.md': `one\ntwo\ncall ${MOBILE}\nfour\n` }, ALLOW);
  assert.equal(r.status, 1);
  assert.match(r.out, /FORBIDDEN FAIL: README\.md:3:/);
});

test('review 2.4: very long lines are scanned in time (no quadratic rule)', () => {
  for (const [label, content] of [
    ['one long run', `${'a'.repeat(300000)}\n`],
    ['long run before an at-sign', `${'a'.repeat(100000)}@\n`],
    ['dotted labels after an at-sign', `a@${'a.'.repeat(60000)}\n`],
    ['long digit run', `${'0'.repeat(200000)}\n`],
  ]) {
    const started = Date.now();
    const r = run({ 'README.md': content }, ALLOW);
    const ms = Date.now() - started;
    assert.ok(ms < 8000, `"${label}" took ${ms} ms`);
    assert.ok(r.status === 0 || r.status === 1, `unexpected status ${r.status} for "${label}"`);
  }
});

// --- regression tests for review RN-003.3 ---

const HEBREW_FILLER = 'א'.repeat(5000);

test('review 3.1: UTF-16 without a BOM is scanned in both byte orders, even when the text is Hebrew', () => {
  for (const [label, bytes] of [
    ['hebrew town, le', utf16leNoBom(TOWN_HE_FULL)],
    ['hebrew town, be', (() => { const b = utf16leNoBom(TOWN_HE_FULL); b.swap16(); return b; })()],
    ['hebrew filler then email, le', utf16leNoBom(`${HEBREW_FILLER}\n${EMAIL}`)],
    ['hebrew filler then email, be', (() => { const b = utf16leNoBom(`${HEBREW_FILLER}\n${EMAIL}`); b.swap16(); return b; })()],
    ['ascii then hebrew then phone, le', utf16leNoBom(`${'a'.repeat(9000)}${HEBREW_FILLER}\n${MOBILE}`)],
    ['bom, hebrew filler then email, be', utf16be(`${HEBREW_FILLER}\n${EMAIL}`)],
  ]) {
    const r = run({ 'README.md': bytes }, ALLOW);
    assert.equal(r.status, 1, `"${label}" must fail`);
    assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
  }
});

test('review 3.1: clean Hebrew UTF-16 and clean NUL-bearing bytes still pass', () => {
  const hebrew = 'ממוצע 93, דיני קניין 100, דיני חברות 100, 43 יחידות, 2026';
  assert.equal(run({ 'README.md': utf16le(hebrew) }, ALLOW).status, 0);
  assert.equal(run({ 'README.md': utf16leNoBom(hebrew) }, ALLOW).status, 0);
  assert.equal(run({ 'README.md': Buffer.from([0, 1, 2, 0, 3, 4, 0, 5, 6, 0, 7, 8, 0, 9]) }, ALLOW).status, 0);
});

test('review 3.2: a phone number split by CRLF or by spaced dashes fails', () => {
  const samples = [
    ['054-123', '\r\n', '4567'].join(''),
    ['054-123-', '\r\n', '4567'].join(''),
    ['054', ' - ', '123', ' - ', '4567'].join(''),
    ['(054)', ' - ', '123', ' - ', '4567'].join(''),
    ['054-123', '\n', '4567'].join(''),
  ];
  for (const sample of samples) {
    const r = run({ 'README.md': `call ${sample}\n` }, ALLOW);
    assert.equal(r.status, 1, 'a phone-shaped sample must fail');
    assert.match(r.out, /FORBIDDEN FAIL: README\.md/);
  }
});

test('review 3.2: realistic site numbers do not trigger the widened phone rule', () => {
  const text = [
    'ממוצע 93 · 100 דיני קניין · 100 דיני חברות · 94 דיני מיסים',
    '43 יחידות דיור, 2022 – היום, 2024 – היום, 2017 – 2020, 2021 – 2027',
    'Version 5.3.0, node 24.19.0, 1440 x 900, 390 x 844, Lighthouse 95',
    'Updated 2026-10-18 at 00:17:21',
  ].join('\n');
  const r = run({ 'README.md': `${text}\n` }, ALLOW);
  assert.equal(r.status, 0, r.out);
});

test('review 3: large inputs stay fast with the extra decodings and the widened rule', () => {
  for (const [label, content] of [
    ['zero then a long run of spaces', `0${' '.repeat(300000)}\n`],
    ['many zeros separated by spaces', `${'0 '.repeat(150000)}\n`],
    ['large UTF-16 file', utf16le(`${'a'.repeat(300000)}\n`)],
    ['large NUL-bearing bytes', Buffer.alloc(600000, 0)],
  ]) {
    const started = Date.now();
    const r = run({ 'README.md': content }, ALLOW);
    const ms = Date.now() - started;
    assert.ok(ms < 8000, `"${label}" took ${ms} ms`);
    assert.ok(r.status === 0 || r.status === 1, `unexpected status ${r.status} for "${label}"`);
  }
});

test('review 2.4: no false positives on dates, versions and ordinary numbers', () => {
  const r = run(
    { 'README.md': 'Version 5.3.0 released 2026-10-18; 12 pieces, 43 units, node 24.19.0, 1440x900.\n' },
    ALLOW,
  );
  assert.equal(r.status, 0, r.out);
});
