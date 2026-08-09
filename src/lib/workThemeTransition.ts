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
  _viewport: TransitionViewport,
): WorkTransitionFrame => {
  const t = clamp01(rawProgress);
  const maximumScale = 5.6;
  const sourceProgress = smootherStep(t / 0.42);
  const targetProgress = smootherStep((t - 0.54) / 0.4);
  const themeChange = smootherStep((t - 0.43) / 0.12);
  const focusWindow = clamp01(1 - Math.abs(t - 0.49) / 0.14);
  const sourceVelocity = Math.sin(Math.PI * clamp01(t / 0.42));
  const targetVelocity = Math.sin(Math.PI * clamp01((t - 0.54) / 0.4));

  return {
    sourceScale: lerp(1, maximumScale, sourceProgress),
    sourceOpacity: 1 - themeChange,
    targetScale: lerp(maximumScale, 1, targetProgress),
    targetOpacity: themeChange,
    targetProgress,
    sourceBlur: 0.55 * smootherStep(focusWindow),
    focusPulse: smootherStep(focusWindow),
    streakOpacity: 0.09 * Math.max(sourceVelocity, targetVelocity),
  };
};
