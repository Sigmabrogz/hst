import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Scale, TrendingUp } from 'lucide-react';
import styles from './ConvictionWeightDisplay.module.css';

interface ConvictionWeightDisplayProps {
  phase: 'early' | 'mid' | 'late' | 'closed';
  percentRemaining?: number;
  userStake?: number;
}

// Time weight function - the core V3 formula
const TIME_WEIGHTS = {
  early: 1.5,  // 0-33% of duration
  mid: 1.0,    // 33-66% of duration
  late: 0.6,   // 66-100% of duration
  closed: 0,
};

export function ConvictionWeightDisplay({ 
  phase, 
  userStake = 100 
}: ConvictionWeightDisplayProps) {
  const currentWeight = TIME_WEIGHTS[phase] || 0;
  
  // Calculate conviction for user's stake
  const conviction = useMemo(() => {
    return userStake * currentWeight;
  }, [userStake, currentWeight]);

  // Calculate what conviction would be in other phases
  const convictionComparison = useMemo(() => ({
    early: userStake * TIME_WEIGHTS.early,
    mid: userStake * TIME_WEIGHTS.mid,
    late: userStake * TIME_WEIGHTS.late,
  }), [userStake]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Scale size={14} />
        <span>V3: CONVICTION WEIGHT</span>
        <span className={styles.badge}>TIME-WEIGHTED</span>
      </div>

      {/* Current Weight Display */}
      <div className={styles.currentWeight}>
        <div className={styles.weightLabel}>Your Current Multiplier</div>
        <motion.div 
          className={styles.weightValue}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          key={currentWeight}
        >
          <span className={styles.multiplier}>{currentWeight}x</span>
          <span className={styles.phaseBadge} data-phase={phase}>
            {phase.toUpperCase()}
          </span>
        </motion.div>
      </div>

      {/* Formula Display */}
      <div className={styles.formula}>
        <div className={styles.formulaTitle}>
          <Zap size={12} />
          THE FORMULA
        </div>
        <div className={styles.formulaContent}>
          <code>conviction = stake × w(t)</code>
        </div>
        <div className={styles.formulaExample}>
          Your {userStake} HST × {currentWeight} = <strong>{conviction} conviction</strong>
        </div>
      </div>

      {/* Time Weight Tiers */}
      <div className={styles.tiers}>
        <div className={styles.tiersTitle}>
          <Clock size={12} />
          TIME WEIGHT TIERS
        </div>
        <div className={styles.tiersList}>
          {(['early', 'mid', 'late'] as const).map((tier) => {
            const weight = TIME_WEIGHTS[tier];
            const isActive = phase === tier;
            const convictionForTier = convictionComparison[tier];
            
            return (
              <div 
                key={tier}
                className={`${styles.tier} ${isActive ? styles.activeTier : ''}`}
                data-tier={tier}
              >
                <div className={styles.tierHeader}>
                  <span className={styles.tierName}>{tier.toUpperCase()}</span>
                  <span className={styles.tierWeight}>{weight}x</span>
                  {isActive && <span className={styles.nowIndicator}>NOW</span>}
                </div>
                <div className={styles.tierBar}>
                  <motion.div 
                    className={styles.tierFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${(weight / 1.5) * 100}%` }}
                    transition={{ duration: 0.5, delay: tier === 'early' ? 0 : tier === 'mid' ? 0.1 : 0.2 }}
                  />
                </div>
                <div className={styles.tierConviction}>
                  {userStake} HST → {convictionForTier} conv
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact Explanation */}
      <div className={styles.impact}>
        <div className={styles.impactTitle}>
          <TrendingUp size={12} />
          WHAT THIS MEANS
        </div>
        <div className={styles.impactContent}>
          {phase === 'early' && (
            <p>
              <strong>Maximum conviction!</strong> Your stake is multiplied by 1.5x 
              when calculating your winner pot share. Early believers get rewarded most.
            </p>
          )}
          {phase === 'mid' && (
            <p>
              <strong>Standard conviction.</strong> Your stake counts at face value (1.0x). 
              You're joining after early momentum but before the late rush.
            </p>
          )}
          {phase === 'late' && (
            <p>
              <strong>Reduced conviction.</strong> Your stake is multiplied by only 0.6x. 
              Late entries receive smaller winner shares. This is anti-sniper protection.
            </p>
          )}
          {phase === 'closed' && (
            <p>
              <strong>Market closed.</strong> No new bets accepted.
            </p>
          )}
        </div>
      </div>

      {/* Formula Reference */}
      <div className={styles.reference}>
        <div className={styles.referenceTitle}>PAYOUT FORMULA</div>
        <code className={styles.referenceCode}>
          payout = pot × (your_conviction / total_winner_conviction)
        </code>
        <div className={styles.referenceNote}>
          Same stake, different timing = different payout
        </div>
      </div>
    </div>
  );
}

