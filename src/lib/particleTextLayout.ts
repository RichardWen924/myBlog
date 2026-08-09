export const getSpacedGlyphRunWidth = (glyphWidths: number[], letterSpacing: number) => {
  if (glyphWidths.length === 0) return 0;

  return glyphWidths.reduce((total, width) => total + width, 0)
    + letterSpacing * (glyphWidths.length - 1);
};
