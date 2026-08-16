import { motion } from 'framer-motion';

export interface PromptItem {
  label: string;
  hint: string;
  href: string;
  accent?: 'sage' | 'warm';
}

interface PromptNavProps {
  items: PromptItem[];
}

/** Claude-inspired prompt choices, adapted into real site navigation. */
export default function PromptNav({ items }: PromptNavProps) {
  return (
    <nav className="prompt-nav" aria-label="Explore Richard's work">
      {items.map((item, index) => (
        <motion.a
          key={item.href}
          href={item.href}
          className={`prompt-nav__item prompt-nav__item--${item.accent ?? 'sage'} group no-underline`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 + index * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -2 }}
          whileFocus={{ y: -2 }}
        >
          <span className="prompt-nav__label font-mono text-xs tracking-[0.14em]">{item.label}</span>
          <span className="prompt-nav__hint font-serif text-base text-ink">{item.hint}</span>
          <span className="prompt-nav__arrow font-mono text-sm" aria-hidden="true">
            &rarr;
          </span>
        </motion.a>
      ))}
    </nav>
  );
}
