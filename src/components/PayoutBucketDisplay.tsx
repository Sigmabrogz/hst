import React from 'react';
import { Clock, Zap, Timer, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './PayoutBucketDisplay.module.css';

interface PayoutBucketDisplayProps {
  currentPhase: 'EARLY' | 'MID' | 'LATE';
  timeRemaining: string;
  marketDuration: number; // total hours
  userEntryBucket?: 'EARLY' | 'MID' | 'LATE' | null;
}

const BUCKET_CONFIG = {
  EARLY: {
    potShare: 50,
    timeRange: '0-33%',
    color: 'var(--accent-green)',
    icon: Zap,
    description: 'Best pot share — early coordinators rewarded most'
  },
  MID: {
    potShare: 35,
    timeRange: '33-66%',
    color: 'var(--accent-orange)',
    icon: Timer,
    description: 'Good pot share — momentum builders'
  },
  LATE: {
    potShare: 15,
    timeRange: '66-100%',
    color: 'var(--accent-red)',
    icon: AlertTriangle,
    description: 'Reduced pot share — late joiners compete for less'
  }
};

export function PayoutBucketDisplay({ 
  currentPhase, 
  timeRemaining,
  userEntryBucket 
}: PayoutBucketDisplayProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Clock size={14} />
        <span>V2: TIME-BUCKETED PAYOUTS</span>
        <span className={styles.badge}>PROPOSED</span>
      </div>

      <div className={styles.explanation}>
        Winners compete <strong>within their entry bucket</strong> for that bucket's pot slice.
        Early still wins more, but late can still win something meaningful.
      </div>

      <div className={styles.buckets}>
        {(['EARLY', 'MID', 'LATE'] as const).map((bucket) => {
          const config = BUCKET_CONFIG[bucket];
          const Icon = config.icon;
          const isCurrentPhase = bucket === currentPhase;
          const isUserBucket = bucket === userEntryBucket;

          return (
            <motion.div
              key={bucket}
              className={`${styles.bucket} ${isCurrentPhase ? styles.active : ''} ${isUserBucket ? styles.userBucket : ''}`}
              style={{ '--bucket-color': config.color } as React.CSSProperties}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: bucket === 'EARLY' ? 0 : bucket === 'MID' ? 0.1 : 0.2 }}
            >
              <div className={styles.bucketHeader}>
                <Icon size={14} style={{ color: config.color }} />
                <span className={styles.bucketName}>{bucket}</span>
                {isCurrentPhase && <span className={styles.nowBadge}>NOW</span>}
                {isUserBucket && <span className={styles.youBadge}>YOU</span>}
              </div>

              <div className={styles.potShare}>
                <span className={styles.potValue}>{config.potShare}%</span>
                <span className={styles.potLabel}>of winner pot</span>
              </div>

              <div className={styles.timeRange}>
                {config.timeRange} of market duration
              </div>

              <div className={styles.bucketDesc}>
                {config.description}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className={styles.currentStatus}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Current Phase</span>
          <span className={styles.statusValue} style={{ color: BUCKET_CONFIG[currentPhase].color }}>
            {currentPhase}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Time Left</span>
          <span className={styles.statusValue}>{timeRemaining}</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Your Bucket</span>
          <span className={styles.statusValue}>
            {userEntryBucket || 'Not entered'}
          </span>
        </div>
      </div>

      <div className={styles.v2Note}>
        <strong>V2 Change:</strong> Instead of all winners splitting one pot, 
        you only compete with others who entered in the same time window.
        This makes late entry viable — you're not competing against early whales.
      </div>
    </div>
  );
}

