import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, TrendingUp, TrendingDown, Menu, Zap, User, RefreshCw, CheckSquare, Square, Users } from "lucide-react";
// @ts-ignore
import arenaHero from "@/assets/arena-bg.png";
import logo from "@/assets/logo.png";
// @ts-ignore
import bannerBg from "@/assets/banner-bg.png";
import { INITIAL_PLAYERS } from "@/data/players";
import { useLiveData } from "@/hooks/useLiveData";
import { shareToOdds, fmtUSD, fmtPrice } from "@/utils";
import { useMemo, useState, useEffect } from "react";

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
    formatData: fmtUSD,
    unit: "MARKET CAP",
    showChart: true,
    history: [
      { round: "Round 1", winner: "Lionel Bull", val: "$42.5M", date: "Jun 26, 2026" },
      { round: "Round 2", winner: "Cristiano Bull", val: "$48.2M", date: "Jun 28, 2026" }
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
    formatData: (n: number) => `${(n / 1_000_000).toFixed(1)}M`,
    unit: "TOKENS BURNED",
    showChart: false,
    history: [
      { round: "Round 1", winner: "Kylian Bull", val: "12.5M", date: "Jun 26, 2026" },
      { round: "Round 2", winner: "Lionel Bull", val: "14.1M", date: "Jun 28, 2026" }
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
    formatData: (n: number) => n.toLocaleString(),
    unit: "HOLDERS",
    showChart: false,
    history: [
      { round: "Round 1", winner: "Cristiano Bull", val: "8,420", date: "Jun 26, 2026" },
      { round: "Round 2", winner: "Kylian Bull", val: "9,150", date: "Jun 28, 2026" }
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

function ChampionshipSection({ champ, players, autoRefresh, setAutoRefresh, index }: any) {
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

  const versus = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < ranked.length; i++) {
      for (let j = i + 1; j < ranked.length; j++) {
        pairs.push({ a: ranked[i], b: ranked[j] });
      }
    }
    const mappedPairs = pairs.map((match, index) => {
      let a = match.a;
      let b = match.b;

      // Force Cristiano to be on the left for the second match
      if (index === 1 && b?.name?.includes("Cristiano")) {
        a = match.b;
        b = match.a;
      }

      const total = (a?.[champ.metric] || 0) + (b?.[champ.metric] || 0);
      let pctA = total > 0 ? Math.round((a[champ.metric] / total) * 100) : 50;
      let pctB = total > 0 ? Math.round((b[champ.metric] / total) * 100) : 50;

      // Make Cristiano the frontrunner in the second match
      if (index === 1 && a?.name?.includes("Cristiano")) {
        pctA = 58;
        pctB = 42;
      }

      // Check if matchup involves a new player (within 5 days)
      const isNewA = a?.debutDate && new Date().getTime() - new Date(a.debutDate).getTime() < 5 * 24 * 60 * 60 * 1000;
      const isNewB = b?.debutDate && new Date().getTime() - new Date(b.debutDate).getTime() < 5 * 24 * 60 * 60 * 1000;
      const isNewMatchup = isNewA || isNewB;

      return {
        a,
        b,
        pctA,
        pctB,
        isNewMatchup
      };
    });

    // Sort so new matchups (Coming Next Season) appear at the bottom
    return mappedPairs.sort((x, y) => {
      if (x.isNewMatchup && !y.isNewMatchup) return 1;
      if (!x.isNewMatchup && y.isNewMatchup) return -1;
      return 0;
    });
  }, [ranked, champ]);

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
              {ranked.map((b: any) => (
                <div key={b.rank} className={`relative grid ${champ.showChart ? 'grid-cols-[50px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_100px]' : 'grid-cols-[50px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_100px]'} items-center gap-4 border-b border-white/5 px-6 py-4 transition-colors last:border-0 hover:bg-white/[0.02]`}
                  style={b.rank === 1 ? { background: `linear-gradient(to right, ${b.accent}20, transparent)` } : {}}
                >
                  {/* Left Border for rank 1 */}
                  {b.rank === 1 && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: b.accent, boxShadow: `0 0 10px ${b.accent}` }} />
                  )}

                  <div className="text-center relative z-10">
                    {b.rank === 1 ? (
                      <span className="font-display text-xl font-black italic" style={{ color: b.accent, textShadow: `0 0 15px ${b.accent}` }}>1</span>
                    ) : (
                      <span className="font-mono text-sm font-semibold text-muted-foreground/50">{b.rank}</span>
                    )}
                  </div>

                  {/* @ts-ignore */}
                  <Link to="/$playerId" params={{ playerId: b.id }} className="flex min-w-0 items-center gap-4 hover:opacity-80 transition-opacity relative z-10">
                    <div className="h-10 w-10 shrink-0 rounded-md border flex items-center justify-center overflow-hidden bg-black/50"
                      style={{ borderColor: b.rank === 1 ? b.accent : `${b.accent}40`, boxShadow: b.rank === 1 ? `0 0 10px ${b.accent}40` : 'none' }}>
                      <img src={b.img} alt={b.name} className="h-full w-full object-cover" decoding="async" fetchPriority={b.rank <= 3 ? "high" : "auto"} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display text-sm font-bold text-white flex items-center gap-2">
                        {b.name}
                        {b.debutDate && new Date().getTime() - new Date(b.debutDate).getTime() < 5 * 24 * 60 * 60 * 1000 && (
                          <span className="inline-block rounded bg-yellow-500/20 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider text-yellow-400">NEW</span>
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
                        ? { borderColor: b.accent, color: b.accent, backgroundColor: `${b.accent}15` }
                        : { borderColor: 'rgba(255,255,255,0.1)', color: 'hsl(var(--muted-foreground))', backgroundColor: 'transparent' }
                      }
                    >
                      Trade
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE VERSUS */}
        <section className="mb-8">
          <div className="mb-8">
            <div className={`font-mono text-[10px] font-bold tracking-[0.2em] ${champ.accentText} uppercase mb-1`}>HEAD TO HEAD</div>
            <h2 className="font-display text-3xl font-extrabold text-white">THE VERSUS</h2>
          </div>

          <div className="space-y-2">
            {versus.map((v: any, i: number) => (
              <div key={i} className="relative overflow-hidden rounded-xl border border-white/5 bg-[#121316]">
                {/* Background ambient light */}
                <div className="absolute inset-0 pointer-events-none mix-blend-screen">
                  <div className="absolute -left-16 top-1/2 h-[250px] w-[250px] -translate-y-1/2 rounded-full blur-[60px] opacity-60" style={{ background: v.a.accent }} />
                  <div className="absolute -right-16 top-1/2 h-[250px] w-[250px] -translate-y-1/2 rounded-full blur-[60px] opacity-60" style={{ background: v.b.accent }} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-stretch justify-between min-h-[70px]">
                  {/* Left Bull */}
                  <div className="flex items-center gap-4 flex-1 w-full md:w-1/3">
                    <img
                      src={v.a.img}
                      alt={v.a.name}
                      className="h-[100px] md:h-full w-28 md:w-40 object-cover [mask-image:linear-gradient(to_right,black_60%,transparent)]"
                      loading="lazy"
                    />
                    <div className="py-3 md:py-4 pr-2">
                      <div className="font-display text-lg font-bold text-white leading-tight flex items-center gap-2">
                        {v.a.name}
                        {v.a.debutDate && new Date().getTime() - new Date(v.a.debutDate).getTime() < 5 * 24 * 60 * 60 * 1000 && (
                          <span className="inline-block rounded bg-yellow-500/20 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider text-yellow-400">NEW</span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">${v.a.ticker}</div>
                      <div className="font-mono text-sm font-bold text-white">{champ.formatData(v.a[champ.metric])}</div>
                      {v.pctA >= v.pctB && (
                        <div className="mt-1.5 inline-block rounded bg-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                          FRONT RUNNER
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center VS & Bar */}
                  <div className="flex flex-col items-center justify-center flex-1 w-full md:w-1/3 px-4 py-3 md:py-4">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-[#0A0A0B] font-display text-xs font-black text-gold shadow-[0_0_15px_rgba(252,211,77,0.15)] z-10">
                      VS
                    </div>

                    <div className="w-full relative flex items-center gap-4">
                      {v.isNewMatchup ? (
                        <div className="w-full h-8 flex-1 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
                          <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase relative z-10 flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500/50" />
                            Coming Next Season
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="font-mono text-[10px] font-bold" style={{ color: v.a.accent }}>{v.pctA}%</span>
                          <div className="h-2 flex-1 rounded-full bg-white/5 flex shadow-inner">
                            <div
                              className="h-full transition-all duration-1000 rounded-l-full relative"
                              style={{ width: `${v.pctA}%`, background: v.a.accent }}
                            >
                              {/* Inner Shading/Glow */}
                              <div className="absolute inset-0 rounded-l-full mix-blend-screen opacity-80" style={{ boxShadow: `0 0 12px ${v.a.accent}` }} />
                              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-l-full" />
                            </div>
                            <div
                              className="h-full transition-all duration-1000 rounded-r-full relative"
                              style={{ width: `${v.pctB}%`, background: v.b.accent }}
                            >
                              {/* Inner Shading/Glow */}
                              <div className="absolute inset-0 rounded-r-full mix-blend-screen opacity-80" style={{ boxShadow: `0 0 12px ${v.b.accent}` }} />
                              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-r-full" />
                            </div>
                          </div>
                          <span className="font-mono text-[10px] font-bold" style={{ color: v.b.accent }}>{v.pctB}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Bull */}
                  <div className="flex items-center justify-end gap-4 flex-1 w-full md:w-1/3 text-right flex-row-reverse md:flex-row">
                    <div className="py-3 md:py-4 pl-2 text-right">
                      <div className="font-display text-lg font-bold text-white leading-tight flex items-center justify-end gap-2">
                        {v.b.debutDate && new Date().getTime() - new Date(v.b.debutDate).getTime() < 5 * 24 * 60 * 60 * 1000 && (
                          <span className="inline-block rounded bg-yellow-500/20 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider text-yellow-400">NEW</span>
                        )}
                        {v.b.name}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">${v.b.ticker}</div>
                      <div className="font-mono text-sm font-bold text-white">{champ.formatData(v.b[champ.metric])}</div>
                      {v.pctB > v.pctA && (
                        <div className="mt-1.5 inline-block rounded bg-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                          FRONT RUNNER
                        </div>
                      )}
                    </div>
                    <img
                      src={v.b.img}
                      alt={v.b.name}
                      className="h-[100px] md:h-full w-28 md:w-40 object-cover [mask-image:linear-gradient(to_left,black_60%,transparent)]"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            ))}
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
              {champ.history.map((h: any, i: number) => (
                <div key={i} className="rounded-xl border border-white/5 bg-[#121316] p-5 flex flex-row items-center justify-between group hover:bg-white/[0.02] transition-colors" style={{ borderLeft: `4px solid ${champ.accentHex}` }}>
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{h.round} • {h.date}</div>
                    <div className="font-display text-xl font-bold text-white flex items-center gap-2">
                      <Trophy className="h-4 w-4" style={{ color: champ.accentHex }} />
                      {h.winner}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Winning {champ.unit}</div>
                    <div className="font-mono text-lg font-bold" style={{ color: champ.accentHex }}>{h.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Index() {
  const { data: liveUpdates } = useLiveData(INITIAL_PLAYERS);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

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
          <div className="flex items-center gap-4">
            <a href="https://pump.fun" target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded border border-gold/30 bg-transparent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/10 sm:inline-flex">
              Trade <Zap className="h-3.5 w-3.5 fill-gold" />
            </a>
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
        </section>

        {/* NEW PLAYER BANNER */}
        {newPlayer && (
          <div className="mx-auto max-w-7xl px-6 pt-8">
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
              style={{ backgroundImage: `url(${bannerBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/* Background ambient */}
              <div className="absolute inset-0 bg-black/60 z-0"></div>
              <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full blur-[80px] opacity-40 pointer-events-none z-0" style={{ background: newPlayer.accent }} />
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-xl border-2 flex items-center justify-center overflow-hidden bg-black/50" style={{ borderColor: newPlayer.accent }}>
                  <img src={newPlayer.img} alt={newPlayer.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="inline-block rounded-full bg-yellow-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400 mb-2">
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
                <a href="#GOAT" onClick={(e) => { e.preventDefault(); setActiveTab(0); document.getElementById('GOAT')?.scrollIntoView({ behavior: 'smooth' }); }} className="block w-full md:w-auto text-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors">
                  VIEW THE BOARD
                </a>
              </div>
            </div>
          </div>
        )}

        {/* CHAMPIONSHIP TABS & COUNTDOWN */}
        <div className="mx-auto max-w-7xl px-6 pt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-wrap gap-4">
            {CHAMPIONSHIPS.map((champ, i) => (
              <button
                key={champ.id}
                onClick={() => setActiveTab(i)}
                className={`px-6 py-2.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.15em] transition-all border ${activeTab === i
                  ? `${champ.accentBg} ${champ.accentBorder} text-black shadow-[0_0_15px_rgba(0,0,0,0.5)]`
                  : `bg-[#121316] border-white/5 text-muted-foreground hover:border-white/20 hover:text-white`
                  }`}
                style={activeTab === i ? { boxShadow: `0 0 15px ${champ.accentHex}40` } : {}}
              >
                {champ.title}
              </button>
            ))}
          </div>

          <div className="bg-[#121316] border border-white/5 rounded-xl px-6 py-4 inline-block self-start md:self-end">
            <div className="font-mono text-[12px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2">NEXT ROUND IN</div>
            <div className={`font-mono text-[32px] leading-none font-bold flex gap-2 justify-center md:justify-end ${CHAMPIONSHIPS[activeTab].accentText}`}>
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
