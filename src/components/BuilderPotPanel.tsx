import { useState } from 'react';
import { Trophy, CheckCircle, Circle, Twitter, Users, Link2, Hammer, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BuilderPotPanel.module.css';

interface BuilderPotPanelProps {
  totalPot: number;
  predictionPotShare: number; // e.g., 70
  builderPotShare: number; // e.g., 30
  userIsVerified: boolean;
  userActions: {
    tweeted: boolean;
    referred: boolean;
    shared: boolean;
    built: boolean;
  };
}

const ACTIONS = [
  { key: 'tweeted', label: 'Tweet about market', icon: Twitter, multiplier: '+25%' },
  { key: 'referred', label: 'Refer a participant', icon: Users, multiplier: '+50%' },
  { key: 'shared', label: 'Share market link', icon: Link2, multiplier: '+10%' },
  { key: 'built', label: 'Builder action', icon: Hammer, multiplier: '+100%' },
] as const;

export function BuilderPotPanel({
  totalPot,
  predictionPotShare = 70,
  builderPotShare = 30,
  userIsVerified = false,
  userActions = { tweeted: false, referred: false, shared: false, built: false }
}: BuilderPotPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  const predictionPotAmount = (totalPot * predictionPotShare) / 100;
  const builderPotAmount = (totalPot * builderPotShare) / 100;

  // Calculate user's multiplier based on actions
  const calculateMultiplier = () => {
    let mult = 100; // base 1x
    if (userActions.tweeted) mult += 25;
    if (userActions.referred) mult += 50;
    if (userActions.shared) mult += 10;
    if (userActions.built) mult += 100;
    return mult;
  };

  const userMultiplier = calculateMultiplier();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Trophy size={14} />
        <span>V2: PREDICTION + BUILDER POT SPLIT</span>
        <span className={styles.badge}>PROPOSED</span>
      </div>

      <div className={styles.explanation}>
        <strong>70%</strong> goes to correct bettors. <strong>30%</strong> goes to verified coordinators 
        who helped make the outcome real.
      </div>

      {/* Pot Split Visualization */}
      <div className={styles.potSplit}>
        <div className={styles.potBar}>
          <motion.div 
            className={styles.predictionBar}
            initial={{ width: 0 }}
            animate={{ width: `${predictionPotShare}%` }}
            transition={{ duration: 0.5 }}
          >
            <span>{predictionPotShare}%</span>
          </motion.div>
          <motion.div 
            className={styles.builderBar}
            initial={{ width: 0 }}
            animate={{ width: `${builderPotShare}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span>{builderPotShare}%</span>
          </motion.div>
        </div>

        <div className={styles.potLabels}>
          <div className={styles.potLabel}>
            <div className={styles.potDot} style={{ background: 'var(--accent-green)' }} />
            <div className={styles.potInfo}>
              <span className={styles.potName}>PREDICTION POT</span>
              <span className={styles.potAmount}>{predictionPotAmount.toLocaleString()} HST</span>
            </div>
          </div>
          <div className={styles.potLabel}>
            <div className={styles.potDot} style={{ background: 'var(--accent-cyan)' }} />
            <div className={styles.potInfo}>
              <span className={styles.potName}>BUILDER POT</span>
              <span className={styles.potAmount}>{builderPotAmount.toLocaleString()} HST</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Status */}
      <div className={styles.userStatus}>
        <div className={styles.statusHeader}>
          <span>Your Coordinator Status</span>
          {userIsVerified ? (
            <span className={styles.verifiedBadge}>
              <CheckCircle size={12} /> VERIFIED
            </span>
          ) : (
            <span className={styles.unverifiedBadge}>
              <Circle size={12} /> NOT VERIFIED
            </span>
          )}
        </div>

        <div className={styles.multiplierDisplay}>
          <span className={styles.multiplierLabel}>Your Multiplier</span>
          <span className={styles.multiplierValue}>{userMultiplier / 100}x</span>
          <span className={styles.multiplierNote}>
            {userMultiplier === 100 ? 'Complete actions to boost' : `+${userMultiplier - 100}% bonus`}
          </span>
        </div>

        <button 
          className={styles.detailsToggle}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▾ Hide Actions' : '▸ Show Actions to Verify'}
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              className={styles.actionsList}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {ACTIONS.map((action) => {
                const Icon = action.icon;
                const isCompleted = userActions[action.key as keyof typeof userActions];

                return (
                  <div 
                    key={action.key}
                    className={`${styles.actionItem} ${isCompleted ? styles.completed : ''}`}
                  >
                    <div className={styles.actionCheck}>
                      {isCompleted ? (
                        <CheckCircle size={14} className={styles.checkIcon} />
                      ) : (
                        <Circle size={14} />
                      )}
                    </div>
                    <Icon size={14} />
                    <span className={styles.actionLabel}>{action.label}</span>
                    <span className={styles.actionMultiplier}>{action.multiplier}</span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* What This Means */}
      <div className={styles.whatThisMeans}>
        <Gift size={14} />
        <div>
          <strong>V2 Change:</strong> Free riders who just bet get 70% of the pot. 
          Coordinators who help make the outcome real get access to the extra 30% builder pot.
          <br />
          <em>This solves: "passive bettors extract all value"</em>
        </div>
      </div>
    </div>
  );
}

