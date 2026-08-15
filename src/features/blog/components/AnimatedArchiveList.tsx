import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import ArchivePostRow from './ArchivePostRow';
import { getNextSelectionIndex, type ArchivePost } from '../blogArchive';

export interface AnimatedArchiveListProps {
  posts: ArchivePost[];
  onItemSelect: (post: ArchivePost) => void;
  displayScrollbar?: boolean;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
}

interface AnimatedArchiveItemProps {
  post: ArchivePost;
  index: number;
  selected: boolean;
  reducedMotion: boolean | null;
  containerRef: RefObject<HTMLDivElement | null>;
  registerItem: (index: number, node: HTMLLIElement | null) => void;
  onSelect: (index: number) => void;
  onItemSelect: (post: ArchivePost) => void;
}

function AnimatedArchiveItem({
  post,
  index,
  selected,
  reducedMotion,
  containerRef,
  registerItem,
  onSelect,
  onItemSelect,
}: AnimatedArchiveItemProps) {
  const itemRef = useRef<HTMLLIElement>(null);
  const isInView = useInView(itemRef, {
    root: containerRef,
    amount: 0.2,
  });

  const setItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      itemRef.current = node;
      registerItem(index, node);
    },
    [index, registerItem],
  );

  const isVisible = isInView || reducedMotion;

  return (
    <motion.li
      ref={setItemRef}
      className="blog-quick-list__item"
      initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
      animate={{
        opacity: isVisible ? 1 : 0.3,
        y: isVisible ? 0 : 10,
        scale: selected ? 1 : 0.985,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => onSelect(index)}
      onFocus={() => onSelect(index)}
    >
      <ArchivePostRow
        post={post}
        selected={selected}
        compact
        onActivate={() => onItemSelect(post)}
      />
    </motion.li>
  );
}

export default function AnimatedArchiveList({
  posts,
  onItemSelect,
  displayScrollbar = true,
  showGradients = true,
  enableArrowNavigation = true,
}: AnimatedArchiveListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollState, setScrollState] = useState({ atTop: true, atBottom: false });
  const reducedMotion = useReducedMotion();

  const registerItem = useCallback((index: number, node: HTMLLIElement | null) => {
    itemRefs.current[index] = node;
  }, []);

  const updateScrollState = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    setScrollState({
      atTop: list.scrollTop <= 4,
      atBottom: list.scrollTop + list.clientHeight >= list.scrollHeight - 4,
    });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    updateScrollState();
    list.addEventListener('scroll', updateScrollState, { passive: true });

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateScrollState);
    resizeObserver?.observe(list);

    return () => {
      list.removeEventListener('scroll', updateScrollState);
      resizeObserver?.disconnect();
    };
  }, [posts.length, updateScrollState]);

  useEffect(() => {
    setSelectedIndex((current) => Math.min(current, Math.max(posts.length - 1, 0)));
  }, [posts.length]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const item = itemRefs.current[index];
      if (!item) return;

      item.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
      item.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
    },
    [reducedMotion],
  );

  const moveSelection = useCallback(
    (direction: number) => {
      setSelectedIndex((current) => {
        const next = getNextSelectionIndex(current, direction, posts.length);
        if (next !== current) {
          window.requestAnimationFrame(() => scrollToIndex(next));
        }
        return next;
      });
    },
    [posts.length, scrollToIndex],
  );

  const getFocusedItemIndex = useCallback((target: EventTarget | null) => {
    if (!(target instanceof Node)) return -1;
    return itemRefs.current.findIndex((item) => item?.contains(target));
  }, []);

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const index = getFocusedItemIndex(event.target);
      if (index >= 0) setSelectedIndex(index);
    },
    [getFocusedItemIndex],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (enableArrowNavigation && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = getNextSelectionIndex(selectedIndex, direction, posts.length);

        if (nextIndex !== selectedIndex) {
          event.preventDefault();
          moveSelection(direction);
        }
        return;
      }

      if (event.key === 'Tab') {
        const index = getFocusedItemIndex(event.target);
        if (index >= 0) setSelectedIndex(index);
        return;
      }

      if (event.key === 'Enter' && event.target === listRef.current) {
        const link = itemRefs.current[selectedIndex]?.querySelector<HTMLAnchorElement>('a');
        if (link) {
          event.preventDefault();
          link.click();
        }
      }
    },
    [enableArrowNavigation, getFocusedItemIndex, moveSelection, posts.length, selectedIndex],
  );

  const listClassName = [
    'blog-quick-list',
    !displayScrollbar && 'blog-quick-list--no-scrollbar',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="blog-quick-list-frame">
      {showGradients && (
        <>
          <motion.div
            className="blog-quick-list__gradient blog-quick-list__gradient--top"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: scrollState.atTop ? 0 : 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          />
          <motion.div
            className="blog-quick-list__gradient blog-quick-list__gradient--bottom"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: scrollState.atBottom ? 0 : 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          />
        </>
      )}
      <div
        ref={listRef}
        className={listClassName}
        tabIndex={0}
        aria-label="Quick browse archive"
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      >
        <ul className="blog-quick-list__items">
          {posts.map((post, index) => (
            <AnimatedArchiveItem
              key={post.id}
              post={post}
              index={index}
              selected={index === selectedIndex}
              reducedMotion={reducedMotion}
              containerRef={listRef}
              registerItem={registerItem}
              onSelect={setSelectedIndex}
              onItemSelect={onItemSelect}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
