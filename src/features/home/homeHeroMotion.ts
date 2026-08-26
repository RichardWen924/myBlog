import { gsap } from 'gsap';
import { navigate } from 'astro:transitions/client';
import { getGreetingRotation, getHomeMotionProfile } from './homeHero';

const select = <T extends Element>(root: Element, selector: string) =>
  root.querySelector<T>(selector);

const selectAll = <T extends Element>(root: Element, selector: string) =>
  Array.from(root.querySelectorAll<T>(selector));

const canAnimateNavigation = (event: MouseEvent) =>
  event.button === 0
  && !event.metaKey
  && !event.ctrlKey
  && !event.shiftKey
  && !event.altKey;

export function initHomeHeroMotion(hero: HTMLElement) {
  const media = gsap.matchMedia();

  media.add(
    {
      isDesktop: '(min-width: 768px)',
      finePointer: '(pointer: fine)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { isDesktop, finePointer, reduceMotion } = context.conditions as {
        isDesktop: boolean;
        finePointer: boolean;
        reduceMotion: boolean;
      };
      const profile = getHomeMotionProfile(reduceMotion);
      const topbar = select<HTMLElement>(hero, '[data-home-frame-top]');
      const footer = select<HTMLElement>(hero, '[data-home-frame-footer]');
      const welcome = select<HTMLElement>(hero, '[data-home-welcome]');
      const orbit = select<HTMLElement>(hero, '[data-home-orbit]');
      const markerTrack = select<HTMLElement>(hero, '[data-home-orbit-marker-track]');
      const identity = select<HTMLElement>(hero, '[data-home-identity]');
      const counter = select<HTMLElement>(hero, '[data-home-counter]');
      const indexLabel = select<HTMLElement>(hero, '[data-home-greeting-index]');
      const greetings = selectAll<HTMLElement>(hero, '[data-home-greeting-item]');
      const routes = selectAll<HTMLAnchorElement>(hero, '[data-home-route]');
      const routeLabels = selectAll<HTMLElement>(hero, '[data-home-route-label]');
      const routeArrows = selectAll<HTMLElement>(hero, '[data-home-route-arrow]');
      const routeLines = selectAll<HTMLElement>(hero, '[data-home-route-line]');
      const firstGreeting = greetings[0];

      if (
        !topbar
        || !footer
        || !welcome
        || !orbit
        || !markerTrack
        || !identity
        || !counter
        || !indexLabel
        || !firstGreeting
        || routes.length === 0
      ) {
        return;
      }

      let greetingLoop: gsap.core.Timeline | null = null;
      let exitTimeline: gsap.core.Timeline | null = null;
      let navigating = false;

      const setActiveGreeting = (activeIndex: number) => {
        greetings.forEach((greeting, index) => {
          greeting.toggleAttribute('data-greeting-active', index === activeIndex);
        });
        indexLabel.textContent = String(activeIndex + 1).padStart(2, '0');
      };

      const routeHandlers = routes.map((route) => {
        const handleRouteClick = (event: MouseEvent) => {
          if (event.defaultPrevented || !canAnimateNavigation(event) || navigating) return;

          const href = route.href;
          if (!href) return;

          event.preventDefault();
          navigating = true;
          greetingLoop?.pause();

          if (reduceMotion) {
            void navigate(href, { sourceElement: route });
            return;
          }

          const otherRoutes = routes.filter((candidate) => candidate !== route);
          const selectedLabel = select<HTMLElement>(route, '[data-home-route-label]');
          const selectedArrow = select<HTMLElement>(route, '[data-home-route-arrow]');
          const selectedLine = select<HTMLElement>(route, '[data-home-route-line]');
          exitTimeline = gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            onComplete: () => void navigate(href, { sourceElement: route }),
          });

          exitTimeline
            .to(otherRoutes, {
              autoAlpha: 0,
              x: -16,
              duration: profile.transitionDuration * 0.62,
              stagger: 0.025,
            }, 0)
            .to([welcome, topbar, footer], {
              autoAlpha: 0,
              x: -18,
              duration: profile.transitionDuration * 0.74,
            }, 0)
            .to(route, {
              x: 14,
              duration: profile.transitionDuration * 0.72,
            }, 0)
            .to(selectedLabel, {
              color: 'var(--color-accent)',
              duration: profile.transitionDuration * 0.52,
            }, 0)
            .to(selectedArrow, {
              color: 'var(--color-warm)',
              x: 8,
              y: -8,
              duration: profile.transitionDuration * 0.62,
            }, 0)
            .to(selectedLine, {
              backgroundColor: 'var(--color-warm)',
              scaleX: 0.32,
              duration: profile.transitionDuration * 0.72,
            }, 0)
            .to(route, {
              autoAlpha: 0,
              duration: profile.transitionDuration * 0.28,
            }, profile.transitionDuration * 0.72);
        };

        route.addEventListener('click', handleRouteClick);
        return { route, handleRouteClick };
      });

      gsap.set(greetings, { autoAlpha: 0, yPercent: 72, filter: 'blur(4px)' });
      gsap.set(firstGreeting, { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)' });
      gsap.set(markerTrack, { rotation: 45 });
      setActiveGreeting(0);

      if (reduceMotion) {
        gsap.set([topbar, footer, welcome, orbit, identity, counter, ...routes], {
          autoAlpha: 1,
          clearProps: 'transform,filter',
        });
        gsap.set(routeLines, { scaleX: 1, transformOrigin: 'left center' });
        gsap.set(greetings.slice(1), { autoAlpha: 0 });

        return () => {
          exitTimeline?.kill();
          gsap.killTweensOf(welcome);
          routeHandlers.forEach(({ route, handleRouteClick }) => {
            route.removeEventListener('click', handleRouteClick);
          });
        };
      }

      gsap.set(topbar, { autoAlpha: 0, y: -10 });
      gsap.set(orbit, { autoAlpha: 0, scale: 0.94 });
      gsap.set(firstGreeting, { autoAlpha: 0, yPercent: 72, filter: 'blur(5px)' });
      gsap.set(identity, { autoAlpha: 0, y: 18 });
      gsap.set(counter, { autoAlpha: 0, x: -10 });
      gsap.set(routeLabels, { autoAlpha: 0, yPercent: 72 });
      gsap.set(routeArrows, { autoAlpha: 0, x: -6, y: 6 });
      gsap.set(routeLines, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(footer, { autoAlpha: 0, y: 8 });

      let markerStep = 1;
      const buildGreetingLoop = (): gsap.core.Timeline => {
        const loop = gsap.timeline({ paused: true });

        greetings.forEach((currentGreeting, index) => {
          const nextIndex = (index + 1) % greetings.length;
          const nextGreeting = greetings[nextIndex];
          const markerRotation = getGreetingRotation(markerStep, greetings.length);
          markerStep += 1;
          if (!nextGreeting) return;

          loop
            .to({}, { duration: profile.greetingHold })
            .to(currentGreeting, {
              autoAlpha: 0,
              yPercent: -72,
              filter: 'blur(4px)',
              duration: 0.48,
              ease: 'power3.in',
            })
            .fromTo(nextGreeting, {
              autoAlpha: 0,
              yPercent: 72,
              filter: 'blur(4px)',
            }, {
              autoAlpha: 1,
              yPercent: 0,
              filter: 'blur(0px)',
              duration: 0.6,
              ease: 'power4.out',
              immediateRender: false,
            }, '<0.08')
            .to(markerTrack, {
              rotation: markerRotation,
              duration: 0.72,
              ease: 'power3.inOut',
            }, '<')
            .add(() => setActiveGreeting(nextIndex), '>-0.12');
        });

        loop.eventCallback('onComplete', () => {
          if (greetingLoop !== loop) return;
          greetingLoop = buildGreetingLoop();
          greetingLoop.play(0);
        });

        return loop;
      };

      greetingLoop = buildGreetingLoop();

      const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
      intro
        .addLabel('frame', 0)
        .to(topbar, { autoAlpha: 1, y: 0, duration: 0.42 }, 'frame')
        .fromTo(markerTrack, { rotation: 18 }, { rotation: 45, duration: 0.78 }, 'frame+=0.04')
        .to(orbit, { autoAlpha: 1, scale: 1, duration: 0.68 }, 'frame+=0.08')
        .to(firstGreeting, {
          autoAlpha: 1,
          yPercent: 0,
          filter: 'blur(0px)',
          duration: 0.62,
        }, 'frame+=0.2')
        .to(identity, { autoAlpha: 1, y: 0, duration: 0.52 }, 'frame+=0.34')
        .to(routeLines, { scaleX: 1, duration: 0.64, stagger: 0.08 }, 'frame+=0.28')
        .to(routeLabels, { autoAlpha: 1, yPercent: 0, duration: 0.58, stagger: 0.08 }, 'frame+=0.38')
        .to(routeArrows, { autoAlpha: 1, x: 0, y: 0, duration: 0.42, stagger: 0.08 }, 'frame+=0.48')
        .to(counter, { autoAlpha: 1, x: 0, duration: 0.4 }, 'frame+=0.56')
        .to(footer, { autoAlpha: 1, y: 0, duration: 0.38 }, 'frame+=0.7');
      intro.duration(profile.entranceDuration);
      intro.eventCallback('onComplete', () => greetingLoop?.play(0));

      let handlePointerMove: ((event: PointerEvent) => void) | undefined;
      let handlePointerLeave: (() => void) | undefined;
      let handlePointerEnter: (() => void) | undefined;
      let handleResize: (() => void) | undefined;
      if (isDesktop && finePointer) {
        let bounds = hero.getBoundingClientRect();
        const moveWelcomeX = gsap.quickTo(welcome, 'x', {
          duration: 0.8,
          ease: 'power3.out',
        });
        const moveWelcomeY = gsap.quickTo(welcome, 'y', {
          duration: 0.8,
          ease: 'power3.out',
        });

        const refreshBounds = () => {
          bounds = hero.getBoundingClientRect();
        };
        handlePointerEnter = refreshBounds;
        handleResize = refreshBounds;
        handlePointerMove = (event: PointerEvent) => {
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;

          moveWelcomeX(x * profile.pointerShift);
          moveWelcomeY(y * profile.pointerShift * 0.7);
        };
        handlePointerLeave = () => {
          moveWelcomeX(0);
          moveWelcomeY(0);
        };
        hero.addEventListener('pointerenter', handlePointerEnter, { passive: true });
        hero.addEventListener('pointermove', handlePointerMove, { passive: true });
        hero.addEventListener('pointerleave', handlePointerLeave, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
      }

      return () => {
        greetingLoop?.kill();
        exitTimeline?.kill();
        intro.kill();
        gsap.killTweensOf(welcome);
        routeHandlers.forEach(({ route, handleRouteClick }) => {
          route.removeEventListener('click', handleRouteClick);
        });
        if (handlePointerEnter) hero.removeEventListener('pointerenter', handlePointerEnter);
        if (handlePointerMove) hero.removeEventListener('pointermove', handlePointerMove);
        if (handlePointerLeave) hero.removeEventListener('pointerleave', handlePointerLeave);
        if (handleResize) window.removeEventListener('resize', handleResize);
      };
    },
    hero,
  );

  return () => media.revert();
}
