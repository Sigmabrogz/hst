// LateEntryBanner - Warns users about late entry risks
// Solves: "late buyers unexpectedly losing money"

import { motion } from 'framer-motion';
import { Clock, Zap, AlertTriangle, TrendingDown, Info } from 'lucide-react';
import styles from './LateEntryBanner.module.css';

type Phase = 'early' | 'mid' | 'late' | 'closed';

interface LateEntryBannerProps {
  phase: Phase;
  percentRemaining: number;
  hoursRemaining: number;
}

const phaseConfig = {
  early: {
    icon: Zap,
    color: 'var(--accent-green)',
    bgColor: 'var(--accent-green-dim)',
    title: 'EARLY WINDOW',
    subtitle: 'Best pot-share advantage',
    description: 'You\'re entering early. Early coordinators who are right get the largest share of the winner pot.',
    tip: 'Tip: Coordinate now for maximum upside.',
  },
  mid: {
    icon: Clock,
    color: 'var(--accent-orange)',
    bgColor: 'var(--accent-orange-dim)',
    title: 'MID WINDOW',
    subtitle: 'Balanced risk/reward',
    description: 'Market momentum is building. Your pot share will be moderate compared to early entrants.',
    tip: 'Tip: Consider your conviction level before entering.',
  },
  late: {
    icon: AlertTriangle,
    color: 'var(--color-sell)',
    bgColor: 'rgba(255, 71, 87, 0.1)',
    title: 'LATE ENTRY',
    subtitle: 'Reduced pot-share upside',
    description: 'You\'re entering late. Most of the pot share has been claimed by earlier believers. Your upside is limited.',
    tip: 'Warning: Late entries mainly fund earlier conviction unless the crowd flips.',
  },
  closed: {
    icon: TrendingDown,
    color: 'var(--text-muted)',
    bgColor: 'var(--bg-secondary)',
    title: 'MARKET CLOSED',
    subtitle: 'Trading ended',
    description: 'This market is no longer accepting entries. Wait for resolution.',
    tip: '',
  },
};

export function LateEntryBanner({ phase, percentRemaining, hoursRemaining }: LateEntryBannerProps) {
  const config = phaseConfig[phase];
  const Icon = config.icon;

  return (
    <motion.div
      className={styles.container}
      style={{ 
        '--phase-color': config.color,
        '--phase-bg': config.bgColor,
      } as React.CSSProperties}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Phase Indicator */}
      <div className={styles.phaseIndicator}>
        <div className={styles.iconWrapper}>
          <Icon size={16} />
        </div>
        <div className={styles.phaseInfo}>
          <span className={styles.phaseTitle}>{config.title}</span>
          <span className={styles.phaseSubtitle}>{config.subtitle}</span>
        </div>
        <div className={styles.timeLeft}>
          <span className={styles.timeValue}>{hoursRemaining}h</span>
          <span className={styles.timeLabel}>left</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className={styles.progressTrack}>
        <div className={styles.progressSegments}>
          <div 
            className={`${styles.segment} ${phase === 'early' ? styles.active : ''}`}
            style={{ '--seg-color': 'var(--accent-green)' } as React.CSSProperties}
          >
            <span>EARLY</span>
          </div>
          <div 
            className={`${styles.segment} ${phase === 'mid' ? styles.active : ''}`}
            style={{ '--seg-color': 'var(--accent-orange)' } as React.CSSProperties}
          >
            <span>MID</span>
          </div>
          <div 
            className={`${styles.segment} ${phase === 'late' ? styles.active : ''}`}
            style={{ '--seg-color': 'var(--color-sell)' } as React.CSSProperties}
          >
            <span>LATE</span>
          </div>
        </div>
        <div 
          className={styles.progressFill}
          style={{ width: `${100 - percentRemaining}%` }}
        />
      </div>

      {/* Description */}
      <div className={styles.description}>
        <p>{config.description}</p>
      </div>

      {/* Tip */}
      {config.tip && (
        <div className={styles.tip}>
          <Info size={12} />
          <span>{config.tip}</span>
        </div>
      )}

      {/* Phase-specific warnings */}
      {phase === 'late' && (
        <div className={styles.warning}>
          <AlertTriangle size={14} />
          <div className={styles.warningContent}>
            <strong>Late Entry Risk</strong>
            <p>Your effective return may be lower than implied odds suggest due to pot-share dilution.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

