import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getTransitionDirection,
  getTransitionFrame,
  isWorkPath,
} from './workThemeTransition.ts';

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
  it('maps the enter endpoints from Archive to full-screen Work', () => {
    const start = getTransitionFrame('enter', 0, { width: 1440, height: 900 });
    const end = getTransitionFrame('enter', 1, { width: 1440, height: 900 });

    assert.equal(start.percent, 0);
    assert.equal(start.focusX, 88);
    assert.equal(start.workScale, 0.46);
    assert.equal(start.sourceShiftX, 0);
    assert.equal(end.percent, 100);
    assert.equal(end.focusX, 50);
    assert.equal(end.workScale, 1);
    assert.equal(end.sourceShiftX, -38);
    assert.ok(end.portalRadius > Math.hypot(1440, 900));
  });

  it('maps exit as the semantic reverse at the same viewport size', () => {
    const start = getTransitionFrame('exit', 0, { width: 1440, height: 900 });
    const end = getTransitionFrame('exit', 1, { width: 1440, height: 900 });

    assert.equal(start.percent, 100);
    assert.equal(start.focusX, 50);
    assert.equal(start.workScale, 1);
    assert.equal(start.sourceShiftX, 38);
    assert.equal(end.percent, 0);
    assert.equal(end.focusX, 12);
    assert.equal(end.workScale, 0.46);
    assert.equal(end.sourceShiftX, 0);
    assert.equal(end.portalRadius, 21);
  });

  it('reduces depth and uses safe node positions on compact viewports', () => {
    const frame = getTransitionFrame('enter', 0, { width: 390, height: 844 });

    assert.equal(frame.focusX, 84);
    assert.equal(frame.workScale, 0.62);
    assert.equal(frame.sourceDepthScale, 1);
    assert.equal(frame.speedOpacity, 0);
  });
});
