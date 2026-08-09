import { gsap } from 'gsap';
import type {
  TransitionBeforePreparationEvent,
  TransitionBeforeSwapEvent,
} from 'astro:transitions/client';
import {
  getTransitionDirection,
  getTransitionFrame,
  isWorkPath,
  WORK_HERO_ARRIVAL_EVENT,
  type WorkTransitionDirection,
  type WorkTransitionFrame,
} from '../../lib/workThemeTransition';

declare global {
  interface Window {
    __workThemeTransitionController?: boolean;
  }
}

const TRANSITION_DURATION_SECONDS = 1.34;
const ROOT_STYLE_PROPERTIES = [
  '--work-transition-focus-x',
  '--work-transition-focus-y',
  '--work-transition-source-focus-y',
  '--work-transition-source-scale',
  '--work-transition-source-opacity',
  '--work-transition-source-blur',
  '--work-transition-target-scale',
  '--work-transition-target-opacity',
  '--work-transition-focus-pulse',
  '--work-transition-streak-opacity',
] as const;

export const initWorkThemeTransition = () => {
  if (window.__workThemeTransitionController) return;

  const host = document.querySelector<HTMLElement>('[data-work-theme-transition]');
  const target = document.querySelector<HTMLElement>('[data-work-transition-target]');

  if (!host || !target) return;

  window.__workThemeTransitionController = true;

  const root = document.documentElement;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pendingDirection: WorkTransitionDirection | null = null;
  let activeTween: gsap.core.Tween | null = null;
  let lockedSource: HTMLElement | null = null;
  let bodyPaddingRight = '';

  const getSitePage = (scope: Document = document) => {
    const page = scope.body.querySelector<HTMLElement>(':scope > [data-site-page]');
    return page ?? scope.querySelector<HTMLElement>('[data-site-page]');
  };

  const setRootProperty = (name: string, amount: number) => {
    root.style.setProperty(name, String(amount));
  };

  const renderFrame = (direction: WorkTransitionDirection, frame: WorkTransitionFrame) => {
    setRootProperty('--work-transition-source-scale', frame.sourceScale);
    setRootProperty('--work-transition-source-opacity', frame.sourceOpacity);
    setRootProperty('--work-transition-source-blur', frame.sourceBlur);
    setRootProperty('--work-transition-target-scale', frame.targetScale);
    setRootProperty('--work-transition-target-opacity', frame.targetOpacity);
    setRootProperty('--work-transition-focus-pulse', frame.focusPulse);
    setRootProperty('--work-transition-streak-opacity', frame.streakOpacity);

    const targetTone = direction === 'enter' ? 'work' : 'archive';
    const sourceTone = direction === 'enter' ? 'archive' : 'work';
    root.dataset.workTransitionTone = frame.targetOpacity >= 0.5 ? targetTone : sourceTone;
    root.toggleAttribute('data-work-transition-settled', frame.targetProgress >= 0.999);
  };

  const measureBrandFocus = (source: HTMLElement) => {
    const brand = source.querySelector<HTMLElement>('.site-header__brand');
    const rect = brand?.getBoundingClientRect();
    const hasVisibleBrand = Boolean(rect && rect.width > 0 && rect.height > 0);
    const focusX = hasVisibleBrand && rect ? rect.left + rect.width / 2 : 96;
    const focusY = hasVisibleBrand && rect ? rect.top + rect.height / 2 : 40;

    setRootProperty('--work-transition-focus-x', focusX);
    setRootProperty('--work-transition-focus-y', focusY);
    setRootProperty('--work-transition-source-focus-y', window.scrollY + focusY);
  };

  const lockDocument = (source: HTMLElement) => {
    lockedSource = source;
    source.inert = true;
    bodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const prepareStaticState = (direction: WorkTransitionDirection) => {
    const source = getSitePage();
    if (!source) return null;

    pendingDirection = direction;
    root.dataset.workTransitionActive = '';
    root.dataset.workTransitionDirection = direction;
    source.setAttribute('data-work-transition-source', '');
    measureBrandFocus(source);
    lockDocument(source);
    renderFrame(direction, getTransitionFrame(direction, 0, {
      width: window.innerWidth,
      height: window.innerHeight,
    }));
    return source;
  };

  const stripInactiveRuntime = (page: HTMLElement) => {
    [...page.querySelectorAll<HTMLElement>('astro-island')]
      .reverse()
      .forEach((island) => island.replaceWith(...island.childNodes));
    page.querySelectorAll('script, .entry-progress-loader, [data-work-theme-transition]').forEach((element) => {
      element.remove();
    });
    page.removeAttribute('data-work-transition-source');
    page.setAttribute('aria-hidden', 'true');
    page.inert = true;
  };

  const mountIncomingPage = (incomingPage: HTMLElement, direction: WorkTransitionDirection) => {
    const clone = document.importNode(incomingPage, true);
    stripInactiveRuntime(clone);
    if (direction === 'enter') {
      clone.querySelectorAll<HTMLElement>('.future-wordmark.is-particle-ready')
        .forEach((wordmark) => wordmark.classList.remove('is-particle-ready'));
      clone.querySelectorAll('.future-wordmark__particle')
        .forEach((particleLayer) => particleLayer.remove());
    }
    target.replaceChildren(clone);
    target.dataset.targetTheme = direction === 'enter' ? 'work' : 'non-work';
  };

  const play = (
    direction: WorkTransitionDirection,
    signal?: AbortSignal,
  ) => {
    if (reducedMotionQuery.matches) {
      renderFrame(direction, getTransitionFrame(direction, 1, {
        width: window.innerWidth,
        height: window.innerHeight,
      }));
      return Promise.resolve();
    }

    activeTween?.kill();
    const state = { value: 0 };

    return new Promise<void>((resolve) => {
      let completed = false;
      const finish = () => {
        if (completed) return;
        completed = true;
        signal?.removeEventListener('abort', abort);
        activeTween = null;
        resolve();
      };
      const abort = () => {
        activeTween?.kill();
        finish();
      };

      signal?.addEventListener('abort', abort, { once: true });
      activeTween = gsap.to(state, {
        value: 1,
        duration: TRANSITION_DURATION_SECONDS,
        ease: 'none',
        onUpdate: () => {
          renderFrame(direction, getTransitionFrame(direction, state.value, {
            width: window.innerWidth,
            height: window.innerHeight,
          }));
        },
        onComplete: finish,
      });
    });
  };

  const cleanup = (completeWorkArrival = false) => {
    activeTween?.kill();
    activeTween = null;
    document.querySelectorAll<HTMLElement>('[data-work-transition-source]')
      .forEach((page) => {
        page.removeAttribute('data-work-transition-source');
        page.inert = false;
        page.style.removeProperty('will-change');
      });
    lockedSource?.removeAttribute('inert');
    lockedSource = null;
    target.replaceChildren();
    delete target.dataset.targetTheme;
    delete root.dataset.workTransitionActive;
    delete root.dataset.workTransitionDirection;
    delete root.dataset.workTransitionTone;
    root.removeAttribute('data-work-transition-settled');
    ROOT_STYLE_PROPERTIES.forEach((property) => root.style.removeProperty(property));
    document.body.style.paddingRight = bodyPaddingRight;
    bodyPaddingRight = '';
    pendingDirection = null;

    if (completeWorkArrival && isWorkPath(window.location.pathname)) {
      root.dataset.workHeroArrival = 'complete';
      window.dispatchEvent(new CustomEvent(WORK_HERO_ARRIVAL_EVENT));
    }
  };

  const cleanupAfterPaint = (completeWorkArrival = false) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => cleanup(completeWorkArrival));
    });
  };

  const handleBeforePreparation = (event: Event) => {
    const transitionEvent = event as TransitionBeforePreparationEvent;
    const direction = getTransitionDirection(transitionEvent.from, transitionEvent.to);
    if (!direction) return;

    const defaultLoader = transitionEvent.loader;
    transitionEvent.loader = async () => {
      const source = prepareStaticState(direction);
      if (!source) return;

      try {
        await defaultLoader();
        if (transitionEvent.signal.aborted || transitionEvent.defaultPrevented) {
          cleanup();
          return;
        }

        const incomingPage = getSitePage(transitionEvent.newDocument);
        if (!incomingPage) {
          transitionEvent.preventDefault();
          cleanup();
          return;
        }

        mountIncomingPage(incomingPage, direction);
        await play(direction, transitionEvent.signal);
      } catch (error) {
        transitionEvent.preventDefault();
        cleanup();
        console.error('[WorkThemeTransition] Navigation preparation failed.', error);
      }
    };
  };

  const handleBeforeSwap = (event: Event) => {
    if (!pendingDirection) return;
    const transitionEvent = event as TransitionBeforeSwapEvent;
    transitionEvent.newDocument.documentElement.dataset.workTransitionActive = '';
    transitionEvent.newDocument.documentElement.dataset.workTransitionDirection = pendingDirection;
    transitionEvent.newDocument.documentElement.dataset.workTransitionTone = pendingDirection === 'enter' ? 'work' : 'archive';
    if (pendingDirection === 'enter') {
      transitionEvent.newDocument.documentElement.dataset.workHeroArrival = 'pending';
    } else {
      transitionEvent.newDocument.documentElement.removeAttribute('data-work-hero-arrival');
    }
  };

  const handleAfterSwap = () => {
    if (!pendingDirection) return;
    const completedDirection = pendingDirection;
    cleanupAfterPaint(completedDirection === 'enter');
  };

  document.addEventListener('astro:before-preparation', handleBeforePreparation);
  document.addEventListener('astro:before-swap', handleBeforeSwap);
  document.addEventListener('astro:after-swap', handleAfterSwap);
};
