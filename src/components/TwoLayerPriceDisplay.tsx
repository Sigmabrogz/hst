import { motion } from 'framer-motion';
import { Layers, TrendingUp, Scale, Info } from 'lucide-react';
import styles from './TwoLayerPriceDisplay.module.css';

interface TwoLayerPriceDisplayProps {
  yesOdds: number; // 0-100 (price signal)
  phase: 'early' | 'mid' | 'late' | 'closed';
  userStake?: number;
}

const TIME_WEIGHTS = {
  early: 1.5,
  mid: 1.0,
  late: 0.6,
  closed: 0,
};

export function TwoLayerPriceDisplay({ 
  yesOdds, 
  phase,
  userStake = 100 
}: TwoLayerPriceDisplayProps) {
  const noOdds = 100 - yesOdds;
  const currentWeight = TIME_WEIGHTS[phase] || 0;
  const conviction = userStake * currentWeight;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Layers size={14} />
        <span>V3: TWO-LAYER SYSTEM</span>
        <span className={styles.badge}>ODDS + CONVICTION</span>
      </div>

      <div className={styles.explanation}>
        <Info size={12} />
        <span>
          <strong>Layer 1:</strong> Odds show direction (price signal). 
          <strong>Layer 2:</strong> Conviction decides the final split (time-weighted).
        </span>
      </div>

      <div className={styles.layers}>
        {/* Layer 1: Odds */}
        <div className={styles.layer}>
          <div className={styles.layerHeader}>
            <TrendingUp size={14} />
            <span>LAYER 1: ODDS (PRICE)</span>
          </div>
          <div className={styles.layerDescription}>
            What direction the market believes. Entry cost.
          </div>
          
          <div className={styles.oddsDisplay}>
            <div className={styles.oddsCard} data-side="yes">
              <span className={styles.oddsLabel}>YES</span>
              <span className={styles.oddsValue}>{yesOdds}¢</span>
              <span className={styles.oddsSubtext}>{yesOdds}% implied</span>
            </div>
            <div className={styles.oddsDivider}>
              <span>vs</span>
            </div>
            <div className={styles.oddsCard} data-side="no">
              <span className={styles.oddsLabel}>NO</span>
              <span className={styles.oddsValue}>{noOdds}¢</span>
              <span className={styles.oddsSubtext}>{noOdds}% implied</span>
            </div>
          </div>

          <div className={styles.layerNote}>
            Traditional AMMs stop here. You buy at odds, win if right.
          </div>
        </div>

        {/* Arrow between layers */}
        <div className={styles.layerArrow}>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ↓
          </motion.div>
          <span>+ TIME WEIGHT</span>
        </div>

        {/* Layer 2: Conviction */}
        <div className={styles.layer}>
          <div className={styles.layerHeader}>
            <Scale size={14} />
            <span>LAYER 2: CONVICTION (POT-SHARE)</span>
          </div>
          <div className={styles.layerDescription}>
            How much of the winner pot you'll receive. Time-weighted.
          </div>

          <div className={styles.convictionDisplay}>
            <div className={styles.convictionFormula}>
              <code>conviction = stake × w(t)</code>
            </div>
            
            <div className={styles.convictionCalc}>
              <div className={styles.calcRow}>
                <span>Your Stake:</span>
                <span>{userStake} HST</span>
              </div>
              <div className={styles.calcRow}>
                <span>Time Weight (w):</span>
                <span className={styles.weightHighlight} data-phase={phase}>
                  {currentWeight}x ({phase.toUpperCase()})
                </span>
              </div>
              <div className={styles.calcRow + ' ' + styles.calcResult}>
                <span>Your Conviction:</span>
                <span>{conviction}</span>
              </div>
            </div>
          </div>

          <div className={styles.layerNote}>
            Your model adds this layer. Early conviction = bigger winner share.
          </div>
        </div>
      </div>

      {/* The Difference */}
      <div className={styles.difference}>
        <div className={styles.differenceTitle}>THE KEY DIFFERENCE</div>
        <div className={styles.differenceGrid}>
          <div className={styles.differenceItem}>
            <div className={styles.differenceLabel}>Traditional AMM</div>
            <div className={styles.differenceValue}>
              Early = better <em>price</em>
            </div>
          </div>
          <div className={styles.differenceItem}>
            <div className={styles.differenceLabel}>Your V3 Model</div>
            <div className={styles.differenceValue}>
              Early = better <em>payout share</em>
            </div>
          </div>
        </div>
      </div>

      {/* One-liner */}
      <div className={styles.tagline}>
        "Odds show direction. Conviction decides the final split."
      </div>
    </div>
  );
}

