const fs = require('fs');
let code = fs.readFileSync('src/routes/index.tsx', 'utf-8');

// 1. Fix tournamentsData prop
code = code.replace(
  /champ={CHAMPIONSHIPS\[activeTab\]}\r?\n\s*players={mappedPlayers}\r?\n\s*autoRefresh={autoRefresh}/m,
  'champ={CHAMPIONSHIPS[activeTab]}\n          players={mappedPlayers}\n          tournamentsData={tournamentsData}\n          autoRefresh={autoRefresh}'
);

// 2. Fix dbId for HOLDERS
code = code.replace(
  /const tournament = tournamentsData\.tournaments\.find\(\(t: any\) => t\.championship_id === champ\.id\.toLowerCase\(\)\);/m,
  'const dbId = champ.id.toLowerCase() === "holders" ? "holder" : champ.id.toLowerCase();\n    const tournament = tournamentsData.tournaments.find((t: any) => t.championship_id === dbId);'
);

// 3. Fix error boundary
code = code.replace(
  /function ChampionshipSection\(\{ champ, players, tournamentsData, autoRefresh, setAutoRefresh, index, refetch, isFetching \}: any\) {\r?\n\s*const ranked = useMemo\(\(\) => {/m,
  'function ChampionshipSection({ champ, players, tournamentsData, autoRefresh, setAutoRefresh, index, refetch, isFetching }: any) {\n  try {\n  const ranked = useMemo(() => {'
);
code = code.replace(
  /          <\/section>\r?\n\s*\)\}\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*\);\r?\n\s*\}/m,
  '          </section>\n        )}\n      </div>\n    </div>\n  );\n  } catch (err) {\n    console.error("ChampionshipSection crashed", err);\n    return <div className="py-16 text-center text-red-500 min-h-[500px] flex items-center justify-center">Error in ChampionshipSection: {(err as Error).message}</div>;\n  }\n}'
);

// 4. Fix sorted array with fallback
code = code.replace(
  /const sorted = \[\.\.\.players\]\.sort\(\(a: any, b: any\) => b\[champ\.metric\] - a\[champ\.metric\]\);/g,
  'const sorted = [...(players || [])].filter(Boolean).sort((a: any, b: any) => (b[champ.metric] || 0) - (a[champ.metric] || 0));'
);
code = code.replace(
  /const total = sorted.reduce\(\(sum, p\) => sum \+ p\[champ.metric\], 0\);/g,
  'const total = sorted.reduce((sum, p) => sum + (p[champ.metric] || 0), 0);'
);

// 5. Fix unused import and add useTournamentsData and usePlayersData
code = code.replace(
  /import { INITIAL_PLAYERS } from "@\/data\/players";\r?\nimport { useLiveData } from "@\/hooks\/useLiveData";/m,
  'import { usePlayersData } from "@/hooks/useLiveData";\nimport { useTournamentsData } from "@/hooks/useTournaments";'
);

fs.writeFileSync('src/routes/index.tsx', code);
console.log('Fixes applied successfully!');
