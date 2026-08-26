export interface WorkMotionProfile {
  revealDuration: number;
  revealOffset: number;
  revealStart: string;
  revealStagger: number;
  heroParallaxPercent: number;
  heroScrub: number;
  progressScrub: number;
  skillParallax: {
    x: number;
    y: number;
    rotation: number;
    duration: number;
  };
}

export function getWorkMotionProfile({
  reducedMotion,
  finePointer,
}: {
  reducedMotion: boolean;
  finePointer: boolean;
}): WorkMotionProfile {
  if (reducedMotion) {
    return {
      revealDuration: 0,
      revealOffset: 0,
      revealStart: 'top 100%',
      revealStagger: 0,
      heroParallaxPercent: 0,
      heroScrub: 0,
      progressScrub: 0,
      skillParallax: { x: 0, y: 0, rotation: 0, duration: 0 },
    };
  }

  return {
    revealDuration: 0.72,
    revealOffset: 20,
    revealStart: 'top 82%',
    revealStagger: 0.08,
    heroParallaxPercent: -6,
    heroScrub: 0.8,
    progressScrub: 0.6,
    skillParallax: finePointer
      ? { x: 8, y: 6, rotation: 0.35, duration: 0.8 }
      : { x: 0, y: 0, rotation: 0, duration: 0 },
  };
}

export function timelineItemDelay(index: number, staggerDelay = 0.1, startDelay = 0) {
  return startDelay + index * staggerDelay;
}
