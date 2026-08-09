import { useEffect, useState } from 'react';
import ParticleText from './bits/ParticleText';
import StrokeText from './bits/StrokeText';

const OUTLINE_DURATION_MS = 1450;

/** Work hero: an outline resolves into a living particle wordmark. */
export default function FutureHero() {
  const [particleReady, setParticleReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setParticleReady(true);
      return undefined;
    }

    const timer = window.setTimeout(() => setParticleReady(true), OUTLINE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="hero-stage work-future-hero relative isolate flex items-center justify-center overflow-hidden" aria-label="BUILD FUTURE">
      <div className={`future-wordmark ${particleReady ? 'is-particle-ready' : ''}`}>
        <div className="future-wordmark__stroke" aria-hidden={particleReady}>
          <StrokeText
            text="BUILD FUTURE"
            strokeColor="#ff9b76"
            strokeWidth={1.6}
            drawDuration={1.15}
            stagger={0.02}
            fillMode="none"
            fontSize={128}
            fontWeight={800}
            letterSpacing={-5}
          />
        </div>
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
              fontSize="clamp(4rem, 15vw, 11rem)"
              fontWeight={800}
              fontFamily="inherit"
              glow
            />
          </div>
        )}
      </div>
    </section>
  );
}
