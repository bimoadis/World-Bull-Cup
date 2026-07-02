const fs = require('fs');
const path = require('path');

const p = path.resolve('src/routes/index.tsx');
let content = fs.readFileSync(p, 'utf-8');

// 1. Replace imports
content = content.replace(
  'import { INITIAL_PLAYERS } from "@/data/players";\nimport { useLiveData } from "@/hooks/useLiveData";',
  'import { usePlayersData } from "@/hooks/useLiveData";\nimport { useTournamentsData } from "@/hooks/useTournaments";'
);

// 2. Remove static CHAMPIONSHIPS history (will be dynamic)
content = content.replace(/history: \[\s*\{.*?\}\s*\]/gs, 'history: []');

// 3. Update Index component
content = content.replace(
  '  const [autoRefresh, setAutoRefresh] = useState(true);\n  const { data: liveUpdates, refetch, isFetching } = useLiveData(INITIAL_PLAYERS, autoRefresh);',
  `  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data: players = [], refetch, isFetching } = usePlayersData(autoRefresh);
  const { data: tournamentsData } = useTournamentsData();`
);

// 4. Update INITIAL_PLAYERS usages in Index
content = content.replace(/INITIAL_PLAYERS/g, 'players');

// 5. Update mappedPlayers calculation
content = content.replace(
  `  const mappedPlayers = useMemo(() => {
    return players.map((p: any) => {
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
  }, [liveUpdates]);`,
  `  const mappedPlayers = useMemo(() => {
    return players.map((p: any) => {
      return {
        ...p,
        liveMcap: p.market_cap || 0,
        livePrice: p.price || 0,
        liveChange: p.change_24h || 0,
        liveBurned: p.tokens_burned || 0,
        liveHolders: p.live_holders || 0,
        up: (p.change_24h || 0) >= 0,
        ticker: p.ticker_symbol,
        img: p.image_url
      };
    });
  }, [players]);`
);

// 6. Update ChampionshipSection props & history & bracket
let champSec = `function ChampionshipSection({ champ, players, tournamentsData, autoRefresh, setAutoRefresh, index, refetch, isFetching }: any) {
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

  const history = useMemo(() => {
    if (!tournamentsData?.hallOfFame) return [];
    return tournamentsData.hallOfFame
      .filter((h: any) => h.championship_id === champ.id.toLowerCase())
      .map((h: any) => {
         const p = players.find((p: any) => p.id === h.winner_player_id);
         return {
           round: \`Season \${h.season_number}\`,
           winner: p?.name || 'Unknown',
           val: 'Winner',
           date: new Date(h.end_date).toLocaleDateString(),
           winnerPlayer: p
         }
      });
  }, [tournamentsData, champ, players]);

  const bracket = useMemo(() => {
     if (!tournamentsData?.tournaments || !tournamentsData?.matches) return null;
     const tournament = tournamentsData.tournaments.find((t: any) => t.championship_id === champ.id.toLowerCase());
     if (!tournament) return null;

     const matches = tournamentsData.matches.filter((m: any) => m.tournament_id === tournament.id);
     const sf1Match = matches.find((m: any) => m.round_name === 'SEMI-FINAL 1');
     const sf2Match = matches.find((m: any) => m.round_name === 'SEMI-FINAL 2');
     const finalMatch = matches.find((m: any) => m.is_final);

     const getPlayer = (id: string) => players.find((p: any) => p.id === id) || { name: 'TBD', img: '', [champ.metric]: 0, ticker: 'TBD', accent: '#333' };

     const makeMatchObj = (m: any) => {
        if (!m) return { a: getPlayer(''), b: getPlayer(''), pctA: 50, pctB: 50, winner: null };
        const a = getPlayer(m.player1_id);
        const b = getPlayer(m.player2_id);
        const ma = a[champ.metric] || 0;
        const mb = b[champ.metric] || 0;
        const total = ma + mb;
        return {
          a, b,
          pctA: total > 0 ? Math.round((ma / total) * 100) : 50,
          pctB: total > 0 ? Math.round((mb / total) * 100) : 50,
          winner: m.winner_id ? getPlayer(m.winner_id) : (ma >= mb ? a : b)
        }
     };

     return {
       sf1: makeMatchObj(sf1Match),
       sf2: makeMatchObj(sf2Match),
       final: makeMatchObj(finalMatch),
       tournament
     }
  }, [tournamentsData, champ, players]);

  const [timeLeft, setTimeLeft] = useState({ d: "00", h: "00", m: "00", s: "00" });

  useEffect(() => {
    if (!bracket?.tournament) return;
    const isWaiting = bracket.tournament.status === 'waiting';
    const target = isWaiting ? new Date(new Date(bracket.tournament.end_time).getTime() + (24*60*60*1000)) : new Date(bracket.tournament.end_time);
    
    const timer = setInterval(() => {
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
    }, 1000);
    return () => clearInterval(timer);
  }, [bracket]);

  if (!bracket) return <div className="py-16 text-center text-white">Loading tournament data...</div>;`;

content = content.replace(/function ChampionshipSection\(\{ champ, players, autoRefresh, setAutoRefresh, index, timeLeft, refetch, isFetching \}: any\) \{[\s\S]*?return \(\n    <div className=\{`py-16/m, champSec + '\n\n  return (\n    <div className={`py-16');

// 7. Update usage of ChampionshipSection
content = content.replace(
  `<ChampionshipSection
          champ={CHAMPIONSHIPS[activeTab]}
          players={mappedPlayers}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          index={0}
          timeLeft={timeLeft}
          refetch={refetch}
          isFetching={isFetching}
        />`,
  `<ChampionshipSection
          champ={CHAMPIONSHIPS[activeTab]}
          players={mappedPlayers}
          tournamentsData={tournamentsData}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          index={0}
          refetch={refetch}
          isFetching={isFetching}
        />`
);

// 8. Update Hall of Fame past winners map
content = content.replace(
  `{champ.history.map((h: any, i: number) => {
                const winnerPlayer = players.find(p => p.name === h.winner);`,
  `{history.map((h: any, i: number) => {
                const winnerPlayer = h.winnerPlayer;`
);

content = content.replace(
  `{champ.history && champ.history.length > 0 && (`,
  `{history && history.length > 0 && (`
);

// 9. Remove old timer in Index
content = content.replace(/const \[timeLeft, setTimeLeft\] = useState\(\{ d: "00", h: "00", m: "00", s: "00" \}\);[\s\S]*?return \(\) => clearInterval\(timer\);\n  \}, \[\]\);/g, '');

// 10. Update NEW label logic to 7 days
content = content.replace(/5 \* 24 \* 60 \* 60 \* 1000/g, '7 * 24 * 60 * 60 * 1000');
content = content.replace(/p\.debutDate/g, 'p.debut_date');

// Write back
fs.writeFileSync(p, content);
console.log("Refactored index.tsx");
