import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, TrendingUp, TrendingDown, Menu, Zap, User, RefreshCw, CheckSquare, Square, Users, Wallet, Flame } from "lucide-react";
// @ts-ignore
import arenaHero from "@/assets/arena-bg.png";
import logo from "@/assets/logo.png";
// @ts-ignore
import bannerBg from "@/assets/banner-bg.png";
import { INITIAL_PLAYERS } from "@/data/players";
import { useLiveData } from "@/hooks/useLiveData";
import { shareToOdds, fmtUSD, fmtPrice } from "@/utils";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

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

const matchesData = [
  { step: "ROUND OF 16", a: "Lionel Bull", b: "Kylian Bull", date: "Jul 04, 2026", time: "14:00 UTC", status: "UP NEXT" },
  { step: "QUARTER-FINAL", a: "Kylian Bull", b: "Cristiano Bull", date: "Jul 07, 2026", time: "16:00 UTC", status: "PENDING" },
  { step: "SEMI-FINAL", a: "Cristiano Bull", b: "Lionel Bull", date: "Jul 14, 2026", time: "18:00 UTC", status: "PENDING" },
  { step: "THE FINAL CHARGE", a: "Winner A", b: "Winner B", date: "Jul 19, 2026", time: "20:00 UTC", status: "GRAND FINAL" },
];

const CHAMPIONSHIPS = [
  {
    id: "GOAT",
    kicker: "THE BOARD",
    title: "ODDS BOARD",
    desc: "Sorted by market cap. Odds = inverse of each coin's market-cap share.",
    metric: "liveMcap",
    accentText: "text-gold",
    accentBg: "bg-gold",
    accentBorder: "border-gold",
    accentHex: "#EAB308", // gold
    accentRgb: "234, 179, 8",
    formatData: fmtUSD,
    unit: "MARKET CAP",
    showChart: true,
    history: [
      { round: "Season 1", winner: "Lionel Bull", val: "$42.5M", date: "Jun 26, 2026" },
      { round: "Season 2", winner: "Cristiano Bull", val: "$48.2M", date: "Jun 28, 2026" }
    ]
  },
  {
    id: "BURN",
    kicker: "CHAMPIONSHIP II",
    title: "BURN CHAMPIONSHIP",
    desc: "Ranked by tokens burned — the more supply a bull torches, the higher it climbs.",
    metric: "liveBurned",
    accentText: "text-[#E8602C]",
    accentBg: "bg-[#E8602C]",
    accentBorder: "border-[#E8602C]",
    accentHex: "#E8602C", // fire
    accentRgb: "232, 96, 44",
    formatData: (n: number) => `${(n / 1_000_000).toFixed(1)}M`,
    unit: "TOKENS BURNED",
    showChart: false,
    history: [
      { round: "Season 1", winner: "Kylian Bull", val: "12.5M", date: "Jun 26, 2026" },
      { round: "Season 2", winner: "Lionel Bull", val: "14.1M", date: "Jun 28, 2026" }
    ]
  },
  {
    id: "HOLDERS",
    kicker: "CHAMPIONSHIP III",
    title: "HOLDER CHAMPIONSHIP",
    desc: "Ranked by holder count — the bull with the biggest crowd behind it wins.",
    metric: "liveHolders",
    accentText: "text-[#4F8FE8]",
    accentBg: "bg-[#4F8FE8]",
    accentBorder: "border-[#4F8FE8]",
    accentHex: "#4F8FE8", // blue
    accentRgb: "79, 143, 232",
    formatData: (n: number) => n.toLocaleString(),
    unit: "HOLDERS",
    showChart: false,
    history: [
      { round: "Season 1", winner: "Cristiano Bull", val: "8,420", date: "Jun 26, 2026" },
      { round: "Season 2", winner: "Kylian Bull", val: "9,150", date: "Jun 28, 2026" }
    ]
  }
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

function MatchCard({ v, champ, delay, isFinal = false }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-xl border ${isFinal ? 'border-[#DAA520] shadow-[0_0_15px_rgba(218,165,32,0.2)] h-[185px] md:h-[220px]' : 'border-white/5 h-[110px] md:h-[130px]'} bg-[#121316] effect-border-shine w-full`}
    >
      {/* Background ambient light */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen">
        <div className="absolute -left-16 top-1/2 h-[250px] w-[250px] -translate-y-1/2 rounded-full blur-[60px] opacity-40" style={{ background: v.a.accent }} />
        <div className="absolute -right-16 top-1/2 h-[250px] w-[250px] -translate-y-1/2 rounded-full blur-[60px] opacity-40" style={{ background: v.b.accent }} />
      </div>

      <div className="relative z-10 flex items-stretch justify-between h-full">
        {/* Left Bull */}
        <div className="flex items-center flex-1 min-w-0">
          <img
            src={v.a.img}
            alt={v.a.name}
            className={`absolute left-0 top-0 h-full ${isFinal ? 'w-48 md:w-64' : 'w-24 md:w-32'} object-cover [mask-image:linear-gradient(to_right,black_20%,transparent_80%)] opacity-40 md:opacity-100 z-0 pointer-events-none`}
            loading="lazy"
          />
          <div className={`py-2 md:py-4 pr-2 md:pr-2 relative z-10 flex flex-col justify-center min-w-0 h-full ${isFinal ? 'pl-24 sm:pl-32 md:pl-48' : 'pl-16 sm:pl-24 md:pl-28'}`}>
            <div className={`font-display font-bold text-white leading-tight flex items-center gap-1 md:gap-2 flex-wrap ${isFinal ? 'text-base sm:text-xl md:text-3xl' : 'text-xs sm:text-sm md:text-base'}`}>
              <span>{v.a.name}</span>
            </div>
            <div className={`font-mono text-muted-foreground uppercase tracking-wider mb-0.5 md:mb-1 truncate ${isFinal ? 'text-[10px] md:text-[14px]' : 'text-[8px] md:text-[10px]'}`}>${v.a.ticker}</div>
            <div className={`font-mono font-bold text-white truncate ${isFinal ? 'text-sm md:text-2xl' : 'text-[10px] md:text-sm'}`}>{champ.formatData(v.a[champ.metric])}</div>
          </div>
        </div>

        {/* Center VS & Bar */}
        <div className="flex flex-col items-center justify-center w-[25%] sm:w-1/3 px-1 sm:px-2 md:px-4 py-2 md:py-4 shrink-0 relative z-10">
          <div className={`mb-2 md:mb-4 rounded-full border-[1.5px] ${isFinal ? 'border-gold p-[4px] md:p-[6px]' : 'border-[#DAA520] p-[2px] md:p-[3px]'} bg-[#0A0A0B] effect-glow`}>
            <div className={`flex ${isFinal ? 'h-10 w-10 md:h-16 md:w-16 border-[3px]' : 'h-6 w-6 md:h-9 md:w-9 border-[1.5px]'} items-center justify-center rounded-full border-[#DAA520] bg-gradient-to-br from-[#3b2b00] to-[#0A0A0B] shadow-[inset_0_0_15px_rgba(218,165,32,0.5)]`}>
              <span className={`font-display font-black text-[#FFD700] ${isFinal ? 'text-xs md:text-lg' : 'text-[8px] md:text-xs'}`} style={{ textShadow: '0 0 10px rgba(255,215,0,0.8)' }}>
                VS
              </span>
            </div>
          </div>

          <div className="w-full relative flex items-center gap-1 sm:gap-2 md:gap-4">
            <span className={`font-mono font-bold ${isFinal ? 'text-[10px] md:text-[16px]' : 'text-[7px] md:text-[10px]'}`} style={{ color: v.a.accent }}>{v.pctA}%</span>
            <div className="h-1.5 md:h-2 flex-1 rounded-full bg-white/5 flex shadow-inner">
              <div className="h-full transition-all duration-1000 rounded-l-full relative" style={{ width: `${v.pctA}%`, background: v.a.accent }}>
                <div className="absolute inset-0 rounded-l-full mix-blend-screen opacity-80" style={{ boxShadow: `0 0 12px ${v.a.accent}` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-l-full" />
              </div>
              <div className="h-full transition-all duration-1000 rounded-r-full relative" style={{ width: `${v.pctB}%`, background: v.b.accent }}>
                <div className="absolute inset-0 rounded-r-full mix-blend-screen opacity-80" style={{ boxShadow: `0 0 12px ${v.b.accent}` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-r-full" />
              </div>
            </div>
            <span className={`font-mono font-bold ${isFinal ? 'text-[10px] md:text-[16px]' : 'text-[7px] md:text-[10px]'}`} style={{ color: v.b.accent }}>{v.pctB}%</span>
          </div>
        </div>

        {/* Right Bull */}
        <div className="flex items-center justify-end flex-1 min-w-0 text-right">
          <div className={`py-2 md:py-4 pl-2 md:pl-2 relative z-10 flex flex-col justify-center items-end min-w-0 h-full ${isFinal ? 'pr-24 sm:pr-32 md:pr-48' : 'pr-16 sm:pr-24 md:pr-28'}`}>
            <div className={`font-display font-bold text-white leading-tight flex items-center justify-end gap-1 md:gap-2 flex-wrap-reverse ${isFinal ? 'text-base sm:text-xl md:text-3xl' : 'text-xs sm:text-sm md:text-base'}`}>
              <span>{v.b.name}</span>
            </div>
            <div className={`font-mono text-muted-foreground uppercase tracking-wider mb-0.5 md:mb-1 truncate ${isFinal ? 'text-[10px] md:text-[14px]' : 'text-[8px] md:text-[10px]'}`}>${v.b.ticker}</div>
            <div className={`font-mono font-bold text-white truncate ${isFinal ? 'text-sm md:text-2xl' : 'text-[10px] md:text-sm'}`}>{champ.formatData(v.b[champ.metric])}</div>
          </div>
          <img
            src={v.b.img}
            alt={v.b.name}
            className={`absolute right-0 top-0 h-full ${isFinal ? 'w-48 md:w-64' : 'w-24 md:w-32'} object-cover [mask-image:linear-gradient(to_left,black_20%,transparent_80%)] opacity-40 md:opacity-100 z-0 pointer-events-none`}
            loading="lazy"
          />
        </div>
      </div>
    </motion.div>
  );
}

function ChampionshipSection({ champ, players, autoRefresh, setAutoRefresh, index, timeLeft }: any) {
  // Sort and rank players for this specific metric
  const ranked = useMemo(() => {
    const sorted = [...players].sort((a: any, b: any) => b[champ.metric] - a[champ.metric]);
    const total = sorted.reduce((sum, p) => sum + p[champ.metric], 0);

    return sorted.map((b: any, i: number) => {
      const share = total > 0 ? b[champ.metric] / total : 0;
      return {
        ...b,
        rank: i + 1,
        metricStr: champ.formatData(b[champ.metric]),
        oddsStr: shareToOdds(share),
        shareStr: (share * 100).toFixed(1),
        sharePct: share * 100
      };
    });
  }, [players, champ]);

  const bracket = useMemo(() => {
    const p1 = players.find((p: any) => p.id === "lionel") || players[0];
    const p2 = players.find((p: any) => p.id === "kylian") || players[1];
    const p3 = players.find((p: any) => p.id === "cristiano") || players[2];
    const p4 = players.find((p: any) => p.id === "lamine") || players[3];

    // SF1: Lionel vs Lamine
    const m1a = p1[champ.metric] || 0;
    const m1b = p4[champ.metric] || 0;
    const m1Total = m1a + m1b;
    const sf1 = {
      a: p1, b: p4,
      pctA: m1Total > 0 ? Math.round((m1a / m1Total) * 100) : 50,
      pctB: m1Total > 0 ? Math.round((m1b / m1Total) * 100) : 50,
      winner: m1a >= m1b ? p1 : p4,
    };

    // SF2: Kylian vs Cristiano
    const m2a = p2[champ.metric] || 0;
    const m2b = p3[champ.metric] || 0;
    const m2Total = m2a + m2b;
    const sf2 = {
      a: p2, b: p3,
      pctA: m2Total > 0 ? Math.round((m2a / m2Total) * 100) : 50,
      pctB: m2Total > 0 ? Math.round((m2b / m2Total) * 100) : 50,
      winner: m2a >= m2b ? p2 : p3,
    };

    // Final
    const w1 = sf1.winner;
    const w2 = sf2.winner;
    const fa = w1[champ.metric] || 0;
    const fb = w2[champ.metric] || 0;
    const fTotal = fa + fb;
    
    return {
      sf1,
      sf2,
      final: {
        a: w1, b: w2,
        pctA: fTotal > 0 ? Math.round((fa / fTotal) * 100) : 50,
        pctB: fTotal > 0 ? Math.round((fb / fTotal) * 100) : 50,
      },
      champion: fa >= fb ? w1 : w2
    };
  }, [players, champ]);

  return (
    <div className={`py-16 ${index % 2 === 1 ? 'bg-[#0D0E10]' : 'bg-[#0A0A0B]'}`}>
      <div className="mx-auto max-w-7xl px-6">

        {/* BOARD */}
        <section id={champ.id} className="mb-24">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className={`font-mono text-[10px] font-bold tracking-[0.2em] ${champ.accentText} uppercase mb-1`}>{champ.kicker}</div>
              <h2 className="font-display text-3xl font-extrabold text-white">{champ.title}</h2>
              <p className="mt-2 text-xs text-muted-foreground">{champ.desc}</p>
            </div>
            {index === 0 && (
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-white/10 sm:flex"
              >
                <div className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-white/20'}`} />
                Auto-refresh <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#121316]">
            <div className="min-w-[900px]">
              {/* TABLE HEADER */}
              <div className={`grid ${champ.showChart ? 'grid-cols-[50px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_100px]' : 'grid-cols-[50px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_100px]'} items-center gap-4 border-b border-white/5 px-6 py-4 text-[9px] font-bold tracking-[0.15em] text-muted-foreground uppercase`}>
                <div className="text-center">#</div>
                <div>PLAYER</div>
                <div>{champ.unit}</div>
                {champ.showChart && <div>24H %</div>}
                {champ.showChart && <div>24H CHART</div>}
                <div className="text-right">ODDS</div>
                <div className="text-right">SHARE</div>
                <div className="text-center">TRADE</div>
              </div>

              {/* TABLE ROWS */}
              {ranked.map((b: any, index: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10px" }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={b.rank} className={`relative grid ${champ.showChart ? 'grid-cols-[50px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_100px]' : 'grid-cols-[50px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_100px]'} items-center gap-4 border-b border-white/5 px-6 py-4 transition-colors last:border-0 hover:bg-white/[0.02]`}
                  style={b.rank === 1 ? { background: `linear-gradient(to right, ${champ.accentHex}20, transparent)` } : {}}
                >
                  {/* Left Border for rank 1 */}
                  {b.rank === 1 && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: champ.accentHex, boxShadow: `0 0 10px ${champ.accentHex}` }} />
                  )}

                  <div className="text-center relative z-10">
                    {b.rank === 1 ? (
                      <span className="font-display text-xl font-black italic" style={{ color: champ.accentHex, textShadow: `0 0 15px ${champ.accentHex}` }}>1</span>
                    ) : (
                      <span className="font-mono text-sm font-semibold text-muted-foreground/50">{b.rank}</span>
                    )}
                  </div>

                  {/* @ts-ignore */}
                  <Link to="/$playerId" params={{ playerId: b.id }} className="flex min-w-0 items-center gap-4 hover:opacity-80 transition-opacity relative z-10">
                    <div className="h-10 w-10 shrink-0 rounded-md border flex items-center justify-center overflow-hidden bg-black/50"
                      style={{ borderColor: b.rank === 1 ? champ.accentHex : `${champ.accentHex}40`, boxShadow: b.rank === 1 ? `0 0 10px ${champ.accentHex}40` : 'none' }}>
                      <img src={b.img} alt={b.name} className="h-full w-full object-cover" decoding="async" fetchPriority={b.rank <= 3 ? "high" : "auto"} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display text-sm font-bold text-white flex items-center gap-2">
                        {b.name}
                        {b.debutDate && new Date().getTime() - new Date(b.debutDate).getTime() < 5 * 24 * 60 * 60 * 1000 && (
                          <span className="inline-block rounded bg-yellow-500/20 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider text-yellow-400 effect-reflection">NEW</span>
                        )}
                      </div>
                      <div className="truncate font-mono text-[10px] uppercase text-muted-foreground">${b.contract}</div>
                    </div>
                  </Link>

                  <div className="font-mono text-sm font-semibold text-white relative z-10">{b.metricStr}</div>

                  {champ.showChart && (
                    <div className={`font-mono text-sm font-semibold relative z-10 ${b.up ? "text-green-500" : "text-red-500"}`}>
                      <span className="inline-flex items-center gap-1">
                        {b.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {b.up ? "+" : ""}{b.liveChange.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {champ.showChart && (
                    <div className="relative z-10">
                      <Sparkline up={b.up} />
                    </div>
                  )}

                  <div className={`text-right font-mono text-sm font-bold relative z-10 ${champ.accentText}`}>{b.oddsStr}</div>
                  <div className="text-right font-mono text-sm font-semibold text-white relative z-10">{b.shareStr}%</div>

                  <div className="text-center relative z-10">
                    <a href={b.contract !== "Soon" ? `https://pump.fun/${b.contract}` : "https://pump.fun"} target="_blank" rel="noreferrer"
                      className="inline-block rounded border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
                      style={b.rank === 1
                        ? { borderColor: champ.accentHex, color: champ.accentHex, backgroundColor: `${champ.accentHex}15` }
                        : { borderColor: 'rgba(255,255,255,0.1)', color: 'hsl(var(--muted-foreground))', backgroundColor: 'transparent' }
                      }
                    >
                      Trade
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TOURNAMENT BRACKET */}
        <section className="mb-8">
          <div className="mb-8 text-center">
            <div className={`font-mono text-[10px] md:text-xs font-bold tracking-[0.2em] ${champ.accentText} uppercase mb-2`}>THE KNOCKOUT STAGE</div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white">TOURNAMENT BRACKET</h2>
          </div>

          <div className="flex flex-col items-center relative w-full mt-4">
            
            {/* ROUND 1 */}
            <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-12 justify-center items-center relative z-10">
              {/* SF 1 */}
              <div className="w-full max-w-xl">
                <div className="text-center font-mono text-[10px] md:text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3">DAY 1 • SEMI-FINAL 1</div>
                <MatchCard v={bracket.sf1} champ={champ} delay={0.1} />
                <div className="flex flex-col items-center mt-3 text-white/20">
                  <div className="w-px h-6 border-l border-dashed border-white/20" />
                  <div className="text-xs mt-1">↓ Winner Advances</div>
                </div>
              </div>

              {/* SF 2 */}
              <div className="w-full max-w-xl">
                <div className="text-center font-mono text-[10px] md:text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3">DAY 1 • SEMI-FINAL 2</div>
                <MatchCard v={bracket.sf2} champ={champ} delay={0.2} />
                <div className="flex flex-col items-center mt-3 text-white/20">
                  <div className="w-px h-6 border-l border-dashed border-white/20" />
                  <div className="text-xs mt-1">↓ Winner Advances</div>
                </div>
              </div>
            </div>

            {/* Connecting Lines Desktop */}
            <div className="hidden lg:flex w-full max-w-3xl justify-between px-32 mt-4 opacity-30 relative z-0">
               <div className="w-1/2 h-12 border-t-2 border-l-2 border-white/50 rounded-tl-xl" />
               <div className="w-1/2 h-12 border-t-2 border-r-2 border-white/50 rounded-tr-xl" />
            </div>
            
            <div className="hidden lg:flex justify-center w-full relative z-0 -mt-12">
                <div className="w-px h-16 bg-white/30" />
            </div>

            {/* FINAL */}
            <div className="w-full relative z-10 mt-6 lg:mt-0">
              <div className="text-center font-mono text-[11px] md:text-sm font-bold tracking-[0.2em] text-gold uppercase mb-3 flex flex-col items-center gap-1">
                <span>DAY 2 • THE FINAL</span>
                {timeLeft && (
                  <span className="text-[9px] md:text-[10px] text-muted-foreground flex gap-1.5 items-center bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(218,165,32,0.6)]" />
                    MATCH IN {timeLeft.d}D : {timeLeft.h}H : {timeLeft.m}M : {timeLeft.s}S
                  </span>
                )}
              </div>
              <MatchCard v={bracket.final} champ={champ} delay={0.4} isFinal={true} />
            </div>


            
          </div>
        </section>

        {/* PAST WINNERS HISTORY */}
        {champ.history && champ.history.length > 0 && (
          <section className="mb-8 mt-16">
            <div className="mb-8">
              <div className={`font-mono text-[10px] font-bold tracking-[0.2em] ${champ.accentText} uppercase mb-1`}>HALL OF FAME</div>
              <h2 className="font-display text-3xl font-extrabold text-white">PAST WINNERS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {champ.history.map((h: any, i: number) => {
                const winnerPlayer = INITIAL_PLAYERS.find(p => p.name === h.winner);
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    key={i} className="rounded-xl border border-white/5 bg-[#121316] p-4 md:p-5 flex flex-row items-center justify-between group hover:bg-white/[0.02] transition-colors" style={{ borderLeft: `4px solid ${champ.accentHex}` }}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      {winnerPlayer && (
                        <div className="relative shrink-0">
                          <img 
                            src={winnerPlayer.img} 
                            alt={winnerPlayer.name} 
                            className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover border border-white/10 shadow-sm"
                            loading="lazy"
                          />
                          <div className="absolute -bottom-1.5 -right-1.5 rounded-full bg-[#121316] p-1 shadow-sm">
                            <Trophy className="h-3 w-3 md:h-3.5 md:w-3.5" style={{ color: champ.accentHex }} />
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="font-mono text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider mb-1 md:mb-1.5">{h.round} • {h.date}</div>
                        <div className="font-display text-base md:text-xl font-bold text-white flex items-center gap-2 leading-none">
                          {!winnerPlayer && <Trophy className="h-4 w-4" style={{ color: champ.accentHex }} />}
                          {h.winner}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="font-mono text-[8px] md:text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5 md:mb-1">Winning {champ.unit}</div>
                      <div className="font-mono text-sm md:text-lg font-bold" style={{ color: champ.accentHex }}>{h.val}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

const INTRO_STEPS = [
  {
    id: "goat",
    stepNum: "01",
    label: "GOAT CUP",
    title: "GOAT CHAMPIONSHIP",
    desc: "Sorted by market capitalization. Every bull's valuation is live-tracked from DexScreener. Odds are calculated dynamically as the inverse of each coin's market-cap share. High cap means low odds, marking them the favorite to win.",
    accent: "#EAB308", // gold
    accentRgb: "234, 179, 8",
    accentText: "text-gold",
    icon: Trophy,
  },
  {
    id: "burn",
    stepNum: "02",
    label: "BURN CUP",
    title: "BURN CHAMPIONSHIP",
    desc: "Ranked by total tokens burned (absolute count sent to the burn address). The more supply a bull torches, the higher it climbs in the standings. Torching supply reduces circulating tokens, demonstrating pure community commitment.",
    accent: "#E8602C", // fire
    accentRgb: "232, 96, 44",
    accentText: "text-[#E8602C]",
    icon: Flame,
  },
  {
    id: "holders",
    stepNum: "03",
    label: "HOLDERS CUP",
    title: "HOLDER CHAMPIONSHIP",
    desc: "Ranked by total holder count on-chain. The bull with the biggest crowd and strongest community behind it takes the crown. Every single wallet counts as we measure who has the largest army of believers.",
    accent: "#4F8FE8", // blue
    accentRgb: "79, 143, 232",
    accentText: "text-[#4F8FE8]",
    icon: Users,
  }
];

function ChampionshipIntro() {
  const [activeStep, setActiveStep] = useState(0);
  const current = INTRO_STEPS[activeStep];
  const IconComponent = current.icon;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      {/* Container with sharp corners, cream border, and solid box-shadow border */}
      <div 
        className="relative transition-all duration-500 bg-[#0F0A15] border border-white/20 rounded-none overflow-hidden"
        style={{
          boxShadow: `8px 8px 0px 0px ${current.accent}`,
        }}
      >
        {/* Dynamic Background Ambient Glow */}
        <div 
          className="absolute -left-20 -top-20 h-72 w-72 rounded-full blur-[100px] opacity-15 pointer-events-none transition-all duration-500" 
          style={{ backgroundColor: current.accent }} 
        />

        {/* 1. Top Header Sub-Bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: current.accent }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: current.accent }}></span>
            </span>
            <span className="font-mono text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#C5FF1A] uppercase">
              LIVE • WORLD BULL CUP ECOSYSTEM
            </span>
          </div>
          <div className="font-mono text-[10px] md:text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
            STEP <span style={{ color: current.accent }} className="font-bold">{current.stepNum}</span> / 03
          </div>
        </div>

        {/* 2. Timeline Progress Sub-Bar */}
        <div className="flex items-center justify-between px-6 sm:px-12 py-5 border-b border-white/10 relative z-10 select-none">
          {/* Step 1 */}
          <button 
            onClick={() => setActiveStep(0)} 
            className="flex items-center gap-2 focus:outline-none cursor-pointer group"
          >
            <div 
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${activeStep >= 0 ? 'bg-[#EAB308]' : 'bg-white/10'}`}
              style={activeStep === 0 ? { boxShadow: '0 0 10px #EAB308' } : {}}
            />
            <span className={`font-mono text-[9px] md:text-xs tracking-wider transition-colors uppercase ${activeStep === 0 ? 'text-[#EAB308] font-bold' : 'text-white/20 group-hover:text-white/50'}`}>
              01 GOAT
            </span>
          </button>

          {/* Line 1 -> 2 */}
          <div className="flex-1 mx-4 h-[2px] bg-white/10 relative hidden xs:block">
            <div 
              className="absolute inset-0 transition-all duration-500" 
              style={{ 
                width: activeStep >= 1 ? '100%' : '0%', 
                background: `linear-gradient(to right, #EAB308, #E8602C)`,
                boxShadow: activeStep >= 1 ? '0 0 8px #E8602C' : 'none'
              }} 
            />
          </div>

          {/* Step 2 */}
          <button 
            onClick={() => setActiveStep(1)} 
            className="flex items-center gap-2 focus:outline-none cursor-pointer group"
          >
            <div 
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${activeStep >= 1 ? 'bg-[#E8602C]' : 'bg-white/10'}`}
              style={activeStep === 1 ? { boxShadow: '0 0 10px #E8602C' } : {}}
            />
            <span className={`font-mono text-[9px] md:text-xs tracking-wider transition-colors uppercase ${activeStep === 1 ? 'text-[#E8602C] font-bold' : 'text-white/20 group-hover:text-white/50'}`}>
              02 BURN
            </span>
          </button>

          {/* Line 2 -> 3 */}
          <div className="flex-1 mx-4 h-[2px] bg-white/10 relative hidden xs:block">
            <div 
              className="absolute inset-0 transition-all duration-500" 
              style={{ 
                width: activeStep >= 2 ? '100%' : '0%', 
                background: `linear-gradient(to right, #E8602C, #4F8FE8)`,
                boxShadow: activeStep >= 2 ? '0 0 8px #4F8FE8' : 'none'
              }} 
            />
          </div>

          {/* Step 3 */}
          <button 
            onClick={() => setActiveStep(2)} 
            className="flex items-center gap-2 focus:outline-none cursor-pointer group"
          >
            <div 
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${activeStep >= 2 ? 'bg-[#4F8FE8]' : 'bg-white/10'}`}
              style={activeStep === 2 ? { boxShadow: '0 0 10px #4F8FE8' } : {}}
            />
            <span className={`font-mono text-[9px] md:text-xs tracking-wider transition-colors uppercase ${activeStep === 2 ? 'text-[#4F8FE8] font-bold' : 'text-white/20 group-hover:text-white/50'}`}>
              03 HOLDERS
            </span>
          </button>
        </div>

        {/* 3. Main Content Sub-Box */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1.6fr] items-center gap-8 md:gap-10 p-6 md:p-10 relative z-10">
          
          {/* Left Block: Big Scanline Number & Icon */}
          <div className="flex items-center justify-center gap-8 md:justify-end px-4 md:pr-4">
            {/* Scanline Number */}
            <div className="relative select-none shrink-0">
              <div 
                className="font-mono text-[90px] md:text-[130px] font-black leading-none select-none transition-all duration-500"
                style={{
                  color: current.accent,
                  textShadow: `0 0 35px ${current.accent}70, 0 0 75px ${current.accent}25`,
                  opacity: 0.95
                }}
              >
                {current.stepNum}
              </div>
              {/* Retro scanline overlay */}
              <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40 bg-[linear-gradient(rgba(18,19,22,0)_50%,rgba(18,19,22,0.85)_50%)] bg-[length:100%_4px]" />
            </div>

            {/* Category Icon */}
            <div 
              className="p-4.5 rounded-2xl bg-black/45 border transition-all duration-500 shrink-0"
              style={{
                boxShadow: `inset 0 0 25px rgba(${current.accentRgb}, 0.1), 0 0 20px rgba(${current.accentRgb}, 0.1)`,
                borderColor: `${current.accent}25`
              }}
            >
              <IconComponent 
                className="h-10 w-10 md:h-12 md:w-12 transition-all duration-500"
                style={{
                  color: current.accent,
                  filter: `drop-shadow(0 0 10px ${current.accent}90)`
                }}
              />
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:block w-px h-28 bg-white/10" />

          {/* Right Block: Title & Desc */}
          <div className="flex flex-col justify-center text-center md:text-left">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4 uppercase tracking-wide">
                {current.title}
              </h3>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed max-w-xl">
                {current.desc}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Index() {
  const { data: liveUpdates } = useLiveData(INITIAL_PLAYERS);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectPhantom = async () => {
    try {
      const provider = (window as any).solana;
      if (provider?.isPhantom) {
        const resp = await provider.connect();
        setWalletAddress(resp.publicKey.toString());
      } else {
        alert("Phantom wallet not found! Please install the extension.");
        window.open("https://phantom.app/", "_blank");
      }
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  };

  // Check if any player is new
  const newPlayer = useMemo(() => {
    return INITIAL_PLAYERS.find(p => p.debutDate && new Date().getTime() - new Date(p.debutDate).getTime() < 5 * 24 * 60 * 60 * 1000);
  }, []);

  // Countdown timer logic (48 hours, resets at 00:00 UTC)
  const [timeLeft, setTimeLeft] = useState({ d: "00", h: "00", m: "00", s: "00" });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const cycle = 48 * 60 * 60 * 1000;
      const distance = cycle - (now % cycle);

      const d = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, "0");
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, "0");
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
      const s = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, "0");

      setTimeLeft({ d, h, m, s });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const mappedPlayers = useMemo(() => {
    return INITIAL_PLAYERS.map((p: any) => {
      const up = liveUpdates?.[p.id];
      return {
        ...p,
        liveMcap: up?.marketCap || p.marketCap || 0,
        livePrice: up?.price || p.price || 0,
        liveChange: up?.change24h || p.change24h || 0,
        liveBurned: up?.tokensBurned || p.tokensBurned || 0,
        liveHolders: up?.holders || p.liveHolders || 0,
        up: (up?.change24h || p.change24h || 0) >= 0
      };
    });
  }, [liveUpdates]);

  const totalMcap = mappedPlayers.reduce((sum, p) => sum + p.liveMcap, 0);
  const favPlayer = [...mappedPlayers].sort((a, b) => b.liveMcap - a.liveMcap)[0];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-foreground font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="World Bull Cup Logo" className="h-8 w-auto" />
            <span className="font-display text-lg font-bold tracking-widest text-white uppercase">
              WORLD BULL CUP
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-xs font-semibold text-muted-foreground uppercase tracking-widest md:flex">
            {CHAMPIONSHIPS.map((champ, i) => (
              <button
                key={champ.id}
                onClick={() => {
                  setActiveTab(i);
                  document.getElementById(champ.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`py-5 transition-colors ${activeTab === i ? `${champ.accentText} border-b-2 ${champ.accentBorder}` : 'hover:text-foreground'}`}
              >
                {champ.id}
              </button>
            ))}
            {/* Hiding Matches link */}
            {/* <a href="#matches" className="hover:text-foreground py-5 transition-colors">Matches</a> */}
          </nav>
          <div className="flex items-center gap-3 md:gap-4">
            <a href="https://x.com/WorldBullCup" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white transition-colors" aria-label="X (Twitter)">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://pump.fun" target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded border border-gold/30 bg-transparent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/10 sm:inline-flex">
              Trade <Zap className="h-3.5 w-3.5 fill-gold" />
            </a>
            {walletAddress ? (
              <div className="flex items-center gap-2.5 rounded-full border border-[#5b21b6] bg-[#1e103c] px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-[13px] font-mono font-bold text-white">
                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-[#00e676] shadow-[0_0_8px_rgba(0,230,118,0.6)]" />
                <span className="hidden sm:inline">{walletAddress.slice(0, 4)} ... {walletAddress.slice(-4)}</span>
                <Wallet className="h-3.5 w-3.5 sm:hidden" />
              </div>
            ) : (
              <button onClick={connectPhantom} className="flex items-center gap-2 rounded-full border border-purple-500/50 bg-purple-500/10 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider text-purple-400 transition-colors hover:bg-purple-500/20">
                <Wallet className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Connect</span>
              </button>
            )}
            <button className="md:hidden text-white ml-2">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden border-b border-white/5 bg-[#0D0E10]"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-2/3 h-full mix-blend-screen opacity-90">
              <img src={arenaHero} alt="Arena" className="w-full h-full object-cover [mask-image:linear-gradient(to_left,black,transparent)]" fetchPriority="high" decoding="async" />
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
                Three legends, three coins, one charge. Every bull runs in three races at once — biggest market cap, most tokens burned, biggest holder army.
              </p>

              {/* STAT CARDS */}
              <div className="mt-10 flex flex-wrap gap-4">
                <div className="flex flex-col justify-center rounded-xl bg-white/5 border border-white/5 p-4 min-w-[160px]">
                  <div className="font-display text-2xl font-bold text-white">{fmtUSD(totalMcap)}</div>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Combined Market<br />Cap</span>
                    <Sparkline up={true} />
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-xl bg-white/5 border border-white/5 p-4 min-w-[160px]">
                  <div className="font-display text-2xl font-bold text-white">{favPlayer?.name || "N/A"}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">GOAT Leader</span>
                    <Users className="h-5 w-5 text-gold/40" />
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-xl bg-white/5 border border-white/5 p-4 min-w-[140px]">
                  <div className="font-display text-2xl font-bold text-white">{mappedPlayers.length}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Players In Play</div>
                </div>
              </div>

              <p className="mt-8 text-[9px] text-muted-foreground/50 max-w-xs">
                Not betting. Not financial advice. "Odds" are a visual reading of metric share. Tokens are highly risky.
              </p>
            </div>
          </div>
        </motion.section>

        {/* NEW PLAYER BANNER */}
        {newPlayer && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto max-w-7xl px-6 pt-8"
          >
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative effect-border-shine"
              style={{ backgroundImage: `url(${bannerBg})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }}
            >
              {/* Background ambient */}
              <div className="absolute inset-0 bg-black/60 z-0"></div>
              <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full blur-[80px] opacity-40 pointer-events-none z-0 animate-pulse effect-glow" style={{ background: newPlayer.accent }} />

              <div className="flex items-center gap-6 relative z-10">
                <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-xl border-2 flex items-center justify-center overflow-hidden bg-black/50 effect-glow" style={{ borderColor: newPlayer.accent }}>
                  <img src={newPlayer.img} alt={newPlayer.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="inline-block rounded-full bg-yellow-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400 mb-2 effect-shimmer-bg effect-glow">
                    NEW CHALLENGER ENTERED THE ARENA
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white">
                    {newPlayer.name} <span className="text-muted-foreground font-medium text-lg md:text-xl ml-1">starts the climb.</span>
                  </h3>
                  <div className="font-mono text-[10px] uppercase text-muted-foreground mt-1 tracking-wider">
                    ${newPlayer.ticker} • {newPlayer.nation} {newPlayer.flag}
                  </div>
                </div>
              </div>

              <div className="relative z-10 w-full md:w-auto shrink-0">
                <a href="#GOAT" onClick={(e) => { e.preventDefault(); setActiveTab(0); document.getElementById('GOAT')?.scrollIntoView({ behavior: 'smooth' }); }} className="block w-full md:w-auto text-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors effect-reflection btn-gold-hover">
                  VIEW THE BOARD
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* CHAMPIONSHIP OVERVIEW */}
        <ChampionshipIntro />

        {/* CHAMPIONSHIP TABS & COUNTDOWN */}
        <div className="mx-auto max-w-7xl px-6 pt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-wrap gap-4">
            {CHAMPIONSHIPS.map((champ, i) => (
              <button
                key={champ.id}
                onClick={() => setActiveTab(i)}
                className={`px-6 py-2.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-all border ${activeTab === i
                  ? `${champ.accentBg} ${champ.accentBorder} text-black shadow-[0_0_15px_rgba(0,0,0,0.5)] effect-shimmer-bg effect-glow`
                  : `bg-[#121316] border-white/5 text-muted-foreground hover:border-white/20 hover:text-white effect-reflection`
                  }`}
                style={activeTab === i ? { boxShadow: `0 0 15px ${champ.accentHex}40`, '--glow-color': champ.accentRgb } as any : {}}
              >
                {champ.title}
              </button>
            ))}
          </div>

          <div className="bg-[#121316] border border-white/5 rounded-xl px-6 py-4 inline-block self-start md:self-end effect-border-shine" style={{ '--glow-color': CHAMPIONSHIPS[activeTab].accentRgb } as any}>
            <div className="font-mono text-[12px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2">NEXT ROUND IN</div>
            <div className={`font-mono text-[32px] leading-none font-bold flex gap-2 justify-center md:justify-end ${CHAMPIONSHIPS[activeTab].accentText}`} style={{ '--glow-color': CHAMPIONSHIPS[activeTab].accentRgb } as any}>
              <span>{timeLeft.d}<span className="text-sm text-muted-foreground ml-1">D</span></span> :
              <span>{timeLeft.h}<span className="text-sm text-muted-foreground ml-1">H</span></span> :
              <span>{timeLeft.m}<span className="text-sm text-muted-foreground ml-1">M</span></span> :
              <span>{timeLeft.s}<span className="text-sm text-muted-foreground ml-1">S</span></span>
            </div>
          </div>
        </div>

        <ChampionshipSection
          champ={CHAMPIONSHIPS[activeTab]}
          players={mappedPlayers}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          index={0}
          timeLeft={timeLeft}
        />

        <div className="mx-auto max-w-7xl px-6 py-16">
          {/* MATCHES SECTION HIDDEN */}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0D0E10] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="World Bull Cup Logo" className="h-8 w-auto" />
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
                {CHAMPIONSHIPS.map((champ, i) => (
                  <li key={champ.id}>
                    <button
                      onClick={() => {
                        setActiveTab(i);
                        document.getElementById(champ.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-gold transition-colors uppercase"
                    >
                      {champ.id}
                    </button>
                  </li>
                ))}
                {/* <li><a href="#matches" className="hover:text-gold transition-colors">MATCHES</a></li> */}
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-[10px] font-bold tracking-[0.15em] text-white uppercase mb-6">RESOURCES</h3>
              <ul className="space-y-4 text-xs text-muted-foreground">
                <li><a href="https://x.com/WorldBullCup" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Twitter / X</a></li>
                <li><a href="https://dexscreener.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">DexScreener</a></li>
                <li><a href="https://pump.fun" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Pump.fun</a></li>
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
