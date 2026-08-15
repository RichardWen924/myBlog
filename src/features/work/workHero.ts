export type WorkHeroStartMode = 'particles' | 'settle';

export const WORK_HERO_SETTLE_MS = 180;

export const getWorkHeroStartMode = (reducedMotion: boolean): WorkHeroStartMode => (
  reducedMotion ? 'particles' : 'settle'
);
