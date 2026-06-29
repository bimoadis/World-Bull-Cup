import { useQuery } from '@tanstack/react-query';

export const useLiveData = (players) => {
  return useQuery({
    queryKey: ['liveData'],
    queryFn: async () => {
      const updates = {};
      await Promise.all(
        players.map(async (p) => {
          if (!p.pairAddress) return;
          try {
            const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${p.pairAddress}`);
            const data = await res.json();
            const pair = data?.pairs?.[0] || data?.pair;
            if (!pair) return;
            updates[p.id] = {
              marketCap: Number(pair.marketCap ?? pair.fdv ?? 0),
              price: Number(pair.priceUsd ?? 0),
              volume24h: Number(pair.volume?.h24 ?? 0),
              change24h: Number(pair.priceChange?.h24 ?? 0),
            };
          } catch (e) {
            // suppress errors, keep using previous data or dummy
          }
        })
      );
      return updates;
    },
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 10_000,
  });
};
