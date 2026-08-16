import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface DynamicIllustrationProps {
  className?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * A lightweight, editorial illustration scene for the Hero.
 * The artwork is intentionally abstract so the existing paper theme remains
 * the visual identity, while the layers create the feeling of a living page.
 */
export default function DynamicIllustration({ className = '' }: DynamicIllustrationProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      const y = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
      host.style.setProperty('--illustration-x', x.toFixed(3));
      host.style.setProperty('--illustration-y', y.toFixed(3));
    };

    const resetPointer = () => {
      host.style.setProperty('--illustration-x', '0');
      host.style.setProperty('--illustration-y', '0');
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', resetPointer);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', resetPointer);
    };
  }, [reducedMotion]);

  const lineTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 1.15, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div
      ref={hostRef}
      className={`dynamic-illustration ${className}`}
      data-motion={reducedMotion ? 'static' : 'idle'}
      aria-hidden="true"
    >
      <svg
        className="dynamic-illustration__background"
        viewBox="0 0 720 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="144" cy="230" r="156" stroke="currentColor" strokeOpacity=".08" />
        <circle cx="144" cy="230" r="108" stroke="currentColor" strokeOpacity=".08" />
        <path
          d="M24 339C105 285 174 278 242 319C308 359 347 354 405 305C472 248 548 254 698 318"
          stroke="currentColor"
          strokeOpacity=".08"
          strokeWidth="1.5"
        />
      </svg>

      <motion.svg
        className="dynamic-illustration__midground"
        viewBox="0 0 720 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        initial={reducedMotion ? false : { opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={lineTransition}
      >
        <motion.path
          d="M-18 318C74 278 108 179 195 171C268 165 292 252 359 251C421 250 459 157 540 141C596 130 647 153 746 213"
          className="dynamic-illustration__ink-line"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 10"
          initial={reducedMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={lineTransition}
        />
        <motion.path
          d="M85 87C119 55 169 45 205 67C241 89 235 129 207 142C180 155 147 140 150 113C153 85 195 67 232 78"
          className="dynamic-illustration__warm-line"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          initial={reducedMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ ...lineTransition, delay: 0.18 }}
        />
        <circle cx="562" cy="103" r="9" fill="currentColor" fillOpacity=".13" />
        <circle cx="579" cy="121" r="3" fill="currentColor" fillOpacity=".45" />
        <circle cx="548" cy="126" r="4" fill="currentColor" fillOpacity=".28" />
        <path d="M592 82L626 112L594 132" stroke="currentColor" strokeOpacity=".48" strokeWidth="2" />
      </motion.svg>

      <motion.div
        className="dynamic-illustration__foreground"
        initial={reducedMotion ? false : { opacity: 0, y: 18, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.28, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg viewBox="0 0 250 175" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M24 19L224 8L236 148L36 162L24 19Z"
            fill="var(--color-paper)"
            fillOpacity=".82"
            stroke="currentColor"
            strokeOpacity=".28"
            strokeWidth="1.5"
          />
          <path d="M51 50L177 43" stroke="currentColor" strokeOpacity=".4" strokeWidth="2" />
          <path d="M52 66L192 58" stroke="currentColor" strokeOpacity=".16" />
          <path d="M53 79L156 73" stroke="currentColor" strokeOpacity=".16" />
          <path d="M53 111C79 91 98 93 113 110C128 127 145 128 170 106" stroke="var(--color-warm)" strokeWidth="2" strokeLinecap="round" />
          <path d="M169 99L176 106L168 113" stroke="var(--color-warm)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="51" y="35" fill="var(--color-accent)" fontFamily="monospace" fontSize="10" letterSpacing="2">01 / THINKING NOTE</text>
        </svg>
      </motion.div>
    </div>
  );
}
