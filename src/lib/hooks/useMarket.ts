// React hooks for PAMM market data - LIVE from Monad Testnet
import { useState, useEffect, useCallback } from 'react';
import type { Market, Pool, BuyQuote } from '../contracts/pamm';
import {
  getMarket,
  getMarkets,
  getMarketCount,
  quoteBuyYes,
  quoteBuyNo,
  calculateImpliedOdds,
  getTimeRemaining,
  getCrowdingLevel,
  parseHST,
} from '../contracts/pamm';

export interface MarketState {
  market: Market | null;
  pool: Pool | null;
  impliedOdds: number;
  timeRemaining: ReturnType<typeof getTimeRemaining>;
  crowding: ReturnType<typeof getCrowdingLevel>;
  isLoading: boolean;
  error: string | null;
}

// Hook for single market by ID
export function useMarket(marketId: bigint | null) {
  const [state, setState] = useState<MarketState>({
    market: null,
    pool: null,
    impliedOdds: 50,
    timeRemaining: { hours: 0, minutes: 0, seconds: 0, phase: 'closed', percentRemaining: 0 },
    crowding: { crowdedSide: 'BALANCED', crowdingRatio: 1, description: 'Loading...' },
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!marketId) {
      setState(prev => ({ ...prev, isLoading: false, error: 'No market ID' }));
      return;
    }

    try {
      const market = await getMarket(marketId);

      if (!market) {
        setState(prev => ({ ...prev, isLoading: false, error: 'Market not found' }));
        return;
      }

      // Use pool data from market response if available
      const pool: Pool = {
        yesReserve: market.rYes ?? 0n,
        noReserve: market.rNo ?? 0n,
        k: (market.rYes ?? 0n) * (market.rNo ?? 0n),
      };

      const impliedOdds = pool.yesReserve > 0n && pool.noReserve > 0n
        ? calculateImpliedOdds(pool.yesReserve, pool.noReserve)
        : 50;
      const timeRemaining = getTimeRemaining(market.closeTime);
      const crowding = getCrowdingLevel(pool.yesReserve, pool.noReserve);

      setState({
        market,
        pool,
        impliedOdds,
        timeRemaining,
        crowding,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching market:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch market',
      }));
    }
  }, [marketId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Update time remaining every second
  useEffect(() => {
    if (!state.market) return;
    
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeRemaining: getTimeRemaining(prev.market?.closeTime ?? 0n),
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.market]);

  return { ...state, refetch: fetchData };
}

// Hook to fetch all markets (paginated)
export function useMarkets(start = 0, count = 10) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMarkets = useCallback(async () => {
    setIsLoading(true);
    try {
      const [total, marketList] = await Promise.all([
        getMarketCount(),
        getMarkets(start, count),
      ]);
      setTotalCount(total);
      setMarkets(marketList);
      setError(null);
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
    } finally {
      setIsLoading(false);
    }
  }, [start, count]);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  return { markets, isLoading, error, totalCount, refetch: fetchMarkets };
}

// Hook to get the first active (open) market
export function useActiveMarket() {
  const { markets, isLoading: marketsLoading, error: marketsError } = useMarkets(0, 20);
  
  // Find the first market that's still open
  const activeMarket = markets.find(m => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    return !m.resolved && m.closeTime > now;
  });
  
  const marketId = activeMarket ? BigInt(activeMarket.id) : null;
  const marketState = useMarket(marketId);
  
  return {
    ...marketState,
    allMarkets: markets,
    isLoading: marketsLoading || marketState.isLoading,
    error: marketsError || marketState.error,
  };
}

export interface QuoteState {
  quote: BuyQuote | null;
  isLoading: boolean;
  error: string | null;
}

export function useBuyQuote(
  marketId: bigint | null,
  side: 'YES' | 'NO',
  amount: string
) {
  const [state, setState] = useState<QuoteState>({
    quote: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!marketId || !amount || parseFloat(amount) <= 0) {
      setState({ quote: null, isLoading: false, error: null });
      return;
    }

    const fetchQuote = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const sharesOut = parseHST(amount);
        const quoteFn = side === 'YES' ? quoteBuyYes : quoteBuyNo;
        const quote = await quoteFn(marketId, sharesOut);
        
        setState({
          quote,
          isLoading: false,
          error: quote ? null : 'Failed to get quote',
        });
      } catch (error) {
        setState({
          quote: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Quote error',
        });
      }
    };

    const debounce = setTimeout(fetchQuote, 300);
    return () => clearTimeout(debounce);
  }, [marketId, side, amount]);

  return state;
}

// Demo data for UI development
export function useDemoMarket() {
  const demoMarket: Market = {
    id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'WILL @BLKNOIZ06 MENTION $HST AND/OR @HYPERSTITIONS IN THE NEXT 8 HOURS?',
    resolver: '0x7efd20565D24f6bf5F01e4E514D330cd4cEfB471',
    resolverFee: 0n,
    closeTime: BigInt(Math.floor(Date.now() / 1000) + 8 * 3600),
    pot: parseHST('1000000'), // 1M HST
    yesSupply: parseHST('500000'),
    noSupply: parseHST('300000'),
    resolved: false,
    outcome: 0,
  };

  const demoPool: Pool = {
    yesReserve: parseHST('400000'),
    noReserve: parseHST('600000'),
    k: parseHST('240000000000'),
  };

  const impliedOdds = calculateImpliedOdds(demoPool.yesReserve, demoPool.noReserve);
  const timeRemaining = getTimeRemaining(demoMarket.closeTime);
  const crowding = getCrowdingLevel(demoPool.yesReserve, demoPool.noReserve);

  return {
    market: demoMarket,
    pool: demoPool,
    impliedOdds,
    timeRemaining,
    crowding,
    isLoading: false,
    error: null,
  };
}

