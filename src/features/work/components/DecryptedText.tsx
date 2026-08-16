import { useCallback, useEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react';

interface DecryptedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  speed?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover' | 'click';
}

const defaultCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';

/** React Bits-inspired character decryption reveal, adapted to the project's framer-motion stack. */
export default function DecryptedText({
  text,
  speed = 50,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = defaultCharacters,
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const hostRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo(
    () => (useOriginalCharsOnly ? Array.from(new Set(text)).filter((char) => char !== ' ') : characters.split('')),
    [characters, text, useOriginalCharsOnly],
  );

  const scramble = useCallback((revealedIndices: Set<number>) => (
    text.split('').map((char, index) => {
      if (char === ' ' || revealedIndices.has(index)) return char;
      return availableChars[Math.floor(Math.random() * availableChars.length)] ?? char;
    }).join('')
  ), [availableChars, text]);

  const getOrder = useCallback(() => {
    const order: number[] = [];
    if (revealDirection === 'start') return text.split('').map((_, index) => index);
    if (revealDirection === 'end') return text.split('').map((_, index) => text.length - index - 1);
    const middle = Math.floor(text.length / 2);
    for (let offset = 0; order.length < text.length; offset += 1) {
      const index = offset % 2 === 0 ? middle + offset / 2 : middle - Math.ceil(offset / 2);
      if (index >= 0 && index < text.length) order.push(index);
    }
    return order;
  }, [revealDirection, text]);

  const startReveal = useCallback(() => {
    if (isAnimating) return;
    setRevealed(new Set());
    setDisplayText(scramble(new Set()));
    setIsAnimating(true);
  }, [isAnimating, scramble]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsAnimating(false);
    setRevealed(new Set());
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    if (!isAnimating) return undefined;
    const order = getOrder();
    let pointer = 0;

    intervalRef.current = setInterval(() => {
      setRevealed((current) => {
        if (pointer >= order.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setDisplayText(text);
          setIsAnimating(false);
          return current;
        }
        const next = new Set(current);
        const nextIndex = order[pointer];
        if (nextIndex === undefined) return current;
        next.add(nextIndex);
        pointer += 1;
        setDisplayText(scramble(next));
        return next;
      });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [getOrder, isAnimating, scramble, sequential, speed, text]);

  useEffect(() => {
    if (animateOn !== 'view') return undefined;
    const host = hostRef.current;
    if (!host) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !hasAnimated) {
        startReveal();
        setHasAnimated(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(host);
    return () => observer.disconnect();
  }, [animateOn, hasAnimated, startReveal]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handlers = animateOn === 'hover'
    ? { onMouseEnter: startReveal, onMouseLeave: reset }
    : animateOn === 'click'
      ? { onClick: startReveal }
      : {};

  return (
    <span ref={hostRef} className={parentClassName} {...handlers} {...props}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => {
          const isRevealed = revealed.has(index) || (!isAnimating && hasAnimated);
          return <span key={`${char}-${index}`} className={isRevealed ? className : encryptedClassName}>{char}</span>;
        })}
      </span>
    </span>
  );
}
