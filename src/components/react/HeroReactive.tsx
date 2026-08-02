import { useState } from 'react';
import BlurText from './bits/BlurText';

interface HeroReactiveProps {
  name: string;
  title: string;
  email?: string;
}

/**
 * Claude-style hero adapted to the paper-feel spec:
 * visual (left) + content (right: serif heading → subtitle → prompt field).
 * The prompt field is decorative for now — no backend.
 */
export default function HeroReactive({ name, title, email }: HeroReactiveProps) {
  const [value, setValue] = useState('');

  return (
    <section className="relative flex min-h-screen items-center">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-10 px-4 md:grid-cols-5 md:gap-8">
        {/* Left visual: hand-drawn scribble circle (paper substitute for Lottie) */}
        <div className="flex items-start justify-center pt-6 md:col-span-2">
        <svg
          viewBox="0 0 120 120"
          className="h-44 w-44 text-accent opacity-40"
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

      {/* Right content: heading → subtitle → prompt field */}
        <div className="flex flex-col items-start md:col-span-3 md:items-end">
          <BlurText
            text={name}
            className="font-serif text-5xl font-bold leading-tight text-ink md:text-right"
            delay={70}
            animateBy="characters"
          />
          <p className="mt-4 text-right text-lg text-ink-soft">{title}</p>

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

          {/* Prompt field — Claude-style, paper-feel, decorative for now */}
          <div className="mt-10 w-full md:max-w-md">
            <label
              htmlFor="hero-prompt"
              className="mb-2 block font-mono text-xs tracking-wide text-ink-soft/70"
            >
              对这个世界，我好奇的是…
            </label>
            <div className="relative">
              <input
                id="hero-prompt"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="输入你的想法，然后按下回车"
                className="w-full border-b border-border bg-transparent py-3 pr-10 font-serif text-base text-ink placeholder:text-ink-soft/40 focus:border-accent focus:outline-none"
              />
              {/* Paper arrow at the right */}
              <span className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-accent" aria-hidden="true">
                &rarr;
              </span>
            </div>
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
    </section>
  );
}
