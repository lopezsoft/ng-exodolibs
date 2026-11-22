import fs from 'node:fs';
import path from 'node:path';

const version = (process.argv[2] || '').replace(/^v/, '').trim();
if (!version) {
  console.error('Uso: node scripts/build-release-notes.mjs <version> [outputPath]');
  process.exit(1);
}

const outputPath = process.argv[3] || '';
const rootDir = process.cwd();

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractChangelogSection(changelogContent, targetVersion) {
  if (!changelogContent) {
    return '';
  }
  const escaped = escapeRegExp(targetVersion);
  const headingRegex = new RegExp(`^## \\[${escaped}\\][^\\n]*$`, 'm');
  const match = headingRegex.exec(changelogContent);
  if (!match) {
    return '';
  }
  const startIndex = match.index + match[0].length;
  const rest = changelogContent.slice(startIndex);
  const nextHeading = rest.search(/^## \[/m);
  const section = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return section.trim();
}

const versionedReleaseNotesPath = path.join(rootDir, `RELEASE_NOTES_v${version}.md`);
const genericReleaseNotesPath = path.join(rootDir, 'RELEASE_NOTES.md');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

let userHighlights = readIfExists(versionedReleaseNotesPath);
if (!userHighlights) {
  const genericContent = readIfExists(genericReleaseNotesPath);
  if (genericContent && genericContent.includes(version)) {
    userHighlights = genericContent;
  }
}

const changelogSection = extractChangelogSection(readIfExists(changelogPath), version);

const parts = [];

if (userHighlights) {
  parts.push(userHighlights);
} else {
  parts.push(`# exodolibs v${version}\n\nNueva versión de la librería \`exodolibs\` lista para instalación.`);
}

if (changelogSection) {
  parts.push(
    [
      '<details>',
      '<summary>Detalles técnicos (CHANGELOG.md)</summary>',
      '',
      changelogSection,
      '',
      '</details>'
    ].join('\n')
  );
}

if (!userHighlights || !userHighlights.includes('npm install exodolibs')) {
  parts.push(
    [
      '### Instalación',
      '',
      '```bash',
      `npm install exodolibs@${version}`,
      '```'
    ].join('\n')
  );
}

const finalNotes = `${parts.join('\n\n---\n\n')}\n`;

if (outputPath) {
  fs.writeFileSync(outputPath, finalNotes, 'utf8');
} else {
  process.stdout.write(finalNotes);
}
