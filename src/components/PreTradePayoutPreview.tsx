import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './PreTradePayoutPreview.module.css';

interface PreTradePayoutPreviewProps {
  side: 'YES' | 'NO';
  stake: number;
  phase: 'early' | 'mid' | 'late' | 'closed';
  totalPot: number;
  totalYesConviction: number;
  totalNoConviction: number;
  yesOdds: number;
}

const TIME_WEIGHTS = {
  early: 1.5,
  mid: 1.0,
  late: 0.6,
  closed: 0,
};

export function PreTradePayoutPreview({
  side,
  stake,
  phase,
  totalPot,
  totalYesConviction,
  totalNoConviction,
  yesOdds,
}: PreTradePayoutPreviewProps) {
  const currentWeight = TIME_WEIGHTS[phase] || 0;
  const userConviction = stake * currentWeight;

  // Calculate estimated payout if user's side wins
  const payoutEstimate = useMemo(() => {
    if (stake <= 0 || phase === 'closed') return null;

    // User's conviction adds to the winning side's total
    const newTotalConviction = side === 'YES' 
      ? totalYesConviction + userConviction
      : totalNoConviction + userConviction;

    // User's share of the winner pot
    const potSharePercent = (userConviction / newTotalConviction) * 100;
    
    // Estimated payout (simplified - pot includes both sides)
    const estimatedPot = totalPot + stake; // Simplified
    const estimatedPayout = (potSharePercent / 100) * estimatedPot;
    
    // ROI calculation
    const roi = ((estimatedPayout - stake) / stake) * 100;

    // Compare to what they'd get if they entered at different times
    const earlyConviction = stake * TIME_WEIGHTS.early;
    const lateConviction = stake * TIME_WEIGHTS.late;
    
    const earlyShare = (earlyConviction / (newTotalConviction - userConviction + earlyConviction)) * 100;
    const lateShare = (lateConviction / (newTotalConviction - userConviction + lateConviction)) * 100;

    return {
      conviction: userConviction,
      potSharePercent,
      estimatedPayout,
      roi,
      earlyShare,
      lateShare,
      impliedOdds: side === 'YES' ? yesOdds : 100 - yesOdds,
    };
  }, [stake, phase, side, totalPot, totalYesConviction, totalNoConviction, userConviction, yesOdds]);

  if (!payoutEstimate || stake <= 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Calculator size={14} />
          <span>PRE-TRADE PAYOUT PREVIEW</span>
        </div>
        <div className={styles.empty}>
          Enter a stake amount to see your estimated payout
        </div>
      </div>
    );
  }

  const isLateEntry = phase === 'late';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Calculator size={14} />
        <span>PRE-TRADE PAYOUT PREVIEW</span>
        <span className={styles.badge} data-side={side}>{side}</span>
      </div>

      {/* Main Preview */}
      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          IF {side} WINS
        </div>

        <div className={styles.previewStats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Your Conviction</span>
            <motion.span 
              className={styles.statValue}
              key={payoutEstimate.conviction}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {payoutEstimate.conviction.toFixed(1)}
            </motion.span>
            <span className={styles.statFormula}>
              {stake} × {currentWeight} = {payoutEstimate.conviction.toFixed(1)}
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Est. Pot Share</span>
            <motion.span 
              className={styles.statValue}
              key={payoutEstimate.potSharePercent}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              ~{payoutEstimate.potSharePercent.toFixed(2)}%
            </motion.span>
            <span className={styles.statFormula}>
              of winner pot
            </span>
          </div>

          <div className={styles.statCard + ' ' + styles.highlight}>
            <span className={styles.statLabel}>Est. Payout</span>
            <motion.span 
              className={styles.statValue}
              key={payoutEstimate.estimatedPayout}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              ~{payoutEstimate.estimatedPayout.toFixed(0)} HST
            </motion.span>
            <span className={styles.statFormula}>
              {payoutEstimate.roi >= 0 ? '+' : ''}{payoutEstimate.roi.toFixed(0)}% ROI
            </span>
          </div>
        </div>
      </div>

      {/* Time Comparison */}
      <div className={styles.comparison}>
        <div className={styles.comparisonTitle}>
          SAME STAKE, DIFFERENT TIMING
        </div>
        <div className={styles.comparisonGrid}>
          <div className={`${styles.comparisonItem} ${phase === 'early' ? styles.current : ''}`}>
            <span className={styles.comparisonPhase}>EARLY</span>
            <span className={styles.comparisonShare}>{payoutEstimate.earlyShare.toFixed(2)}%</span>
          </div>
          <div className={`${styles.comparisonItem} ${phase === 'mid' ? styles.current : ''}`}>
            <span className={styles.comparisonPhase}>MID</span>
            <span className={styles.comparisonShare}>{payoutEstimate.potSharePercent.toFixed(2)}%</span>
          </div>
          <div className={`${styles.comparisonItem} ${phase === 'late' ? styles.current : ''}`}>
            <span className={styles.comparisonPhase}>LATE</span>
            <span className={styles.comparisonShare}>{payoutEstimate.lateShare.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Warning for late entry */}
      {isLateEntry && (
        <div className={styles.warning}>
          <AlertTriangle size={14} />
          <div>
            <strong>Late entry warning:</strong> You're joining after coordination momentum formed. 
            Your pot share will be smaller than earlier participants with the same stake.
          </div>
        </div>
      )}

      {/* Early entry encouragement */}
      {phase === 'early' && (
        <div className={styles.encouragement}>
          <CheckCircle size={14} />
          <div>
            <strong>Early coordinator bonus!</strong> Your 1.5x time weight gives you 
            maximum conviction. Early believers get paid more.
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        * Estimates based on current pool state. Actual payout depends on final conviction totals.
      </div>
    </div>
  );
}

