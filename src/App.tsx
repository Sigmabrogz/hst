import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmi';
import './styles/theme.css';
import { MarketPage } from './pages/MarketPage';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MarketPage />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
