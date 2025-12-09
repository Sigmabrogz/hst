// Wagmi configuration for MetaMask wallet connection
import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Monad Testnet chain definition
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

// Wagmi config with MetaMask (injected) connector
export const config = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
});

// Contract addresses from https://docs.hyperstitions.com/
export const CONTRACTS = {
  HST: '0x97401d48A80B15bC7291599e24B590Eedcd7cE37',
  PAMM: '0x97b4a6b501C55cCC7A597E259266E7E28A2d0BE0',
  ZAMM: '0xe5e5bE029793A4481287Be2BFc37e2D38316c422',
  TREASURY: '0x7efd20565D24f6bf5F01e4E514D330cd4cEfB471',
} as const;

