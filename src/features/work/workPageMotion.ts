import { gsap } from 'gsap';
import { getWorkMotionProfile } from '../../lib/workMotion';

const select = <T extends Element>(root: Element, selector: string) =>
  root.querySelector<T>(selector);

const selectAll = <T extends Element>(root: Element, selector: string) =>
  Array.from(root.querySelectorAll<T>(selector));

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function initWorkPageMotion(root: HTMLElement) {
  const media = gsap.matchMedia();

  media.add(
    {
      reducedMotion: '(prefers-reduced-motion: reduce)',
      finePointer: '(pointer: fine)',
    },
    (context) => {
      const { reducedMotion, finePointer } = context.conditions as {
        reducedMotion: boolean;
        finePointer: boolean;
      };
      const profile = getWorkMotionProfile({ reducedMotion, finePointer });
      const revealTargets = selectAll<HTMLElement>(root, '[data-work-reveal]');
      const timelineTargets = selectAll<HTMLElement>(root, '[data-work-timeline-item]');
      const loopTargets = selectAll<HTMLElement>(root, '[data-work-loop]');
      const allRevealTargets = Array.from(new Set([...revealTargets, ...timelineTargets, ...loopTargets]));
      const heroTargets = allRevealTargets.filter(
        (element) => element.closest('[data-work-section="hero"]'),
      );
      const sectionTargets = allRevealTargets.filter(
        (element) => !element.closest('[data-work-section="hero"]'),
      );
      const progressFill = select<HTMLElement>(root, '[data-work-progress-fill]');
      const heroMark = select<HTMLElement>(root, '[data-work-hero-mark]');
      const heroRing = heroMark?.querySelector<HTMLElement>('.work-redesign__hero-mark-ring');
      const timelines: gsap.core.Timeline[] = [];
      let observer: IntersectionObserver | undefined;

      if (reducedMotion) {
        gsap.set(allRevealTargets, { autoAlpha: 1, clearProps: 'transform,filter' });
        gsap.set(progressFill, { scaleX: 1, transformOrigin: 'left center' });
        return;
      }

      gsap.set(heroTargets, { autoAlpha: 0, y: profile.revealOffset });
      gsap.set(sectionTargets, { y: profile.revealOffset });
      gsap.set(progressFill, { scaleX: 0, transformOrigin: 'left center' });

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timelines.push(intro);
      intro
        .addLabel('hero')
        .to(heroTargets.filter((element) => element.dataset.workReveal === 'eyebrow'), {
          autoAlpha: 1,
          y: 0,
          duration: profile.revealDuration * 0.8,
        }, 'hero')
        .to(heroTargets.filter((element) => element.dataset.workReveal === 'heading'), {
          autoAlpha: 1,
          y: 0,
          duration: profile.revealDuration * 1.25,
        }, 'hero+=0.08')
        .to(heroTargets.filter((element) => element.dataset.workReveal === 'lede'), {
          autoAlpha: 1,
          y: 0,
          duration: profile.revealDuration,
        }, 'hero+=0.26')
        .to(heroTargets.filter((element) => element.dataset.workReveal === 'scroll'), {
          autoAlpha: 1,
          y: 0,
          duration: profile.revealDuration * 0.8,
        }, 'hero+=0.48');

      const sectionMap = new Map<Element, HTMLElement[]>();
      sectionTargets.forEach((target) => {
        const section = target.closest<HTMLElement>('[data-work-section]');
        if (!section) return;
        const targets = sectionMap.get(section) ?? [];
        targets.push(target);
        sectionMap.set(section, targets);
      });

      const revealSection = (section: Element, targets: HTMLElement[]) => {
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        timelines.push(timeline);
        timeline.to(targets, {
          autoAlpha: 1,
          y: 0,
          duration: profile.revealDuration,
          stagger: profile.revealStagger,
        });
        sectionMap.delete(section);
      };

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const targets = sectionMap.get(entry.target);
            if (targets) revealSection(entry.target, targets);
            observer?.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
      );
      sectionMap.forEach((_targets, section) => observer?.observe(section));

      if (progressFill) {
        const progressTo = gsap.quickTo(progressFill, 'scaleX', {
          duration: 0.28,
          ease: 'power2.out',
        });
        const updateProgress = () => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          progressTo(maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 1);
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();

        if (heroRing) {
          gsap.to(heroRing, {
            rotation: 360,
            duration: 34,
            repeat: -1,
            ease: 'none',
          });
        }

        let handlePointerMove: ((event: PointerEvent) => void) | undefined;
        let handlePointerLeave: (() => void) | undefined;
        let handleResize: (() => void) | undefined;
        if (finePointer && heroMark) {
          let bounds = root.getBoundingClientRect();
          const moveX = gsap.quickTo(heroMark, 'x', { duration: 0.9, ease: 'power3.out' });
          const moveY = gsap.quickTo(heroMark, 'y', { duration: 0.9, ease: 'power3.out' });
          const refreshBounds = () => { bounds = root.getBoundingClientRect(); };
          handleResize = refreshBounds;
          handlePointerMove = (event) => {
            const x = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5);
            const y = clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5);
            moveX(x * profile.skillParallax.x);
            moveY(y * profile.skillParallax.y);
          };
          handlePointerLeave = () => {
            moveX(0);
            moveY(0);
          };
          root.addEventListener('pointermove', handlePointerMove, { passive: true });
          root.addEventListener('pointerleave', handlePointerLeave, { passive: true });
          window.addEventListener('resize', handleResize, { passive: true });
        }

        return () => {
          observer?.disconnect();
          timelines.forEach((timeline) => timeline.kill());
          gsap.killTweensOf([progressFill, heroMark, heroRing]);
          if (handlePointerMove) root.removeEventListener('pointermove', handlePointerMove);
          if (handlePointerLeave) root.removeEventListener('pointerleave', handlePointerLeave);
          if (handleResize) window.removeEventListener('resize', handleResize);
          window.removeEventListener('scroll', updateProgress);
        };
      }

      return () => {
        observer?.disconnect();
        timelines.forEach((timeline) => timeline.kill());
        gsap.killTweensOf([progressFill, heroMark, heroRing]);
      };
    },
  );

  return () => media.revert();
}
