export type WorkTransitionDirection = 'enter' | 'exit';

export interface TransitionViewport {
  width: number;
  height: number;
}

export interface WorkTransitionFrame {
  percent: number;
  workProgress: number;
  cameraProgress: number;
  portalProgress: number;
  focusX: number;
  portalRadius: number;
  workScale: number;
  sourceShiftX: number;
  sourceDepthScale: number;
  sourceBlur: number;
  speedOpacity: number;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, value: number) => from + (to - from) * value;
const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp01(value), 3);
const easeInOutCubic = (value: number) => {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
  direction: WorkTransitionDirection,
  rawProgress: number,
  viewport: TransitionViewport,
): WorkTransitionFrame => {
  const t = clamp01(rawProgress);
  const compact = viewport.width < 640;
  const medium = !compact && viewport.width < 1024;
  const startNode = compact ? 84 : medium ? 86 : 88;
  const endNode = compact ? 16 : medium ? 14 : 12;
  const initialScale = compact ? 0.62 : medium ? 0.54 : 0.46;
  const workProgress = direction === 'enter' ? t : 1 - t;
  const cameraProgress = direction === 'enter'
    ? easeOutCubic(clamp01((t - 0.04) / 0.84))
    : 1 - easeOutCubic(clamp01((t - 0.04) / 0.84));
  const portalProgress = direction === 'enter'
    ? easeInOutCubic(clamp01((t - 0.12) / 0.88))
    : 1 - easeInOutCubic(clamp01(t / 0.88));
  const focusX = direction === 'enter'
    ? lerp(startNode, 50, cameraProgress)
    : lerp(endNode, 50, cameraProgress);
  const fullRadius = Math.hypot(viewport.width, viewport.height) * 1.08;
  const portalRadius = lerp(21, fullRadius, Math.pow(portalProgress, 1.28));
  const workScale = lerp(initialScale, 1, portalProgress);
  const depthBudget = compact ? 0 : medium ? 0.16 : 0.24;
  const sourceDepthScale = 1 + depthBudget * cameraProgress;
  const sourceShiftX = direction === 'enter' ? focusX - startNode : focusX - endNode;
  const sourceBlur = compact ? 0 : 1.2 * cameraProgress;
  const speedOpacity = compact ? 0 : Math.min(0.24, cameraProgress * (1 - portalProgress) * 0.28);

  return {
    percent: Math.round(workProgress * 100),
    workProgress,
    cameraProgress,
    portalProgress,
    focusX,
    portalRadius,
    workScale,
    sourceShiftX,
    sourceDepthScale,
    sourceBlur,
    speedOpacity,
  };
};
