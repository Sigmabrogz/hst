// SimpleProToggle - Toggle between simple and pro view
// Solves: "most users want simple. power users will self-select."

import { motion } from 'framer-motion';
import styles from './SimpleProToggle.module.css';

interface SimpleProToggleProps {
  isProView: boolean;
  onToggle: (isPro: boolean) => void;
}

export function SimpleProToggle({ isProView, onToggle }: SimpleProToggleProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.option} ${!isProView ? styles.active : ''}`}
        onClick={() => onToggle(false)}
      >
        SIMPLE
      </button>
      <button
        className={`${styles.option} ${isProView ? styles.active : ''}`}
        onClick={() => onToggle(true)}
      >
        PRO
      </button>
      <motion.div
        className={styles.indicator}
        animate={{ x: isProView ? '100%' : '0%' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </div>
  );
}

