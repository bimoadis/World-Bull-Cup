import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, TrendingUp, TrendingDown, Menu, Zap, User, RefreshCw, CheckSquare, Square, Users } from "lucide-react";
// @ts-ignore
import arenaHero from "@/assets/arena-bg.png";
import logo from "@/assets/logo.png";
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
    showChart: true
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
    showChart: false
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
    showChart: false
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
    return [
      { a: ranked[0], b: ranked[1] },
      { a: ranked[0], b: ranked[2] },
      { a: ranked[1], b: ranked[2] },
    ].map((match, index) => {
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

      return {
        a,
        b,
        pctA,
        pctB,
      };
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
                      <div className="truncate font-display text-sm font-bold text-white">{b.name}</div>
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
                      <div className="font-display text-lg font-bold text-white leading-tight">{v.a.name}</div>
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
                    </div>
                  </div>

                  {/* Right Bull */}
                  <div className="flex items-center justify-end gap-4 flex-1 w-full md:w-1/3 text-right flex-row-reverse md:flex-row">
                    <div className="py-3 md:py-4 pl-2">
                      <div className="font-display text-lg font-bold text-white leading-tight">{v.b.name}</div>
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
      </div>
    </div>
  );
}

function Index() {
  const { data: liveUpdates } = useLiveData(INITIAL_PLAYERS);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Countdown timer logic
  const targetDate = new Date("2026-07-04T14:00:00Z").getTime();
  const [timeLeft, setTimeLeft] = useState({ d: "00", h: "00", m: "00", s: "00" });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ d: "00", h: "00", m: "00", s: "00" });
        return;
      }

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
            <a href="#matches" className="hover:text-foreground py-5 transition-colors">Matches</a>
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

        {/* CHAMPIONSHIP TABS */}
        <div className="mx-auto max-w-7xl px-6 pt-16 flex flex-wrap gap-4">
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

        <ChampionshipSection
          champ={CHAMPIONSHIPS[activeTab]}
          players={mappedPlayers}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          index={0}
        />

        <div className="mx-auto max-w-7xl px-6 py-16">
          {/* MATCHES */}
          <section id="matches" className="mb-24">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
              <div>
                <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-gold uppercase mb-1">THE RUN</div>
                <h2 className="font-display text-3xl font-extrabold text-white">MATCHES</h2>
              </div>
              <div className="bg-[#121316] border border-white/5 rounded-xl px-6 py-3 inline-block self-center md:self-end">
                <div className="font-mono text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1">NEXT MATCH IN</div>
                <div className="font-mono text-2xl font-bold text-gold flex gap-2 justify-center">
                  <span>{timeLeft.d}<span className="text-sm text-muted-foreground ml-1">D</span></span> :
                  <span>{timeLeft.h}<span className="text-sm text-muted-foreground ml-1">H</span></span> :
                  <span>{timeLeft.m}<span className="text-sm text-muted-foreground ml-1">M</span></span> :
                  <span>{timeLeft.s}<span className="text-sm text-muted-foreground ml-1">S</span></span>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute top-4 left-0 right-0 h-[1px] bg-white/10" />
              {/* Timeline Line Active (Start to Round of 16) */}
              <div className="hidden md:block absolute top-[15.5px] left-0 w-[12.5%] h-[2px] bg-gold shadow-[0_0_8px_rgba(252,211,77,0.8)] z-0" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {matchesData.map((f: any, i: number) => (
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
                    <div className={`rounded-xl border bg-[#121316] p-5 relative overflow-hidden group transition-all duration-300 ${i === 0
                      ? 'border-gold shadow-[0_0_15px_rgba(252,211,77,0.15)] hover:shadow-[0_0_30px_rgba(252,211,77,0.6)] hover:-translate-y-1 cursor-pointer'
                      : 'border-white/5 hover:border-white/10'
                      }`}>
                      {f.status && (
                        <div className="absolute bottom-5 right-5 text-center">
                          <Trophy className="h-10 w-10 text-white/5" />
                        </div>
                      )}

                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                          <Square className="h-4 w-4 text-white/10" />
                          <span className={`font-display text-sm font-bold ${i === 0 || i === 1 || i === 2 ? 'text-white' : 'text-muted-foreground'}`}>{f.a}</span>
                        </div>
                        <div className="font-mono text-[9px] text-muted-foreground/60 pl-1">VS</div>
                        <div className="flex items-center gap-3">
                          <Square className="h-4 w-4 text-white/10" />
                          <span className={`font-display text-sm font-bold ${i === 0 || i === 1 || i === 2 ? 'text-white' : 'text-muted-foreground'}`}>{f.b}</span>
                        </div>
                      </div>

                      <div className={`mt-6 pt-4 border-t ${i === 0 ? 'border-gold/50' : 'border-white/5'} flex flex-col relative z-10`}>
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
                <li><a href="#matches" className="hover:text-gold transition-colors">MATCHES</a></li>
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
