const fs = require('fs');
const path = require('path');

const p = path.resolve('src/routes/$playerId.tsx');
let content = fs.readFileSync(p, 'utf-8');

// 1. Replace imports
content = content.replace(
  'import { INITIAL_PLAYERS } from "@/data/players";\nimport { useLiveData } from "@/hooks/useLiveData";',
  'import { usePlayersData } from "@/hooks/useLiveData";'
);

// 2. Update hooks and params
content = content.replace(
  `  const { data: liveUpdates } = useLiveData(INITIAL_PLAYERS);\n\n  const player = useMemo(() => {\n    return INITIAL_PLAYERS.find(p => p.id === playerId);\n  }, [playerId]);`,
  `  const { data: players = [] } = usePlayersData(true);\n\n  const player = useMemo(() => {\n    return players.find(p => p.id === playerId);\n  }, [playerId, players]);`
);

// 3. Update mapped stats
content = content.replace(
  `  const stats = useMemo(() => {\n    if (!player) return null;\n    const up = liveUpdates?.[player.id];\n    return {\n      marketCap: up?.marketCap || player.marketCap || 0,\n      price: up?.price || player.price || 0,\n      volume24h: up?.volume24h || player.volume24h || 0,\n      change24h: up?.change24h || player.change24h || 0,\n      tokensBurned: up?.tokensBurned || player.tokensBurned || 0,\n      liveHolders: up?.holders || player.liveHolders || 0,\n      up: (up?.change24h || player.change24h || 0) >= 0,\n    };\n  }, [player, liveUpdates]);`,
  `  const stats = useMemo(() => {\n    if (!player) return null;\n    return {\n      marketCap: player.market_cap || 0,\n      price: player.price || 0,\n      volume24h: player.volume_24h || 0,\n      change24h: player.change_24h || 0,\n      tokensBurned: player.tokens_burned || 0,\n      liveHolders: player.live_holders || 0,\n      up: (player.change_24h || 0) >= 0,\n    };\n  }, [player]);`
);

// 4. Handle img and ticker
content = content.replace(
  `src={player.image_url || player.img}`,
  `src={player.image_url}`
);
content = content.replace(
  `\${player.ticker}`,
  `\${player.ticker_symbol}`
);

fs.writeFileSync(p, content);
console.log("Refactored $playerId.tsx");
