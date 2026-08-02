import { motion } from 'framer-motion';
import skills from '../../data/skills';

/** Category skills with hairline progress bars, accent green fill. */
export default function SkillsGrid() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((category, ci) => (
        <div key={category.category}>
          <h3 className="mb-4 font-serif text-lg font-semibold text-ink">
            {category.category}
          </h3>
          <ul className="space-y-3">
            {category.items.map((skill, si) => (
              <li key={skill.name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-ink-soft">
                  {skill.name}
                </span>
                {skill.level != null && (
                  <div className="h-px flex-1 overflow-hidden bg-border">
                    <motion.div
                      className="h-full origin-left bg-accent"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: skill.level / 5 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: ci * 0.15 + si * 0.08,
                        duration: 0.7,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
