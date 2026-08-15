import { useEffect, useState } from 'react';
import { getWorkHeroStartMode, WORK_HERO_SETTLE_MS } from '../workHero';
import ParticleText from './ParticleText';

/** Work hero: an outline resolves into a living particle wordmark. */
export default function FutureHero() {
  const [particleReady, setParticleReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startMode = getWorkHeroStartMode(reducedMotion);

    if (startMode === 'particles') {
      setParticleReady(true);
      return undefined;
    }

    const settleTimer = window.setTimeout(() => setParticleReady(true), WORK_HERO_SETTLE_MS);

    return () => {
      window.clearTimeout(settleTimer);
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
