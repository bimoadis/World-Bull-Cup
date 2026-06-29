import { useQuery } from '@tanstack/react-query';

export const useLiveData = (players) => {
  return useQuery({
    queryKey: ['liveData'],
    queryFn: async () => {
      const updates = {};
      
      // DexScreener & Helius endpoints
      const HELIUS_RPC = import.meta.env.VITE_HELIUS_RPC_URL || "https://mainnet.helius-rpc.com/?api-key=";
      const BURN_ADDRESS = "1nc1nerator11111111111111111111111111111111"; // Standard Solana burn address

      await Promise.all(
        players.map(async (p) => {
          updates[p.id] = {};

          // 1. Fetch Market Data from DexScreener
          if (p.pairAddress) {
            try {
              const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${p.pairAddress}`);
              const data = await res.json();
              const pair = data?.pairs?.[0] || data?.pair;
              if (pair) {
                updates[p.id] = {
                  ...updates[p.id],
                  marketCap: Number(pair.marketCap ?? pair.fdv ?? 0),
                  price: Number(pair.priceUsd ?? 0),
                  volume24h: Number(pair.volume?.h24 ?? 0),
                  change24h: Number(pair.priceChange?.h24 ?? 0),
                };
              }
            } catch (e) {
              console.warn(`Failed to fetch DexScreener for ${p.id}`);
            }
          }

          // 2. Fetch On-chain Data (Holders & Burn) using Helius DAS / RPC
          if (p.contract && p.contract !== "Soon") {
            try {
              // Fetch token accounts for Burn address (to calculate tokens burned)
              const burnRes = await fetch(HELIUS_RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: '1',
                  method: 'getTokenAccountsByOwner',
                  params: [
                    BURN_ADDRESS,
                    { mint: p.contract },
                    { encoding: 'jsonParsed' }
                  ]
                })
              });
              const burnData = await burnRes.json();
              const burnedAmount = burnData?.result?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;

              // To fetch accurate holders on Solana without indexer is hard, 
              // but we can use Helius getTokenAccounts if available or DAS API.
              // Here we mock the holder fetch or use a dummy endpoint until the specific Helius DAS query is provided.
              
              updates[p.id] = {
                ...updates[p.id],
                tokensBurned: burnedAmount > 0 ? burnedAmount : p.tokensBurned, // fallback to config if 0
                // holders: fetchedHolders
              };
            } catch (e) {
              console.warn(`Failed to fetch On-chain data for ${p.id}`);
            }
          }
        })
      );
      return updates;
    },
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 10_000,
  });
};
