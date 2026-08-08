import BlurText from './bits/BlurText';
import DynamicIllustration from './DynamicIllustration';
import PromptNav from './PromptNav';

interface HeroReactiveProps {
  name: string;
  title: string;
  email?: string;
}

/**
 * Claude-style hero adapted to the paper-feel spec:
 * visual (left) + content (right: serif heading → subtitle → prompt field).
 * The prompt choices are navigation links, not a backend-powered form.
 */
export default function HeroReactive({ name, title, email }: HeroReactiveProps) {
  return (
    <section className="hero-stage relative isolate flex items-center overflow-hidden">
      {/* Generated thinking orbit: a soft, full-bleed paper layer behind the Hero */}
      <div
        className="hero-thinking-orbit pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <img
          src="/hero-thinking-orbit.png"
          alt=""
          width="1536"
          height="1024"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover object-left mix-blend-multiply"
        />

      </div>

      <DynamicIllustration />

      <div className="relative z-10 mx-auto grid w-full max-w-4xl grid-cols-1 gap-10 px-4 md:grid-cols-5 md:gap-8">
        {/* Hero content: heading → subtitle → prompt field */}
        <div className="flex flex-col items-start md:col-span-3 md:col-start-3 md:items-end">
          <BlurText
            text={name}
            className="font-serif text-5xl font-bold leading-tight text-ink md:text-right"
            delay={70}
            animateBy="characters"
          />
          <p className="mt-4 text-right text-lg text-ink-soft">{title}</p>

          <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft/60">
            <span>Personal site</span>
            <span aria-hidden="true">·</span>
            <span>{title}</span>
          </div>

          {/* Hand-drawn underline, warm accent */}
          <svg
            viewBox="0 0 120 10"
            className="mt-3 h-3 w-40 text-warm"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3,6 Q30,1 60,6 T117,5" />
          </svg>

          <div className="mt-10 w-full md:max-w-lg">
            <p className="mb-3 text-right font-mono text-xs tracking-wide text-ink-soft/70">
              从这里开始探索
            </p>
            <PromptNav
              items={[
                { label: 'Build', hint: 'projects and systems', href: '/projects', accent: 'sage' },
                { label: 'Think', hint: 'about the way I work', href: '/about', accent: 'warm' },
                { label: 'Note', hint: 'short essays and experiments', href: '/blog', accent: 'sage' },
              ]}
            />
            {email && (
              <p className="mt-3 text-xs text-ink-soft/60">
                或者，直接给我写信：{' '}
                <a href={`mailto:${email}`} className="text-accent no-underline hover:underline">
                  {email}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      <a className="hero-scroll-cue" href="#introduction" aria-label="Scroll to introduction">
        <span className="hero-scroll-cue__label font-mono text-[10px] uppercase tracking-[0.18em]">
          Continue
        </span>
        <span className="hero-scroll-cue__line" aria-hidden="true" />
        <span className="hero-scroll-cue__arrow" aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
