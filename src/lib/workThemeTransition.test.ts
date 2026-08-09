import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getWorkHeroStartMode,
  getTransitionDirection,
  getTransitionFrame,
  isWorkPath,
} from './workThemeTransition.ts';

describe('Work Hero arrival', () => {
  it('chooses a single start mode from motion and transition state', () => {
    assert.equal(getWorkHeroStartMode(true, true), 'particles');
    assert.equal(getWorkHeroStartMode(false, true), 'await-transition');
    assert.equal(getWorkHeroStartMode(false, false), 'settle');
  });
});

describe('Work route classification', () => {
  it('recognizes only the Work route', () => {
    assert.equal(isWorkPath('/work'), true);
    assert.equal(isWorkPath('/work/'), true);
    assert.equal(isWorkPath('/work#projects'), true);
    assert.equal(isWorkPath('/projects'), false);
  });

  it('returns enter and exit only when crossing the Work boundary', () => {
    assert.equal(getTransitionDirection('/about', '/work'), 'enter');
    assert.equal(getTransitionDirection('/work', '/blog'), 'exit');
    assert.equal(getTransitionDirection('/', '/blog'), null);
    assert.equal(getTransitionDirection('/work', '/work#projects'), null);
  });
});

describe('Work transition frames', () => {
  it('pushes the camera into the Richard focus before pulling back the target', () => {
    const viewport = { width: 1440, height: 900 };
    const start = getTransitionFrame('enter', 0, viewport);
    const midpoint = getTransitionFrame('enter', 0.46, viewport);
    const end = getTransitionFrame('enter', 1, viewport);

    assert.equal(start.sourceScale, 1);
    assert.equal(start.sourceOpacity, 1);
    assert.equal(start.targetOpacity, 0);
    assert.ok(midpoint.sourceScale >= 5);
    assert.ok(midpoint.targetScale >= 5);
    assert.equal(end.sourceOpacity, 0);
    assert.equal(end.targetScale, 1);
    assert.equal(end.targetOpacity, 1);
  });

  it('uses the same Richard-focus camera sequence when leaving Work', () => {
    const viewport = { width: 1440, height: 900 };
    const enterMidpoint = getTransitionFrame('enter', 0.46, viewport);
    const exitMidpoint = getTransitionFrame('exit', 0.46, viewport);

    assert.deepEqual(exitMidpoint, enterMidpoint);
  });

  it('settles target expansion before the final frame', () => {
    const viewport = { width: 1440, height: 900 };
    const almost = getTransitionFrame('enter', 0.99, viewport);
    const end = getTransitionFrame('enter', 1, viewport);

    assert.ok(Math.abs(end.targetScale - almost.targetScale) < 0.0001);
    assert.ok(Math.abs(end.targetOpacity - almost.targetOpacity) < 0.0001);
  });
});
