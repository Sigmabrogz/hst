import { useVersion } from '../contexts/VersionContext';
import styles from './VersionToggle.module.css';

export function VersionToggle() {
  const { version, setVersion, isV2, isV3 } = useVersion();

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
          <span className={styles.sublabel}>BUCKETS</span>
        </button>
        <button
          className={`${styles.btn} ${version === 'v3' ? styles.activeV3 : ''}`}
          onClick={() => setVersion('v3')}
        >
          <span className={styles.label}>V3</span>
          <span className={styles.sublabel}>CONVICTION</span>
        </button>
      </div>
      
      {isV2 && (
        <div className={styles.v2Indicator}>
          ⚡ V2 PREVIEW MODE
        </div>
      )}
      {isV3 && (
        <div className={styles.v3Indicator}>
          🎯 V3 CONVICTION MODEL
        </div>
      )}
    </div>
  );
}

