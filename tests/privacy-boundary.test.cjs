const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');
const privateRoots = ['context', 'program', 'workouts', 'health', 'nutrition', 'handoffs', 'templates'];
const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');

for (const privateRoot of privateRoots) {
  assert.match(gitignore, new RegExp(`^/${privateRoot}/$`, 'm'), `${privateRoot}/ must remain ignored`);
}

const trackedFiles = execFileSync('git', ['ls-files'], {cwd: root, encoding: 'utf8'})
  .trim()
  .split('\n')
  .filter(Boolean);

for (const privateRoot of privateRoots) {
  assert.equal(
    trackedFiles.some(file => file === privateRoot || file.startsWith(`${privateRoot}/`)),
    false,
    `${privateRoot}/ must not contain tracked public-repository files`
  );
}

const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
for (const privateRoot of privateRoots) {
  assert.doesNotMatch(
    serviceWorker,
    new RegExp(`(?:^|[./'\"\\s])${privateRoot}/`),
    `${privateRoot}/ must not appear in the offline asset cache`
  );
}

console.log('Privacy boundary tests passed.');
