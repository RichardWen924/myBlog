import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const work = readFileSync(resolve(root, 'src/pages/work.astro'), 'utf8');
const intro = readFileSync(resolve(root, 'src/components/react/WhoAmIIntro.tsx'), 'utf8');
const decryptedText = readFileSync(resolve(root, 'src/components/react/DecryptedText.tsx'), 'utf8');
const navigation = readFileSync(resolve(root, 'src/components/work/WorkChapterNavigation.astro'), 'utf8');
const styles = readFileSync(resolve(root, 'src/styles/work.css'), 'utf8');
const mockTimeline = readFileSync(resolve(root, 'src/data/workTimelineMock.ts'), 'utf8');

test('Work inserts Who am i before the systems chapter', () => {
  assert.match(work, /id="work-whoami"/);
  assert.match(work, /data-work-chapter="whoami"/);
  assert.match(work, /WhoAmIIntro/);
  assert.match(intro, /Who am i/);
  assert.match(intro, /Richard Wen/);
  assert.match(intro, /backend agent/);
  assert.match(intro, /研究Agent/);
  assert.match(work, /index="02" label="Technical practice"/);
  assert.ok(work.indexOf('data-work-chapter="whoami"') < work.indexOf('data-work-chapter="systems"'));
});

test('Who am i uses four temporary education and internship entries', () => {
  assert.equal(existsSync(resolve(root, 'src/data/workTimelineMock.ts')), true);
  assert.match(mockTimeline, /type: 'education'/g);
  assert.match(mockTimeline, /type: 'work'/g);
  assert.equal((mockTimeline.match(/startDate:/g) ?? []).length, 4);
  assert.match(work, /items=\{workTimelineMock\}/);
});

test('Who am i reveals left content before the right timeline', () => {
  assert.match(intro, /from ['"]\.\/DecryptedText['"]/);
  assert.match(intro, /<DecryptedText/);
  assert.match(intro, /text="Who am i"/);
  assert.match(intro, /speed=\{160\}/);
  assert.match(intro, /sequential/);
  assert.match(intro, /animateOn="view"/);
  assert.match(decryptedText, /IntersectionObserver/);
  assert.match(decryptedText, /setInterval/);
  assert.match(work, /WhoAmIIntro client:visible/);
  assert.match(work, /<Timeline client:visible items=\{workTimelineMock\} \/>/);
  assert.match(work, /className="work-whoami-timeline" delay=\{1\.35\}/);
  assert.match(styles, /work-whoami-layout/);
  assert.match(styles, /work-whoami-timeline/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test('Work rail includes the Who am i chapter and renumbers following chapters', () => {
  assert.match(navigation, /href="#work-whoami"[\s\S]*?data-work-rail-link="whoami"[\s\S]*?>01</);
  assert.match(navigation, /href="#work-systems"[\s\S]*?data-work-rail-link="systems"[\s\S]*?>02</);
  assert.match(navigation, /href="#work-more"[\s\S]*?>05</);
});
