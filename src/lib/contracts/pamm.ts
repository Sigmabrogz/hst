// PAMM Contract Integration
// Read-only helpers for Hyperstitions PAMM on Monad Testnet

import { createPublicClient, http, formatUnits, parseUnits, type Address } from 'viem';

// Monad Testnet Chain Definition
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
} as const;

// Alternative RPC endpoints to try
const RPC_ENDPOINTS = [
  'https://testnet-rpc.monad.xyz',
  'https://monad-testnet.rpc.caldera.xyz/http',
];

// Contract Addresses (from https://docs.hyperstitions.com/)
export const CONTRACTS = {
  HST: '0x97401d48A80B15bC7291599e24B590Eedcd7cE37' as Address,
  PAMM: '0x97b4a6b501C55cCC7A597E259266E7E28A2d0BE0' as Address,
  ZAMM: '0xe5e5bE029793A4481287Be2BFc37e2D38316c422' as Address,
  TREASURY: '0x7efd20565D24f6bf5F01e4E514D330cd4cEfB471' as Address,
} as const;

// PAMM ABI (based on contract source from docs)
export const PAMM_ABI = [
  // Market count
  {
    name: 'marketCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Get single market (full data)
  {
    name: 'getMarket',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [
      { name: 'yesSupply', type: 'uint256' },
      { name: 'noSupply', type: 'uint256' },
      { name: 'resolver', type: 'address' },
      { name: 'resolved', type: 'bool' },
      { name: 'outcome', type: 'bool' },
      { name: 'pot', type: 'uint256' },
      { name: 'payoutPerShare', type: 'uint256' },
      { name: 'desc', type: 'string' },
      { name: 'closeTs', type: 'uint72' },
      { name: 'canClose', type: 'bool' },
      { name: 'rYes', type: 'uint256' },
      { name: 'rNo', type: 'uint256' },
      { name: 'pYes_num', type: 'uint256' },
      { name: 'pYes_den', type: 'uint256' },
    ],
  },
  // Get multiple markets (paginated)
  {
    name: 'getMarkets',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'start', type: 'uint256' },
      { name: 'count', type: 'uint256' },
    ],
    outputs: [
      { name: 'marketIds', type: 'uint256[]' },
      { name: 'yesSupplies', type: 'uint256[]' },
      { name: 'noSupplies', type: 'uint256[]' },
      { name: 'resolvers', type: 'address[]' },
      { name: 'resolved', type: 'bool[]' },
      { name: 'outcome', type: 'bool[]' },
      { name: 'pot', type: 'uint256[]' },
      { name: 'payoutPerShare', type: 'uint256[]' },
      { name: 'descs', type: 'string[]' },
      { name: 'closes', type: 'uint72[]' },
      { name: 'canCloses', type: 'bool[]' },
      { name: 'rYesArr', type: 'uint256[]' },
      { name: 'rNoArr', type: 'uint256[]' },
      { name: 'pYesNumArr', type: 'uint256[]' },
      { name: 'pYesDenArr', type: 'uint256[]' },
      { name: 'next', type: 'uint256' },
    ],
  },
  // Get pool data
  {
    name: 'getPool',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'rYes', type: 'uint256' },
      { name: 'rNo', type: 'uint256' },
      { name: 'tsLast', type: 'uint32' },
      { name: 'kLast', type: 'uint256' },
      { name: 'lpSupply', type: 'uint256' },
    ],
  },
  // Implied YES probability
  {
    name: 'impliedYesProb',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [
      { name: 'num', type: 'uint256' },
      { name: 'den', type: 'uint256' },
    ],
  },
  // Trading status
  {
    name: 'tradingOpen',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  // Quote BUY YES
  {
    name: 'quoteBuyYes',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'yesOut', type: 'uint256' },
    ],
    outputs: [
      { name: 'oppIn', type: 'uint256' },
      { name: 'sttInFair', type: 'uint256' },
      { name: 'p0_num', type: 'uint256' },
      { name: 'p0_den', type: 'uint256' },
      { name: 'p1_num', type: 'uint256' },
      { name: 'p1_den', type: 'uint256' },
    ],
  },
  // Quote BUY NO
  {
    name: 'quoteBuyNo',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'noOut', type: 'uint256' },
    ],
    outputs: [
      { name: 'oppIn', type: 'uint256' },
      { name: 'sttInFair', type: 'uint256' },
      { name: 'p0_num', type: 'uint256' },
      { name: 'p0_den', type: 'uint256' },
      { name: 'p1_num', type: 'uint256' },
      { name: 'p1_den', type: 'uint256' },
    ],
  },
  // Quote SELL YES
  {
    name: 'quoteSellYes',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'yesIn', type: 'uint256' },
    ],
    outputs: [
      { name: 'oppOut', type: 'uint256' },
      { name: 'sttOutFair', type: 'uint256' },
      { name: 'p0_num', type: 'uint256' },
      { name: 'p0_den', type: 'uint256' },
      { name: 'p1_num', type: 'uint256' },
      { name: 'p1_den', type: 'uint256' },
    ],
  },
  // Quote SELL NO
  {
    name: 'quoteSellNo',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'noIn', type: 'uint256' },
    ],
    outputs: [
      { name: 'oppOut', type: 'uint256' },
      { name: 'sttOutFair', type: 'uint256' },
      { name: 'p0_num', type: 'uint256' },
      { name: 'p0_den', type: 'uint256' },
      { name: 'p1_num', type: 'uint256' },
      { name: 'p1_den', type: 'uint256' },
    ],
  },
  // User markets
  {
    name: 'getUserMarkets',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'start', type: 'uint256' },
      { name: 'count', type: 'uint256' },
    ],
    outputs: [
      { name: 'yesIds', type: 'uint256[]' },
      { name: 'noIds', type: 'uint256[]' },
      { name: 'yesBalances', type: 'uint256[]' },
      { name: 'noBalances', type: 'uint256[]' },
      { name: 'claimables', type: 'uint256[]' },
      { name: 'isResolved', type: 'bool[]' },
      { name: 'tradingOpen_', type: 'bool[]' },
      { name: 'next', type: 'uint256' },
    ],
  },
  // Winning ID
  {
    name: 'winningId',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
  // ERC6909 balance
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Total supply
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // All markets array
  {
    name: 'allMarkets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Descriptions
  {
    name: 'descriptions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

// Create public client
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

// Types
export interface Market {
  id: string;
  description: string;
  resolver: Address;
  resolverFee: bigint;
  closeTime: bigint;
  pot: bigint;
  yesSupply: bigint;
  noSupply: bigint;
  resolved: boolean;
  outcome: number;
  // Pool data from getMarket
  rYes?: bigint;
  rNo?: bigint;
  pYes_num?: bigint;
  pYes_den?: bigint;
}

export interface Pool {
  yesReserve: bigint;
  noReserve: bigint;
  k: bigint;
}

export interface BuyQuote {
  oppIn: bigint;      // AMM cost (pool leg)
  sttInFair: bigint;  // Pot charge (EV leg)
  totalCost: bigint;  // Total input required
  sharesOut: bigint;  // Shares you receive
  effectivePrice: number; // All-in price per share
}

export interface SellQuote {
  oppOut: bigint;
  sttOutFair: bigint;
  totalReturn: bigint;
  sharesIn: bigint;
  effectivePrice: number;
}

// Helper functions
export function formatHST(value: bigint, decimals = 18): string {
  return formatUnits(value, decimals);
}

export function parseHST(value: string, decimals = 18): bigint {
  return parseUnits(value, decimals);
}

export function calculateImpliedOdds(yesReserve: bigint, noReserve: bigint): number {
  const total = yesReserve + noReserve;
  if (total === 0n) return 50;
  return Number((noReserve * 10000n) / total) / 100;
}

export function calculatePotShare(
  userShares: bigint,
  totalCirculating: bigint
): number {
  if (totalCirculating === 0n) return 0;
  return Number((userShares * 10000n) / totalCirculating) / 100;
}

export function calculateEstimatedPayout(
  userShares: bigint,
  pot: bigint,
  circulatingSupply: bigint
): bigint {
  if (circulatingSupply === 0n) return 0n;
  return (userShares * pot) / circulatingSupply;
}

export function getTimeRemaining(closeTime: bigint): {
  hours: number;
  minutes: number;
  seconds: number;
  phase: 'early' | 'mid' | 'late' | 'closed';
  percentRemaining: number;
} {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const remaining = closeTime > now ? Number(closeTime - now) : 0;
  
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  
  // Assuming 8-hour markets (from their UI)
  const totalDuration = 8 * 3600;
  const percentRemaining = Math.min(100, (remaining / totalDuration) * 100);
  
  let phase: 'early' | 'mid' | 'late' | 'closed';
  if (remaining === 0) {
    phase = 'closed';
  } else if (percentRemaining > 66) {
    phase = 'early';
  } else if (percentRemaining > 33) {
    phase = 'mid';
  } else {
    phase = 'late';
  }
  
  return { hours, minutes, seconds, phase, percentRemaining };
}

export function getCrowdingLevel(
  yesReserve: bigint,
  noReserve: bigint
): { 
  crowdedSide: 'YES' | 'NO' | 'BALANCED';
  crowdingRatio: number;
  description: string;
} {
  const total = yesReserve + noReserve;
  if (total === 0n) {
    return { crowdedSide: 'BALANCED', crowdingRatio: 1, description: 'Pool not seeded' };
  }
  
  const yesRatio = Number(yesReserve * 1000n / total) / 1000;
  const noRatio = Number(noReserve * 1000n / total) / 1000;
  
  // Higher reserve = more people bought the opposite side
  // So if yesReserve is high, YES is cheap (under-owned)
  if (yesRatio > 0.6) {
    return { 
      crowdedSide: 'NO', 
      crowdingRatio: yesRatio / noRatio,
      description: 'NO side crowded • YES has higher upside'
    };
  } else if (noRatio > 0.6) {
    return { 
      crowdedSide: 'YES', 
      crowdingRatio: noRatio / yesRatio,
      description: 'YES side crowded • NO has higher upside'
    };
  }
  
  return { 
    crowdedSide: 'BALANCED', 
    crowdingRatio: 1,
    description: 'Balanced • Similar upside both sides'
  };
}

// Contract read functions - LIVE DATA from Monad Testnet
export async function getMarketCount(): Promise<number> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.PAMM,
      abi: PAMM_ABI,
      functionName: 'marketCount',
    });
    return Number(result);
  } catch (error) {
    console.error('Error fetching market count:', error);
    return 0;
  }
}

export async function getMarket(marketId: bigint): Promise<Market | null> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.PAMM,
      abi: PAMM_ABI,
      functionName: 'getMarket',
      args: [marketId],
    }) as any[];
    
    // Destructure based on contract's getMarket return order
    const [
      yesSupply, noSupply, resolver, resolved, outcome,
      pot, payoutPerShare, desc, closeTs, canClose,
      rYes, rNo, pYes_num, pYes_den
    ] = result;
    
    return {
      id: marketId.toString(),
      description: desc,
      resolver: resolver as Address,
      resolverFee: 0n, // Not returned directly
      closeTime: BigInt(closeTs),
      pot,
      yesSupply,
      noSupply,
      resolved,
      outcome: outcome ? 1 : 0,
      // Extra pool data
      rYes,
      rNo,
      pYes_num,
      pYes_den,
    };
  } catch (error) {
    console.error('Error fetching market:', error);
    return null;
  }
}

export async function getMarkets(start: number, count: number): Promise<Market[]> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.PAMM,
      abi: PAMM_ABI,
      functionName: 'getMarkets',
      args: [BigInt(start), BigInt(count)],
    }) as any[];
    
    const [
      marketIds, yesSupplies, noSupplies, resolvers,
      resolved, outcome, pot, payoutPerShare, descs,
      closes, canCloses, rYesArr, rNoArr, pYesNumArr, pYesDenArr, next
    ] = result;
    
    const markets: Market[] = [];
    for (let i = 0; i < marketIds.length; i++) {
      markets.push({
        id: marketIds[i].toString(),
        description: descs[i],
        resolver: resolvers[i] as Address,
        resolverFee: 0n,
        closeTime: BigInt(closes[i]),
        pot: pot[i],
        yesSupply: yesSupplies[i],
        noSupply: noSupplies[i],
        resolved: resolved[i],
        outcome: outcome[i] ? 1 : 0,
        rYes: rYesArr[i],
        rNo: rNoArr[i],
        pYes_num: pYesNumArr[i],
        pYes_den: pYesDenArr[i],
      });
    }
    return markets;
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
}

export async function getPool(marketId: bigint): Promise<Pool | null> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.PAMM,
      abi: PAMM_ABI,
      functionName: 'getPool',
      args: [marketId],
    }) as [bigint, bigint, bigint, number, bigint, bigint];
    
    const [poolId, rYes, rNo, tsLast, kLast, lpSupply] = result;
    
    return {
      yesReserve: rYes,
      noReserve: rNo,
      k: kLast,
    };
  } catch (error) {
    console.error('Error fetching pool:', error);
    return null;
  }
}

export async function quoteBuyYes(
  marketId: bigint,
  sharesOut: bigint
): Promise<BuyQuote | null> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.PAMM,
      abi: PAMM_ABI,
      functionName: 'quoteBuyYes',
      args: [marketId, sharesOut],
    }) as [bigint, bigint, bigint, bigint, bigint, bigint];
    
    const [oppIn, sttInFair, p0_num, p0_den, p1_num, p1_den] = result;
    const totalCost = oppIn + sttInFair;
    const effectivePrice = sharesOut > 0n 
      ? Number(formatHST(totalCost)) / Number(formatHST(sharesOut))
      : 0;
    
    return {
      oppIn,
      sttInFair,
      totalCost,
      sharesOut,
      effectivePrice,
    };
  } catch (error) {
    console.error('Error getting buy YES quote:', error);
    return null;
  }
}

export async function quoteBuyNo(
  marketId: bigint,
  sharesOut: bigint
): Promise<BuyQuote | null> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.PAMM,
      abi: PAMM_ABI,
      functionName: 'quoteBuyNo',
      args: [marketId, sharesOut],
    }) as [bigint, bigint, bigint, bigint, bigint, bigint];
    
    const [oppIn, sttInFair, p0_num, p0_den, p1_num, p1_den] = result;
    const totalCost = oppIn + sttInFair;
    const effectivePrice = sharesOut > 0n 
      ? Number(formatHST(totalCost)) / Number(formatHST(sharesOut))
      : 0;
    
    return {
      oppIn,
      sttInFair,
      totalCost,
      sharesOut,
      effectivePrice,
    };
  } catch (error) {
    console.error('Error getting buy NO quote:', error);
    return null;
  }
}

export async function getUserBalance(
  user: Address,
  tokenId: bigint
): Promise<bigint> {
  try {
    const result = await publicClient.readContract({
      address: CONTRACTS.PAMM,
      abi: PAMM_ABI,
      functionName: 'balanceOf',
      args: [user, tokenId],
    });
    return result as bigint;
  } catch (error) {
    console.error('Error fetching user balance:', error);
    return 0n;
  }
}

// Compute YES token ID from market ID (marketId itself)
export function getYesTokenId(marketId: `0x${string}`): bigint {
  return BigInt(marketId);
}

// Compute NO token ID from market ID (keccak256("PMARKET:NO", marketId))
export function getNoTokenId(marketId: `0x${string}`): bigint {
  // This would need proper keccak implementation
  // For demo, we'll use a placeholder
  return BigInt(marketId) + 1n;
}

