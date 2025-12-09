// UserPositionCard - Shows user's current position and estimated payouts
// Solves: Users don't know what they own or what they can win

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Percent, Award, ChevronRight } from 'lucide-react';
import { formatHST } from '../lib/contracts/pamm';
import styles from './UserPositionCard.module.css';

interface UserPositionCardProps {
  yesBalance: bigint;
  noBalance: bigint;
  yesSupply: bigint;
  noSupply: bigint;
  pot: bigint;
  impliedOdds: number;
  isConnected: boolean;
}

export function UserPositionCard({
  yesBalance,
  noBalance,
  yesSupply,
  noSupply,
  pot,
  impliedOdds,
  isConnected,
}: UserPositionCardProps) {
  // Calculate pot shares
  const yesPotShare = yesSupply > 0n 
    ? Number((yesBalance * 10000n) / yesSupply) / 100 
    : 0;
  const noPotShare = noSupply > 0n 
    ? Number((noBalance * 10000n) / noSupply) / 100 
    : 0;

  // Calculate estimated payouts
  const yesEstPayout = yesSupply > 0n 
    ? (yesBalance * pot) / yesSupply 
    : 0n;
  const noEstPayout = noSupply > 0n 
    ? (noBalance * pot) / noSupply 
    : 0n;

  const hasYesPosition = yesBalance > 0n;
  const hasNoPosition = noBalance > 0n;
  const hasPosition = hasYesPosition || hasNoPosition;

  if (!isConnected) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Wallet size={12} />
          <span>YOUR POSITION</span>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Wallet size={24} />
          </div>
          <span className={styles.emptyText}>Connect wallet to view position</span>
          <button className={styles.connectBtn}>
            [ CONNECT ]
          </button>
        </div>
      </div>
    );
  }

  if (!hasPosition) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Wallet size={12} />
          <span>YOUR POSITION</span>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Award size={24} />
          </div>
          <span className={styles.emptyText}>No position in this market</span>
          <span className={styles.emptyHint}>Buy YES or NO to start coordinating</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.header}>
        <Wallet size={12} />
        <span>YOUR POSITION</span>
        <div className={styles.headerBadge}>ACTIVE</div>
      </div>

      {/* Position Cards */}
      <div className={styles.positionsGrid}>
        {/* YES Position */}
        <div 
          className={`${styles.positionCard} ${hasYesPosition ? styles.active : styles.inactive}`}
          style={{ '--pos-color': 'var(--color-yes)' } as React.CSSProperties}
        >
          <div className={styles.positionHeader}>
            <span className={styles.positionSide}>YES</span>
            {hasYesPosition && (
              <span className={styles.positionBadge}>HOLDING</span>
            )}
          </div>
          
          <div className={styles.positionValue}>
            <span className={styles.valueNumber}>
              {Number(formatHST(yesBalance)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className={styles.valueLabel}>shares</span>
          </div>

          {hasYesPosition && (
            <div className={styles.positionMeta}>
              <div className={styles.metaRow}>
                <Percent size={10} />
                <span>Pot Share: {yesPotShare.toFixed(2)}%</span>
              </div>
              <div className={styles.metaRow}>
                <TrendingUp size={10} />
                <span>Est. Payout: ~{Number(formatHST(yesEstPayout)).toFixed(2)} HST</span>
              </div>
            </div>
          )}
        </div>

        {/* NO Position */}
        <div 
          className={`${styles.positionCard} ${hasNoPosition ? styles.active : styles.inactive}`}
          style={{ '--pos-color': 'var(--color-no)' } as React.CSSProperties}
        >
          <div className={styles.positionHeader}>
            <span className={styles.positionSide}>NO</span>
            {hasNoPosition && (
              <span className={styles.positionBadge}>HOLDING</span>
            )}
          </div>
          
          <div className={styles.positionValue}>
            <span className={styles.valueNumber}>
              {Number(formatHST(noBalance)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className={styles.valueLabel}>shares</span>
          </div>

          {hasNoPosition && (
            <div className={styles.positionMeta}>
              <div className={styles.metaRow}>
                <Percent size={10} />
                <span>Pot Share: {noPotShare.toFixed(2)}%</span>
              </div>
              <div className={styles.metaRow}>
                <TrendingUp size={10} />
                <span>Est. Payout: ~{Number(formatHST(noEstPayout)).toFixed(2)} HST</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payout Summary */}
      <div className={styles.payoutSummary}>
        <div className={styles.summaryHeader}>
          <span>PAYOUT SCENARIOS</span>
        </div>
        
        <div className={styles.scenarioRow}>
          <span className={styles.scenarioLabel}>If YES wins:</span>
          <span 
            className={styles.scenarioValue}
            style={{ color: hasYesPosition ? 'var(--color-yes)' : 'var(--text-muted)' }}
          >
            {hasYesPosition 
              ? `+${Number(formatHST(yesEstPayout)).toFixed(2)} HST` 
              : '0 HST'
            }
          </span>
        </div>
        
        <div className={styles.scenarioRow}>
          <span className={styles.scenarioLabel}>If NO wins:</span>
          <span 
            className={styles.scenarioValue}
            style={{ color: hasNoPosition ? 'var(--color-no)' : 'var(--text-muted)' }}
          >
            {hasNoPosition 
              ? `+${Number(formatHST(noEstPayout)).toFixed(2)} HST` 
              : '0 HST'
            }
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button className={styles.actionBtn}>
          <span>Add to Position</span>
          <ChevronRight size={14} />
        </button>
        <button className={styles.actionBtn}>
          <span>Sell Position</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

