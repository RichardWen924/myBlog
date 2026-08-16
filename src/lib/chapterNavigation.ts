export type ChapterDirection = -1 | 1;

export function getAdjacentChapterIndex(
  currentIndex: number,
  direction: ChapterDirection,
  chapterCount: number,
): number {
  if (chapterCount <= 0) return 0;
  return Math.min(Math.max(currentIndex + direction, 0), chapterCount - 1);
}

export interface ChapterNavigationOptions {
  chapterSelector: string;
  linkSelector: string;
  chapterDataKey: string;
  linkDataKey: string;
  interactiveSelector: string;
}

export function setupChapterNavigation({
  chapterSelector,
  linkSelector,
  chapterDataKey,
  linkDataKey,
  interactiveSelector,
}: ChapterNavigationOptions): () => void {
  const chapters = [...document.querySelectorAll<HTMLElement>(chapterSelector)];
  const links = [...document.querySelectorAll<HTMLElement>(linkSelector)];
  if (chapters.length === 0 || links.length === 0) return () => {};

  const setActiveChapter = (id: string | undefined) => {
    links.forEach((link) => {
      const isActive = link.dataset[linkDataKey] === id;
      link.toggleAttribute('data-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        setActiveChapter((visible.target as HTMLElement).dataset[chapterDataKey]);
      }
    },
    { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
  );

  chapters.forEach((chapter) => observer.observe(chapter));
  setActiveChapter(chapters[0]?.dataset[chapterDataKey]);

  const getCurrentChapterIndex = () => {
    const marker = window.scrollY + window.innerHeight * 0.35;
    const currentIndex = chapters.findIndex((chapter) => {
      const top = chapter.offsetTop;
      return marker >= top && marker < top + chapter.offsetHeight;
    });

    return currentIndex === -1 ? 0 : currentIndex;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented
      || !['ArrowDown', 'ArrowUp'].includes(event.key)
      || !(event.target instanceof HTMLElement)
      || event.target.isContentEditable
      || event.target.matches(interactiveSelector)
      || Boolean(event.target.closest(interactiveSelector))
    ) return;

    const direction: ChapterDirection = event.key === 'ArrowDown' ? 1 : -1;
    const currentIndex = getCurrentChapterIndex();
    const nextIndex = getAdjacentChapterIndex(currentIndex, direction, chapters.length);
    const nextChapter = chapters[nextIndex];
    if (!nextChapter || nextIndex === currentIndex) return;

    event.preventDefault();
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (nextIndex === 0) window.scrollTo({ top: 0, behavior });
    else nextChapter.scrollIntoView({ behavior, block: 'start' });
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => {
    observer.disconnect();
    window.removeEventListener('keydown', handleKeyDown);
  };
}
