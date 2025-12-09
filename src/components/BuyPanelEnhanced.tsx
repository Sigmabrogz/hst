// BuyPanelEnhanced - Shows all-in cost, breakdown, payout preview
// Solves: "$1/share preference" + "late buyers losing money" confusion

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Info, TrendingDown, Zap, AlertTriangle } from 'lucide-react';
import type { Market, Pool, BuyQuote } from '../lib/contracts/pamm';
import { formatHST, parseHST, calculateImpliedOdds, calculateEstimatedPayout } from '../lib/contracts/pamm';
import styles from './BuyPanelEnhanced.module.css';

interface BuyPanelEnhancedProps {
  market: Market;
  pool: Pool;
  onBuy?: (side: 'YES' | 'NO', amount: string) => void;
}

export function BuyPanelEnhanced({ market, pool, onBuy }: BuyPanelEnhancedProps) {
  const [side, setSide] = useState<'YES' | 'NO'>('YES');
  const [amount, setAmount] = useState('100');
  const [inputMode, setInputMode] = useState<'shares' | 'cost'>('shares');
  const [isProView, setIsProView] = useState(false);

  const impliedOdds = calculateImpliedOdds(pool.yesReserve, pool.noReserve);
  
  // Calculate time remaining for late-entry cap
  const now = BigInt(Math.floor(Date.now() / 1000));
  const timeLeft = market.closeTime > now ? Number(market.closeTime - now) : 0;
  const hoursLeft = timeLeft / 3600;
  const isLateEntry = hoursLeft < 2; // Last 2 hours
  const maxOrderSize = isLateEntry ? 500 : 10000; // Cap at 500 in last 2 hours
  
  // Simulated quote (in real app, use useBuyQuote hook)
  const quote = useMemo((): BuyQuote | null => {
    const shares = parseFloat(amount) || 0;
    if (shares <= 0) return null;
    
    // Simplified quote simulation for demo
    const effectiveOdds = side === 'YES' ? impliedOdds / 100 : (100 - impliedOdds) / 100;
    const basePrice = effectiveOdds;
    const potCharge = basePrice * 0.15; // ~15% pot contribution
    const totalPrice = basePrice + potCharge;
    
    const sharesOut = parseHST(amount);
    const oppIn = parseHST((shares * basePrice).toFixed(6));
    const sttInFair = parseHST((shares * potCharge).toFixed(6));
    
    return {
      oppIn,
      sttInFair,
      totalCost: oppIn + sttInFair,
      sharesOut,
      effectivePrice: totalPrice,
    };
  }, [amount, side, impliedOdds]);

  // Payout calculation
  const payoutPreview = useMemo(() => {
    if (!quote) return null;
    
    const circulatingSupply = side === 'YES' ? market.yesSupply : market.noSupply;
    const newCirculating = circulatingSupply + quote.sharesOut;
    const newPot = market.pot + quote.sttInFair;
    
    const estimatedPayout = calculateEstimatedPayout(quote.sharesOut, newPot, newCirculating);
    const potShare = newCirculating > 0n 
      ? Number((quote.sharesOut * 10000n) / newCirculating) / 100 
      : 0;
    
    const roi = quote.totalCost > 0n
      ? ((Number(formatHST(estimatedPayout)) - Number(formatHST(quote.totalCost))) / Number(formatHST(quote.totalCost))) * 100
      : 0;
    
    return {
      estimatedPayout,
      potShare,
      roi,
      breakEven: Number(formatHST(quote.totalCost)),
    };
  }, [quote, market, side]);

  const handleQuickAmount = (pct: number) => {
    // In real app, calculate based on user balance
    const baseAmount = 1000;
    setAmount((baseAmount * pct / 100).toString());
  };

  return (
    <div className={styles.container}>
      {/* Terminal Header */}
      <div className={styles.header}>
        <span>▸ BUY {side}</span>
        <span className={styles.headerHint}>[ effective price shown ]</span>
      </div>

      {/* $1/Share Price Display */}
      <div className={styles.dollarPriceDisplay}>
        <div 
          className={`${styles.dollarPrice} ${side === 'NO' ? styles.selected : ''}`}
          onClick={() => setSide('NO')}
        >
          <span className={styles.dollarLabel}>NO</span>
          <span className={styles.dollarValue}>${((100 - impliedOdds) / 100).toFixed(2)}</span>
        </div>
        <div 
          className={`${styles.dollarPrice} ${side === 'YES' ? styles.selected : ''}`}
          onClick={() => setSide('YES')}
        >
          <span className={styles.dollarLabel}>YES</span>
          <span className={styles.dollarValue}>${(impliedOdds / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* YES/NO Toggle */}
      <div className={styles.sideToggle}>
        <button
          className={`${styles.sideBtn} ${side === 'NO' ? styles.active : ''}`}
          onClick={() => setSide('NO')}
          style={{ '--side-color': 'var(--color-no)' } as React.CSSProperties}
        >
          NO
        </button>
        <motion.div
          className={styles.toggleThumb}
          animate={{ x: side === 'YES' ? '100%' : '0%' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ background: side === 'YES' ? 'var(--color-yes)' : 'var(--color-no)' }}
        />
        <button
          className={`${styles.sideBtn} ${side === 'YES' ? styles.active : ''}`}
          onClick={() => setSide('YES')}
          style={{ '--side-color': 'var(--color-yes)' } as React.CSSProperties}
        >
          YES
        </button>
      </div>

      {/* Input Mode Toggle */}
      <div className={styles.inputModeRow}>
        <button
          className={`${styles.modeBtn} ${inputMode === 'shares' ? styles.active : ''}`}
          onClick={() => setInputMode('shares')}
        >
          Buy by Shares
        </button>
        <button
          className={`${styles.modeBtn} ${inputMode === 'cost' ? styles.active : ''}`}
          onClick={() => setInputMode('cost')}
        >
          Buy by Amount
        </button>
      </div>

      {/* Amount Input */}
      <div className={styles.inputSection}>
        <div className={styles.inputWrapper}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={styles.input}
            placeholder="0"
          />
          <span className={styles.inputSuffix}>
            {inputMode === 'shares' ? `${side}` : 'HST'}
          </span>
        </div>
        
        {/* Quick Amount Buttons */}
        <div className={styles.quickAmounts}>
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              className={styles.quickBtn}
              onClick={() => handleQuickAmount(pct)}
            >
              {pct === 100 ? 'MAX' : `${pct}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Late Entry Warning */}
      {isLateEntry && (
        <div className={styles.lateEntryWarning}>
          <AlertTriangle size={12} />
          <span>Late entry: Max order {maxOrderSize} shares. Pot share dilution risk.</span>
        </div>
      )}

      {/* Simple/Pro Toggle */}
      <div className={styles.viewToggle}>
        <button
          className={`${styles.viewBtn} ${!isProView ? styles.active : ''}`}
          onClick={() => setIsProView(false)}
        >
          SIMPLE
        </button>
        <button
          className={`${styles.viewBtn} ${isProView ? styles.active : ''}`}
          onClick={() => setIsProView(true)}
        >
          PRO
        </button>
      </div>

      {/* Simple View - Just effective price */}
      <AnimatePresence mode="wait">
        {quote && !isProView && (
          <motion.div
            className={styles.simpleView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.simpleRow}>
              <span>You pay</span>
              <span className={styles.simpleValue}>
                {Number(formatHST(quote.totalCost)).toFixed(2)} HST
              </span>
            </div>
            <div className={styles.simpleRow}>
              <span>You get</span>
              <span className={styles.simpleValue}>
                {amount} {side} shares @ ${quote.effectivePrice.toFixed(2)}
              </span>
            </div>
            <div className={styles.simpleHint}>
              You're paying market odds + contributing to winner pot
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cost Breakdown - Pro View Only */}
      <AnimatePresence mode="wait">
        {quote && isProView && (
          <motion.div
            className={styles.breakdown}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.breakdownHeader}>
              <Info size={12} />
              <span>COST BREAKDOWN</span>
            </div>
            
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>Market Price (AMM)</span>
              <span className={styles.breakdownValue}>
                {Number(formatHST(quote.oppIn)).toFixed(2)} HST
              </span>
            </div>
            
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>
                Pot Contribution
                <span className={styles.tooltip} data-tip="Your share of the winner pot">?</span>
              </span>
              <span className={styles.breakdownValue} style={{ color: 'var(--accent-cyan)' }}>
                +{Number(formatHST(quote.sttInFair)).toFixed(2)} HST
              </span>
            </div>
            
            <div className={styles.breakdownDivider} />
            
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>
                <strong>Total Cost (All-in)</strong>
              </span>
              <span className={styles.breakdownTotal}>
                {Number(formatHST(quote.totalCost)).toFixed(2)} HST
              </span>
            </div>

            {/* Effective Price per Share */}
            <div className={styles.effectivePrice}>
              <span>Effective Price</span>
              <span className={styles.effectivePriceValue}>
                ${quote.effectivePrice.toFixed(4)} / share
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payout Preview */}
      <AnimatePresence mode="wait">
        {payoutPreview && (
          <motion.div
            className={styles.payoutPreview}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className={styles.payoutHeader}>
              <Zap size={12} />
              <span>IF {side} WINS</span>
            </div>
            
            <div className={styles.payoutGrid}>
              <div className={styles.payoutItem}>
                <span className={styles.payoutLabel}>Est. Payout</span>
                <span className={styles.payoutValue} style={{ color: 'var(--accent-green)' }}>
                  ~{Number(formatHST(payoutPreview.estimatedPayout)).toFixed(2)} HST
                </span>
              </div>
              
              <div className={styles.payoutItem}>
                <span className={styles.payoutLabel}>Your Pot Share</span>
                <span className={styles.payoutValue}>
                  {payoutPreview.potShare.toFixed(2)}%
                </span>
              </div>
              
              <div className={styles.payoutItem}>
                <span className={styles.payoutLabel}>Potential ROI</span>
                <span 
                  className={styles.payoutValue}
                  style={{ color: payoutPreview.roi > 0 ? 'var(--accent-green)' : 'var(--color-sell)' }}
                >
                  {payoutPreview.roi > 0 ? '+' : ''}{payoutPreview.roi.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Loss scenario */}
            <div className={styles.lossWarning}>
              <TrendingDown size={12} />
              <span>If {side === 'YES' ? 'NO' : 'YES'} wins: you lose {payoutPreview.breakEven.toFixed(2)} HST</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Button */}
      <button 
        className={styles.buyButton}
        style={{ 
          '--btn-color': side === 'YES' ? 'var(--color-yes)' : 'var(--color-no)' 
        } as React.CSSProperties}
        onClick={() => onBuy?.(side, amount)}
        disabled={!quote}
      >
        <span>[ BUY {side} ]</span>
        <ArrowRight size={16} />
      </button>

      {/* Trading Status */}
      <div className={styles.tradingStatus}>
        {market.resolved ? (
          <span style={{ color: 'var(--color-sell)' }}>TRADING CLOSED</span>
        ) : (
          <span style={{ color: 'var(--accent-green)' }}>TRADING OPEN</span>
        )}
      </div>
    </div>
  );
}

