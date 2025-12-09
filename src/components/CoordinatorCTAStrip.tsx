// CoordinatorCTAStrip - Actions to help coordinate the outcome
// Solves: "How do we motivate people to act vs free ride?"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  MessageSquare, 
  Users, 
  Copy, 
  Check, 
  ExternalLink,
  Zap,
  Trophy
} from 'lucide-react';
import styles from './CoordinatorCTAStrip.module.css';

interface CoordinatorCTAStripProps {
  marketDescription: string;
  marketId: string;
  side?: 'YES' | 'NO';
}

export function CoordinatorCTAStrip({ 
  marketDescription, 
  marketId,
  side = 'YES'
}: CoordinatorCTAStripProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const marketUrl = `https://app.hyperstitions.com/market/${marketId}`;
  
  // Generate tweet template
  const tweetTemplate = side === 'YES'
    ? `🔮 Betting YES on: "${marketDescription}"\n\nJoin the coordination:\n${marketUrl}\n\n$HST @hyperstitions`
    : `🔮 Betting NO on: "${marketDescription}"\n\nJoin the coordination:\n${marketUrl}\n\n$HST @hyperstitions`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(marketUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTweet = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetTemplate)}`;
    window.open(tweetUrl, '_blank');
  };

  const handleQuote = () => {
    // Pre-fill with quote tweet template
    const quoteTemplate = `I'm coordinating on this:\n\n${marketUrl}`;
    const quoteUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(quoteTemplate)}`;
    window.open(quoteUrl, '_blank');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.headerLeft}>
          <Zap size={12} />
          <span>COORDINATE TO WIN</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.hint}>Help make it happen</span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            className={styles.chevron}
          >
            ▾
          </motion.span>
        </div>
      </div>

      {/* Explanation Banner - Buy + Bet + Build framing */}
      <div className={styles.explainer}>
        <Trophy size={14} />
        <span>
          <strong>Buy + Bet + Build:</strong> Coordinators who help make the outcome real get rewarded more than passive bettors.
        </span>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button className={styles.actionBtn} onClick={handleTweet}>
          <MessageSquare size={14} />
          <span>Tweet</span>
        </button>
        
        <button className={styles.actionBtn} onClick={handleQuote}>
          <Share2 size={14} />
          <span>Quote</span>
        </button>
        
        <button className={styles.actionBtn} onClick={handleCopyLink}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
        
        <button className={styles.actionBtn}>
          <Users size={14} />
          <span>Invite</span>
        </button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.expandedContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Tweet Template Preview */}
            <div className={styles.templateSection}>
              <div className={styles.templateHeader}>
                <span>Tweet Template</span>
                <button 
                  className={styles.copyTemplateBtn}
                  onClick={() => navigator.clipboard.writeText(tweetTemplate)}
                >
                  <Copy size={10} />
                  Copy
                </button>
              </div>
              <div className={styles.templatePreview}>
                {tweetTemplate}
              </div>
            </div>

            {/* Coordination Checklist */}
            <div className={styles.checklist}>
              <div className={styles.checklistHeader}>
                <span>Coordinator Checklist</span>
              </div>
              <div className={styles.checklistItems}>
                <label className={styles.checkItem}>
                  <input type="checkbox" />
                  <span>Share market on X/Twitter</span>
                </label>
                <label className={styles.checkItem}>
                  <input type="checkbox" />
                  <span>Invite 2+ friends to participate</span>
                </label>
                <label className={styles.checkItem}>
                  <input type="checkbox" />
                  <span>Engage with related discussions</span>
                </label>
                <label className={styles.checkItem}>
                  <input type="checkbox" />
                  <span>Take action to influence outcome</span>
                </label>
              </div>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span className={styles.statValue}>47</span>
                <span className={styles.statLabel}>Coordinators</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>128</span>
                <span className={styles.statLabel}>Shares</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>23</span>
                <span className={styles.statLabel}>Mentions</span>
              </div>
            </div>

            {/* External Links */}
            <div className={styles.externalLinks}>
              <a href="#" className={styles.extLink}>
                <span>View on X</span>
                <ExternalLink size={10} />
              </a>
              <a href="#" className={styles.extLink}>
                <span>Discord</span>
                <ExternalLink size={10} />
              </a>
              <a href="#" className={styles.extLink}>
                <span>Telegram</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

