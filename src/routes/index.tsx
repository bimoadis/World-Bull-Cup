import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Sparkles, TrendingUp, TrendingDown, Flame, Menu, ChevronRight, Circle } from "lucide-react";
import arenaHero from "@/assets/arena-hero.jpg";
import { INITIAL_PLAYERS } from "@/data/players";
import { useLiveData } from "@/hooks/useLiveData";
import { shareToOdds, fmtUSD, fmtPrice } from "@/utils";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "World Bull Cup — The Bulls Enter The Arena" },
      { name: "description", content: "Three legends. Three coins. One charge. Trade odds on the world's most theatrical betting arena." },
      { property: "og:title", content: "World Bull Cup" },
      { property: "og:description", content: "Three legends. Three coins. One charge." },
    ],
  }),
  component: Index,
});

const fixtures = [
  { label: "Round of 16", a: "Lionel Bull", b: "Kylian Bull", date: "Jul 04, 2026 • 14:00", live: false },
  { label: "Quarter-final", a: "Kylian Bull", b: "Cristiano Bull", date: "Jul 07, 2026 • 16:00", live: true },
  { label: "Semi-final", a: "Cristiano Bull", b: "Lionel Bull", date: "Jul 12, 2026 • 18:00", live: false },
  { label: "The Final Charge", a: "TBD", b: "TBD", date: "Jul 19, 2026 • 20:00", live: false },
];

function Sparkline({ up }: { up: boolean }) {
  const color = up ? "oklch(0.72 0.17 150)" : "oklch(0.65 0.22 25)";
  const path = up
    ? "M0 22 L10 18 L20 20 L30 12 L40 14 L50 8 L60 10 L70 4 L80 6"
    : "M0 6 L10 10 L20 8 L30 14 L40 12 L50 18 L60 16 L70 22 L80 20";
  return (
    <svg viewBox="0 0 80 28" className="h-7 w-20" fill="none">
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d={`${path} L80 28 L0 28 Z`} fill={color} opacity="0.15" />
    </svg>
  );
}

function Index() {
  const { data: liveUpdates } = useLiveData(INITIAL_PLAYERS);

  const { rankedBulls, totalMcapStr, favName } = useMemo(() => {
    let total = 0;
    const mapped = INITIAL_PLAYERS.map(p => {
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
    
    mapped.sort((a, b) => b.liveMcap - a.liveMcap);
    
    const favName = mapped[0]?.name || "N/A";
    
    const ranked = mapped.map((b, i) => {
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
    const genVs = (a, b) => {
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-gold to-gold-soft text-primary-foreground">
              <Trophy className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="font-display text-sm font-bold tracking-[0.18em] text-foreground">
              WORLD BULL CUP
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {["Board", "Versus", "Fixtures"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="transition-colors hover:text-foreground">{l}</a>
            ))}
            <a href="#trade" className="text-foreground">Trade</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="btn-gold btn-gold-hover hidden rounded-full px-4 py-2 text-xs font-semibold tracking-wide sm:inline-flex">
              CONNECT WALLET
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-lg border border-border md:hidden">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24">
        <section className="relative mt-8 overflow-hidden rounded-3xl border border-border glass-card">
          <div className="absolute inset-0">
            <img src={arenaHero} alt="Arena" className="h-full w-full object-cover opacity-60" width={1600} height={1024} />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          <div className="relative grid gap-10 px-8 py-14 md:px-14 md:py-20 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-gold">
                <Sparkles className="h-3 w-3" /> WORLD CUP 2026 — BULL EDITION
              </div>
              <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
                THE BULLS<br />ENTER THE<br />
                <span className="text-gold-gradient">ARENA</span>
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                Three legends. Three coins. One charge. Trade live odds on the most theatrical
                head-to-head betting arena on the market. The bull is taking over.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="btn-gold btn-gold-hover rounded-full px-6 py-3 text-sm font-bold tracking-wide">
                  ENTER THE ARENA
                </button>
                <button className="rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-surface-2">
                  View Whitepaper
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 self-end lg:gap-4">
              <StatCard label="Combined Market Cap" value={totalMcapStr} accent />
              <StatCard label="Current Favorite" value={favName} small />
              <StatCard label="Players In Play" value={rankedBulls.length.toString()} />
            </div>
          </div>
        </section>

        <section id="board" className="mt-14">
          <SectionHeader kicker="Live Market" title="ODDS BOARD" />
          <div className="overflow-x-auto rounded-2xl border border-border glass-card">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[40px_minmax(0,1.6fr)_minmax(0,1fr)_repeat(4,minmax(0,0.9fr))_110px] items-center gap-4 border-b border-border bg-surface-2/60 px-5 py-3 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">
                <div>#</div><div>PLAYER</div><div>MARKET CAP</div>
                <div className="text-right">PRICE</div><div className="text-right">24H</div>
                <div className="text-right">ODDS</div><div className="text-right">SHARE</div>
                <div className="text-right">ACTION</div>
              </div>
              {rankedBulls.map((b) => (
                <div key={b.rank} className="group grid grid-cols-[40px_minmax(0,1.6fr)_minmax(0,1fr)_repeat(4,minmax(0,0.9fr))_110px] items-center gap-4 border-b border-border/60 px-5 py-4 transition-colors last:border-b-0 hover:bg-gold/[0.04]">
                  <div className="font-mono text-sm text-muted-foreground">{b.rank}</div>
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={b.img} alt={b.name} className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-border" loading="lazy" width={40} height={40} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{b.name}</div>
                      <div className="truncate font-mono text-[11px] text-muted-foreground">{b.contract}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{b.capStr}</span>
                    <Sparkline up={b.up} />
                  </div>
                  <div className="text-right font-mono text-sm">{b.priceStr}</div>
                  <div className={`text-right font-mono text-sm font-semibold ${b.up ? "text-success" : "text-danger"}`}>
                    <span className="inline-flex items-center gap-1">
                      {b.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {b.up ? "+" : ""}{b.liveChange.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-right font-mono text-sm">{b.oddsStr}</div>
                  <div className="text-right font-mono text-sm">{b.shareStr}%</div>
                  <div className="flex justify-end">
                    <button className="btn-gold btn-gold-hover rounded-full px-4 py-1.5 text-xs font-bold tracking-wide">Trade</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="versus" className="mt-14">
          <SectionHeader kicker="Head to Head" title="THE VERSUS" />
          <div className="space-y-3">
            {versus.map((v, i) => (
              <div key={i} className="grid grid-cols-1 items-center gap-4 rounded-2xl border border-border glass-card p-4 md:grid-cols-[1fr_80px_1fr] md:p-5">
                <Fighter bull={v.a} align="left" pct={v.pctA} winning={v.pctA > v.pctB} />
                <div className="flex flex-col items-center gap-2">
                  <div className="font-display text-xs font-bold tracking-[0.3em] text-muted-foreground">VS</div>
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
                </div>
                <Fighter bull={v.b} align="right" pct={v.pctB} winning={v.pctB > v.pctA} />
                <div className="md:col-span-3">
                  <div className="relative h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-gold-soft" style={{ width: `${v.pctA}%` }} />
                    <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-[oklch(0.6_0.18_250)] to-[oklch(0.55_0.2_250)]" style={{ width: `${v.pctB}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
                    <span>{v.pctA}% — {v.a.name}</span>
                    <span>{v.b.name} — {v.pctB}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="fixtures" className="mt-14">
          <SectionHeader kicker="Tournament" title="FIXTURES" />
          <div className="rounded-2xl border border-border glass-card p-2 md:p-4">
            <ol className="relative">
              <div className="absolute left-[22px] top-4 bottom-4 w-px bg-border md:left-[26px]" />
              {fixtures.map((f, i) => (
                <li key={i} className="relative grid grid-cols-1 items-center gap-3 rounded-xl px-3 py-4 transition-colors hover:bg-surface-2/50 md:grid-cols-[200px_1fr_180px] md:gap-6 md:px-4">
                  <div className="flex items-center gap-3">
                    <div className={`relative grid h-3 w-3 place-items-center rounded-full ${f.live ? "bg-gold" : "bg-surface-2 ring-1 ring-border"}`}>
                      {f.live && <span className="absolute inset-0 animate-ping rounded-full bg-gold opacity-60" />}
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground">{f.label}</span>
                    {f.live && <span className="rounded-full bg-danger/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-danger">LIVE</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-sm font-semibold md:text-base">
                    <span>{f.a}</span>
                    <span className="text-xs font-normal text-muted-foreground">vs</span>
                    <span>{f.b}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 md:justify-end">
                    <span className="font-mono text-xs text-muted-foreground">{f.date}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <footer className="mt-20 border-t border-border pt-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-gold to-gold-soft text-primary-foreground">
              <Trophy className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="font-display text-sm font-bold tracking-[0.2em]">WORLD BULL Cup</span>
          </div>
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-muted-foreground">
            World Bull Cup is an independent fan project. Not affiliated with FIFA, the FIFA World Cup™, any players,
            federations, or Pump.fun. Betting here is fictional, or test only. "Odds" are a visual reading of market cap
            share, not wager and not a payout. Digital tokens are highly risky — you may lose everything you put in.
          </p>
          <div className="mt-6 flex justify-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">X / Twitter</a>
            <a href="#" className="hover:text-foreground">DexScreener</a>
            <a href="#" className="hover:text-foreground">Pump.fun</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <div className="mb-1 font-mono text-[10px] font-semibold tracking-[0.25em] text-gold">{kicker}</div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
      </div>
      <a href="#" className="hidden items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
        View all <ChevronRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function StatCard({ label, value, accent, small }: { label: string; value: string; accent?: boolean; small?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 backdrop-blur-md ${accent ? "border-gold/40 bg-gold/[0.06]" : "border-border bg-surface/60"}`}>
      <div className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`font-display font-extrabold tracking-tight ${small ? "text-base md:text-lg" : "text-xl md:text-2xl"} ${accent ? "text-gold-gradient" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function Fighter({ bull, align, pct, winning }: { bull: any; align: "left" | "right"; pct: number; winning: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${align === "right" ? "md:flex-row-reverse md:text-right" : ""}`}>
      <div className="relative shrink-0">
        <img src={bull.img} alt={bull.name} className={`h-14 w-14 rounded-xl object-cover ring-2 ${winning ? "ring-gold" : "ring-border"}`} loading="lazy" width={56} height={56} />
        {winning && (
          <div className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-soft text-primary-foreground">
            <Flame className="h-3 w-3" strokeWidth={2.5} />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate font-display text-sm font-bold md:text-base">{bull.name}</div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <span>{bull.capStr}</span>
          <Circle className="h-1 w-1 fill-current" />
          <span>odds {bull.oddsStr}</span>
        </div>
        <div className={`mt-0.5 font-mono text-xs font-semibold ${winning ? "text-gold" : "text-muted-foreground"}`}>{pct}%</div>
      </div>
    </div>
  );
}
