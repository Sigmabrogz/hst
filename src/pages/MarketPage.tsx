// MarketPage - Main layout integrating all UX upgrade components
// Layout: Dashboard with sidebar + terminal aesthetic
// Now supports V1 (UX only), V2 (contract upgrades), and V3 (conviction model) views

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  BarChart3, 
  MessageSquare, 
  FileText,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import {
  MarketClarityHeader,
  BuyPanelEnhanced,
  LateEntryBanner,
  CrowdingMeter,
  UserPositionCard,
  CoordinatorCTAStrip,
  WalletConnect,
  VersionToggle,
  PayoutBucketDisplay,
  BuilderPotPanel,
  ChangesInfoPanel,
  PriceChart,
  ConvictionWeightDisplay,
  TwoLayerPriceDisplay,
  PreTradePayoutPreview,
} from '../components';
import { useVersion } from '../contexts/VersionContext';
import { useActiveMarket, useDemoMarket } from '../lib/hooks/useMarket';
import { formatHST, parseHST } from '../lib/contracts/pamm';
import styles from './MarketPage.module.css';

export function MarketPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [useLiveData, setUseLiveData] = useState(false); // Default to demo for now
  const { isV2, isV3 } = useVersion();
  const [buyAmount] = useState(100); // For payout preview
  
  // Try live data first, fall back to demo
  const liveData = useActiveMarket();
  const demoData = useDemoMarket();
  
  // Use live data if available and no errors, otherwise use demo
  const hasLiveData = useLiveData && liveData.market && !liveData.error;
  const marketData = hasLiveData ? liveData : demoData;
  
  // Data source status
  const dataSource = hasLiveData ? 'LIVE' : 'DEMO';
  const isConnecting = useLiveData && liveData.isLoading;

  // Demo user position
  const userPosition = {
    yesBalance: parseHST('1500'),
    noBalance: 0n,
    isConnected: true,
  };

  // Demo user actions for V2 builder pot
  const userActions = {
    tweeted: true,
    referred: false,
    shared: true,
    built: false,
  };

  if (!marketData.market || !marketData.pool) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <span>Loading market...</span>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Top Navigation */}
      <nav className={styles.topNav}>
        <div className={styles.navLeft}>
          <button 
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className={styles.logo}>[HYPERSTITIONS]</span>
        </div>
        
        <div className={styles.navCenter}>
          <span className={styles.navLabel}>HST TERMINAL</span>
          <VersionToggle />
          <button 
            className={styles.dataSourceBtn}
            onClick={() => setUseLiveData(!useLiveData)}
            title={useLiveData 
              ? "Connected to Monad Testnet (click for demo)" 
              : "Demo mode (click to try live data)"
            }
          >
            <span 
              className={styles.statusDot} 
              style={{ 
                background: isConnecting 
                  ? 'var(--color-warning)'
                  : hasLiveData 
                    ? 'var(--accent-green)' 
                    : 'var(--accent-orange)' 
              }}
            />
            {isConnecting ? 'CONNECTING...' : dataSource}
          </button>
        </div>
        
        <div className={styles.navRight}>
          <a href="https://docs.hyperstitions.com" target="_blank" rel="noopener" className={styles.navLink}>
            HOW IT WORKS
          </a>
          <WalletConnect />
        </div>
      </nav>

      {/* Changes Info Panel - Documentation at top */}
      <div className={styles.infoPanelContainer}>
        <ChangesInfoPanel />
      </div>

      <div className={styles.mainLayout}>
        {/* Left Sidebar - Market Status */}
        <motion.aside 
          className={styles.sidebar}
          animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Fixed Header for V2/V3 panels - always visible, never scrolls */}
          {(isV2 || isV3) && (
            <div className={styles.sidebarFixed}>
              {/* V2: Time-Bucketed Payouts */}
              {isV2 && (
                <div className={styles.stickyVersionPanel}>
                  <PayoutBucketDisplay
                    currentPhase={marketData.timeRemaining.phase}
                    timeRemaining={marketData.timeRemaining}
                    marketDuration={24}
                    userEntryBucket="EARLY"
                  />
                </div>
              )}

              {/* V3: Conviction Weight Display */}
              {isV3 && (
                <div className={styles.stickyVersionPanel}>
                  <ConvictionWeightDisplay
                    phase={marketData.timeRemaining.phase}
                    percentRemaining={marketData.timeRemaining.percentRemaining}
                    userStake={buyAmount}
                  />
                </div>
              )}
            </div>
          )}

          {/* Scrollable sidebar content */}
          <div className={styles.sidebarContent}>
            {/* Market Status Panel */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <Activity size={12} />
                <span>MARKET STATUS</span>
              </div>
              <div className={styles.statusList}>
                <div className={styles.statusItem}>
                  <span>HST PRICE:</span>
                  <span className={styles.statusValue}>$0.00249</span>
                </div>
                <div className={styles.statusItem}>
                  <span>POT TO SHARE:</span>
                  <span className={styles.statusValue}>
                    {Number(formatHST(marketData.market.pot)).toLocaleString()} HST
                  </span>
                </div>
                <div className={styles.statusItem}>
                  <span>CYCLE EMISSIONS:</span>
                  <span className={styles.statusValue}>10M HST ($25K)</span>
                </div>
                <div className={styles.statusItem}>
                  <span>PM VOL:</span>
                  <span className={styles.statusValue}>408M HST ($1M)</span>
                </div>
                <div className={styles.statusItem}>
                  <span>PM LIQUIDITY:</span>
                  <span className={styles.statusValue}>781M HST ($2M)</span>
                </div>
                <div className={styles.statusItem}>
                  <span>CREATOR:</span>
                  <span className={styles.statusValue} style={{ color: 'var(--accent-orange)' }}>
                    HYPERSTITIONS
                  </span>
                </div>
              </div>
            </div>

            {/* Late Entry Banner */}
            <LateEntryBanner 
              phase={marketData.timeRemaining.phase}
              percentRemaining={marketData.timeRemaining.percentRemaining}
              hoursRemaining={marketData.timeRemaining.hours}
            />

            {/* Crowding Meter */}
            <CrowdingMeter 
              yesOdds={marketData.impliedOdds}
              crowdedSide={marketData.crowding.crowdedSide}
              crowdingRatio={marketData.crowding.crowdingRatio}
              description={marketData.crowding.description}
            />

            {/* Quick Links */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <FileText size={12} />
                <span>CONTRACTS</span>
              </div>
              <div className={styles.contractLinks}>
                <a href="#" className={styles.contractLink}>
                  <span>MKT ID:</span>
                  <span>6057...8230</span>
                  <ExternalLink size={10} />
                </a>
                <a href="#" className={styles.contractLink}>
                  <span>ZAMM:</span>
                  <span>0xe5e5...c422</span>
                  <ExternalLink size={10} />
                </a>
                <a href="#" className={styles.contractLink}>
                  <span>PAMM:</span>
                  <span>0x97b4...0BE0</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Market Header */}
          <MarketClarityHeader 
            market={marketData.market}
            pool={marketData.pool}
          />

          {/* Polymarket-style: Chart + Buy Panel side by side */}
          <div className={styles.chartBuyRow}>
            {/* Left: Price Chart */}
            <div className={styles.chartSection}>
              <PriceChart 
                currentYesPrice={marketData.impliedOdds}
                marketId={marketData.market.id}
              />
            </div>

            {/* Right: Buy Panel (Polymarket style) */}
            <div className={styles.buySection}>
              <BuyPanelEnhanced 
                market={marketData.market}
                pool={marketData.pool}
              />
              
              {/* V3: Pre-Trade Payout Preview */}
              {isV3 && (
                <PreTradePayoutPreview
                  side="YES"
                  stake={buyAmount}
                  phase={marketData.timeRemaining.phase}
                  totalPot={Number(formatHST(marketData.market.pot))}
                  totalYesConviction={Number(formatHST(marketData.market.yesSupply)) * 1.2}
                  totalNoConviction={Number(formatHST(marketData.market.noSupply)) * 0.9}
                  yesOdds={marketData.impliedOdds}
                />
              )}
            </div>
          </div>

          {/* V3: Two-Layer Price Display */}
          {isV3 && (
            <TwoLayerPriceDisplay
              yesOdds={marketData.impliedOdds}
              phase={marketData.timeRemaining.phase}
              userStake={buyAmount}
            />
          )}

          {/* Content Grid */}
          <div className={styles.contentGrid}>
            {/* Center Column - Tweets/Activity */}
            <div className={styles.centerColumn}>
              {/* Coordinator CTA */}
              <CoordinatorCTAStrip 
                marketDescription={marketData.market.description}
                marketId={marketData.market.id}
                side="YES"
              />

              {/* Tweet Feed Panel */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <MessageSquare size={12} />
                  <span>Latest Ansem tweets</span>
                  <span className={styles.tweetHandle}>@blknoiz06</span>
                </div>
                <div className={styles.tweetFeed}>
                  {[
                    { text: 'legendary run', time: '10h ago' },
                    { text: 'probably completes it if he doesnt have to float it bc defenders in his face', time: '13h ago' },
                    { text: 'phillip rivers? yall not being serious', time: '13h ago' },
                    { text: 'that split formation with both rbs was tough', time: '13h ago' },
                    { text: '😂', time: '14h ago' },
                    { text: 'WHERE?', time: '15h ago' },
                    { text: 'run a slant & go w/ aj here i promise its 6', time: '15h ago' },
                  ].map((tweet, i) => (
                    <div key={i} className={styles.tweetItem}>
                      <span className={styles.tweetPipe}>|</span>
                      <span className={styles.tweetText}>{tweet.text}</span>
                      <span className={styles.tweetTime}>{tweet.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol Status */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <BarChart3 size={12} />
                  <span>PROTOCOL STATUS</span>
                </div>
                <div className={styles.protocolStats}>
                  <div className={styles.protocolStat}>
                    <span className={styles.protocolLabel}>TREASURY:</span>
                    <span className={styles.protocolValue}>369M ($919K)</span>
                  </div>
                  <div className={styles.protocolStat}>
                    <span className={styles.protocolLabel}>24H VOLUME:</span>
                    <span className={styles.protocolValue}>$84K</span>
                  </div>
                  <div className={styles.protocolStat}>
                    <span className={styles.protocolLabel}>BUY VOL:</span>
                    <span className={styles.protocolValue}>$13K</span>
                  </div>
                  <div className={styles.protocolStat}>
                    <span className={styles.protocolLabel}>SELL VOL:</span>
                    <span className={styles.protocolValue}>$71K</span>
                  </div>
                </div>
                <div className={styles.protocolActions}>
                  <button className={styles.protocolBtn}>SWAP</button>
                  <button className={styles.protocolBtn}>BRIDGE</button>
                  <button className={styles.protocolBtn}>DOCS</button>
                  <button className={styles.protocolBtn}>X</button>
                </div>
              </div>
            </div>

            {/* Right Column - Position + V2/V3 extras */}
            <div className={styles.rightColumn}>
              {/* V2: Builder Pot Panel */}
              {isV2 && (
                <BuilderPotPanel
                  totalPot={Number(formatHST(marketData.market.pot))}
                  predictionPotShare={70}
                  builderPotShare={30}
                  userIsVerified={userActions.tweeted || userActions.built}
                  userActions={userActions}
                />
              )}

              {/* User Position */}
              <UserPositionCard 
                yesBalance={userPosition.yesBalance}
                noBalance={userPosition.noBalance}
                yesSupply={marketData.market.yesSupply}
                noSupply={marketData.market.noSupply}
                pot={marketData.market.pot}
                impliedOdds={marketData.impliedOdds}
                isConnected={userPosition.isConnected}
              />

              {/* Shoutbox */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <MessageSquare size={12} />
                  <span>SHOUTBOX</span>
                </div>
                <div className={styles.shoutbox}>
                  <div className={styles.shoutMessage}>
                    <span className={styles.shoutUser}>anon_0x2e0:</span>
                    <span>the loop completes itself</span>
                  </div>
                </div>
                <div className={styles.shoutInput}>
                  <input 
                    type="text" 
                    placeholder="Send your message" 
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

