// CrowdingMeter - Shows which side is crowded and upside implications
// Solves: Users don't know if they're piling into a crowded side

import { motion } from 'framer-motion';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';
import styles from './CrowdingMeter.module.css';

interface CrowdingMeterProps {
  yesOdds: number;
  crowdedSide: 'YES' | 'NO' | 'BALANCED';
  crowdingRatio: number;
  description: string;
}

export function CrowdingMeter({ 
  yesOdds, 
  crowdedSide, 
  crowdingRatio, 
  description 
}: CrowdingMeterProps) {
  const noOdds = 100 - yesOdds;
  
  // Determine upside messaging
  const getUpsideMessage = () => {
    if (crowdedSide === 'YES') {
      return { side: 'NO', message: 'NO has higher upside potential' };
    } else if (crowdedSide === 'NO') {
      return { side: 'YES', message: 'YES has higher upside potential' };
    }
    return { side: 'BOTH', message: 'Similar upside on both sides' };
  };
  
  const upside = getUpsideMessage();
  const isCrowded = crowdedSide !== 'BALANCED';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Users size={12} />
        <span>CROWDING METER</span>
      </div>

      {/* Visual Bar */}
      <div className={styles.meterSection}>
        <div className={styles.meterLabels}>
          <span 
            className={styles.sideLabel}
            style={{ color: crowdedSide === 'NO' ? 'var(--color-no)' : 'var(--text-muted)' }}
          >
            NO {noOdds.toFixed(0)}%
          </span>
          <span 
            className={styles.sideLabel}
            style={{ color: crowdedSide === 'YES' ? 'var(--color-yes)' : 'var(--text-muted)' }}
          >
            YES {yesOdds.toFixed(0)}%
          </span>
        </div>
        
        <div className={styles.meterTrack}>
          <motion.div 
            className={styles.meterFillNo}
            initial={{ width: 0 }}
            animate={{ width: `${noOdds}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <motion.div 
            className={styles.meterFillYes}
            initial={{ width: 0 }}
            animate={{ width: `${yesOdds}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <div className={styles.meterCenter} />
        </div>

        {/* Crowding indicators */}
        <div className={styles.crowdingIndicators}>
          <div 
            className={`${styles.crowdIndicator} ${crowdedSide === 'NO' ? styles.crowded : ''}`}
          >
            {crowdedSide === 'NO' && <span className={styles.crowdedBadge}>CROWDED</span>}
          </div>
          <div 
            className={`${styles.crowdIndicator} ${crowdedSide === 'YES' ? styles.crowded : ''}`}
          >
            {crowdedSide === 'YES' && <span className={styles.crowdedBadge}>CROWDED</span>}
          </div>
        </div>
      </div>

      {/* Insight Box */}
      <div className={styles.insightBox}>
        {isCrowded ? (
          <>
            <div className={styles.insightIcon}>
              <TrendingUp size={14} style={{ color: upside.side === 'YES' ? 'var(--color-yes)' : 'var(--color-no)' }} />
            </div>
            <div className={styles.insightContent}>
              <span className={styles.insightTitle}>{description}</span>
              <span className={styles.insightDetail}>
                Crowding ratio: {crowdingRatio.toFixed(1)}x
              </span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.insightIcon}>
              <AlertCircle size={14} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div className={styles.insightContent}>
              <span className={styles.insightTitle}>{description}</span>
              <span className={styles.insightDetail}>
                Market is balanced
              </span>
            </div>
          </>
        )}
      </div>

      {/* Explanation */}
      <div className={styles.explanation}>
        <span className={styles.explainLabel}>What this means:</span>
        <ul className={styles.explainList}>
          <li>
            <span className={styles.bullet}>▸</span>
            Crowded side = more people betting there = smaller pot share per person
          </li>
          <li>
            <span className={styles.bullet}>▸</span>
            Under-owned side = fewer bettors = larger pot share if you're right
          </li>
        </ul>
      </div>
    </div>
  );
}

