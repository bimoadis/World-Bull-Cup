-- Hapus tabel jika sudah ada (opsional untuk reset)
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS hall_of_fame;
DROP TABLE IF EXISTS player_stats;
DROP TABLE IF EXISTS players;

-- 1. Tabel Players
CREATE TABLE players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nation TEXT NOT NULL,
    flag TEXT NOT NULL,
    ticker_symbol TEXT NOT NULL,
    accent TEXT,
    contract TEXT,
    pair_address TEXT,
    image_url TEXT,
    debut_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Player Stats (Cache)
CREATE TABLE player_stats (
    player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    market_cap NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    volume_24h NUMERIC DEFAULT 0,
    change_24h NUMERIC DEFAULT 0,
    tokens_burned NUMERIC DEFAULT 0,
    live_holders INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Hall of Fame
CREATE TABLE hall_of_fame (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id TEXT NOT NULL, 
    season_number INTEGER NOT NULL,
    tournament_name TEXT NOT NULL,
    winner_player_id TEXT REFERENCES players(id),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Tournaments
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    championship_id TEXT NOT NULL, 
    season_number INTEGER NOT NULL DEFAULT 3, 
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'completed')),
    start_time TIMESTAMP WITH TIME ZONE, 
    end_time TIMESTAMP WITH TIME ZONE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel Matches
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    round_name TEXT NOT NULL, 
    player1_id TEXT REFERENCES players(id),
    player2_id TEXT REFERENCES players(id),
    winner_id TEXT REFERENCES players(id),
    match_time TIMESTAMP WITH TIME ZONE, 
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS & Policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read player_stats" ON player_stats FOR SELECT USING (true);
CREATE POLICY "Public read hall of fame" ON hall_of_fame FOR SELECT USING (true);
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
