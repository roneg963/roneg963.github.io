#!/usr/bin/env node
// Public-repo guard (ADR-0002): fails when a tracked path is outside allowlist.txt
// or when tracked content matches a rule in scripts/forbidden.txt.
// Node built-ins only.
//
// Default mode reads allowlist.txt and scripts/forbidden.txt from the repository's INDEX (the content
// that would be committed) and fails if the working-tree copy differs from it, so an unstaged edit can
// neither approve a path nor switch a rule off. Explicit --allowlist / --forbidden files override this
// (used by the unit tests).
//
// Every tracked file is scanned, whatever its extension or content: nothing is exempt and a NUL byte does
// not stop the scan. Text is scanned as UTF-8 and, when the file has a UTF-16 BOM or any NUL byte, also as
// UTF-16 in both byte orders. Each rule runs over the whole file, so a value split across lines is found.
// Matched text is never printed; only the file, line and rule are.
//
// KNOWN LIMITS (decision of Ron, 2026-10-18): this scan is a safety net for innocent mistakes, such as an
// e-mail address pasted into text by accident. It is NOT a security boundary against deliberate hiding.
// Not detected: values written as HTML entities or base64; look-alike characters (homoglyphs); full-width
// and Arabic-Indic digits; UTF-32; UTF-16 that has no BOM and no ASCII-range character at all; a phone
// number split by more than three separator characters. The allowlist is the primary control, and the
// file list (`git ls-files`) is reviewed by a person before the first push.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!key.startsWith('--') || argv[i + 1] === undefined) {
      console.error('usage: check-allowlist.mjs [--repo DIR] [--allowlist FILE] [--forbidden FILE]');
      process.exit(2);
    }
    out[key.slice(2)] = argv[i + 1];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const repo = resolve(args.repo ?? join(here, '..'));

function git(...gitArgs) {
  const r = spawnSync('git', ['-C', repo, ...gitArgs], { maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(`git ${gitArgs.join(' ')} failed: ${r.stderr.toString().trim()}`);
    process.exit(2);
  }
  return r.stdout;
}

let failures = 0;

// Returns the text of a rule file: the explicit file if given, else the index copy of `relPath`.
function loadRuleFile(relPath, explicitPath) {
  if (explicitPath) return readFileSync(resolve(explicitPath), 'utf8');
  const text = git('show', `:${relPath}`).toString('utf8');
  const dirty = spawnSync('git', ['-C', repo, 'diff', '--quiet', '--', relPath]);
  if (dirty.status !== 0) {
    console.log(`RULES FAIL: ${relPath} differs from the index; stage it or revert it`);
    failures++;
  }
  return text;
}

const toLines = (text) =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

// The ways a file's bytes are read as text. UTF-8 always. A file with a UTF-16 BOM or with any NUL byte
// is also read as UTF-16 in BOTH byte orders; there is no guessing from the proportion of NULs, because
// Hebrew text in UTF-16 has few of them.
function decodings(buf) {
  const texts = [buf.toString('utf8')];
  const hasBom =
    buf.length >= 2 && ((buf[0] === 0xff && buf[1] === 0xfe) || (buf[0] === 0xfe && buf[1] === 0xff));
  if (hasBom || buf.includes(0)) {
    const start = hasBom ? 2 : 0;
    const body = buf.subarray(start, start + Math.floor((buf.length - start) / 2) * 2);
    texts.push(Buffer.from(body).toString('utf16le')); // little-endian
    const swapped = Buffer.from(body);
    swapped.swap16();
    texts.push(swapped.toString('utf16le')); // big-endian
  }
  return texts;
}

const allow = toLines(loadRuleFile('allowlist.txt', args.allowlist));
const rules = toLines(loadRuleFile('scripts/forbidden.txt', args.forbidden)).map((src) => {
  try {
    return { src, re: new RegExp(src, 'iu') };
  } catch (e) {
    console.error(`invalid rule in scripts/forbidden.txt: ${src} (${e.message})`);
    process.exit(2);
  }
});

const tracked = git('ls-files', '-z').toString('utf8').split('\0').filter(Boolean);
const isAllowed = (p) => allow.some((a) => (a.endsWith('/') ? p.startsWith(a) : p === a));

for (const p of tracked) {
  if (!isAllowed(p)) {
    console.log(`ALLOWLIST FAIL: ${p}`);
    failures++;
    continue;
  }
  // Scan the staged content.
  const texts = decodings(git('show', `:${p}`));
  for (const { src, re } of rules) {
    for (const text of texts) {
      const m = re.exec(text); // no "g" flag: stateless, first match only
      if (m) {
        const line = text.slice(0, m.index).split('\n').length;
        console.log(`FORBIDDEN FAIL: ${p}:${line}: rule ${src}`);
        failures++;
        break;
      }
    }
  }
}

if (failures) {
  console.log(`CHECK FAILED: ${failures} problem(s) in ${tracked.length} tracked file(s)`);
  process.exit(1);
}
console.log(`ALLOWLIST OK (${tracked.length} tracked file(s))`);
