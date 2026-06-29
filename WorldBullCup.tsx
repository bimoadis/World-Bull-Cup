import React, { useState, useEffect, useRef } from "react";

/* ============================================================================
   WORLD BULL CUP
   ----------------------------------------------------------------------------
   A sportsbook-styled "versus" board that actually compares the market caps of
   player coins. "Odds" are a visual representation of each coin's share of the
   combined market cap — NOT a real wager. No money is staked, no payout exists.

   >>> TO CONNECT LIVE DATA <<<
   Each player has a `pairAddress` field (Solana pool address on DexScreener).
   Fill those in, then flip USE_LIVE_DATA to true. The fetchLiveData() function
   below already does the work — it hits the public DexScreener API and maps the
   response onto each player. Until then, DUMMY numbers are used.
   ============================================================================ */

const USE_LIVE_DATA = false; // <-- set true once pairAddress values are filled in

// ---------------------------------------------------------------------------
// ROSTER. Add more players here — the whole UI scales off this array.
// Replace `img` with your edited bull artwork (data URL, /public path, or http).
// ---------------------------------------------------------------------------
const INITIAL_PLAYERS = [
  {
    id: "lionel",
    name: "Lionel Bull",
    nation: "Argentina",
    flag: "🇦🇷",
    ticker: "LIOBULL",
    accent: "#5BA3D0",
    contract: "Soon",
    pairAddress: "", // DexScreener Solana pair address
    img: "", // your bull edit goes here
    // DUMMY values (used when USE_LIVE_DATA = false):
    marketCap: 4_120_000,
    price: 0.00412,
    volume24h: 980_000,
    change24h: 12.4,
  },
  {
    id: "kylian",
    name: "Kylian Bull",
    nation: "France",
    flag: "🇫🇷",
    ticker: "KYLBULL",
    accent: "#4F6BED",
    contract: "Soon",
    pairAddress: "",
    img: "",
    marketCap: 3_640_000,
    price: 0.00364,
    volume24h: 1_240_000,
    change24h: -4.1,
  },
  {
    id: "cristiano",
    name: "Cristiano Bull",
    nation: "Portugal",
    flag: "🇵🇹",
    ticker: "CR7BULL",
    accent: "#C0392B",
    contract: "Soon",
    pairAddress: "",
    img: "",
    marketCap: 2_980_000,
    price: 0.00298,
    volume24h: 760_000,
    change24h: 6.7,
  },
];

// ---------------------------------------------------------------------------
// LIVE DATA — DexScreener public API. No key required.
// Returns a partial map keyed by player id: { marketCap, price, volume24h, change24h }
// ---------------------------------------------------------------------------
async function fetchLiveData(players) {
  const updates = {};
  await Promise.all(
    players.map(async (p) => {
      if (!p.pairAddress) return;
      try {
        const res = await fetch(
          `https://api.dexscreener.com/latest/dex/pairs/solana/${p.pairAddress}`
        );
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
        // leave dummy values in place on failure
      }
    })
  );
  return updates;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fmtUSD = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};
const fmtPrice = (n) =>
  n < 0.01 ? `$${n.toFixed(5)}` : `$${n.toFixed(4)}`;

// Convert a market-cap share into decimal "odds" (sportsbook style).
// Bigger share => favorite => lower odds.
const shareToOdds = (share) => {
  if (share <= 0) return "—";
  const o = 1 / share;
  return o.toFixed(2);
};

// ---------------------------------------------------------------------------
// Schedule (placeholder — bull-flavored fixtures)
// ---------------------------------------------------------------------------
const FIXTURES = [
  { round: "Round of 16", a: "Lionel Bull", b: "Kylian Bull", date: "Jul 04, 2026" },
  { round: "Quarter-final", a: "Kylian Bull", b: "Cristiano Bull", date: "Jul 09, 2026" },
  { round: "Semi-final", a: "Cristiano Bull", b: "Lionel Bull", date: "Jul 14, 2026" },
  { round: "The Final Charge", a: "TBD", b: "TBD", date: "Jul 19, 2026" },
];

// ===========================================================================
// COMPONENT
// ===========================================================================
export default function WorldBullCup() {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const totalMcap = players.reduce((s, p) => s + p.marketCap, 0) || 1;
  const ranked = [...players].sort((a, b) => b.marketCap - a.marketCap);
  const leader = ranked[0];

  const refresh = async () => {
    if (!USE_LIVE_DATA) {
      setLastUpdate(new Date());
      return;
    }
    setRefreshing(true);
    const updates = await fetchLiveData(players);
    setPlayers((prev) =>
      prev.map((p) => (updates[p.id] ? { ...p, ...updates[p.id] } : p))
    );
    setLastUpdate(new Date());
    setRefreshing(false);
  };

  useEffect(() => {
    if (!USE_LIVE_DATA) return;
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, []);

  return (
    <div style={S.root}>
      <Style />
      <Nav />
      <Hero leader={leader} totalMcap={totalMcap} />
      <Board
        players={players}
        totalMcap={totalMcap}
        ranked={ranked}
        onRefresh={refresh}
        lastUpdate={lastUpdate}
        refreshing={refreshing}
      />
      <Versus ranked={ranked} totalMcap={totalMcap} />
      <Schedule />
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// NAV
// ---------------------------------------------------------------------------
function Nav() {
  return (
    <nav style={S.nav}>
      <div style={S.navInner}>
        <a href="#top" style={S.brand}>
          <span style={S.brandMark}>▟</span>
          <span className="wbc-display" style={S.brandText}>
            WORLD&nbsp;BULL&nbsp;CUP
          </span>
        </a>
        <div style={S.navLinks} className="wbc-navlinks">
          <a href="#board" style={S.navLink}>Board</a>
          <a href="#versus" style={S.navLink}>Versus</a>
          <a href="#schedule" style={S.navLink}>Fixtures</a>
          <a href="#" style={S.navCta} className="wbc-navcta">Trade ↗</a>
        </div>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// HERO
// ---------------------------------------------------------------------------
function Hero({ leader, totalMcap }) {
  return (
    <header id="top" style={S.hero}>
      <div style={S.heroGlow} />
      <div style={S.heroInner}>
        <div style={S.eyebrow}>
          <span style={S.live}>● LIVE BOARD</span>
          <span style={S.eyebrowSep}>/</span>
          <span>SOLANA · PUMP.FUN</span>
        </div>

        <h1 className="wbc-display" style={S.heroTitle}>
          THE BULLS<br />
          ENTER THE<br />
          <span style={S.heroTitleGold}>ARENA.</span>
        </h1>

        <p style={S.heroSub}>
          Three legends, three coins, one charge. The board reads each coin's
          share of the combined market cap as live odds. The bull in front is the
          one the market is backing — nothing is wagered, everything is watched.
        </p>

        <div style={S.heroStats}>
          <Stat label="Combined market cap" value={fmtUSD(totalMcap)} />
          <Stat label="Current favorite" value={`${leader.flag} ${leader.name}`} />
          <Stat label="Players in play" value="3" />
        </div>

        <div style={S.heroDisclaimer}>
          Not betting. Not financial advice. "Odds" are a visual reading of
          market-cap share. Tokens are highly risky.
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value }) {
  return (
    <div style={S.stat}>
      <div className="wbc-mono" style={S.statValue}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BOARD — the odds table (one row per player)
// ---------------------------------------------------------------------------
function Board({ players, totalMcap, ranked, onRefresh, lastUpdate, refreshing }) {
  return (
    <section id="board" style={S.section}>
      <SectionHead
        kicker="The Card"
        title="ODDS BOARD"
        right={
          <button style={S.refreshBtn} className="wbc-refresh" onClick={onRefresh}>
            {refreshing ? "↻ syncing" : "↻ refresh"}
          </button>
        }
      />
      <div style={S.boardMeta}>
        Sorted by market cap. Odds = inverse of each coin's market-cap share.
        Updated {lastUpdate.toLocaleTimeString()}.
      </div>

      <div style={S.table}>
        <div style={S.theadRow} className="wbc-thead">
          <div>#</div>
          <div>Player</div>
          <div style={S.tNum}>Market cap</div>
          <div style={S.tNum}>Price</div>
          <div style={S.tNum}>24h</div>
          <div style={S.tNum}>Odds</div>
          <div style={S.tNum}>Share</div>
          <div></div>
        </div>

        {ranked.map((p, i) => {
          const share = p.marketCap / totalMcap;
          const up = p.change24h >= 0;
          return (
            <div key={p.id} style={S.trow} className="wbc-trow">
              <div style={S.rank}>{i === 0 ? "★" : i + 1}</div>

              <div style={S.playerCell}>
                <div style={{ ...S.avatar, borderColor: p.accent }}>
                  {p.img ? (
                    <img src={p.img} alt={p.name} style={S.avatarImg} />
                  ) : (
                    <span style={S.avatarPlaceholder}>▟</span>
                  )}
                </div>
                <div>
                  <div className="wbc-display" style={S.playerName}>{p.name}</div>
                  <div style={S.playerMeta}>
                    {p.flag} {p.nation} · ${p.ticker}
                  </div>
                </div>
              </div>

              <div className="wbc-mono" style={{ ...S.tNum, ...S.strong }}>
                {fmtUSD(p.marketCap)}
              </div>
              <div className="wbc-mono" style={S.tNum}>{fmtPrice(p.price)}</div>
              <div
                className="wbc-mono"
                style={{ ...S.tNum, color: up ? "#4FB477" : "#C0392B" }}
              >
                {up ? "▲" : "▼"} {Math.abs(p.change24h).toFixed(1)}%
              </div>
              <div
                className="wbc-mono"
                style={{
                  ...S.tNum,
                  ...S.odds,
                  ...(i === 0 ? S.oddsFav : {}),
                }}
              >
                {shareToOdds(share)}
              </div>
              <div className="wbc-mono" style={S.tNum}>
                {(share * 100).toFixed(1)}%
              </div>

              <div style={S.tNum}>
                <a href="#" style={S.tradeMini} className="wbc-trademini">
                  Trade
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// VERSUS — the signature element. Pairwise head-to-head momentum bars.
// ---------------------------------------------------------------------------
function Versus({ ranked, totalMcap }) {
  // Build the matchups from the ranked roster (all unique pairs)
  const pairs = [];
  for (let i = 0; i < ranked.length; i++) {
    for (let j = i + 1; j < ranked.length; j++) {
      pairs.push([ranked[i], ranked[j]]);
    }
  }

  return (
    <section id="versus" style={S.sectionDark}>
      <SectionHead kicker="Head to Head" title="THE VERSUS" />
      <div style={S.versusList}>
        {pairs.map(([a, b], idx) => {
          const sum = a.marketCap + b.marketCap || 1;
          const aShare = (a.marketCap / sum) * 100;
          const bShare = 100 - aShare;
          const aLeads = a.marketCap >= b.marketCap;
          return (
            <div key={idx} style={S.matchup}>
              <Side player={a} leads={aLeads} align="left" />

              <div style={S.versusCenter}>
                <div className="wbc-display" style={S.vsBadge}>VS</div>
              </div>

              <Side player={b} leads={!aLeads} align="right" />

              {/* momentum bar spanning the whole matchup */}
              <div style={S.momentumWrap}>
                <div
                  className="wbc-momentum-a"
                  style={{
                    ...S.momentumA,
                    width: `${aShare}%`,
                    background: a.accent,
                  }}
                />
                <div
                  className="wbc-momentum-b"
                  style={{
                    ...S.momentumB,
                    width: `${bShare}%`,
                    background: b.accent,
                  }}
                />
                <div
                  className="wbc-mono"
                  style={{ ...S.momentumLabel, left: 12 }}
                >
                  {aShare.toFixed(0)}%
                </div>
                <div
                  className="wbc-mono"
                  style={{ ...S.momentumLabel, right: 12 }}
                >
                  {bShare.toFixed(0)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Side({ player, leads, align }) {
  return (
    <div style={{ ...S.side, textAlign: align }}>
      <div
        style={{
          ...S.sideAvatar,
          borderColor: player.accent,
          marginLeft: align === "right" ? "auto" : 0,
        }}
      >
        {player.img ? (
          <img src={player.img} alt={player.name} style={S.avatarImg} />
        ) : (
          <span style={S.avatarPlaceholderLg}>▟</span>
        )}
      </div>
      <div
        className="wbc-display"
        style={{
          ...S.sideName,
          color: leads ? "#C9A227" : "#EDEDED",
        }}
      >
        {player.name}
      </div>
      <div style={S.sideMeta}>
        {player.flag} ${player.ticker}
      </div>
      <div className="wbc-mono" style={S.sideMcap}>
        {fmtUSD(player.marketCap)}
      </div>
      {leads && <div style={S.leadTag}>FRONT RUNNER</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCHEDULE
// ---------------------------------------------------------------------------
function Schedule() {
  return (
    <section id="schedule" style={S.section}>
      <SectionHead kicker="The Run" title="FIXTURES" />
      <div style={S.fixtures}>
        {FIXTURES.map((f, i) => (
          <div key={i} style={S.fixture} className="wbc-fixture">
            <div style={S.fixtureRound}>{f.round}</div>
            <div style={S.fixtureMatch}>
              <span className="wbc-display" style={S.fixtureTeam}>{f.a}</span>
              <span style={S.fixtureVs}>vs</span>
              <span className="wbc-display" style={S.fixtureTeam}>{f.b}</span>
            </div>
            <div className="wbc-mono" style={S.fixtureDate}>{f.date}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FOOTER
// ---------------------------------------------------------------------------
function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.footerInner}>
        <div className="wbc-display" style={S.footerBrand}>WORLD BULL CUP</div>
        <p style={S.footerDisc}>
          World Bull Cup is an independent fan project. Not affiliated with FIFA,
          the FIFA World Cup™, any player, federation, or Pump.fun. Nothing here
          is betting, financial, or legal advice. "Odds" are a visual reading of
          market-cap share, not a wager and not a payout. Digital tokens are
          highly risky — you may lose everything you put in.
        </p>
        <div style={S.footerLinks}>
          <a href="#" style={S.footerLink}>X / Twitter</a>
          <a href="#" style={S.footerLink}>DexScreener</a>
          <a href="#" style={S.footerLink}>Pump.fun</a>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Shared section header
// ---------------------------------------------------------------------------
function SectionHead({ kicker, title, right }) {
  return (
    <div style={S.sectionHead}>
      <div>
        <div style={S.kicker}>{kicker}</div>
        <h2 className="wbc-display" style={S.sectionTitle}>{title}</h2>
      </div>
      {right}
    </div>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const GOLD = "#C9A227";
const BG = "#0A0A0B";
const CARD = "#141416";
const CARD2 = "#1B1B1E";
const LINE = "#2A2A2E";
const TEXT = "#EDEDED";
const MUTE = "#8A8A90";

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: ${BG}; }
      .wbc-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.01em; }
      .wbc-mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
      .wbc-navcta:hover { background: ${GOLD} !important; color: #000 !important; }
      .wbc-navlink:hover { color: ${TEXT} !important; }
      .wbc-refresh:hover { border-color: ${GOLD} !important; color: ${GOLD} !important; }
      .wbc-trow:hover { background: ${CARD2} !important; }
      .wbc-trademini:hover { background: ${GOLD} !important; color: #000 !important; border-color: ${GOLD} !important; }
      .wbc-fixture:hover { border-color: ${GOLD}55 !important; transform: translateY(-2px); }
      .wbc-fixture { transition: all 0.2s ease; }
      .wbc-momentum-a, .wbc-momentum-b { transition: width 0.9s cubic-bezier(0.22,1,0.36,1); }
      @media (max-width: 720px) {
        .wbc-navlinks a:not(.wbc-navcta) { display: none; }
        .wbc-thead { display: none !important; }
      }
      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
      }
      @keyframes wbcFadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}

const S = {
  root: {
    background: BG,
    color: TEXT,
    fontFamily: "'Inter', sans-serif",
    minHeight: "100vh",
    overflowX: "hidden",
  },

  // NAV
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(10,10,11,0.82)",
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid ${LINE}`,
  },
  navInner: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: TEXT },
  brandMark: { color: GOLD, fontSize: 20, lineHeight: 1 },
  brandText: { fontSize: 19, fontWeight: 700, letterSpacing: "0.06em" },
  navLinks: { display: "flex", alignItems: "center", gap: 28 },
  navLink: { color: MUTE, textDecoration: "none", fontSize: 14, fontWeight: 500 },
  navCta: {
    color: GOLD,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    border: `1px solid ${GOLD}`,
    padding: "8px 16px",
    borderRadius: 2,
    transition: "all 0.2s ease",
  },

  // HERO
  hero: { position: "relative", overflow: "hidden", borderBottom: `1px solid ${LINE}` },
  heroGlow: {
    position: "absolute",
    top: "-30%",
    left: "50%",
    transform: "translateX(-50%)",
    width: 800,
    height: 800,
    background: `radial-gradient(circle, ${GOLD}14 0%, transparent 60%)`,
    pointerEvents: "none",
  },
  heroInner: {
    position: "relative",
    maxWidth: 1180,
    margin: "0 auto",
    padding: "90px 24px 70px",
    animation: "wbcFadeUp 0.7s ease both",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 12,
    letterSpacing: "0.18em",
    color: MUTE,
    fontWeight: 600,
    marginBottom: 28,
  },
  live: { color: GOLD },
  eyebrowSep: { color: LINE },
  heroTitle: {
    fontSize: "clamp(52px, 9vw, 108px)",
    fontWeight: 700,
    lineHeight: 0.92,
    letterSpacing: "0.005em",
    marginBottom: 28,
  },
  heroTitleGold: { color: GOLD },
  heroSub: {
    maxWidth: 540,
    fontSize: 16,
    lineHeight: 1.6,
    color: MUTE,
    marginBottom: 40,
  },
  heroStats: {
    display: "flex",
    flexWrap: "wrap",
    gap: 40,
    paddingTop: 32,
    borderTop: `1px solid ${LINE}`,
  },
  stat: {},
  statValue: { fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 4 },
  statLabel: { fontSize: 12, color: MUTE, letterSpacing: "0.08em", textTransform: "uppercase" },
  heroDisclaimer: {
    marginTop: 36,
    fontSize: 12,
    color: "#5E5E64",
    letterSpacing: "0.02em",
  },

  // SECTIONS
  section: { maxWidth: 1180, margin: "0 auto", padding: "80px 24px" },
  sectionDark: {
    background: "#0C0C0E",
    borderTop: `1px solid ${LINE}`,
    borderBottom: `1px solid ${LINE}`,
    padding: "80px 0",
  },
  sectionHead: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 36,
    maxWidth: 1180,
    margin: "0 auto 36px",
    padding: "0 24px",
  },
  kicker: {
    fontSize: 12,
    letterSpacing: "0.22em",
    color: GOLD,
    textTransform: "uppercase",
    fontWeight: 600,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, letterSpacing: "0.01em" },

  // BOARD
  boardMeta: { fontSize: 13, color: MUTE, marginBottom: 24, maxWidth: 600 },
  refreshBtn: {
    background: "transparent",
    border: `1px solid ${LINE}`,
    color: MUTE,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    padding: "9px 16px",
    borderRadius: 2,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  table: { border: `1px solid ${LINE}`, borderRadius: 4, overflow: "hidden" },
  theadRow: {
    display: "grid",
    gridTemplateColumns: "40px 2.4fr 1.1fr 1fr 0.9fr 0.8fr 0.8fr 0.8fr",
    gap: 12,
    padding: "14px 20px",
    background: "#101012",
    borderBottom: `1px solid ${LINE}`,
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: MUTE,
    fontWeight: 600,
    alignItems: "center",
  },
  trow: {
    display: "grid",
    gridTemplateColumns: "40px 2.4fr 1.1fr 1fr 0.9fr 0.8fr 0.8fr 0.8fr",
    gap: 12,
    padding: "18px 20px",
    borderBottom: `1px solid ${LINE}`,
    background: CARD,
    alignItems: "center",
    transition: "background 0.15s ease",
  },
  rank: { fontFamily: "'JetBrains Mono', monospace", color: GOLD, fontSize: 15, fontWeight: 700 },
  playerCell: { display: "flex", alignItems: "center", gap: 14, minWidth: 0 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 4,
    border: "2px solid",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarPlaceholder: { color: "#3A3A40", fontSize: 22 },
  avatarPlaceholderLg: { color: "#3A3A40", fontSize: 40 },
  playerName: { fontSize: 17, fontWeight: 600, lineHeight: 1.1 },
  playerMeta: { fontSize: 12, color: MUTE, marginTop: 3 },
  tNum: { textAlign: "right", fontSize: 14 },
  strong: { fontWeight: 700, color: TEXT },
  odds: {
    fontWeight: 700,
    color: TEXT,
    fontSize: 15,
  },
  oddsFav: { color: GOLD },
  tradeMini: {
    display: "inline-block",
    border: `1px solid ${LINE}`,
    color: MUTE,
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 2,
    transition: "all 0.2s ease",
  },

  // VERSUS
  versusList: { maxWidth: 1180, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 28 },
  matchup: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 20,
    background: CARD,
    border: `1px solid ${LINE}`,
    borderRadius: 6,
    padding: "36px 32px 52px",
  },
  side: { minWidth: 0 },
  sideAvatar: {
    width: 84,
    height: 84,
    borderRadius: 6,
    border: "2px solid",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 16,
  },
  sideName: { fontSize: 26, fontWeight: 700, lineHeight: 1 },
  sideMeta: { fontSize: 13, color: MUTE, marginTop: 6 },
  sideMcap: { fontSize: 18, fontWeight: 700, color: TEXT, marginTop: 10 },
  leadTag: {
    display: "inline-block",
    marginTop: 12,
    fontSize: 10,
    letterSpacing: "0.16em",
    color: GOLD,
    border: `1px solid ${GOLD}66`,
    padding: "4px 10px",
    borderRadius: 2,
    fontWeight: 700,
  },
  versusCenter: { display: "flex", flexDirection: "column", alignItems: "center" },
  vsBadge: {
    fontSize: 28,
    fontWeight: 700,
    color: "#3A3A40",
    border: `1px solid ${LINE}`,
    borderRadius: "50%",
    width: 58,
    height: 58,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  momentumWrap: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 28,
    height: 8,
    background: "#000",
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
  },
  momentumA: { height: "100%", borderRadius: "8px 0 0 8px" },
  momentumB: { height: "100%", borderRadius: "0 8px 8px 0" },
  momentumLabel: {
    position: "absolute",
    top: -22,
    fontSize: 12,
    fontWeight: 700,
    color: MUTE,
  },

  // SCHEDULE
  fixtures: { display: "flex", flexDirection: "column", gap: 12 },
  fixture: {
    display: "grid",
    gridTemplateColumns: "180px 1fr 140px",
    alignItems: "center",
    gap: 20,
    background: CARD,
    border: `1px solid ${LINE}`,
    borderRadius: 4,
    padding: "22px 28px",
  },
  fixtureRound: {
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: GOLD,
    fontWeight: 600,
  },
  fixtureMatch: { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" },
  fixtureTeam: { fontSize: 19, fontWeight: 600 },
  fixtureVs: { fontSize: 13, color: MUTE, fontStyle: "italic" },
  fixtureDate: { fontSize: 14, color: MUTE, textAlign: "right" },

  // FOOTER
  footer: { borderTop: `1px solid ${LINE}`, background: "#0C0C0E" },
  footerInner: { maxWidth: 1180, margin: "0 auto", padding: "60px 24px" },
  footerBrand: { fontSize: 28, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 20 },
  footerDisc: { fontSize: 13, lineHeight: 1.7, color: MUTE, maxWidth: 720, marginBottom: 28 },
  footerLinks: { display: "flex", gap: 24 },
  footerLink: { color: GOLD, textDecoration: "none", fontSize: 14, fontWeight: 500 },
};
