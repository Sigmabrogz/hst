# Hyperstitions V2 Contract Upgrades

> **When to deploy:** Only if UX layer doesn't stop late-buyer churn or free-rider dominance.  
> **Philosophy:** Smallest contract-level shifts that target the two failure modes without changing core market architecture.

---

## Failure Mode 1: Late Buyers Still Churn

**Symptom:** Users understand the rules now, but still feel the game is unfair.  
**Diagnosis:** Not a messaging problem — it's a **payout-geometry problem**.

### Option A: Time-Bucketed Payout Bands ⭐ RECOMMENDED

**Goal:** Preserve "early advantage" but don't make late participation feel stupid.

```solidity
// Split winner pot into time buckets
struct PayoutBands {
    uint256 earlyShare;   // e.g., 50% of pot
    uint256 midShare;     // e.g., 35% of pot  
    uint256 lateShare;    // e.g., 15% of pot
    uint256 earlyEnd;     // timestamp: first 33% of duration
    uint256 midEnd;       // timestamp: 33-66% of duration
}

// Winners only compete within their bucket for that slice
function claimWinnings(uint256 marketId) external {
    Market storage m = markets[marketId];
    PayoutBands storage bands = m.payoutBands;
    
    uint256 userEntryTime = m.entryTimestamp[msg.sender];
    uint256 userBucket = _getBucket(userEntryTime, m.startTime, bands);
    
    // User's share = (their shares / bucket total shares) * bucket pot slice
    uint256 bucketPot = _getBucketPot(bands, userBucket, m.totalPot);
    uint256 bucketShares = m.bucketTotalShares[userBucket];
    uint256 userShares = m.bucketUserShares[userBucket][msg.sender];
    
    uint256 payout = (userShares * bucketPot) / bucketShares;
    // ...transfer
}
```

**Why it works:**
- Late buyers can still win something meaningful
- Early still wins more, but not everything
- Cleanest live-product upgrade

**Default split suggestion:**
| Bucket | Time Window | Pot Share |
|--------|-------------|-----------|
| EARLY  | 0-33%       | 50%       |
| MID    | 33-66%      | 35%       |
| LATE   | 66-100%     | 15%       |

---

### Option B: Soft Late-Entry Floor

**Goal:** Prevent the feeling of "I joined and got zeroed."

```solidity
// Cap how much early cohort can dominate
uint256 public constant MAX_POT_SHARE_PER_ADDRESS = 500; // 5% max (basis points)
uint256 public constant MAX_POT_SHARE_PER_BUCKET = 6000; // 60% max for early bucket

function _enforcePotShareCaps(uint256 marketId, address user) internal view {
    Market storage m = markets[marketId];
    uint256 userShare = (m.userShares[user] * 10000) / m.totalShares;
    require(userShare <= MAX_POT_SHARE_PER_ADDRESS, "Exceeds max pot share");
}
```

**Why it works:**
- Doesn't break the model
- Just reduces extreme outcomes
- Mild complexity, strong fairness perception gain

---

### Option C: Late Rebate from Fees

**Goal:** Reduce late-entry regret without touching core pot math.

```solidity
uint256 public lateRebatePool; // Funded by X% of fees
uint256 public constant LATE_REBATE_THRESHOLD = 8000; // Last 20% of time

function _allocateFees(uint256 feeAmount) internal {
    uint256 rebateAllocation = (feeAmount * 1000) / 10000; // 10% to rebate pool
    lateRebatePool += rebateAllocation;
    // Rest goes to normal fee distribution
}

function claimLateRebate(uint256 marketId) external {
    Market storage m = markets[marketId];
    require(m.resolved, "Market not resolved");
    require(!m.userWon[msg.sender], "Winners don't get rebate");
    require(_isLateEntry(msg.sender, marketId), "Not late entry");
    
    uint256 rebate = _calculateRebate(msg.sender, marketId);
    lateRebatePool -= rebate;
    // Transfer rebate
}
```

**Why it works:**
- Doesn't change ideological core
- Changes emotional outcome
- Late losers get a small comfort payment

---

### Option D: Late Risk Mode (Throttle)

**Goal:** Stop wrong users from placing late bets.

```solidity
uint256 public constant LATE_MODE_THRESHOLD = 8000; // Last 20%
uint256 public constant LATE_MODE_MAX_SIZE = 500e18; // 500 shares max
uint256 public constant LATE_MODE_COOLDOWN = 300; // 5 min between trades

modifier lateRiskMode(uint256 marketId) {
    Market storage m = markets[marketId];
    if (_isLatePhase(marketId)) {
        require(msg.value <= LATE_MODE_MAX_SIZE, "Late mode: size capped");
        require(
            block.timestamp >= m.lastTrade[msg.sender] + LATE_MODE_COOLDOWN,
            "Late mode: cooldown active"
        );
    }
    _;
}
```

**Already implemented in frontend** — this is the contract-level enforcement.

---

## Failure Mode 2: Free Riders Persist

**Symptom:** People watch the market but don't do the action that makes the outcome real.  
**Diagnosis:** Need to reward **contribution**, not just prediction.

### Option A: Prediction Pot + Builder Pot Split ⭐ RECOMMENDED

**Goal:** Formalize two types of value.

```solidity
struct MarketPots {
    uint256 predictionPot;  // 70% — correct bettors
    uint256 builderPot;     // 30% — verified coordinators
}

// Coordinators prove they posted, shared, recruited, built
mapping(uint256 => mapping(address => bool)) public verifiedCoordinators;
address public coordinatorOracle; // Can be multisig or attestation service

function verifyCoordinator(uint256 marketId, address user) external {
    require(msg.sender == coordinatorOracle, "Not oracle");
    verifiedCoordinators[marketId][user] = true;
}

function claimBuilderReward(uint256 marketId) external {
    require(verifiedCoordinators[marketId][msg.sender], "Not verified");
    Market storage m = markets[marketId];
    
    uint256 builderShare = m.pots.builderPot / m.verifiedCoordinatorCount;
    // Transfer builderShare
}
```

**Why it works:**
- Makes the product's identity obvious
- "Coordination game with clear roles"
- Simple and very readable to users

**Verification options:**
1. Manual oracle (team reviews)
2. Tweet attestation (sign message, post, verify)
3. On-chain action proof (e.g., used a specific contract)
4. Referral tracking

---

### Option B: Action Multiplier

**Goal:** Only reward people who did the thing.

```solidity
struct UserClaim {
    uint256 baseShares;
    uint256 actionMultiplier; // 100 = 1x, 150 = 1.5x, 200 = 2x
}

// Multiplier tiers
uint256 public constant BASE_MULTIPLIER = 100;
uint256 public constant TWEET_MULTIPLIER = 125;      // +25%
uint256 public constant REFERRAL_MULTIPLIER = 150;   // +50%
uint256 public constant BUILDER_MULTIPLIER = 200;    // +100%

function setActionMultiplier(
    uint256 marketId, 
    address user, 
    uint256 multiplier
) external onlyOracle {
    markets[marketId].userMultiplier[user] = multiplier;
}

function calculatePayout(uint256 marketId, address user) public view returns (uint256) {
    Market storage m = markets[marketId];
    uint256 baseShare = (m.userShares[user] * m.totalPot) / m.totalShares;
    uint256 multiplier = m.userMultiplier[user];
    if (multiplier == 0) multiplier = BASE_MULTIPLIER;
    
    return (baseShare * multiplier) / 100;
}
```

**Why it works:**
- Shifts game from passive betting to active participation
- Flexible — can add new action types over time

---

### Option C: Proof-Gated Claim Windows

**Goal:** Free riders can still bet, but won't extract full value.

```solidity
uint256 public constant FULL_CLAIM_WINDOW = 24 hours;
uint256 public constant PARTIAL_CLAIM_RATIO = 7000; // 70% if no proof

function claim(uint256 marketId) external {
    Market storage m = markets[marketId];
    require(m.resolved, "Not resolved");
    
    uint256 payout = _calculateBasePayout(marketId, msg.sender);
    
    if (block.timestamp <= m.resolvedAt + FULL_CLAIM_WINDOW) {
        // Full claim window — must have proof
        require(
            verifiedCoordinators[marketId][msg.sender],
            "Proof required for full claim"
        );
    } else {
        // After window — anyone can claim, but reduced
        if (!verifiedCoordinators[marketId][msg.sender]) {
            payout = (payout * PARTIAL_CLAIM_RATIO) / 10000;
        }
    }
    
    // Transfer payout
}
```

**Why it works:**
- Strong behavioral lever
- Free riders get 70%, coordinators get 100%
- Unclaimed 30% can go to builder pot

---

### Option D: Referral-to-Win Micro-Rewards

**Goal:** Make growth part of the market's utility.

```solidity
mapping(address => address) public referrer;
uint256 public constant REFERRAL_FEE_SHARE = 500; // 5% of fees

function buyWithReferral(
    uint256 marketId, 
    bool isYes, 
    address ref
) external payable {
    if (referrer[msg.sender] == address(0) && ref != address(0)) {
        referrer[msg.sender] = ref;
    }
    _buy(marketId, isYes, msg.value);
}

function _distributeFees(uint256 feeAmount, address buyer) internal {
    address ref = referrer[buyer];
    if (ref != address(0)) {
        uint256 refShare = (feeAmount * REFERRAL_FEE_SHARE) / 10000;
        // Transfer refShare to ref
    }
}
```

**Why it works:**
- Aligns distribution with outcome
- Referrers who brought successful participants get rewarded

---

## Recommended V2 Sequence

### Phase 1: Minimal Contract Tweaks (Week 1-2)
**Pick ONE:**
- [ ] Time-bucketed payout bands (best fairness win)
- [ ] Late rebate from fees (lowest risk)

### Phase 2: Coordination Rewards (Week 3-4)
- [ ] Add builder pot (30% split)
- [ ] Action multiplier for verified outcomes
- [ ] Simple oracle/attestation for proof

### Phase 3: Scaling + Anti-Gaming (Week 5+)
- [ ] Caps per address
- [ ] Late-mode throttles (contract-level)
- [ ] Sybil audit

---

## Best Two Fixes (My Recommendation)

If you want the **simplest, high-impact, low-risk pair**:

### 1. Time-Bucketed Payout Bands
- Solves the emotional fairness problem
- Keeps your early advantage thesis intact
- Users understand "I'm in the MID bucket, competing for 35%"

### 2. Prediction Pot + Builder Pot Split
- Solves free riding
- Makes the product's identity obvious
- "70% for being right, 30% for making it happen"

**Together, these turn the system from:**
> "Odd AMM market with weird late pain"

**Into:**
> "Coordination game with clear roles"

---

## Migration Strategy

Since v1 markets are live:

1. **Don't migrate existing markets** — let them resolve under v1 rules
2. **Deploy PAMM_V2** with new features
3. **UI toggle:** "Classic Markets" vs "Coordination Markets"
4. **Gradually funnel new flow** into v2
5. **Sunset v1** after all markets resolve

```solidity
// Factory pattern for versioning
contract MarketFactory {
    address public pammV1;
    address public pammV2;
    bool public v2Enabled;
    
    function createMarket(...) external returns (uint256) {
        if (v2Enabled) {
            return IPAMM(pammV2).createMarket(...);
        }
        return IPAMM(pammV1).createMarket(...);
    }
}
```

---

## Analytics Triggers

**Deploy Phase 1 if:**
- Late-entry users (last 20% of time) have >40% churn rate
- Post-UX-update complaints still mention "unfair" or "got nothing"

**Deploy Phase 2 if:**
- >60% of volume comes from users with 0 coordination actions
- Market outcomes don't correlate with user actions (passive betting dominates)

---

## Summary

| Problem | Best Fix | Complexity | Impact |
|---------|----------|------------|--------|
| Late buyers churn | Time-bucketed payout bands | Medium | High |
| Free riders dominate | Prediction + Builder pot split | Medium | High |
| Extreme whale dominance | Per-address caps | Low | Medium |
| Wrong users betting late | Late risk mode (contract) | Low | Medium |
| No growth incentive | Referral rewards | Low | Medium |

**Start with the UX layer (already deployed). If failures persist, deploy time-bucketed bands + builder pot split as v2.**

