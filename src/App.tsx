import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmi';
import { VersionProvider } from './contexts/VersionContext';
import './styles/theme.css';
import { MarketPage } from './pages/MarketPage';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <VersionProvider>
          <MarketPage />
        </VersionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
