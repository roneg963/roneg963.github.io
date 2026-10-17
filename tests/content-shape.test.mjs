import assert from 'node:assert/strict';
import test from 'node:test';

const { he } = await import(new URL('../src/content/he.ts', import.meta.url));
const { en } = await import(new URL('../src/content/en.ts', import.meta.url));

function compareShape(expected, actual, path = 'content') {
  assert.equal(typeof actual, typeof expected, `${path}: value type`);
  assert.equal(actual === null, expected === null, `${path}: null value`);
  assert.equal(Array.isArray(actual), Array.isArray(expected), `${path}: array type`);

  if (Array.isArray(expected)) {
    assert.equal(actual.length, expected.length, `${path}: array length`);
    expected.forEach((value, index) => compareShape(value, actual[index], `${path}[${index}]`));
  } else if (expected !== null && typeof expected === 'object') {
    assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), `${path}: object keys`);
    for (const key of Object.keys(expected)) {
      compareShape(expected[key], actual[key], `${path}.${key}`);
    }
  }
}

function checkEnglishStrings(value, path = '') {
  if (typeof value === 'string') {
    assert.ok(value.trim().length > 0, `${path}: empty string`);
    if (path !== 'nav.otherLanguage') {
      assert.doesNotMatch(value, /[\u0590-\u05FF]/u, `${path}: Hebrew text`);
    }
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => checkEnglishStrings(item, `${path}[${index}]`));
  } else if (value !== null && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      checkEnglishStrings(item, path ? `${path}.${key}` : key);
    }
  }
}

test('English content matches every Hebrew key, array length and leaf type', () => {
  compareShape(he, en);
});

test('English strings are nonempty and contain Hebrew only in the language switch', () => {
  checkEnglishStrings(en);
});
