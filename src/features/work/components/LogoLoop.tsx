import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './LogoLoop.css';

export type LogoItem =
  | {
      node: React.ReactNode;
      href?: string;
      title?: string;
      ariaLabel?: string;
    }
  | {
      src: string;
      alt?: string;
      href?: string;
      title?: string;
      srcSet?: string;
      sizes?: string;
      width?: number;
      height?: number;
    };

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
} as const;

const toCssLength = (value?: number | string) =>
  typeof value === 'number' ? `${value}px` : value;

function useResizeObserver(
  callback: () => void,
  elements: Array<React.RefObject<Element | null>>,
  dependencies: React.DependencyList,
) {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener('resize', handleResize);
      callback();
      return () => window.removeEventListener('resize', handleResize);
    }

    const observers = elements.map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();
    return () => observers.forEach((observer) => observer?.disconnect());
  }, dependencies);
}

function useImageLoader(
  seqRef: React.RefObject<HTMLUListElement | null>,
  onLoad: () => void,
  dependencies: React.DependencyList,
) {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];
    if (images.length === 0) {
      onLoad();
      return;
    }

    let remainingImages = images.length;
    const handleLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) onLoad();
    };

    images.forEach((image) => {
      if (image.complete) {
        handleLoad();
      } else {
        image.addEventListener('load', handleLoad, { once: true });
        image.addEventListener('error', handleLoad, { once: true });
      }
    });

    return () => {
      images.forEach((image) => {
        image.removeEventListener('load', handleLoad);
        image.removeEventListener('error', handleLoad);
      });
    };
  }, dependencies);
}

function useAnimationLoop(
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  seqHeight: number,
  isHovered: boolean,
  hoverSpeed: number | undefined,
  isVertical: boolean,
  reducedMotion: boolean,
) {
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (reducedMotion) return;

    const sequenceSize = isVertical ? seqHeight : seqWidth;
    if (sequenceSize > 0) {
      offsetRef.current = ((offsetRef.current % sequenceSize) + sequenceSize) % sequenceSize;
      track.style.transform = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;
      const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (sequenceSize > 0) {
        const nextOffset = offsetRef.current + velocityRef.current * deltaTime;
        offsetRef.current = ((nextOffset % sequenceSize) + sequenceSize) % sequenceSize;
        track.style.transform = isVertical
          ? `translate3d(0, ${-offsetRef.current}px, 0)`
          : `translate3d(${-offsetRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical, reducedMotion]);
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

export const LogoLoop = React.memo<LogoLoopProps>(function LogoLoop({
  logos,
  speed = 120,
  direction = 'left',
  width = '100%',
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = 'Partner logos',
  className,
  style,
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);
  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [copyCount, setCopyCount] = useState<number>(ANIMATION_CONFIG.MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === false) return undefined;
    return 0;
  }, [hoverSpeed, pauseOnHover]);

  const isVertical = direction === 'up' || direction === 'down';
  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    const directionMultiplier = isVertical
      ? direction === 'up' ? 1 : -1
      : direction === 'left' ? 1 : -1;
    return magnitude * directionMultiplier * (speed < 0 ? -1 : 1);
  }, [speed, direction, isVertical]);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const sequenceRect = seqRef.current?.getBoundingClientRect();
    const sequenceWidth = sequenceRect?.width ?? 0;
    const sequenceHeight = sequenceRect?.height ?? 0;

    if (isVertical) {
      const parentHeight = containerRef.current?.parentElement?.clientHeight ?? 0;
      if (containerRef.current && parentHeight > 0) {
        const targetHeight = `${Math.ceil(parentHeight)}px`;
        if (containerRef.current.style.height !== targetHeight) containerRef.current.style.height = targetHeight;
      }
      if (sequenceHeight > 0) {
        setSeqHeight(Math.ceil(sequenceHeight));
        const viewport = containerRef.current?.clientHeight ?? parentHeight ?? sequenceHeight;
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, Math.ceil(viewport / sequenceHeight) + ANIMATION_CONFIG.COPY_HEADROOM));
      }
    } else if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM));
    }
  }, [isVertical]);

  useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight, isVertical]);
  useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight, isVertical]);
  useAnimationLoop(trackRef, targetVelocity, seqWidth, seqHeight, isHovered, effectiveHoverSpeed, isVertical, reducedMotion);

  const cssVariables = useMemo(() => ({
    '--logoloop-gap': `${gap}px`,
    '--logoloop-logoHeight': `${logoHeight}px`,
    ...(fadeOutColor ? { '--logoloop-fadeColor': fadeOutColor } : {}),
  }) as React.CSSProperties, [gap, logoHeight, fadeOutColor]);

  const rootClassName = [
    'logoloop',
    isVertical ? 'logoloop--vertical' : 'logoloop--horizontal',
    fadeOut && 'logoloop--fade',
    scaleOnHover && 'logoloop--scale-hover',
    className,
  ].filter(Boolean).join(' ');

  const renderLogoItem = useCallback((item: LogoItem, key: React.Key) => {
    if (renderItem) {
      return <li className="logoloop__item" key={key} role="listitem">{renderItem(item, key)}</li>;
    }

    const content = 'node' in item ? (
      <span className="logoloop__node">{item.node}</span>
    ) : (
      <img
        src={item.src}
        srcSet={item.srcSet}
        sizes={item.sizes}
        width={item.width}
        height={item.height}
        alt={item.alt ?? ''}
        title={item.title}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    );

    const itemLabel = 'node' in item
      ? item.ariaLabel ?? item.title
      : item.alt ?? item.title;

    return <li className="logoloop__item" key={key} role="listitem">{item.href ? (
      <a className="logoloop__link" href={item.href} aria-label={itemLabel ?? 'logo link'} target="_blank" rel="noreferrer noopener">
        {content}
      </a>
    ) : content}</li>;
  }, [renderItem]);

  const logoLists = useMemo(() => Array.from({ length: copyCount }, (_, copyIndex) => (
    <ul
      className="logoloop__list"
      key={`copy-${copyIndex}`}
      role="list"
      aria-hidden={copyIndex > 0}
      ref={copyIndex === 0 ? seqRef : undefined}
    >
      {logos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
    </ul>
  )), [copyCount, logos, renderLogoItem]);

  const containerStyle = useMemo(() => ({
    width: isVertical && toCssLength(width) === '100%' ? undefined : (toCssLength(width) ?? '100%'),
    ...cssVariables,
    ...style,
  }) as React.CSSProperties, [width, cssVariables, style, isVertical]);

  const handleMouseEnter = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(true);
  }, [effectiveHoverSpeed]);
  const handleMouseLeave = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(false);
  }, [effectiveHoverSpeed]);
  const handleFocus = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(true);
  }, [effectiveHoverSpeed]);
  const handleBlur = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(false);
  }, [effectiveHoverSpeed]);

  return (
    <div ref={containerRef} className={rootClassName} style={containerStyle} role="region" aria-label={ariaLabel}>
      <div
        className="logoloop__track"
        ref={trackRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocusCapture={handleFocus}
        onBlurCapture={handleBlur}
      >
        {logoLists}
      </div>
    </div>
  );
});

LogoLoop.displayName = 'LogoLoop';

export default LogoLoop;
