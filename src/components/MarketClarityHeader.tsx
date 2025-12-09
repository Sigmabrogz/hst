// MarketClarityHeader - Shows market question, odds, pot, time, phase
// Solves: "Users don't know what they're betting on at a glance"

import { motion } from 'framer-motion';
import { Clock, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import type { Market, Pool } from '../lib/contracts/pamm';
import { formatHST, getTimeRemaining, calculateImpliedOdds } from '../lib/contracts/pamm';
import styles from './MarketClarityHeader.module.css';

interface MarketClarityHeaderProps {
  market: Market;
  pool: Pool;
}

export function MarketClarityHeader({ market, pool }: MarketClarityHeaderProps) {
  const impliedOdds = calculateImpliedOdds(pool.yesReserve, pool.noReserve);
  const timeRemaining = getTimeRemaining(market.closeTime);
  const potFormatted = formatHST(market.pot);
  
  const phaseConfig = {
    early: { color: 'var(--accent-green)', label: 'EARLY', icon: Zap },
    mid: { color: 'var(--accent-orange)', label: 'MID', icon: TrendingUp },
    late: { color: 'var(--color-sell)', label: 'LATE', icon: AlertTriangle },
    closed: { color: 'var(--text-muted)', label: 'CLOSED', icon: Clock },
  };
  
  const phase = phaseConfig[timeRemaining.phase];
  const PhaseIcon = phase.icon;

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Terminal Header */}
      <div className={styles.terminalHeader}>
        <span className={styles.terminalLabel}>▸ HST TERMINAL</span>
        <div className={styles.statusRow}>
          <span className={styles.statusDot} style={{ background: phase.color }} />
          <span style={{ color: phase.color }}>{phase.label}</span>
        </div>
      </div>

      {/* Market Question */}
      <div className={styles.questionSection}>
        <h1 className={styles.question}>{market.description}</h1>
      </div>

      {/* $1/Share Normalized Price Display - Polymarket Style */}
      <div className={styles.priceDisplay}>
        <div className={styles.priceCard} style={{ '--card-color': 'var(--color-yes)' } as React.CSSProperties}>
          <span className={styles.priceLabel}>BUY YES AT</span>
          <span className={styles.priceValue}>${(impliedOdds / 100).toFixed(2)}</span>
          <span className={styles.priceSubtext}>{impliedOdds.toFixed(0)}% implied</span>
        </div>
        <div className={styles.priceCard} style={{ '--card-color': 'var(--color-no)' } as React.CSSProperties}>
          <span className={styles.priceLabel}>BUY NO AT</span>
          <span className={styles.priceValue}>${((100 - impliedOdds) / 100).toFixed(2)}</span>
          <span className={styles.priceSubtext}>{(100 - impliedOdds).toFixed(0)}% implied</span>
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className={styles.metricsStrip}>

        {/* Pot Size */}
        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>WINNER POT</span>
          <span className={styles.metricValue}>
            {Number(potFormatted).toLocaleString()} HST
          </span>
        </div>

        <div className={styles.divider} />

        {/* YES Supply */}
        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>YES SHARES</span>
          <span className={styles.metricValue} style={{ color: 'var(--color-yes)' }}>
            {(Number(formatHST(market.yesSupply)) / 1000).toFixed(0)}K
          </span>
        </div>

        <div className={styles.divider} />

        {/* NO Supply */}
        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>NO SHARES</span>
          <span className={styles.metricValue} style={{ color: 'var(--color-no)' }}>
            {(Number(formatHST(market.noSupply)) / 1000).toFixed(0)}K
          </span>
        </div>

        <div className={styles.divider} />

        {/* Time Remaining */}
        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>ENDS IN</span>
          <div className={styles.timeDisplay}>
            <Clock size={14} style={{ color: phase.color }} />
            <span className={styles.metricValue} style={{ color: phase.color }}>
              {String(timeRemaining.hours).padStart(2, '0')}:
              {String(timeRemaining.minutes).padStart(2, '0')}:
              {String(timeRemaining.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Phase Indicator */}
        <div className={styles.metricBlock}>
          <span className={styles.metricLabel}>PHASE</span>
          <div className={styles.phaseIndicator} style={{ borderColor: phase.color }}>
            <PhaseIcon size={12} style={{ color: phase.color }} />
            <span style={{ color: phase.color }}>{phase.label}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div 
          className={styles.progressBar}
          style={{ 
            width: `${timeRemaining.percentRemaining}%`,
            background: phase.color,
          }}
        />
      </div>

      {/* One-liner explanation */}
      <div className={styles.explainer}>
        <span className={styles.explainerIcon}>ℹ</span>
        <span>This market rewards being right AND early. Late entries get smaller pot share.</span>
      </div>
    </motion.div>
  );
}

