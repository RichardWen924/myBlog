import { motion } from 'framer-motion';

const lines = [
  <>一个有热情敢于接纳新事物的开发者</>,
  <>我会<strong>backend agent</strong></>,
  <>目前在：研究Agent</>,
];

/** Staggered introduction copy for the Work profile chapter. */
export default function WhoAmIIntro() {
  return (
    <motion.div
      className="work-whoami-copy"
      initial={{ opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="work-whoami-kicker">01 / PROFILE</p>
      <h2 className="work-whoami-heading">Who am i</h2>
      <p className="work-whoami-name">Richard Wen</p>
      <div className="work-whoami-lines">
        {lines.map((line, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.18 + index * 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
