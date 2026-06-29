import { createFileRoute } from "@tanstack/react-router";
import { Trophy, TrendingUp, TrendingDown, Menu, Zap, User, RefreshCw, CheckSquare, Square, Users } from "lucide-react";
// @ts-ignore
import arenaHero from "@/assets/arena-bg.png";
import { INITIAL_PLAYERS } from "@/data/players";
import { useLiveData } from "@/hooks/useLiveData";
import { shareToOdds, fmtUSD, fmtPrice } from "@/utils";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "World Bull Cup — The Bulls Enter The Arena" },
      { name: "description", content: "Three legends. Three coins. One charge." },
      { property: "og:title", content: "World Bull Cup" },
      { property: "og:description", content: "Three legends. Three coins. One charge." },
    ],
  }),
  component: Index,
});

const fixturesData = [
  { step: "ROUND OF 16", a: "Lionel Bull", b: "Kylian Bull", date: "Jul 04, 2026", time: "14:00", status: "UP NEXT" },
  { step: "QUARTER-FINAL", a: "Kylian Bull", b: "Cristiano Bull", date: "Jul 07, 2026", time: "16:00", status: "" },
  { step: "SEMI-FINAL", a: "Cristiano Bull", b: "Lionel Bull", date: "Jul 14, 2026", time: "18:00", status: "" },
  { step: "THE FINAL CHARGE", a: "TBD", b: "TBD", date: "Jul 19, 2026", time: "20:00", status: "" },
];

function Sparkline({ up }: { up: boolean }) {
  const color = up ? "oklch(0.72 0.17 150)" : "oklch(0.65 0.22 25)";
  const path = up
    ? "M0 22 L10 18 L20 20 L30 12 L40 14 L50 8 L60 10 L70 4 L80 6"
    : "M0 6 L10 10 L20 8 L30 14 L40 12 L50 18 L60 16 L70 22 L80 20";
  return (
    <svg viewBox="0 0 80 28" className="h-7 w-20" fill="none">
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Index() {
  const { data: liveUpdates } = useLiveData(INITIAL_PLAYERS);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { rankedBulls, totalMcapStr, favName } = useMemo(() => {
    let total = 0;
    const mapped = INITIAL_PLAYERS.map((p: any) => {
      const up = liveUpdates?.[p.id];
      const mcap = up?.marketCap || p.marketCap;
      total += mcap;
      return {
        ...p,
        liveMcap: mcap,
        livePrice: up?.price || p.price,
        liveChange: up?.change24h || p.change24h,
      };
    });
    
    mapped.sort((a: any, b: any) => b.liveMcap - a.liveMcap);
    
    const favName = mapped[0]?.name || "N/A";
    
    const ranked = mapped.map((b: any, i: number) => {
      const share = total > 0 ? b.liveMcap / total : 0;
      return {
        ...b,
        rank: i + 1,
        capStr: fmtUSD(b.liveMcap),
        priceStr: fmtPrice(b.livePrice),
        oddsStr: shareToOdds(share),
        shareStr: (share * 100).toFixed(1),
        up: b.liveChange >= 0
      };
    });

    return {
      rankedBulls: ranked,
      totalMcapStr: fmtUSD(total),
      favName
    };
  }, [liveUpdates]);

  const versus = useMemo(() => {
    if (rankedBulls.length < 3) return [];
    const genVs = (a: any, b: any) => {
      const total = a.liveMcap + b.liveMcap;
      const pctA = total > 0 ? Math.round((a.liveMcap / total) * 100) : 50;
      return { a, b, pctA, pctB: 100 - pctA };
    };
    return [
      genVs(rankedBulls[0], rankedBulls[1]),
      genVs(rankedBulls[0], rankedBulls[2]),
      genVs(rankedBulls[1], rankedBulls[2]),
    ];
  }, [rankedBulls]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-foreground font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="text-gold">
              <Trophy className="h-6 w-6" strokeWidth={2} />
            </div>
            <span className="font-display text-lg font-bold tracking-widest text-white uppercase">
              WORLD BULL CUP
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-xs font-semibold text-muted-foreground uppercase tracking-widest md:flex">
            <a href="#board" className="text-gold border-b-2 border-gold py-5 transition-colors">Board</a>
            <a href="#versus" className="hover:text-foreground py-5 transition-colors">Versus</a>
            <a href="#fixtures" className="hover:text-foreground py-5 transition-colors">Fixtures</a>
            <a href="#about" className="hover:text-foreground py-5 transition-colors">About</a>
            <a href="#leaderboard" className="hover:text-foreground py-5 transition-colors">Leaderboard</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="hidden items-center gap-2 rounded border border-gold/30 bg-transparent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/10 sm:inline-flex">
              Trade <Zap className="h-3.5 w-3.5 fill-gold" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:text-white">
              <User className="h-4 w-4" />
            </button>
            <button className="md:hidden text-white">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-white/5 bg-[#0D0E10]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-2/3 h-full mix-blend-screen opacity-90">
              <img src={arenaHero} alt="Arena" className="w-full h-full object-cover [mask-image:linear-gradient(to_left,black,transparent)]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-[#0A0A0B]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent" />
          </div>
          
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
            <div className="max-w-2xl">
              <div className="mb-6 font-mono text-[10px] font-bold tracking-[0.2em] text-gold uppercase">
                LIVE BOARD • SOLANA • PUMP.FUN
              </div>
              <h1 className="font-display text-5xl font-black leading-[0.9] tracking-tight text-white md:text-[5.5rem]">
                THE BULLS<br />ENTER THE<br />
                <span className="text-gold">ARENA.</span>
              </h1>
              <p className="mt-8 max-w-lg text-sm leading-relaxed text-muted-foreground/80 md:text-sm">
                Three legends, three coins, one charge. The board reads each coin's share of the combined market cap as live odds. The bull in front is the one the market is backing — nothing is wagered, everything is watched.
              </p>
              
              {/* STAT CARDS */}
              <div className="mt-10 flex flex-wrap gap-4">
                <div className="flex flex-col justify-center rounded-xl bg-white/5 border border-white/5 p-4 min-w-[160px]">
                  <div className="font-display text-2xl font-bold text-white">{totalMcapStr}</div>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Combined Market<br/>Cap</span>
                    <Sparkline up={true} />
                  </div>
                </div>
                
                <div className="flex flex-col justify-center rounded-xl bg-white/5 border border-white/5 p-4 min-w-[160px]">
                  <div className="font-display text-2xl font-bold text-white">{favName}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Leader</span>
                    <Users className="h-5 w-5 text-gold/40" />
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-xl bg-white/5 border border-white/5 p-4 min-w-[140px]">
                  <div className="font-display text-2xl font-bold text-white">{rankedBulls.length}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Players In Play</div>
                </div>
              </div>
              
              <p className="mt-8 text-[9px] text-muted-foreground/50 max-w-xs">
                Not betting. Not financial advice. "Odds" are a visual reading of market-cap share. Tokens are highly risky.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-16">
          
          {/* ODDS BOARD */}
          <section id="board" className="mb-24">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-gold uppercase mb-1">THE BOARD</div>
                <h2 className="font-display text-3xl font-extrabold text-white">ODDS BOARD</h2>
                <p className="mt-2 text-xs text-muted-foreground">Sorted by market cap. Odds = inverse of each coin's market-cap share.</p>
              </div>
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-white/10 sm:flex"
              >
                <div className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-white/20'}`} />
                Auto-refresh <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#121316]">
              <div className="min-w-[900px]">
                {/* TABLE HEADER */}
                <div className="grid grid-cols-[50px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_100px] items-center gap-4 border-b border-white/5 px-6 py-4 text-[9px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
                  <div className="text-center">#</div>
                  <div>PLAYER</div>
                  <div>MARKET CAP</div>
                  <div>24H %</div>
                  <div>24H CHART</div>
                  <div className="text-right">ODDS</div>
                  <div className="text-right">SHARE</div>
                  <div className="text-center">TRADE</div>
                </div>
                
                {/* TABLE ROWS */}
                {rankedBulls.map((b: any) => (
                  <div key={b.rank} className="grid grid-cols-[50px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_100px] items-center gap-4 border-b border-white/5 px-6 py-4 transition-colors last:border-0 hover:bg-white/[0.02]">
                    <div className="text-center">
                      {b.rank === 1 ? (
                        <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-gold/10 text-gold shadow-[0_0_10px_rgba(252,211,77,0.2)]">
                          <Trophy className="h-3 w-3" />
                        </div>
                      ) : (
                        <span className="font-mono text-sm font-semibold text-muted-foreground/50">{b.rank}</span>
                      )}
                    </div>
                    
                    <div className="flex min-w-0 items-center gap-4">
                      <img src={b.img} alt={b.name} className="h-10 w-10 shrink-0 rounded object-cover shadow-sm" loading="lazy" />
                      <div className="min-w-0">
                        <div className="truncate font-display text-sm font-bold text-white">{b.name}</div>
                        <div className="truncate font-mono text-[10px] uppercase text-muted-foreground">${b.contract}</div>
                      </div>
                    </div>
                    
                    <div className="font-mono text-sm font-semibold text-white">{b.capStr}</div>
                    
                    <div className={`font-mono text-sm font-semibold ${b.up ? "text-green-500" : "text-red-500"}`}>
                      <span className="inline-flex items-center gap-1">
                        {b.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {b.up ? "+" : ""}{b.liveChange.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div>
                      <Sparkline up={b.up} />
                    </div>
                    
                    <div className="text-right font-mono text-sm font-bold text-gold">{b.oddsStr}</div>
                    <div className="text-right font-mono text-sm font-semibold text-white">{b.shareStr}%</div>
                    
                    <div className="text-center">
                      <button className="rounded border border-white/10 bg-transparent px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-gold hover:text-gold">
                        Trade
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* THE VERSUS */}
          <section id="versus" className="mb-24">
            <div className="mb-8">
              <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-gold uppercase mb-1">HEAD TO HEAD</div>
              <h2 className="font-display text-3xl font-extrabold text-white">THE VERSUS</h2>
            </div>
            
            <div className="space-y-4">
              {versus.map((v: any, i: number) => (
                <div key={i} className="relative overflow-hidden rounded-xl border border-white/5 bg-[#121316] px-4 py-6 md:px-8">
                  {/* Background ambient light */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-gold blur-[100px]" />
                    <div className={`absolute -right-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full ${i % 2 === 0 ? 'bg-blue-600' : 'bg-red-600'} blur-[100px]`} />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left Bull */}
                    <div className="flex items-center gap-4 flex-1">
                      <img src={v.a.img} alt={v.a.name} className="h-16 w-16 md:h-20 md:w-20 rounded-lg object-cover shadow-lg" loading="lazy" />
                      <div>
                        <div className="font-display text-lg font-bold text-white">{v.a.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">${v.a.contract}</div>
                        <div className="mt-1 font-mono text-sm font-bold text-white">{fmtUSD(v.a.liveMcap)}</div>
                        {v.pctA >= v.pctB && (
                          <div className="mt-2 inline-block rounded bg-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                            FRONT RUNNER
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Center VS & Bar */}
                    <div className="flex flex-col items-center justify-center flex-1 px-4 max-w-sm w-full mx-auto">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#121316] bg-gold font-display text-xs font-black text-black shadow-[0_0_15px_rgba(252,211,77,0.3)] z-10">
                        VS
                      </div>
                      
                      <div className="w-full relative">
                        <div className="flex justify-between mb-2 font-mono text-xs font-bold text-white">
                          <span>{v.pctA}%</span>
                          <span>{v.pctB}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 flex">
                          <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${v.pctA}%` }} />
                          <div className={`h-full ${i % 2 === 0 ? 'bg-blue-600' : 'bg-red-600'} transition-all duration-1000`} style={{ width: `${v.pctB}%` }} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Bull */}
                    <div className="flex items-center justify-end gap-4 flex-1 text-right">
                      <div>
                        <div className="font-display text-lg font-bold text-white">{v.b.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">${v.b.contract}</div>
                        <div className="mt-1 font-mono text-sm font-bold text-white">{fmtUSD(v.b.liveMcap)}</div>
                        {v.pctB > v.pctA && (
                          <div className="mt-2 inline-block rounded bg-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                            FRONT RUNNER
                          </div>
                        )}
                      </div>
                      <img src={v.b.img} alt={v.b.name} className="h-16 w-16 md:h-20 md:w-20 rounded-lg object-cover shadow-lg" loading="lazy" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FIXTURES */}
          <section id="fixtures" className="mb-24">
            <div className="mb-12 text-center md:text-left">
              <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-gold uppercase mb-1">THE RUN</div>
              <h2 className="font-display text-3xl font-extrabold text-white">FIXTURES</h2>
            </div>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute top-4 left-0 right-0 h-[1px] bg-white/10" />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {fixturesData.map((f: any, i: number) => (
                  <div key={i} className="relative pt-0 md:pt-10">
                    {/* Timeline Node */}
                    <div className="hidden md:flex absolute top-[15px] left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                      <div className={`h-2.5 w-2.5 rounded-full border-2 border-[#0A0A0B] ${i === 0 ? 'bg-gold shadow-[0_0_10px_rgba(252,211,77,0.5)]' : 'bg-white/30'}`} />
                    </div>
                    
                    {/* Label */}
                    <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 whitespace-nowrap text-center">
                      <span className={`font-mono text-[9px] font-bold tracking-[0.15em] uppercase ${i === 0 ? 'text-gold' : 'text-muted-foreground'}`}>
                        {f.step}
                      </span>
                    </div>

                    <div className="block md:hidden mb-2 text-center">
                      <span className={`font-mono text-[9px] font-bold tracking-[0.15em] uppercase ${i === 0 ? 'text-gold' : 'text-muted-foreground'}`}>
                        {f.step}
                      </span>
                    </div>

                    {/* Match Card */}
                    <div className="rounded-xl border border-white/5 bg-[#121316] p-5 relative overflow-hidden group hover:border-white/10 transition-colors">
                      {f.status && (
                        <div className="absolute bottom-5 right-5 text-center">
                           <Trophy className="h-10 w-10 text-white/5" />
                        </div>
                      )}
                      
                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                          {i === 0 ? <CheckSquare className="h-4 w-4 text-gold" /> : <Square className="h-4 w-4 text-white/10" />}
                          <span className={`font-display text-sm font-bold ${i === 0 || i === 1 || i === 2 ? 'text-white' : 'text-muted-foreground'}`}>{f.a}</span>
                        </div>
                        <div className="font-mono text-[9px] text-muted-foreground/60 pl-1">VS</div>
                        <div className="flex items-center gap-3">
                          <Square className="h-4 w-4 text-white/10" />
                          <span className={`font-display text-sm font-bold ${i === 0 || i === 1 || i === 2 ? 'text-white' : 'text-muted-foreground'}`}>{f.b}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-white/5 flex flex-col relative z-10">
                        <span className="font-mono text-[10px] text-muted-foreground">{f.date}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{f.time}</span>
                        {f.status && (
                          <span className="mt-2 font-mono text-[9px] font-bold text-gold tracking-widest">{f.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0D0E10] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-gold">
                  <Trophy className="h-6 w-6" />
                </div>
                <span className="font-display text-sm font-bold tracking-widest text-white uppercase">
                  WORLD BULL CUP
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                World Bull Cup is an independent fan project. Not affiliated with FIFA, the FIFA World Cup™, any players, federations, or Pump.fun.
              </p>
            </div>
            
            <div>
              <h3 className="font-mono text-[10px] font-bold tracking-[0.15em] text-white uppercase mb-6">LINKS</h3>
              <ul className="space-y-4 text-xs text-muted-foreground">
                <li><a href="#board" className="hover:text-gold transition-colors">Board</a></li>
                <li><a href="#versus" className="hover:text-gold transition-colors">Versus</a></li>
                <li><a href="#fixtures" className="hover:text-gold transition-colors">Fixtures</a></li>
                <li><a href="#about" className="hover:text-gold transition-colors">About</a></li>
                <li><a href="#leaderboard" className="hover:text-gold transition-colors">Leaderboard</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-mono text-[10px] font-bold tracking-[0.15em] text-white uppercase mb-6">RESOURCES</h3>
              <ul className="space-y-4 text-xs text-muted-foreground">
                <li><a href="#" className="hover:text-white transition-colors">Twitter / X</a></li>
                <li><a href="#" className="hover:text-white transition-colors">DexScreener</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pump.fun</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-mono text-[10px] font-bold tracking-[0.15em] text-white uppercase mb-6">DISCLAIMER</h3>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Not betting. Not financial advice. "Odds" are a visual reading of market-cap share, not a wager and not a payout. Digital tokens are highly risky — you may lose everything you put in.
              </p>
            </div>
            
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/5 text-center md:text-left text-[10px] text-muted-foreground">
            © 2026 World Bull Cup. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
