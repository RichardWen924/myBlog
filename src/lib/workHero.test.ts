import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getWorkHeroStartMode } from '../features/work/workHero.ts';

describe('Work Hero arrival', () => {
  it('starts immediately for reduced motion and settles for normal motion', () => {
    assert.equal(getWorkHeroStartMode(true), 'particles');
    assert.equal(getWorkHeroStartMode(false), 'settle');
  });
});
