// WalletConnect - MetaMask connection button
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { monadTestnet } from '../lib/wagmi';
import styles from './WalletConnect.module.css';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== monadTestnet.id;
  const metaMaskConnector = connectors.find(c => c.id === 'injected');

  const handleConnect = () => {
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  const handleSwitchNetwork = () => {
    switchChain({ chainId: monadTestnet.id });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className={styles.container}>
        {isWrongNetwork ? (
          <button 
            className={styles.switchBtn}
            onClick={handleSwitchNetwork}
          >
            <span className={styles.warningDot} />
            Switch to Monad
          </button>
        ) : (
          <div className={styles.connected}>
            <span className={styles.networkDot} />
            <span className={styles.network}>Monad</span>
            <span className={styles.address}>{formatAddress(address)}</span>
            <button 
              className={styles.disconnectBtn}
              onClick={() => disconnect()}
              title="Disconnect"
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button 
      className={styles.connectBtn}
      onClick={handleConnect}
      disabled={isPending}
    >
      <span className={styles.offlineDot} />
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

