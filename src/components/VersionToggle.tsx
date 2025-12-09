import React from 'react';
import { useVersion } from '../contexts/VersionContext';
import styles from './VersionToggle.module.css';

export function VersionToggle() {
  const { version, setVersion } = useVersion();

  return (
    <div className={styles.container}>
      <div className={styles.toggle}>
        <button
          className={`${styles.btn} ${version === 'v1' ? styles.active : ''}`}
          onClick={() => setVersion('v1')}
        >
          <span className={styles.label}>V1</span>
          <span className={styles.sublabel}>LIVE</span>
        </button>
        <button
          className={`${styles.btn} ${version === 'v2' ? styles.active : ''}`}
          onClick={() => setVersion('v2')}
        >
          <span className={styles.label}>V2</span>
          <span className={styles.sublabel}>PROPOSED</span>
        </button>
      </div>
      
      <div className={styles.description}>
        {version === 'v1' ? (
          <span>
            <strong>V1:</strong> UX improvements only — $1/share display, late warnings, coordinator CTAs
          </span>
        ) : (
          <span>
            <strong>V2:</strong> Contract upgrades — time-bucketed payouts + builder pot split
          </span>
        )}
      </div>
    </div>
  );
}

