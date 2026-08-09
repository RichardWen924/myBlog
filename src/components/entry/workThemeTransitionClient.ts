import { gsap } from 'gsap';
import type {
  TransitionBeforePreparationEvent,
  TransitionBeforeSwapEvent,
} from 'astro:transitions/client';
import {
  getTransitionDirection,
  getTransitionFrame,
  isWorkPath,
  type WorkTransitionDirection,
  type WorkTransitionFrame,
} from '../../lib/workThemeTransition';

declare global {
  interface Window {
    __workThemeTransitionController?: boolean;
  }
}

const TRANSITION_DURATION_SECONDS = 1.28;
const ROOT_STYLE_PROPERTIES = [
  '--work-transition-progress',
  '--work-transition-focus-x',
  '--work-transition-radius',
  '--work-transition-center-y',
  '--work-transition-work-scale',
  '--work-transition-source-shift-x',
  '--work-transition-source-scale',
  '--work-transition-source-blur',
  '--work-transition-speed-opacity',
  '--work-transition-badge-x',
] as const;

export const initWorkThemeTransition = () => {
  if (window.__workThemeTransitionController) return;

  const host = document.querySelector<HTMLElement>('[data-work-theme-transition]');
  const target = document.querySelector<HTMLElement>('[data-work-transition-target]');
  const hud = document.querySelector<HTMLElement>('[data-work-transition-hud]');
  const progressbar = hud?.querySelector<HTMLElement>('[role="progressbar"]');
  const value = hud?.querySelector<HTMLElement>('[data-work-transition-value]');
  const status = hud?.querySelector<HTMLElement>('[data-work-transition-status]');
  const route = hud?.querySelector<HTMLElement>('[data-work-transition-route]');

  if (!host || !target || !hud || !progressbar || !value || !status || !route) return;

  window.__workThemeTransitionController = true;

  const root = document.documentElement;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pendingDirection: WorkTransitionDirection | null = null;
  let initialPageHandled = false;
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
    const compact = window.innerWidth < 640;
    const medium = !compact && window.innerWidth < 1024;
    const trackStart = compact ? 16 : medium ? 14 : 12;
    const trackEnd = 100 - trackStart;
    const badgeX = trackStart + (trackEnd - trackStart) * frame.workProgress;

    setRootProperty('--work-transition-progress', frame.workProgress);
    setRootProperty('--work-transition-focus-x', frame.focusX);
    setRootProperty('--work-transition-radius', frame.portalRadius);
    setRootProperty('--work-transition-work-scale', frame.workScale);
    setRootProperty('--work-transition-source-shift-x', frame.sourceShiftX);
    setRootProperty('--work-transition-source-scale', frame.sourceDepthScale);
    setRootProperty('--work-transition-source-blur', frame.sourceBlur);
    setRootProperty('--work-transition-speed-opacity', frame.speedOpacity);
    setRootProperty('--work-transition-badge-x', badgeX);

    root.dataset.workTransitionTone = frame.workProgress >= 0.52 ? 'work' : 'archive';
    progressbar.setAttribute('aria-valuenow', String(frame.percent));
    value.textContent = `${frame.percent}%`;

    if (direction === 'enter') {
      progressbar.setAttribute('aria-label', 'Entering Work theme');
      route.textContent = 'ARCHIVE → WORK';
      status.textContent = frame.portalProgress < 0.18
        ? 'CAMERA APPROACH'
        : frame.portalProgress < 0.82
          ? 'EXPANDING WORK'
          : 'FULL-SCREEN ARRIVAL';
    } else {
      progressbar.setAttribute('aria-label', 'Leaving Work theme');
      route.textContent = 'WORK → ARCHIVE';
      status.textContent = frame.portalProgress > 0.82
        ? 'CAMERA PULLBACK'
        : frame.portalProgress > 0.12
          ? 'COLLAPSING WORK'
          : 'RELEASING ARCHIVE';
    }
  };

  const lockDocument = (source: HTMLElement) => {
    lockedSource = source;
    source.inert = true;
    bodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const prepareStaticState = (direction: WorkTransitionDirection, direct = false) => {
    const source = getSitePage();
    if (!source) return null;

    pendingDirection = direction;
    root.dataset.workTransitionActive = '';
    root.dataset.workTransitionDirection = direction;
    root.toggleAttribute('data-work-transition-direct', direct);
    hud.setAttribute('aria-hidden', 'false');
    source.toggleAttribute('data-work-transition-source', !direct);
    setRootProperty('--work-transition-center-y', window.scrollY + window.innerHeight / 2);
    lockDocument(source);
    renderFrame(direction, getTransitionFrame(direction, 0, {
      width: window.innerWidth,
      height: window.innerHeight,
    }));
    return source;
  };

  const stripInactiveRuntime = (page: HTMLElement) => {
    page.querySelectorAll('script, .entry-progress-loader, [data-work-theme-transition]').forEach((element) => {
      element.remove();
    });
    page.removeAttribute('data-work-transition-source');
    page.removeAttribute('data-work-transition-direct-target');
    page.setAttribute('aria-hidden', 'true');
    page.inert = true;
  };

  const mountIncomingPage = (incomingPage: HTMLElement, direction: WorkTransitionDirection) => {
    const clone = document.importNode(incomingPage, true);
    stripInactiveRuntime(clone);
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

  const cleanup = () => {
    activeTween?.kill();
    activeTween = null;
    document.querySelectorAll<HTMLElement>('[data-work-transition-source], [data-work-transition-direct-target]')
      .forEach((page) => {
        page.removeAttribute('data-work-transition-source');
        page.removeAttribute('data-work-transition-direct-target');
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
    root.removeAttribute('data-work-transition-direct');
    ROOT_STYLE_PROPERTIES.forEach((property) => root.style.removeProperty(property));
    document.body.style.paddingRight = bodyPaddingRight;
    bodyPaddingRight = '';
    hud.setAttribute('aria-hidden', 'true');
    pendingDirection = null;
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
  };

  const handleAfterSwap = () => {
    if (!pendingDirection) return;
    window.requestAnimationFrame(() => cleanup());
  };

  const handleInitialPageLoad = () => {
    if (initialPageHandled) return;
    initialPageHandled = true;
    if (!isWorkPath(window.location.pathname)) return;

    const source = prepareStaticState('enter', true);
    if (!source) return;

    mountIncomingPage(source, 'enter');
    void play('enter').finally(() => cleanup());
  };

  document.addEventListener('astro:before-preparation', handleBeforePreparation);
  document.addEventListener('astro:before-swap', handleBeforeSwap);
  document.addEventListener('astro:after-swap', handleAfterSwap);
  document.addEventListener('astro:page-load', handleInitialPageLoad);
};
