import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import styles from './PriceChart.module.css';

interface PriceChartProps {
  currentYesPrice: number; // 0-100
  marketId?: string;
}

interface PricePoint {
  time: number;
  yes: number;
  no: number;
}

// Generate simulated historical price data
function generatePriceHistory(currentPrice: number, points: number = 50): PricePoint[] {
  const history: PricePoint[] = [];
  let price = 50; // Start at 50%
  
  for (let i = 0; i < points; i++) {
    // Random walk with drift toward current price
    const drift = (currentPrice - price) * 0.05;
    const noise = (Math.random() - 0.5) * 8;
    price = Math.max(5, Math.min(95, price + drift + noise));
    
    history.push({
      time: i,
      yes: price,
      no: 100 - price,
    });
  }
  
  // Ensure last point matches current price
  history[history.length - 1] = {
    time: points - 1,
    yes: currentPrice,
    no: 100 - currentPrice,
  };
  
  return history;
}

export function PriceChart({ currentYesPrice, marketId }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [selectedView, setSelectedView] = useState<'yes' | 'no' | 'both'>('both');

  // Generate initial history
  useEffect(() => {
    setPriceHistory(generatePriceHistory(currentYesPrice));
  }, [marketId]);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceHistory(prev => {
        if (prev.length === 0) return prev;
        
        const lastPrice = prev[prev.length - 1].yes;
        const noise = (Math.random() - 0.5) * 2;
        const newPrice = Math.max(5, Math.min(95, lastPrice + noise));
        
        const newPoint: PricePoint = {
          time: prev.length,
          yes: newPrice,
          no: 100 - newPrice,
        };
        
        return [...prev.slice(-49), newPoint];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Calculate chart dimensions and paths
  const chartData = useMemo(() => {
    if (priceHistory.length < 2) return null;

    const width = 100;
    const height = 100;
    const padding = 5;

    const xScale = (i: number) => padding + (i / (priceHistory.length - 1)) * (width - padding * 2);
    const yScale = (price: number) => height - padding - (price / 100) * (height - padding * 2);

    // Generate SVG paths
    const yesPath = priceHistory
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(p.yes)}`)
      .join(' ');

    const noPath = priceHistory
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(p.no)}`)
      .join(' ');

    // Area fill paths
    const yesAreaPath = `${yesPath} L ${xScale(priceHistory.length - 1)} ${height - padding} L ${xScale(0)} ${height - padding} Z`;
    const noAreaPath = `${noPath} L ${xScale(priceHistory.length - 1)} ${height - padding} L ${xScale(0)} ${height - padding} Z`;

    return { yesPath, noPath, yesAreaPath, noAreaPath, xScale, yScale };
  }, [priceHistory]);

  // Price change calculation
  const priceChange = useMemo(() => {
    if (priceHistory.length < 2) return { yes: 0, no: 0 };
    const first = priceHistory[0];
    const last = priceHistory[priceHistory.length - 1];
    return {
      yes: last.yes - first.yes,
      no: last.no - first.no,
    };
  }, [priceHistory]);

  const currentPrice = priceHistory[priceHistory.length - 1] || { yes: currentYesPrice, no: 100 - currentYesPrice };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Activity size={14} />
          <span>PRICE CHART</span>
        </div>
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.viewBtn} ${selectedView === 'yes' ? styles.activeYes : ''}`}
            onClick={() => setSelectedView('yes')}
          >
            YES
          </button>
          <button 
            className={`${styles.viewBtn} ${selectedView === 'both' ? styles.activeBoth : ''}`}
            onClick={() => setSelectedView('both')}
          >
            BOTH
          </button>
          <button 
            className={`${styles.viewBtn} ${selectedView === 'no' ? styles.activeNo : ''}`}
            onClick={() => setSelectedView('no')}
          >
            NO
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className={styles.priceDisplay}>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>YES</span>
          <span className={styles.priceValue} style={{ color: 'var(--accent-green)' }}>
            {currentPrice.yes.toFixed(1)}¢
          </span>
          <span className={`${styles.priceChange} ${priceChange.yes >= 0 ? styles.positive : styles.negative}`}>
            {priceChange.yes >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {priceChange.yes >= 0 ? '+' : ''}{priceChange.yes.toFixed(1)}¢
          </span>
        </div>
        <div className={styles.priceCard}>
          <span className={styles.priceLabel}>NO</span>
          <span className={styles.priceValue} style={{ color: 'var(--accent-red)' }}>
            {currentPrice.no.toFixed(1)}¢
          </span>
          <span className={`${styles.priceChange} ${priceChange.no >= 0 ? styles.positive : styles.negative}`}>
            {priceChange.no >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {priceChange.no >= 0 ? '+' : ''}{priceChange.no.toFixed(1)}¢
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartWrapper}>
        {chartData && (
          <svg 
            viewBox="0 0 100 100" 
            className={styles.chart}
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <defs>
              <linearGradient id="yesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-green)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent-green)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="noGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-red)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent-red)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[25, 50, 75].map(y => (
              <line
                key={y}
                x1="5"
                y1={100 - 5 - (y / 100) * 90}
                x2="95"
                y2={100 - 5 - (y / 100) * 90}
                stroke="var(--border-dim)"
                strokeWidth="0.3"
                strokeDasharray="2,2"
              />
            ))}

            {/* 50% center line */}
            <line
              x1="5"
              y1="50"
              x2="95"
              y2="50"
              stroke="var(--text-dim)"
              strokeWidth="0.5"
              strokeDasharray="4,4"
            />

            {/* YES area and line */}
            {(selectedView === 'yes' || selectedView === 'both') && (
              <>
                <motion.path
                  d={chartData.yesAreaPath}
                  fill="url(#yesGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <motion.path
                  d={chartData.yesPath}
                  fill="none"
                  stroke="var(--accent-green)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
              </>
            )}

            {/* NO area and line */}
            {(selectedView === 'no' || selectedView === 'both') && (
              <>
                <motion.path
                  d={chartData.noAreaPath}
                  fill="url(#noGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <motion.path
                  d={chartData.noPath}
                  fill="none"
                  stroke="var(--accent-red)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
              </>
            )}

            {/* Current price dots */}
            {(selectedView === 'yes' || selectedView === 'both') && (
              <motion.circle
                cx={chartData.xScale(priceHistory.length - 1)}
                cy={chartData.yScale(currentPrice.yes)}
                r="2"
                fill="var(--accent-green)"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            {(selectedView === 'no' || selectedView === 'both') && (
              <motion.circle
                cx={chartData.xScale(priceHistory.length - 1)}
                cy={chartData.yScale(currentPrice.no)}
                r="2"
                fill="var(--accent-red)"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            )}
          </svg>
        )}

        {/* Y-axis labels */}
        <div className={styles.yAxis}>
          <span>100¢</span>
          <span>75¢</span>
          <span>50¢</span>
          <span>25¢</span>
          <span>0¢</span>
        </div>
      </div>

      {/* Time labels */}
      <div className={styles.timeLabels}>
        <span>8h ago</span>
        <span>6h ago</span>
        <span>4h ago</span>
        <span>2h ago</span>
        <span>Now</span>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'var(--accent-green)' }} />
          <span>YES Price</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'var(--accent-red)' }} />
          <span>NO Price</span>
        </div>
        <div className={styles.legendNote}>
          Price = implied probability. $1 payout if correct.
        </div>
      </div>
    </div>
  );
}

