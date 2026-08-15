import { motion } from 'framer-motion';
import type { Project } from '../../../data/projects';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

/** Text-list style project item, NOT a card. Bottom hairline, hover lift + arrow. */
export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.li
      className="project-row border-b border-border"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.a
        href={`/projects/${project.id}`}
        className="group flex flex-wrap items-baseline gap-x-4 gap-y-2 py-5 no-underline"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <span className="project-row__index font-mono text-xs text-ink-soft/55">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="font-serif text-lg font-semibold text-ink transition-colors duration-200 group-hover:text-accent">
          {project.title}
        </span>
        <span className="font-mono text-xs text-ink-soft/70">
          {project.year}
        </span>
        <span className="w-full text-sm text-ink-soft md:flex-1">
          {project.description}
        </span>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft/55 lg:inline">
          {project.technologies.slice(0, 3).join(' · ')}
        </span>
        <span className="project-row__arrow ml-auto shrink-0 font-mono text-sm text-accent opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
          &rarr;
        </span>
      </motion.a>
    </motion.li>
  );
}
