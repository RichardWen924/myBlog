import { motion } from 'framer-motion';
import DecryptedText from './DecryptedText';

const lines = [
  <>一个有热情敢于接纳新事物的开发者</>,
  <>我会 <strong>backend agent</strong></>,
  <>目前在：<strong>研究 Agent</strong></>,
];

/** Staggered introduction copy for the Work profile chapter. */
export default function WhoAmIIntro() {
  return (
    <motion.div
      className="work-whoami-copy"
      initial={{ opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="work-whoami-kicker">01 / PROFILE</p>
      <h2 className="work-whoami-heading">
        <DecryptedText
          text="Who am I"
          speed={160}
          sequential
          revealDirection="start"
          animateOn="view"
          parentClassName="work-whoami-decrypted"
          className="work-whoami-decrypted__char"
          encryptedClassName="work-whoami-decrypted__encrypted"
        />
      </h2>
      <motion.p
        className="work-whoami-name"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ delay: 0.8, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >Richard Wen</motion.p>
      <div className="work-whoami-lines">
        {lines.map((line, index) => (
          <motion.p
            key={index}
            className="work-whoami-line"
            data-index={`0${index + 1}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 1.1 + index * 0.28, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
