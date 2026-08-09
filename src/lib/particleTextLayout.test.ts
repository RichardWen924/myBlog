import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getSpacedGlyphRunWidth } from './particleTextLayout.ts';

describe('particle text layout', () => {
  it('includes spacing only between glyphs', () => {
    assert.equal(getSpacedGlyphRunWidth([10, 12, 8], -2), 26);
    assert.equal(getSpacedGlyphRunWidth([10], -2), 10);
    assert.equal(getSpacedGlyphRunWidth([], -2), 0);
  });
});
