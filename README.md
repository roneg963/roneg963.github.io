# Ron Negrin | רון נגרין

Personal website of Ron Negrin: a static, bilingual (Hebrew and English) site. Work in progress.

## Checks

```
node scripts/check-allowlist.mjs   # tracked paths must be in allowlist.txt; content must pass scripts/forbidden.txt
node --test tests/allowlist.test.mjs   # unit tests
```

## Develop

```
npm install      # Node 22.22 or newer
npm run dev      # local preview
npm run build    # static site into dist/
```

Hebrew is served at `/`, English at `/en/`. Search engines are kept out (`noindex`) until launch.

This repository is public. Only paths listed in `allowlist.txt` may be tracked.
