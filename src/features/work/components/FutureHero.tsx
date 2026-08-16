import ParticleText from './ParticleText';

/** Work hero: a living particle wordmark. */
export default function FutureHero() {
  return (
    <section className="hero-stage work-future-hero relative isolate flex items-center justify-center overflow-hidden" aria-label="BUILD FUTURE">
      <div className="future-wordmark">
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
      </div>
    </section>
  );
}
