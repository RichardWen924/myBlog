import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getWorkMotionProfile } from '../../lib/workMotion';

gsap.registerPlugin(ScrollTrigger);

const selectAll = <T extends Element>(root: Element, selector: string) =>
  Array.from(root.querySelectorAll<T>(selector));

/**
 * Work page motion: a quiet reading rhythm for the archive chapters.
 * Every animation is scoped to the page root so Astro view transitions can cleanly revert it.
 */
export function initWorkPageMotion(root: HTMLElement) {
  let revertMatchMedia = () => {};

  const context = gsap.context(() => {
    const matchMedia = gsap.matchMedia();
    revertMatchMedia = () => matchMedia.revert();

    matchMedia.add(
      {
        reduce: '(prefers-reduced-motion: reduce)',
        fine: '(pointer: fine)',
      },
      (conditions) => {
        const reducedMotion = Boolean(conditions?.reduce);
        const finePointer = Boolean(conditions?.fine);
        const profile = getWorkMotionProfile({ reducedMotion, finePointer });
        const revealTargets = selectAll<HTMLElement>(root, '[data-work-motion-reveal]');
        const signalTargets = revealTargets.filter(
          (element) => element.dataset.workMotionReveal === 'signal',
        );
        const eyebrowTargets = revealTargets.filter(
          (element) => element.dataset.workMotionReveal === 'eyebrow',
        );
        const progressFill = root.querySelector<HTMLElement>('[data-work-scroll-progress-fill]');
        const heroChapter = root.querySelector<HTMLElement>('[data-work-chapter="hero"]');

        if (reducedMotion) {
          gsap.set(revealTargets, { autoAlpha: 1, clearProps: 'transform' });
          gsap.set(selectAll<HTMLElement>(root, '.section-eyebrow__line'), {
            scaleX: 1,
            transformOrigin: 'left center',
          });
          gsap.set(progressFill, { scaleX: 1, transformOrigin: 'left center' });
          return;
        }

        gsap.set(revealTargets, { autoAlpha: 0, y: profile.revealOffset });
        gsap.set(selectAll<HTMLElement>(root, '.section-eyebrow__line'), {
          scaleX: 0,
          transformOrigin: 'left center',
        });
        gsap.set(progressFill, { scaleX: 0, transformOrigin: 'left center' });

        const reveal = (element: HTMLElement, delay = 0) => {
          gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            delay,
            duration: profile.revealDuration,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: profile.revealStart,
              once: true,
            },
          });
        };

        revealTargets
          .filter((element) => element.dataset.workMotionReveal !== 'signal')
          .forEach((element) => reveal(element));
        signalTargets.forEach((element, index) => reveal(element, index * profile.revealStagger));

        eyebrowTargets.forEach((element) => {
          const line = element.querySelector<HTMLElement>('.section-eyebrow__line');
          if (!line) return;
          gsap.to(line, {
            scaleX: 1,
            duration: profile.revealDuration,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: profile.revealStart,
              once: true,
            },
          });
        });

        if (heroChapter) {
          gsap.fromTo(
            heroChapter,
            { autoAlpha: 0.76, y: profile.revealOffset * 0.6 },
            { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          );
          gsap.to(heroChapter, {
            yPercent: profile.heroParallaxPercent,
            ease: 'none',
            scrollTrigger: {
              trigger: heroChapter,
              start: 'top top',
              end: 'bottom top',
              scrub: profile.heroScrub,
              invalidateOnRefresh: true,
            },
          });
        }

        if (progressFill) {
          gsap.to(progressFill, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom bottom',
              scrub: profile.progressScrub,
              invalidateOnRefresh: true,
            },
          });
        }

      },
      root,
    );
  }, root);

  return () => {
    revertMatchMedia();
    context.revert();
  };
}
