import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  animateBy?: 'words' | 'characters';
}

/** Word-by-word blur-in reveal. Paper-feel, transform/opacity only. */
export default function BlurText({
  text,
  className = '',
  delay = 80,
  duration = 600,
  animateBy = 'words',
}: BlurTextProps) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={`inline-block ${className}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {elements.map((el, i) => (
        <span
          key={i}
          className="inline-block whitespace-pre"
          style={
            {
              opacity: inView ? 1 : 0,
              filter: inView ? 'blur(0)' : 'blur(6px)',
              transform: inView ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${i * delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${i * delay}ms, filter ${duration}ms cubic-bezier(0.16,1,0.3,1) ${i * delay}ms`,
            } as CSSProperties
          }
        >
          {el}
          {animateBy === 'words' && i < elements.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}
