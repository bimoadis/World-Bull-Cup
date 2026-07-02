// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get all players from database
    const { data: players, error: playersError } = await supabaseClient
      .from('players')
      .select(`
        id, name, nation, flag, ticker_symbol, accent, contract, pair_address, image_url, debut_date,
        player_stats (
          market_cap, price, volume_24h, change_24h, tokens_burned, live_holders, updated_at
        )
      `)

    if (playersError) throw playersError

    console.log("Database select players:", JSON.stringify(players, null, 2));

    // 2. Check if we need to fetch new data (cache invalidation = 30 seconds)
    let needsUpdate = false;
    for (const p of players) {
      const stats = Array.isArray(p.player_stats) ? p.player_stats[0] : p.player_stats;
      if (!stats) {
        needsUpdate = true;
        break;
      }
      
      const lastUpdate = new Date(stats.updated_at).getTime()
      const now = new Date().getTime()
      
      // If older than 30 seconds
      if (now - lastUpdate > 30_000) {
        needsUpdate = true;
        break;
      }
    }

    if (!needsUpdate) {
      // Return cached data
      const responseData = players.map(p => {
        const stats = Array.isArray(p.player_stats) ? p.player_stats[0] : p.player_stats;
        return {
          ...p,
          market_cap: stats.market_cap,
          price: stats.price,
          volume_24h: stats.volume_24h,
          change_24h: stats.change_24h,
          tokens_burned: stats.tokens_burned,
          live_holders: stats.live_holders
        }
      });
      return new Response(JSON.stringify({ data: responseData, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Needs update! Fetch sequentially/with slight delay to avoid rate limit
    // HELIUS_RPC: 10 RPS. DexScreener: 5 RPS.
    let HELIUS_RPC = Deno.env.get('HELIUS_RPC_URL') || Deno.env.get('HELIUS_RPC') || "https://mainnet.helius-rpc.com/?api-key=REPLACE_ME_LATER";
    if (HELIUS_RPC.startsWith('//')) {
      HELIUS_RPC = 'https:' + HELIUS_RPC;
    }
    const BURN_ADDRESS = "1nc1nerator11111111111111111111111111111111";

    const updatedStats = [];
    
    for (const p of players) {
      const stats = Array.isArray(p.player_stats) ? p.player_stats[0] : p.player_stats;
      let newStats = { ...stats };
      
      // 3a. DexScreener (Market Cap, Price, Volume)
      let pair = null;
      if (p.pair_address) {
        try {
          const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${p.pair_address}`);
          if (dexRes.ok) {
            const data = await dexRes.json();
            pair = data?.pairs?.[0] || data?.pair;
          }
        } catch(e) {
          console.warn("DexScreener fetch error for", p.id, e);
        }
      } else if (p.contract && p.contract !== "Soon" && p.contract !== "TBA") {
        try {
          const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${p.contract}`);
          if (dexRes.ok) {
            const data = await dexRes.json();
            const solanaPairs = data?.pairs?.filter((pr: any) => pr.chainId === 'solana');
            pair = solanaPairs?.[0];
            if (pair && pair.pairAddress) {
              console.log(`Auto-detected pair address for ${p.id}: ${pair.pairAddress}`);
              await supabaseClient
                .from('players')
                .update({ pair_address: pair.pairAddress })
                .eq('id', p.id);
              p.pair_address = pair.pairAddress;
            }
          }
        } catch(e) {
          console.warn("DexScreener token fetch error for", p.id, e);
        }
      }

      if (pair) {
        newStats.market_cap = Number(pair.marketCap ?? pair.fdv ?? 0);
        newStats.price = Number(pair.priceUsd ?? 0);
        newStats.volume_24h = Number(pair.volume?.h24 ?? 0);
        newStats.change_24h = Number(pair.priceChange?.h24 ?? 0);
      }
      
      // Artificial delay to respect 5 RPS (Wait 250ms -> ~4 requests per sec max)
      await new Promise(r => setTimeout(r, 250));
      
      // 3b. Helius (Burned Tokens & Supply)
      if (p.contract && p.contract !== "Soon" && p.contract !== "TBA") {
        try {
          // 3b-1. Balance in Incinerator
          let burnedAmount = 0;
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
          
          if (burnRes.ok) {
            const burnData = await burnRes.json();
            burnedAmount = burnData?.result?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
          }

          // 3b-2. Decreased supply from burn instruction
          const supplyRes = await fetch(HELIUS_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: '1',
              method: 'getTokenSupply',
              params: [ p.contract ]
            })
          });

          if (supplyRes.ok) {
            const supplyData = await supplyRes.json();
            const currentSupply = supplyData?.result?.value?.uiAmount || 0;
            if (currentSupply > 0) {
              const supplyBurned = Math.max(0, 1_000_000_000 - currentSupply);
              newStats.tokens_burned = supplyBurned + burnedAmount;
            } else if (burnedAmount > 0) {
              newStats.tokens_burned = burnedAmount;
            }
          } else if (burnedAmount > 0) {
            newStats.tokens_burned = burnedAmount;
          }
        } catch(e) {
          console.warn("Helius fetch error for burned tokens:", p.id, e);
        }
      }

      // 3c. Helius (Holder Count)
      if (p.contract && p.contract !== "Soon" && p.contract !== "TBA") {
        try {
          const holdersRes = await fetch(HELIUS_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: '1',
              method: 'getTokenAccounts',
              params: {
                mint: p.contract,
                page: 1,
                limit: 1
              }
            })
          });
          
          if (holdersRes.ok) {
            const holdersData = await holdersRes.json();
            const totalHolders = holdersData?.result?.total;
            if (typeof totalHolders === 'number' && totalHolders >= 0) {
              newStats.live_holders = totalHolders;
            }
          }
        } catch(e) {
          console.warn("Helius fetch error for holders:", p.id, e);
        }
      }
      
      updatedStats.push({
        player_id: p.id,
        market_cap: newStats.market_cap,
        price: newStats.price,
        volume_24h: newStats.volume_24h,
        change_24h: newStats.change_24h,
        tokens_burned: newStats.tokens_burned,
        live_holders: newStats.live_holders,
        updated_at: new Date().toISOString()
      });
    }

    // 4. Update database
    for (const stat of updatedStats) {
      await supabaseClient
        .from('player_stats')
        .update({
          market_cap: stat.market_cap,
          price: stat.price,
          volume_24h: stat.volume_24h,
          change_24h: stat.change_24h,
          tokens_burned: stat.tokens_burned,
          live_holders: stat.live_holders,
          updated_at: stat.updated_at
        })
        .eq('player_id', stat.player_id);
    }
    
    // 5. Construct fresh response
    const responseData = players.map(p => {
      const stat = updatedStats.find(s => s.player_id === p.id);
      return {
        ...p,
        market_cap: stat.market_cap,
        price: stat.price,
        volume_24h: stat.volume_24h,
        change_24h: stat.change_24h,
        tokens_burned: stat.tokens_burned,
        live_holders: stat.live_holders
      }
    });

    return new Response(JSON.stringify({ data: responseData, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
