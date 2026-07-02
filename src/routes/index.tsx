import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, TrendingUp, TrendingDown, Menu, Zap, User, RefreshCw, CheckSquare, Square, Users, Wallet, Flame } from "lucide-react";
// @ts-ignore
import arenaHero from "@/assets/arena-bg.png";
import logo from "@/assets/logo.png";
// @ts-ignore
import bannerBg from "@/assets/banner-bg.png";
import { usePlayersData } from "@/hooks/useLiveData";
import { useTournamentsData } from "@/hooks/useTournaments";
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
  const isTbd = v.a.name === 'TBD' || v.b.name === 'TBD';
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-xl border ${isFinal
          ? 'border-[#DAA520] shadow-[0_0_15px_rgba(218,165,32,0.2)] h-[185px] md:h-[220px]'
          : isTbd
            ? 'border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.1)] h-[110px] md:h-[130px]'
            : 'border-white/5 h-[110px] md:h-[130px]'
        } bg-[#121316] effect-border-shine w-full`}
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

function MatchCountdown({ matchTime, status }: { matchTime: string | null; status: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: string; h: string; m: string; s: string } | null>(null);

  useEffect(() => {
    if (status !== 'active' || !matchTime) {
      setTimeLeft(null);
      return;
    }
    const target = new Date(matchTime);

    const updateTimer = () => {
      const now = Date.now();
      const distance = target.getTime() - now;
      if (distance <= 0) {
        setTimeLeft({ d: "00", h: "00", m: "00", s: "00" });
        return;
      }
      const d = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, "0");
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, "0");
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, "0");
      const s = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, "0");
      setTimeLeft({ d, h, m, s });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [matchTime, status]);

  if (!timeLeft) return null;

  return (
    <span className="text-[9px] md:text-[10px] text-muted-foreground flex gap-1.5 items-center bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5 mt-1">
      <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(218,165,32,0.6)]" />
      MATCH IN {timeLeft.d}D : {timeLeft.h}H : {timeLeft.m}M : {timeLeft.s}S
    </span>
  );
}

function ChampionshipSection({ champ, players, tournamentsData, autoRefresh, setAutoRefresh, index, refetch, isFetching }: any) {
  const ranked = useMemo(() => {
    const sorted = [...(players || [])].filter(Boolean).sort((a: any, b: any) => Number(b[champ.metric] || 0) - Number(a[champ.metric] || 0));
    const total = sorted.reduce((sum, p) => sum + Number(p[champ.metric] || 0), 0);

    return sorted.map((b: any, i: number) => {
      const share = total > 0 ? Number(b[champ.metric] || 0) / total : 0;
      return {
        ...b,
        rank: i + 1,
        metricStr: champ.formatData(Number(b[champ.metric] || 0)),
        oddsStr: shareToOdds(share),
        shareStr: (share * 100).toFixed(1),
        sharePct: share * 100
      };
    });
  }, [players, champ]);

  const history = useMemo(() => {
    if (!tournamentsData?.hallOfFame) return [];
    return tournamentsData.hallOfFame
      .filter((h: any) => h.championship_id === champ.id.toLowerCase())
      .map((h: any) => {
        const p = players.find((p: any) => p.id === h.winner_player_id);
        return {
          round: `Season ${h.season_number}`,
          winner: p?.name || 'Unknown',
          val: 'Winner',
          date: new Date(h.end_date).toLocaleDateString(),
          winnerPlayer: p ? { ...p, img: p.image_url } : null
        }
      });
  }, [tournamentsData, champ, players]);

  const bracket = useMemo(() => {
    if (!tournamentsData?.tournaments || !tournamentsData?.matches) return null;
    const dbId = champ.id.toLowerCase() === "holders" ? "holder" : champ.id.toLowerCase();
    const tournament = tournamentsData.tournaments.find((t: any) => t.championship_id === dbId);
    if (!tournament) return null;

    const matches = tournamentsData.matches.filter((m: any) => m.tournament_id === tournament.id);
    const sf1Match = matches.find((m: any) => m.round_name === 'SEMI-FINAL 1');
    const sf2Match = matches.find((m: any) => m.round_name === 'SEMI-FINAL 2');
    const finalMatch = matches.find((m: any) => m.is_final);

    const getPlayer = (id: string) => players.find((p: any) => p.id === id) || { name: 'TBD', img: '/bull-none.svg', [champ.metric]: 0, ticker: 'TBD', accent: '#EAB308' };

    const makeMatchObj = (m: any) => {
      if (!m) return { a: getPlayer(''), b: getPlayer(''), pctA: 50, pctB: 50, winner: null, matchTime: null };
      const a = getPlayer(m.player1_id);
      const b = getPlayer(m.player2_id);
      const ma = a[champ.metric] || 0;
      const mb = b[champ.metric] || 0;
      const total = ma + mb;
      return {
        a, b,
        pctA: total > 0 ? Math.round((ma / total) * 100) : 50,
        pctB: total > 0 ? Math.round((mb / total) * 100) : 50,
        winner: m.winner_id ? getPlayer(m.winner_id) : (ma >= mb ? a : b),
        matchTime: m.match_time
      }
    };

    return {
      sf1: makeMatchObj(sf1Match),
      sf2: makeMatchObj(sf2Match),
      final: makeMatchObj(finalMatch),
      tournament
    }
  }, [tournamentsData, champ, players]);

  if (!bracket || !bracket.tournament) return <div className="py-16 text-center text-white min-h-[500px] flex items-center justify-center">Loading tournament data...</div>;

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
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-white/10"
                >
                  Refresh Now <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-medium transition-all ${
                    autoRefresh
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-white/20'}`} />
                  Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                </button>
              </div>
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
                  key={b.id} className={`relative grid ${champ.showChart ? 'grid-cols-[50px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_100px]' : 'grid-cols-[50px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_100px]'} items-center gap-4 border-b border-white/5 px-6 py-4 transition-colors last:border-0 hover:bg-white/[0.02]`}
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
                      <div className="truncate font-mono text-[10px] uppercase text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span>${b.ticker}</span>
                        {!b.isLive && (
                          <span className="inline-block rounded-full bg-white/5 border border-white/10 px-1.5 py-[0.5px] text-[7px] font-mono tracking-wider text-muted-foreground select-none uppercase font-bold">PRE-LAUNCH</span>
                        )}
                      </div>
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
                    {b.isLive ? (
                      <a href={b.contract && b.contract !== "Soon" && b.contract !== "TBA" ? `https://pump.fun/coin/${b.contract}` : "https://pump.fun"} target="_blank" rel="noreferrer"
                        className="inline-block rounded border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors hover:opacity-90"
                        style={b.rank === 1
                          ? { borderColor: champ.accentHex, color: champ.accentHex, backgroundColor: `${champ.accentHex}15` }
                          : { borderColor: 'rgba(255,255,255,0.1)', color: 'hsl(var(--muted-foreground))', backgroundColor: 'transparent' }
                        }
                      >
                        Trade
                      </a>
                    ) : (
                      <button disabled className="inline-block rounded border border-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 bg-white/[0.01] cursor-not-allowed select-none">
                        Launches soon
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* TABLE FOOTER DISCLAIMER */}
              <div className="border-t border-white/5 bg-white/[0.01] px-6 py-3 text-center font-mono text-[9px] text-muted-foreground/40 tracking-wider">
                Not betting. Not financial advice. "Odds" are a visual reading of metric share, not a wager and not a payout.
              </div>
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
                <div className="text-center font-mono text-[10px] md:text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3 flex flex-col items-center gap-1">
                  <span>DAY 1 • SEMI-FINAL 1</span>
                  <MatchCountdown matchTime={bracket.sf1.matchTime} status={bracket.tournament.status} />
                </div>
                <MatchCard v={bracket.sf1} champ={champ} delay={0.1} />
                <div className="flex flex-col items-center mt-3 text-white/20">
                  <div className="w-px h-6 border-l border-dashed border-white/20" />
                  <div className="text-xs mt-1">↓ Winner Advances</div>
                </div>
              </div>

              {/* SF 2 */}
              <div className="w-full max-w-xl">
                <div className="text-center font-mono text-[10px] md:text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3 flex flex-col items-center gap-1">
                  <span>DAY 1 • SEMI-FINAL 2</span>
                  <MatchCountdown matchTime={bracket.sf2.matchTime} status={bracket.tournament.status} />
                </div>
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
                <MatchCountdown matchTime={bracket.final.matchTime} status={bracket.tournament.status} />
              </div>
              <MatchCard v={bracket.final} champ={champ} delay={0.4} isFinal={true} />
            </div>



          </div>
        </section>

        {/* PAST WINNERS HISTORY */}
        <section className="mb-8 mt-16">
          <div className="mb-8">
            <div className={`font-mono text-[10px] font-bold tracking-[0.2em] ${champ.accentText} uppercase mb-1`}>HALL OF FAME</div>
            <h2 className="font-display text-3xl font-extrabold text-white">
              {history && history.length > 0 ? "PAST WINNERS" : "Awaiting its first champion"}
            </h2>
          </div>

          {history && history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((h: any, i: number) => {
                const winnerPlayer = h.winnerPlayer;
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
          ) : (
            <div className="rounded-xl border border-white/5 border-dashed bg-[#121316]/50 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.01] transition-all">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-xl border border-white/10 flex items-center justify-center bg-black/40">
                  <Trophy className="h-8 w-8 text-muted-foreground/30 animate-pulse" />
                </div>
                <div>
                  <div className="inline-block rounded-full bg-gold/10 px-2.5 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-gold mb-2 border border-gold/20">
                    Season 1 — Live
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-extrabold text-white mb-1.5">
                    Awaiting its first champion
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                    Season 1 is live. The first name carved here hasn't been earned yet. Back your bull and decide it.
                  </p>
                </div>
              </div>
              {ranked[0] && (
                <div className="shrink-0 rounded-lg bg-white/[0.02] border border-white/5 p-4 text-center md:text-right min-w-[200px] effect-border-shine" style={{ '--glow-color': champ.accentRgb } as any}>
                  <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Provisional Leader</div>
                  <div className="font-display text-base font-bold text-white mb-0.5">{ranked[0].name}</div>
                  <div className="font-mono text-xs font-semibold" style={{ color: champ.accentHex }}>
                    {ranked[0].metricStr} • leading now
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const INTRO_STEPS = [
  {
    id: "claim",
    stepNum: "01",
    label: "CLAIM",
    title: "CLAIM",
    desc: "Every cycle, creator fees are claimed from every Player Token — including $LEOBULL, $CRBULL, $KYLBULL, $LAMIBULL and future Bull Tokens — then transferred to the transparent Treasury Wallet.",
    highlight: "Trading across every Bull fuels the entire World Bull Cup ecosystem.",
    accent: "#5BA3D0", // Lionel blue
    accentRgb: "91, 163, 208",
    accentText: "text-[#5BA3D0]",
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 17V3" />
        <path d="m6 11 6 6 6-6" />
        <path d="M19 21H5" />
      </svg>
    ),
  },
  {
    id: "buyback_burn",
    stepNum: "02",
    label: "BUYBACK & BURN",
    title: "BUYBACK & BURN",
    desc: "A dedicated portion of the Treasury market-buys $BULLCUP directly from the open market and permanently burns the purchased tokens, reducing circulating supply every cycle.",
    highlight: "More Player Token activity → More Buybacks → More Burn.",
    accent: "#E8602C", // burn fire orange
    accentRgb: "232, 96, 44",
    accentText: "text-[#E8602C]",
    icon: Flame,
  },
  {
    id: "treasury",
    stepNum: "03",
    label: "TREASURY",
    title: "TREASURY",
    desc: "All creator fees are stored inside an on-chain Treasury Wallet where every transaction can be publicly verified. The Treasury executes automated buybacks, burns and ecosystem allocations with complete transparency.",
    highlight: "Every movement is proof on-chain.",
    accent: "#A855F7", // wallet purple
    accentRgb: "168, 85, 247",
    accentText: "text-[#A855F7]",
    showProofLink: true,
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    id: "ecosystem_growth",
    stepNum: "04",
    label: "ECOSYSTEM GROWTH",
    title: "ECOSYSTEM GROWTH",
    desc: "The remaining Treasury allocation funds ecosystem growth through marketing campaigns, creator rewards, community events, partnerships and future Bull launches—expanding the World Bull Cup ecosystem over time.",
    highlight: "Every new Bull strengthens the ecosystem.",
    accent: "#EAB308", // goat gold
    accentRgb: "234, 179, 8",
    accentText: "text-[#EAB308]",
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
        <path d="M16 7h6v6" />
      </svg>
    ),
  }
];

function ChampionshipIntro() {
  const [activeStep, setActiveStep] = useState(0);
  const current = INTRO_STEPS[activeStep];
  const IconComponent = current.icon;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % INTRO_STEPS.length);
    }, 9000); // Auto-rotation every 6 seconds
    return () => clearInterval(timer);
  }, [activeStep]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {/* Container matching the rounded-xl border border-white/5 bg-[#121316] of Web Bull */}
      <div
        className="relative transition-all duration-500 bg-[#121316] border rounded-xl overflow-hidden"
        style={{
          borderColor: `${current.accent}20`,
          boxShadow: `0 12px 40px -12px rgba(0, 0, 0, 0.75), 0 0 20px ${current.accent}05`,
        }}
      >
        {/* Dynamic Background Ambient Glow */}
        <div
          className="absolute -left-20 -top-20 h-72 w-72 rounded-full blur-[100px] opacity-10 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: current.accent }}
        />

        {/* 1. Top Header Sub-Bar */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 relative z-10 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: current.accent }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: current.accent }}></span>
            </span>
            <span
              className="font-mono text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase transition-colors duration-500"
              style={{ color: current.accent }}
            >
              LIVE • $BULLCUP ECOSYSTEM
            </span>
          </div>
          <div className="font-mono text-[10px] md:text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
            STEP <span style={{ color: current.accent }} className="font-bold">{current.stepNum}</span> / 04
          </div>
        </div>

        {/* 2. Timeline Progress Sub-Bar */}
        <div className="flex items-center justify-between px-6 sm:px-12 py-5 border-b border-white/5 relative z-10 select-none overflow-x-auto bg-white/[0.005]">
          {/* Step 1 */}
          <button
            onClick={() => setActiveStep(0)}
            className="flex items-center gap-2 focus:outline-none cursor-pointer group shrink-0"
          >
            <div
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${activeStep >= 0 ? 'bg-[#5BA3D0]' : 'bg-white/10'}`}
              style={activeStep === 0 ? { boxShadow: '0 0 10px #5BA3D0' } : {}}
            />
            <span className={`font-mono text-[9px] md:text-xs tracking-wider transition-colors uppercase ${activeStep === 0 ? 'text-[#5BA3D0] font-bold' : 'text-white/20 group-hover:text-white/50'}`}>
              01 CLAIM
            </span>
          </button>

          {/* Line 1 -> 2 */}
          <div className="flex-1 mx-4 h-[2px] bg-white/5 relative hidden xs:block min-w-[30px]">
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                width: activeStep >= 1 ? '100%' : '0%',
                background: `linear-gradient(to right, #5BA3D0, #E8602C)`,
                boxShadow: activeStep >= 1 ? '0 0 8px #E8602C' : 'none'
              }}
            />
          </div>

          {/* Step 2 */}
          <button
            onClick={() => setActiveStep(1)}
            className="flex items-center gap-2 focus:outline-none cursor-pointer group shrink-0"
          >
            <div
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${activeStep >= 1 ? 'bg-[#E8602C]' : 'bg-white/10'}`}
              style={activeStep === 1 ? { boxShadow: '0 0 10px #E8602C' } : {}}
            />
            <span className={`font-mono text-[9px] md:text-xs tracking-wider transition-colors uppercase ${activeStep === 1 ? 'text-[#E8602C] font-bold' : 'text-white/20 group-hover:text-white/50'}`}>
              02 BUYBACK & BURN
            </span>
          </button>

          {/* Line 2 -> 3 */}
          <div className="flex-1 mx-4 h-[2px] bg-white/5 relative hidden xs:block min-w-[30px]">
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                width: activeStep >= 2 ? '100%' : '0%',
                background: `linear-gradient(to right, #E8602C, #A855F7)`,
                boxShadow: activeStep >= 2 ? '0 0 8px #A855F7' : 'none'
              }}
            />
          </div>

          {/* Step 3 */}
          <button
            onClick={() => setActiveStep(2)}
            className="flex items-center gap-2 focus:outline-none cursor-pointer group shrink-0"
          >
            <div
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${activeStep >= 2 ? 'bg-[#A855F7]' : 'bg-white/10'}`}
              style={activeStep === 2 ? { boxShadow: '0 0 10px #A855F7' } : {}}
            />
            <span className={`font-mono text-[9px] md:text-xs tracking-wider transition-colors uppercase ${activeStep === 2 ? 'text-[#A855F7] font-bold' : 'text-white/20 group-hover:text-white/50'}`}>
              03 TREASURY
            </span>
          </button>

          {/* Line 3 -> 4 */}
          <div className="flex-1 mx-4 h-[2px] bg-white/5 relative hidden xs:block min-w-[30px]">
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                width: activeStep >= 3 ? '100%' : '0%',
                background: `linear-gradient(to right, #A855F7, #EAB308)`,
                boxShadow: activeStep >= 3 ? '0 0 8px #EAB308' : 'none'
              }}
            />
          </div>

          {/* Step 4 */}
          <button
            onClick={() => setActiveStep(3)}
            className="flex items-center gap-2 focus:outline-none cursor-pointer group shrink-0"
          >
            <div
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${activeStep >= 3 ? 'bg-[#EAB308]' : 'bg-white/10'}`}
              style={activeStep === 3 ? { boxShadow: '0 0 10px #EAB308' } : {}}
            />
            <span className={`font-mono text-[9px] md:text-xs tracking-wider transition-colors uppercase ${activeStep === 3 ? 'text-[#EAB308] font-bold' : 'text-white/20 group-hover:text-white/50'}`}>
              04 ECOSYSTEM GROWTH
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
                  textShadow: `0 0 30px ${current.accent}50, 0 0 60px ${current.accent}15`,
                  opacity: 0.95
                }}
              >
                {current.stepNum}
              </div>
              {/* Retro scanline overlay */}
              <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 bg-[linear-gradient(rgba(18,19,22,0)_50%,rgba(18,19,22,0.85)_50%)] bg-[length:100%_4px]" />
            </div>

            {/* Category Icon */}
            <div
              className="p-4 rounded-lg bg-[#1a1b20] border transition-all duration-500 shrink-0"
              style={{
                boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2), 0 0 15px ${current.accent}08`,
                borderColor: `${current.accent}20`
              }}
            >
              <IconComponent
                className="h-10 w-10 md:h-12 md:w-12 transition-all duration-500"
                style={{
                  color: current.accent,
                  filter: `drop-shadow(0 0 10px ${current.accent}80)`
                }}
              />
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:block w-px h-28 bg-white/5" />

          {/* Right Block: Title & Desc */}
          <div className="flex flex-col justify-center text-center md:text-left">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col animate-fade-in"
            >
              <h3 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4 uppercase tracking-wide">
                {current.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xl">
                {current.desc}
              </p>

              {/* Highlight & action buttons aligned inline */}
              <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-3">
                <span
                  className="font-semibold text-xs md:text-sm"
                  style={{ color: current.accent }}
                >
                  {current.highlight}
                </span>

                {current.showProofLink && (
                  <a
                    href="https://solscan.io"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase font-mono transition-all duration-300 hover:opacity-90"
                    style={{
                      borderColor: `${current.accent}30`,
                      color: current.accent,
                      backgroundColor: `${current.accent}08`,
                      boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1), 0 0 10px ${current.accent}05`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${current.accent}15`;
                      e.currentTarget.style.borderColor = current.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${current.accent}08`;
                      e.currentTarget.style.borderColor = `${current.accent}30`;
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ backgroundColor: current.accent }} />
                    Track On-Chain Proof
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Index() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data: players = [], refetch, isFetching } = usePlayersData(autoRefresh);
  const { data: tournamentsData } = useTournamentsData();
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

  const LIVE_PLAYER_IDS: string[] = []; // List of live player IDs. Empty during pre-launch phase.

  const mappedPlayers = useMemo(() => {
    return players.map((p: any) => {
      const isLive = p.is_live || LIVE_PLAYER_IDS.includes(p.id) || false;
      return {
        ...p,
        liveMcap: p.market_cap || 0,
        livePrice: p.price || 0,
        liveChange: p.change_24h || 0,
        liveBurned: p.tokens_burned || 0,
        liveHolders: p.live_holders || 0,
        up: (p.change_24h || 0) >= 0,
        ticker: p.ticker_symbol,
        img: p.image_url,
        isLive
      };
    });
  }, [players]);

  // Check if any player is new (using mapped fields for img/ticker)
  const newPlayer = useMemo(() => {
    return mappedPlayers.find(p => p.debut_date && new Date().getTime() - new Date(p.debut_date).getTime() < 7 * 24 * 60 * 60 * 1000);
  }, [mappedPlayers]);

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
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://pump.fun/coin/8UNLWZC5AT1yAhjXp6bDTXSqBqKJnDpqdsHAG8Xppump" target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded border border-gold/30 bg-transparent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/10 sm:inline-flex">
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
          tournamentsData={tournamentsData}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          index={0}
          refetch={refetch}
          isFetching={isFetching}
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
                <li><a href="https://pump.fun/coin/8UNLWZC5AT1yAhjXp6bDTXSqBqKJnDpqdsHAG8Xppump" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Pump.fun</a></li>
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
