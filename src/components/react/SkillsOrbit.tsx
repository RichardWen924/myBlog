import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import skills from '../../data/skills';

interface Point {
  x: number;
  y: number;
}

const VIEWBOX = { width: 1020, height: 700 };
const CENTER: Point = { x: 555, y: 350 };
const CATEGORY_POSITIONS: Record<string, Point> = {
  Languages: { x: 280, y: 192 },
  Frontend: { x: 805, y: 188 },
  Tools: { x: 805, y: 525 },
};

const CATEGORY_COLORS = ['sage', 'warm', 'ink'] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function skillPoint(category: Point, index: number, count: number): Point {
  const angle = -Math.PI / 2 + (index / Math.max(count, 1)) * Math.PI * 2;
  return {
    x: category.x + Math.cos(angle) * 116,
    y: category.y + Math.sin(angle) * 92,
  };
}

function fallbackCategoryPosition(index: number): Point {
  const angle = -Math.PI / 2 + (index / Math.max(skills.length, 1)) * Math.PI * 2;
  return {
    x: CENTER.x + Math.cos(angle) * 230,
    y: CENTER.y + Math.sin(angle) * 160,
  };
}

/** A living, paper-toned skill constellation for the About page. */
export default function SkillsOrbit() {
  const reducedMotion = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoryNodes = useMemo(
    () =>
      skills.map((category, categoryIndex) => ({
        ...category,
        position: CATEGORY_POSITIONS[category.category] ?? fallbackCategoryPosition(categoryIndex),
        color: CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length],
        items: category.items.map((item, itemIndex) => ({
          ...item,
          position: skillPoint(
            CATEGORY_POSITIONS[category.category] ?? fallbackCategoryPosition(categoryIndex),
            itemIndex,
            category.items.length,
          ),
        })),
      })),
    [],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host || reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      const y = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
      host.style.setProperty('--orbit-x', x.toFixed(3));
      host.style.setProperty('--orbit-y', y.toFixed(3));
    };

    const resetPointer = () => {
      host.style.setProperty('--orbit-x', '0');
      host.style.setProperty('--orbit-y', '0');
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', resetPointer);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', resetPointer);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={hostRef}
      className="skill-orbit"
      data-motion={reducedMotion ? 'static' : 'idle'}
      aria-label="Interactive map of Richard's skills"
    >
      <svg
        className="skill-orbit__canvas"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role="img"
        aria-labelledby="skills-orbit-title skills-orbit-description"
      >
        <title id="skills-orbit-title">Richard&apos;s skill map</title>
        <desc id="skills-orbit-description">
          Three skill categories connect to their tools and technologies around a central skill map.
        </desc>

        <motion.g
          className="skill-orbit__atmosphere"
          animate={reducedMotion ? undefined : { rotate: [0, 1.5, 0, -1.5, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
        >
          <circle cx={CENTER.x} cy={CENTER.y} r="230" fill="none" stroke="currentColor" strokeOpacity=".08" />
          <circle cx={CENTER.x} cy={CENTER.y} r="190" fill="none" stroke="currentColor" strokeOpacity=".08" strokeDasharray="2 12" />
          <path d="M95 576C240 610 332 620 459 590C608 555 708 604 944 568" fill="none" stroke="currentColor" strokeOpacity=".08" />
          <path d="M82 110C248 142 302 102 438 133C603 171 751 103 946 145" fill="none" stroke="currentColor" strokeOpacity=".08" />
        </motion.g>

        <g className="skill-orbit__connections" aria-hidden="true">
          {categoryNodes.map((category) => {
            const categoryActive = !activeCategory || activeCategory === category.category;
            return (
              <g key={`${category.category}-connections`} opacity={categoryActive ? 1 : 0.18}>
                <motion.line
                  x1={CENTER.x}
                  y1={CENTER.y}
                  x2={category.position.x}
                  y2={category.position.y}
                  className={`skill-orbit__connection skill-orbit__connection--${category.color}`}
                  initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: categoryActive ? 1 : 0.35 }}
                  transition={{ duration: 0.9, delay: 0.18 }}
                />
                {category.items.map((item) => (
                  <motion.line
                    key={`${category.category}-${item.name}-line`}
                    x1={category.position.x}
                    y1={category.position.y}
                    x2={item.position.x}
                    y2={item.position.y}
                    className="skill-orbit__connection"
                    initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: categoryActive ? 0.72 : 0.15 }}
                    transition={{ duration: 0.65, delay: 0.28 + category.items.indexOf(item) * 0.05 }}
                  />
                ))}
              </g>
            );
          })}
        </g>

        <g className="skill-orbit__signals" aria-hidden="true">
          {categoryNodes.map((category, categoryIndex) => (
            <motion.circle
              key={`${category.category}-signal`}
              className="skill-orbit__signal"
              r="2.5"
              initial={reducedMotion ? false : { cx: CENTER.x, cy: CENTER.y }}
              animate={
                reducedMotion
                  ? undefined
                  : {
                      cx: [CENTER.x, category.position.x, CENTER.x],
                      cy: [CENTER.y, category.position.y, CENTER.y],
                      opacity: [0.18, 0.42, 0.18],
                    }
              }
              transition={{
                duration: 10 + categoryIndex * 1.5,
                delay: categoryIndex * 1.1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </g>

        <motion.g
          className="skill-orbit__center"
          animate={reducedMotion ? undefined : { y: [0, -3, 0, 2, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
        >
          <motion.circle
            cx={CENTER.x}
            cy={CENTER.y}
            r="72"
            className="skill-orbit__center-glow"
            animate={
              reducedMotion
                ? undefined
                : { r: [72, 74, 72], opacity: [0.76, 1, 0.76] }
            }
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle cx={CENTER.x} cy={CENTER.y} r="56" className="skill-orbit__center-node" />
          <text x={CENTER.x} y={CENTER.y - 4} className="skill-orbit__center-label" textAnchor="middle">RICHARD</text>
          <text x={CENTER.x} y={CENTER.y + 16} className="skill-orbit__center-meta" textAnchor="middle">SKILL MAP / 2026</text>
        </motion.g>

        <g className="skill-orbit__nodes">
          {categoryNodes.map((category, categoryIndex) => {
            const categoryActive = !activeCategory || activeCategory === category.category;
            return (
              <motion.g
                key={category.category}
                className={`skill-orbit__category skill-orbit__category--${category.color}`}
                tabIndex={0}
                role="button"
                aria-label={`${category.category} skills`}
                opacity={categoryActive ? 1 : 0.32}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: categoryActive ? 1 : 0.32, y: 0 }}
                transition={{ duration: 0.5, delay: 0.42 + categoryIndex * 0.08 }}
                onPointerEnter={() => setActiveCategory(category.category)}
                onPointerLeave={() => setActiveCategory(null)}
                onFocus={() => setActiveCategory(category.category)}
                onBlur={() => setActiveCategory(null)}
              >
                <motion.g
                  animate={
                    reducedMotion
                      ? undefined
                      : { y: [0, -1.5, 0, 1, 0], opacity: [1, 0.96, 1, 0.98, 1] }
                  }
                  transition={{
                    duration: 13 + categoryIndex * 1.8,
                    delay: 1.2 + categoryIndex * 1.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <circle cx={category.position.x} cy={category.position.y} r="8" className="skill-orbit__category-dot" />
                  <text x={category.position.x} y={category.position.y - 20} className="skill-orbit__category-label" textAnchor="middle">
                    {category.category}
                  </text>
                  {category.items.map((item, itemIndex) => (
                    <g key={`${category.category}-${item.name}`} className="skill-orbit__item">
                      <circle cx={item.position.x} cy={item.position.y} r="3" className="skill-orbit__item-dot" />
                      <text
                        x={item.position.x}
                        y={item.position.y + (itemIndex % 2 === 0 ? -10 : 18)}
                        className="skill-orbit__item-label"
                        textAnchor="middle"
                      >
                        {item.name}
                      </text>
                    </g>
                  ))}
                </motion.g>
              </motion.g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
