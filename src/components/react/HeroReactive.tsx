import BlurText from './bits/BlurText';

interface HeroReactiveProps {
  name: string;
  title: string;
}

/** Asymmetric hero: left 40% whitespace + hand-drawn ring, right 60% serif title. */
export default function HeroReactive({ name, title }: HeroReactiveProps) {
  return (
    <section className="relative grid grid-cols-1 gap-8 pt-16 md:grid-cols-5">
      {/* Left 40%: hand-drawn scribble circle (paper-feel, no geometry) */}
      <div className="flex items-start justify-center pt-6 md:col-span-2">
        <svg
          viewBox="0 0 120 120"
          className="h-40 w-40 text-accent opacity-40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M60,6 C90,10 112,34 112,60 C112,86 90,110 60,114 C30,110 8,86 8,60 C8,34 30,10 60,6 Z" />
          <path d="M60,18 C82,22 100,42 100,60 C100,78 82,98 60,102 C38,98 20,78 20,60 C20,42 38,22 60,18 Z" opacity="0.5" />
        </svg>
      </div>

      {/* Right 60%: serif title + hand-drawn underline */}
      <div className="md:col-span-3">
        <BlurText
          text={name}
          className="font-serif text-5xl font-bold leading-tight text-ink"
          delay={70}
          animateBy="characters"
        />
        <p className="mt-4 font-serif text-lg text-ink-soft">{title}</p>

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
      </div>
    </section>
  );
}
