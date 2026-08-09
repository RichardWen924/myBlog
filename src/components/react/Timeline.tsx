import { motion } from 'framer-motion';
import experience from '../../data/experience';
import type { ExperienceItem } from '../../data/experience';

function formatPeriod(start: string, end?: string) {
  return `${start} — ${end ?? 'Present'}`;
}

/** Work/education timeline: left hairline + dot, scroll-triggered reveal. */
interface TimelineProps {
  items?: ExperienceItem[];
}

export default function Timeline({ items = experience }: TimelineProps) {
  return (
    <ol className="relative border-l border-border pl-6">
      {items.map((item, i) => (
        <motion.li
          key={i}
          className="relative mb-10 last:mb-0"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            delay: i * 0.1,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="absolute -left-[27px] mt-1.5 h-2.5 w-2.5 rounded-full border border-accent bg-paper" />
          <div className="font-mono text-xs text-accent">
            {formatPeriod(item.startDate, item.endDate)}
          </div>
          <h3 className="mt-1 font-serif text-lg font-semibold text-ink">
            {item.title}
          </h3>
          <p className="text-sm text-ink-soft">
            {item.organization}
            {item.location ? ` · ${item.location}` : ''}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            {item.description.map((d, j) => (
              <li key={j} className="flex gap-2">
                <span className="text-accent">·</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </motion.li>
      ))}
    </ol>
  );
}
