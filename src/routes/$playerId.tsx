import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Trophy, Zap } from "lucide-react";
import logo from "@/assets/logo.png";
import { usePlayersData } from "@/hooks/useLiveData";
import { fmtUSD, fmtPrice } from "@/utils";
import { useMemo } from "react";

export const Route = createFileRoute("/$playerId")({
  component: PlayerDetail,
});

function PlayerDetail() {
  const { playerId } = Route.useParams();
  const { data: players = [] } = usePlayersData(true);
  
  const player = useMemo(() => {
    return players.find(p => p.id === playerId);
  }, [playerId, players]);

  if (!player) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">Player Not Found</h1>
          <Link to="/" className="text-gold hover:underline">Return to Arena</Link>
        </div>
      </div>
    );
  }

  const mcap = player.market_cap || 0;
  const price = player.price || 0;
  const change24h = player.change_24h || 0;
  const volume24h = player.volume_24h || 0;
  const tokensBurned = player.tokens_burned || 0;
  const holders = player.live_holders || 0;
  
  const up = change24h >= 0;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-foreground font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <img src={logo} alt="World Bull Cup Logo" className="h-6 w-auto" />
              <span className="font-display text-lg font-bold tracking-widest text-white uppercase hidden sm:inline-block">
                WORLD BULL CUP
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href={player.contract && player.contract !== "Soon" && player.contract !== "TBA" ? `https://pump.fun/coin/${player.contract}` : "https://pump.fun"} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded border border-gold/30 bg-transparent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/10">
              Trade {player.ticker_symbol} <Zap className="h-3.5 w-3.5 fill-gold" />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        
        {/* PLAYER HERO */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
          <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 rounded-2xl overflow-hidden border-2" style={{ borderColor: player.accent }}>
            <img src={player.image_url} alt={player.name} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
              <span className="text-base">{player.flag}</span>
              <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">{player.nation}</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-black text-white mb-2">{player.name}</h1>
            <div className="font-mono text-lg text-gold mb-8">${player.ticker_symbol}</div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#121316] border border-white/5 rounded-xl p-4">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Market Cap</div>
                <div className="font-display text-xl text-white font-bold">{fmtUSD(mcap)}</div>
              </div>
              <div className="bg-[#121316] border border-white/5 rounded-xl p-4">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Price</div>
                <div className="font-display text-xl text-white font-bold">{fmtPrice(price)}</div>
              </div>
              <div className="bg-[#121316] border border-white/5 rounded-xl p-4">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">24h Change</div>
                <div className={`font-display text-xl font-bold ${up ? 'text-green-500' : 'text-red-500'}`}>
                  {up ? '+' : ''}{change24h.toFixed(2)}%
                </div>
              </div>
              <div className="bg-[#121316] border border-white/5 rounded-xl p-4">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">24h Volume</div>
                <div className="font-display text-xl text-white font-bold">{fmtUSD(volume24h)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-[#121316] border border-white/5 rounded-xl p-4">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tokens Burned</div>
                <div className="font-display text-xl text-[#E8602C] font-bold">{(tokensBurned / 1_000_000).toFixed(1)}M</div>
              </div>
              <div className="bg-[#121316] border border-white/5 rounded-xl p-4">
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Holders</div>
                <div className="font-display text-xl text-[#4F8FE8] font-bold">{holders.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* DEXSCREENER IFRAME */}
        <div className="mb-12">
          <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-gold uppercase mb-4">LIVE CHART</div>
          <div className="rounded-xl border border-white/5 bg-[#121316] overflow-hidden h-[600px] relative">
            {player.pair_address ? (
              <iframe 
                src={`https://dexscreener.com/solana/${player.pair_address}?embed=1&theme=dark&trades=0&info=0`}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <Trophy className="h-16 w-16 mb-4 opacity-20" />
                <p className="font-display text-xl">Chart Not Available</p>
                <p className="font-mono text-xs mt-2">Pair address pending listing</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
