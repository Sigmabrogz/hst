import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Code, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Shield,
  Layers
} from 'lucide-react';
import { useVersion } from '../contexts/VersionContext';
import styles from './ChangesInfoPanel.module.css';

interface ChangeItem {
  title: string;
  problem: string;
  solution: string;
  logic: string;
  benefit: string;
  code?: string;
}

const V1_CHANGES: ChangeItem[] = [
  {
    title: '$1/Share Normalized Display',
    problem: 'Users import Polymarket mental model expecting $1/share settlement, but see confusing hybrid prices',
    solution: 'Display effective price as if shares settle at $1: "BUY YES AT $0.60"',
    logic: 'effectivePrice = totalCost / sharesOut. If you pay 60 HST for 100 shares, effective price = $0.60/share',
    benefit: 'Instant comprehension. Users understand "60% implied odds" without learning PAMM mechanics',
    code: `// MarketClarityHeader.tsx
const yesPrice = (impliedOdds / 100).toFixed(2);
const noPrice = ((100 - impliedOdds) / 100).toFixed(2);
// Display: "BUY YES AT $0.60"`
  },
  {
    title: 'Simple/Pro View Toggle',
    problem: 'Power users want full breakdown, casual users get overwhelmed by AMM + pot math',
    solution: 'Toggle between Simple view (just pay/get) and Pro view (full cost breakdown)',
    logic: 'Simple: "You pay X HST → You get Y shares @ $Z". Pro: Shows Market Price (AMM) + Pot Contribution + Total Cost',
    benefit: 'Reduces cognitive load by 70% for casual users while preserving transparency for pros',
    code: `// BuyPanelEnhanced.tsx
{viewMode === 'simple' ? (
  <div>You pay: {cost} HST</div>
  <div>You get: {shares} shares @ \${effectivePrice}</div>
) : (
  <div>Market Price (AMM): {ammCost}</div>
  <div>Pot Contribution: {potCost}</div>
  <div>Total Cost: {totalCost}</div>
)}`
  },
  {
    title: 'Late Entry Warnings + Order Caps',
    problem: 'Late buyers feel "scammed" when they get smaller pot share than early buyers',
    solution: 'Phase indicators (EARLY/MID/LATE) + warnings + front-end order size caps in late phase',
    logic: 'Phase = time remaining / total duration. EARLY (>66%), MID (33-66%), LATE (<33%). Cap orders to 500 shares in LATE phase',
    benefit: 'Sets correct expectations. Users know they\'re joining after momentum formed',
    code: `// LateEntryBanner.tsx
const phase = percentRemaining > 66 ? 'EARLY' 
            : percentRemaining > 33 ? 'MID' : 'LATE';

// BuyPanelEnhanced.tsx - Order cap
if (phase === 'LATE' && shares > 500) {
  showWarning('Late entry: max 500 shares');
}`
  },
  {
    title: 'Coordination Bet Framing',
    problem: 'Users think this is a prediction market, but it\'s actually a coordination market',
    solution: 'Rename to "COORDINATION BET" + "Buy + Bet + Build" messaging',
    logic: 'Reframe the value prop: you\'re not just predicting, you\'re coordinating to make the outcome real',
    benefit: 'Aligns user expectations with actual mechanism. Early coordinators understand their advantage',
    code: `// MarketClarityHeader.tsx
<div className={styles.coordinationLabel}>
  ⚡ COORDINATION BET — This market rewards being 
  right AND early. Buy + Bet + Build to win.
</div>`
  },
  {
    title: 'Crowding Meter',
    problem: 'Users don\'t understand that crowded sides have diluted pot shares',
    solution: 'Visual meter showing YES/NO distribution + "crowded side = smaller share per person"',
    logic: 'crowdingRatio = yesShares / noShares. If ratio > 1.5, YES is crowded. Display as percentage bar',
    benefit: 'Users can identify contrarian opportunities and understand dilution risk',
    code: `// CrowdingMeter.tsx
const yesPercent = (yesShares / (yesShares + noShares)) * 100;
// If YES is 70%, show warning: "Crowded side = smaller pot share"`
  },
  {
    title: 'Coordinator CTA Strip',
    problem: 'Users bet passively without helping make the outcome real (free-rider problem)',
    solution: 'Action buttons: Tweet, Quote, Copy Link, Invite + "Buy + Bet + Build" messaging',
    logic: 'Provide clear pathways to coordination actions right next to the buy panel',
    benefit: 'Converts passive bettors into active coordinators. Increases market virality',
    code: `// CoordinatorCTAStrip.tsx
const handleTweet = () => {
  const text = \`I'm betting on: \${description}\\n\\n$HST @hyperstitions\`;
  window.open(\`https://twitter.com/intent/tweet?text=\${encodeURIComponent(text)}\`);
};`
  },
  {
    title: 'Payout Preview (IF YES/NO WINS)',
    problem: 'Users don\'t know what they\'ll actually receive if they win',
    solution: 'Show estimated payout, pot share %, and ROI before confirmation',
    logic: 'estimatedPayout = (userShares / totalWinningShares) * pot. ROI = (payout - cost) / cost * 100',
    benefit: 'Removes uncertainty. Users can calculate expected value before committing',
    code: `// UserPositionCard.tsx
const potSharePercent = (userShares / totalShares) * 100;
const estimatedPayout = (potSharePercent / 100) * pot;
const roi = ((estimatedPayout - cost) / cost) * 100;`
  }
];

const V2_CHANGES: ChangeItem[] = [
  {
    title: 'Time-Bucketed Payout Bands',
    problem: 'Late buyers compete against early whales for the same pot, feel they can\'t win',
    solution: 'Split winner pot into 3 buckets: EARLY (50%), MID (35%), LATE (15%). Winners compete within their bucket',
    logic: 'Entry time determines your bucket. You only compete with others who entered in the same time window',
    benefit: 'Late entry becomes viable. You\'re not competing against early whales for the same slice',
    code: `// V2 Contract Logic (Proposed)
struct PayoutBands {
  uint256 earlyShare;   // 50% of pot
  uint256 midShare;     // 35% of pot  
  uint256 lateShare;    // 15% of pot
}

function claimWinnings(uint256 marketId) {
  uint256 userBucket = getBucket(entryTime);
  uint256 bucketPot = getBucketPot(userBucket);
  uint256 payout = (userShares / bucketTotalShares) * bucketPot;
}`
  },
  {
    title: 'Prediction + Builder Pot Split',
    problem: 'Free riders bet passively and extract value without helping make the outcome real',
    solution: '70% goes to correct bettors (prediction pot), 30% goes to verified coordinators (builder pot)',
    logic: 'Coordinators prove they tweeted, referred, shared, or built. They get access to the extra 30%',
    benefit: 'Solves free-rider problem. Active coordinators get rewarded more than passive bettors',
    code: `// V2 Contract Logic (Proposed)
struct MarketPots {
  uint256 predictionPot;  // 70% — correct bettors
  uint256 builderPot;     // 30% — verified coordinators
}

function claimBuilderReward(uint256 marketId) {
  require(verifiedCoordinators[marketId][msg.sender]);
  uint256 share = builderPot / verifiedCoordinatorCount;
}`
  },
  {
    title: 'Action Multiplier System',
    problem: 'No incentive to do coordination actions beyond betting',
    solution: 'Base 1x payout + multipliers for actions: Tweet (+25%), Referral (+50%), Builder (+100%)',
    logic: 'Oracle/attestor verifies actions. Multiplier applied to base payout',
    benefit: 'Shifts game from passive betting to active participation. More actions = more reward',
    code: `// V2 Contract Logic (Proposed)
uint256 BASE_MULTIPLIER = 100;      // 1x
uint256 TWEET_MULTIPLIER = 125;     // +25%
uint256 REFERRAL_MULTIPLIER = 150;  // +50%
uint256 BUILDER_MULTIPLIER = 200;   // +100%

function calculatePayout(address user) {
  uint256 base = (userShares * pot) / totalShares;
  return (base * userMultiplier) / 100;
}`
  },
  {
    title: 'Soft Late-Entry Floor',
    problem: 'Early whales can dominate the entire pot, leaving nothing for late joiners',
    solution: 'Cap max pot-share per address (e.g., 5%) or per time bucket (e.g., 60% max for early)',
    logic: 'Enforce caps at contract level. Prevents extreme concentration',
    benefit: 'Reduces "whale dominance" feeling. Late joiners always have meaningful upside',
    code: `// V2 Contract Logic (Proposed)
uint256 MAX_POT_SHARE_PER_ADDRESS = 500; // 5% max

function _enforcePotShareCaps(address user) {
  uint256 userShare = (userShares * 10000) / totalShares;
  require(userShare <= MAX_POT_SHARE_PER_ADDRESS);
}`
  },
  {
    title: 'Late Rebate from Fees',
    problem: 'Late losers feel completely burned, even though they understood the rules',
    solution: 'Allocate 10% of fees to a late-participant comfort pool. Late losers get small rebate',
    logic: 'If you enter in last 20% of time AND lose, you get partial refund from rebate pool',
    benefit: 'Reduces late-entry regret without changing core pot math. Emotional safety net',
    code: `// V2 Contract Logic (Proposed)
uint256 lateRebatePool;

function _allocateFees(uint256 feeAmount) {
  uint256 rebate = (feeAmount * 1000) / 10000; // 10%
  lateRebatePool += rebate;
}

function claimLateRebate(uint256 marketId) {
  require(!userWon[msg.sender] && isLateEntry(msg.sender));
  // Transfer rebate
}`
  }
];

export function ChangesInfoPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'v1' | 'v2' | 'overview'>('overview');
  const { isV2 } = useVersion();

  return (
    <div className={styles.container}>
      {/* Toggle Button */}
      <button 
        className={styles.toggleBtn}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Info size={16} />
        <span>CHANGES & DOCUMENTATION</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {isV2 && <span className={styles.v2Badge}>V2 ACTIVE</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.panel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tab Navigation */}
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <Layers size={14} />
                Overview
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'v1' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('v1')}
              >
                <Zap size={14} />
                V1 Changes (Live)
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'v2' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('v2')}
              >
                <Code size={14} />
                V2 Changes (Proposed)
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.content}>
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'v1' && <ChangesTab changes={V1_CHANGES} version="v1" />}
              {activeTab === 'v2' && <ChangesTab changes={V2_CHANGES} version="v2" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className={styles.overview}>
      <div className={styles.overviewHeader}>
        <h2>Hyperstitions UX Upgrade</h2>
        <p>Fixing the mental-model mismatch between Polymarket expectations and coordination market reality</p>
      </div>

      <div className={styles.problemStatement}>
        <h3><AlertTriangle size={16} /> The Core Problem</h3>
        <p>
          Users import <strong>Polymarket mental model</strong> (simple prediction, $1/share settlement) 
          but encounter a <strong>hybrid PAMM mechanism</strong> (AMM + pot split + time-weighted payouts).
        </p>
        <p>
          This causes: "late buyers lose money", "UX isn't great", "how to motivate action vs free riders"
        </p>
      </div>

      <div className={styles.solutionGrid}>
        <div className={styles.solutionCard}>
          <div className={styles.solutionIcon} style={{ background: 'rgba(0, 255, 136, 0.1)' }}>
            <CheckCircle size={24} color="var(--accent-green)" />
          </div>
          <h4>V1: UX Layer (Live)</h4>
          <p>Zero contract changes. Pure presentation fixes.</p>
          <ul>
            <li>$1/share normalized display</li>
            <li>Simple/Pro view toggle</li>
            <li>Late entry warnings + caps</li>
            <li>"Coordination Bet" framing</li>
            <li>Crowding meter</li>
            <li>Payout preview</li>
          </ul>
          <div className={styles.impactBadge}>
            <TrendingUp size={12} />
            ~70% of complaints addressed
          </div>
        </div>

        <div className={styles.solutionCard}>
          <div className={styles.solutionIcon} style={{ background: 'rgba(0, 255, 255, 0.1)' }}>
            <Code size={24} color="var(--accent-cyan)" />
          </div>
          <h4>V2: Contract Upgrades (Proposed)</h4>
          <p>Mechanism-level fixes for remaining issues.</p>
          <ul>
            <li>Time-bucketed payout bands</li>
            <li>Prediction + Builder pot split</li>
            <li>Action multiplier system</li>
            <li>Soft late-entry floor</li>
            <li>Late rebate from fees</li>
          </ul>
          <div className={styles.impactBadge}>
            <Shield size={12} />
            Solves fairness + free-rider
          </div>
        </div>
      </div>

      <div className={styles.philosophySection}>
        <h3><Users size={16} /> The Philosophy</h3>
        <div className={styles.philosophyGrid}>
          <div className={styles.philosophyItem}>
            <strong>Not a Prediction Market</strong>
            <p>It's a <em>coordination market</em>. Public prices create Schelling points for collective action.</p>
          </div>
          <div className={styles.philosophyItem}>
            <strong>Early Advantage is Intentional</strong>
            <p>Early believers who help make the outcome real should be rewarded more than late pile-ins.</p>
          </div>
          <div className={styles.philosophyItem}>
            <strong>Buy + Bet + Build</strong>
            <p>The game rewards coordinators who act, not just bettors who predict passively.</p>
          </div>
        </div>
      </div>

      <div className={styles.techStack}>
        <h3><Code size={16} /> Technical Implementation</h3>
        <div className={styles.techGrid}>
          <div className={styles.techItem}>
            <strong>Frontend</strong>
            <span>React + Vite + TypeScript</span>
          </div>
          <div className={styles.techItem}>
            <strong>Styling</strong>
            <span>CSS Modules + CSS Variables</span>
          </div>
          <div className={styles.techItem}>
            <strong>Animation</strong>
            <span>Framer Motion</span>
          </div>
          <div className={styles.techItem}>
            <strong>Web3</strong>
            <span>Wagmi + Viem + MetaMask</span>
          </div>
          <div className={styles.techItem}>
            <strong>Chain</strong>
            <span>Monad Testnet</span>
          </div>
          <div className={styles.techItem}>
            <strong>Contract</strong>
            <span>PAMM + ZAMM + ERC6909</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangesTab({ changes, version }: { changes: ChangeItem[]; version: 'v1' | 'v2' }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className={styles.changesList}>
      <div className={styles.changesHeader}>
        <h3>
          {version === 'v1' ? (
            <>
              <Zap size={18} /> V1 Changes — UX Improvements (Live)
            </>
          ) : (
            <>
              <Code size={18} /> V2 Changes — Contract Upgrades (Proposed)
            </>
          )}
        </h3>
        <p>
          {version === 'v1' 
            ? 'Zero contract changes. Pure presentation layer fixes that can ship immediately.'
            : 'Mechanism-level changes that require contract deployment. Keep V1 markets alive, deploy V2 for new markets.'
          }
        </p>
      </div>

      {changes.map((change, index) => (
        <motion.div 
          key={index}
          className={styles.changeItem}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <button 
            className={styles.changeHeader}
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <span className={styles.changeNumber}>{index + 1}</span>
            <span className={styles.changeTitle}>{change.title}</span>
            {expandedIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <AnimatePresence>
            {expandedIndex === index && (
              <motion.div
                className={styles.changeDetails}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>
                    <AlertTriangle size={12} /> PROBLEM
                  </div>
                  <p>{change.problem}</p>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>
                    <CheckCircle size={12} /> SOLUTION
                  </div>
                  <p>{change.solution}</p>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>
                    <Clock size={12} /> LOGIC
                  </div>
                  <p>{change.logic}</p>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>
                    <DollarSign size={12} /> BENEFIT
                  </div>
                  <p>{change.benefit}</p>
                </div>

                {change.code && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>
                      <Code size={12} /> CODE
                    </div>
                    <pre className={styles.codeBlock}>{change.code}</pre>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

