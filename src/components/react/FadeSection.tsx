import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Scroll-triggered reveal wrapper. transform/opacity only, soft cubic-bezier. */
export default function FadeSection({
  children,
  className = '',
  delay = 0,
}: FadeSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
