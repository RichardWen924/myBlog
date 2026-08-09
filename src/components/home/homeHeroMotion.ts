import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ENTRY_PROGRESS_COMPLETE_EVENT } from '../../lib/uiEvents';

gsap.registerPlugin(ScrollTrigger);

export const HERO_REVEAL_DURATION = 1.15;

const select = <T extends Element>(root: Element, selector: string) =>
  root.querySelector<T>(selector);

const selectAll = <T extends Element>(root: Element, selector: string) =>
  Array.from(root.querySelectorAll<T>(selector));

export function initHomeHeroMotion(hero: HTMLElement) {
  let handlePointerMove: ((event: PointerEvent) => void) | undefined;
  let handlePointerLeave: (() => void) | undefined;
  let handleEntryComplete: (() => void) | undefined;

  const context = gsap.context(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const copy = select<HTMLElement>(hero, '[data-home-hero-copy]');
    const workspace = select<HTMLElement>(hero, '[data-home-hero-workspace]');
    const paperStack = select<HTMLElement>(hero, '[data-home-hero-paper-stack]');
    const scrollCue = select<HTMLElement>(hero, '[data-home-hero-scroll]');
    const eyebrow = select<HTMLElement>(hero, '[data-home-hero-eyebrow]');
    const overline = select<HTMLElement>(hero, '[data-home-hero-overline]');
    const lede = select<HTMLElement>(hero, '[data-home-hero-lede]');
    const cta = select<HTMLElement>(hero, '[data-home-hero-cta]');
    const titleLines = selectAll<HTMLElement>(hero, '[data-home-hero-title-line]');
    const papers = selectAll<HTMLElement>(hero, '[data-home-hero-paper]');
    const routes = selectAll<SVGPathElement>(hero, '[data-home-hero-route]');

    const visibleElements = [eyebrow, overline, lede, cta, workspace, scrollCue, ...titleLines, ...papers]
      .filter((element): element is HTMLElement => Boolean(element));

    if (reducedMotion) {
      gsap.set(visibleElements, { autoAlpha: 1, clearProps: 'transform' });
      gsap.set(routes, { strokeDashoffset: 0 });
      return;
    }

    gsap.set([eyebrow, overline], { autoAlpha: 0, y: 12 });
    gsap.set([lede, cta], { autoAlpha: 0, y: 18 });
    gsap.set(titleLines, { autoAlpha: 1, yPercent: 112, rotate: 1.5 });
    gsap.set(workspace, { autoAlpha: 0, x: 28, y: 14, scale: 0.97 });
    gsap.set(papers, { autoAlpha: 0, x: 20, y: 16, rotate: 2.5 });
    gsap.set(routes, { strokeDasharray: 720, strokeDashoffset: 720 });
    gsap.set(scrollCue, { autoAlpha: 0, y: 8 });

    const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    intro
      .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.28 }, 0)
      .to(overline, { autoAlpha: 1, y: 0, duration: 0.32 }, 0.04)
      .to(titleLines, { yPercent: 0, rotate: 0, duration: 0.58, ease: 'power4.out' }, 0.1)
      .to(workspace, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.62 }, 0.18)
      .to(papers, { autoAlpha: 1, x: 0, y: 0, rotate: 0, duration: 0.5, stagger: 0.06 }, 0.35)
      .to(routes, { strokeDashoffset: 0, duration: 0.65, ease: 'power2.inOut' }, 0.25)
      .to([lede, cta], { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.48)
      .to(scrollCue, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.82);
    intro.duration(HERO_REVEAL_DURATION);

    const paperDrift = gsap.to(papers, {
      y: (index) => (index - 1) * 2 - 2,
      rotation: (index) => (index - 1) * 0.25,
      duration: 5.2,
      stagger: 0.25,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      paused: true,
    });

    intro.eventCallback('onComplete', () => paperDrift.play());

    let experienceStarted = false;
    const startHero = () => {
      if (experienceStarted) return;
      experienceStarted = true;
      intro.play(0);
    };

    const entryAlreadyComplete = document.documentElement.dataset.entryReady === 'true'
      || !document.querySelector('.entry-progress-loader');

    if (entryAlreadyComplete) {
      startHero();
    } else {
      handleEntryComplete = () => startHero();
      document.addEventListener(ENTRY_PROGRESS_COMPLETE_EVENT, handleEntryComplete, { once: true });
    }

    const scrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    scrollTimeline
      .to(copy, { yPercent: -8, ease: 'none' }, 0)
      .to(workspace, { yPercent: -12, scale: 1.025, ease: 'none' }, 0)
      .to(titleLines, { xPercent: -1.5, ease: 'none' }, 0)
      .to(scrollCue, { autoAlpha: 0, y: -12, ease: 'none' }, 0);

    if (finePointer && !coarsePointer && workspace && paperStack) {
      handlePointerMove = (event: PointerEvent) => {
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        gsap.to(workspace, {
          x: x * 10,
          y: y * 7,
          duration: 0.75,
          overwrite: 'auto',
          ease: 'power2.out',
        });
        gsap.to(paperStack, {
          x: x * -5,
          y: y * -3,
          duration: 0.9,
          overwrite: 'auto',
          ease: 'power2.out',
        });
      };

      handlePointerLeave = () => {
        gsap.to(workspace, { x: 0, y: 0, duration: 1, overwrite: 'auto', ease: 'power3.out' });
        gsap.to(paperStack, { x: 0, y: 0, duration: 1, overwrite: 'auto', ease: 'power3.out' });
      };

      hero.addEventListener('pointermove', handlePointerMove, { passive: true });
      hero.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }
  }, hero);

  return () => {
    if (handlePointerMove) hero.removeEventListener('pointermove', handlePointerMove);
    if (handlePointerLeave) hero.removeEventListener('pointerleave', handlePointerLeave);
    if (handleEntryComplete) document.removeEventListener(ENTRY_PROGRESS_COMPLETE_EVENT, handleEntryComplete);
    context.revert();
  };
}
