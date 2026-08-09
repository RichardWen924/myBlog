import { useEffect, useState } from 'react';
import {
  getWorkHeroStartMode,
  WORK_HERO_ARRIVAL_EVENT,
  WORK_HERO_FALLBACK_MS,
  WORK_HERO_SETTLE_MS,
} from '../../lib/workThemeTransition';
import ParticleText from './bits/ParticleText';

/** Work hero: an outline resolves into a living particle wordmark. */
export default function FutureHero() {
  const [particleReady, setParticleReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    const startMode = getWorkHeroStartMode(
      reducedMotion,
      root.dataset.workHeroArrival === 'pending',
    );

    if (startMode === 'particles') {
      root.removeAttribute('data-work-hero-arrival');
      setParticleReady(true);
      return undefined;
    }

    let started = false;
    let settleTimer: number | undefined;
    let fallbackTimer: number | undefined;

    const startParticles = () => {
      if (started) return;
      started = true;
      window.clearTimeout(fallbackTimer);
      root.removeAttribute('data-work-hero-arrival');
      settleTimer = window.setTimeout(() => setParticleReady(true), WORK_HERO_SETTLE_MS);
    };

    if (startMode === 'await-transition') {
      window.addEventListener(WORK_HERO_ARRIVAL_EVENT, startParticles, { once: true });
      fallbackTimer = window.setTimeout(startParticles, WORK_HERO_FALLBACK_MS);
    } else {
      startParticles();
    }

    return () => {
      window.removeEventListener(WORK_HERO_ARRIVAL_EVENT, startParticles);
      window.clearTimeout(settleTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <section className="hero-stage work-future-hero relative isolate flex items-center justify-center overflow-hidden" aria-label="BUILD FUTURE">
      <div className={`future-wordmark ${particleReady ? 'is-particle-ready' : ''}`}>
        <div className="future-wordmark__outline" aria-hidden="true">BUILD FUTURE</div>
        {particleReady && (
          <div className="future-wordmark__particle">
            <ParticleText
              text="BUILD FUTURE"
              particleSize={2.2}
              density={4}
              color="#f3f0e8"
              highlightColor="#8ee6c2"
              scatter={160}
              gatherDuration={1500}
              stagger={300}
              pointerRepel={34}
              repelRadius={130}
              idleDrift={0.55}
              trigger="mount"
              fontSize="var(--work-wordmark-font-size)"
              fontWeight="var(--work-wordmark-font-weight)"
              fontFamily="inherit"
              letterSpacing="var(--work-wordmark-letter-spacing)"
              maxWidthRatio={0.94}
              glow
            />
          </div>
        )}
      </div>
    </section>
  );
}
