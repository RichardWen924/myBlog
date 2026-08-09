export type WorkTransitionDirection = 'enter' | 'exit';
export type WorkHeroStartMode = 'particles' | 'await-transition' | 'settle';

export const WORK_HERO_ARRIVAL_EVENT = 'work:hero-arrival';
export const WORK_HERO_SETTLE_MS = 180;
export const WORK_HERO_FALLBACK_MS = 2600;

export const getWorkHeroStartMode = (
  reducedMotion: boolean,
  arrivalPending: boolean,
): WorkHeroStartMode => {
  if (reducedMotion) return 'particles';
  return arrivalPending ? 'await-transition' : 'settle';
};

export interface TransitionViewport {
  width: number;
  height: number;
}

export interface WorkTransitionFrame {
  sourceScale: number;
  sourceOpacity: number;
  targetScale: number;
  targetOpacity: number;
  targetProgress: number;
  apertureRadius: number;
  sourceBlur: number;
  focusPulse: number;
  streakOpacity: number;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, value: number) => from + (to - from) * value;
const smootherStep = (value: number) => {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export const isWorkPath = (value: string | URL) => {
  const pathname = value instanceof URL ? value.pathname : new URL(value, 'https://local.invalid').pathname;
  return pathname.replace(/\/+$/, '') === '/work';
};

export const getTransitionDirection = (
  from: string | URL,
  to: string | URL,
): WorkTransitionDirection | null => {
  const fromWork = isWorkPath(from);
  const toWork = isWorkPath(to);

  if (fromWork === toWork) return null;
  return toWork ? 'enter' : 'exit';
};

export const getTransitionFrame = (
  _direction: WorkTransitionDirection,
  rawProgress: number,
  viewport: TransitionViewport,
): WorkTransitionFrame => {
  const t = clamp01(rawProgress);
  const minimumScale = 0.055;
  const sourceProgress = smootherStep(t / 0.46);
  const targetProgress = smootherStep((t - 0.44) / 0.5);
  const sourceFade = smootherStep((t - 0.3) / 0.16);
  const targetFade = smootherStep((t - 0.44) / 0.1);
  const focusWindow = clamp01(1 - Math.abs(t - 0.47) / 0.16);
  const streakWindow = clamp01(1 - Math.abs(t - 0.43) / 0.32);
  const fullRadius = Math.hypot(viewport.width, viewport.height) * 1.08;

  return {
    sourceScale: lerp(1, minimumScale, sourceProgress),
    sourceOpacity: 1 - sourceFade,
    targetScale: lerp(minimumScale, 1, targetProgress),
    targetOpacity: targetFade,
    targetProgress,
    apertureRadius: lerp(12, fullRadius, targetProgress),
    sourceBlur: lerp(0, 2.6, sourceFade),
    focusPulse: smootherStep(focusWindow),
    streakOpacity: 0.18 * smootherStep(streakWindow),
  };
};
