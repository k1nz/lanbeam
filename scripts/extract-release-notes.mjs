import { readFileSync } from 'node:fs';

const tag = process.argv[2];

if (!tag?.startsWith('v')) {
  throw new Error('Usage: node scripts/extract-release-notes.mjs v<version>');
}

const version = tag.slice(1);
const lines = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8').split(/\r?\n/);
const heading = `## [${version}]`;
const start = lines.findIndex((line) => line === heading || line.startsWith(`${heading} - `));

if (start === -1) {
  throw new Error(`CHANGELOG.md does not contain release notes for ${tag}.`);
}

const endOffset = lines.slice(start + 1).findIndex((line) => /^## \[/.test(line));
const end = endOffset === -1 ? lines.length : start + 1 + endOffset;

process.stdout.write(`${lines.slice(start, end).join('\n').trim()}\n`);
