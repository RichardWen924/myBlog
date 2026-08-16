export function timelineItemDelay(index: number, staggerDelay = 0.1, startDelay = 0) {
  return startDelay + index * staggerDelay;
}
