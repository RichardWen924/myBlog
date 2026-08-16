import { useEffect, useState } from 'react';
import { getAdjacentChapterIndex } from '../../../lib/chapterNavigation';
import LineSidebar from './LineSidebar';
import './LineSidebar.css';

const chapters = [
  { id: 'work-hero', label: 'Hero' },
  { id: 'work-whoami', label: 'Profile' },
  { id: 'work-systems', label: 'Systems' },
  { id: 'work-projects', label: 'Projects' },
  { id: 'work-experience', label: 'Experience' },
  { id: 'work-more', label: 'More' },
];

export default function WorkChapterNavigation() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const elements = chapters
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const nextIndex = elements.indexOf(visible.target as HTMLElement);
      if (nextIndex >= 0) setActiveIndex(nextIndex);
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] });

    elements.forEach((element) => observer.observe(element));

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (
        event.defaultPrevented
        || !['ArrowDown', 'ArrowUp'].includes(event.key)
        || !(event.target instanceof HTMLElement)
        || event.target.isContentEditable
        || event.target.matches('input, textarea, select, button, a, summary, [role="button"], [contenteditable="true"]')
        || Boolean(event.target.closest('input, textarea, select, button, a, summary, [role="button"], [contenteditable="true"]'))
      ) return;

      const currentIndex = elements.findIndex((element) => {
        const marker = window.scrollY + window.innerHeight * 0.35;
        return marker >= element.offsetTop && marker < element.offsetTop + element.offsetHeight;
      });
      const nextIndex = getAdjacentChapterIndex(currentIndex < 0 ? 0 : currentIndex, event.key === 'ArrowDown' ? 1 : -1, elements.length);
      const nextChapter = elements[nextIndex];
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
  }, []);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    const id = chapters[index]?.id;
    if (!id) return;
    window.history.replaceState(null, '', `#${id}`);
    const target = document.getElementById(id);
    if (!target) return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (index === 0) window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior, block: 'start' });
  };

  return (
    <div className="work-chapter-rail" data-work-chapter-rail>
      <LineSidebar
        items={chapters.map(({ label }) => label)}
        accentColor="#8ee6c2"
        textColor="#a4aaa5"
        markerColor="#2b302f"
        proximityRadius={120}
        maxShift={22}
        markerLength={34}
        itemGap={18}
        fontSize={0.68}
        smoothing={100}
        defaultActive={0}
        activeIndex={activeIndex}
        onItemClick={handleItemClick}
        className="work-line-sidebar"
      />
    </div>
  );
}
