import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const INITIAL_PLAYERS = [
  {
    id: "lionel",
    name: "Lionel Bull",
    nation: "Argentina",
    flag: "🇦🇷",
    ticker_symbol: "LEOBULL",
    accent: "#5BA3D0",
    contract: "E9TDy2SXV9PFHthcFRbijjGAu1NBKd7oLDn58zDJpump",
    pair_address: null,
    image_url: "/lionelBull-blue.svg", // Disesuaikan untuk public path
    market_cap: 9112,
    price: 0.000009114,
    volume_24h: 2429.57,
    change_24h: -6.02,
    tokens_burned: 18500000,
    live_holders: 14200,
  },
  {
    id: "kylian",
    name: "Kylian Bull",
    nation: "France",
    flag: "🇫🇷",
    ticker_symbol: "KYLBULL",
    accent: "#4F6BED",
    contract: "CGEDT9QZDvvH5GmVkWJH2BXiMJqMJySC9ihWyr7Spump",
    pair_address: "5tYFviFWQRKV9BJSTHGitbdqEYC1BGUgRUDnSADUXqJP",
    image_url: "/kylianBull-royalblue.svg",
    market_cap: 2614099,
    price: 0.002695,
    volume_24h: 197316.16,
    change_24h: 6.46,
    tokens_burned: 12400000,
    live_holders: 16800,
  },
  {
    id: "cristiano",
    name: "Cristiano Bull",
    nation: "Portugal",
    flag: "🇵🇹",
    ticker_symbol: "CRBULL",
    accent: "#C0392B",
    contract: "2pYDm42UiFEvnpAabkL9K3ikXyjai1GrvsnPM3Vrpump",
    pair_address: null,
    image_url: "/cristianoBull-red.svg",
    market_cap: 10443139,
    price: 0.01044,
    volume_24h: 1355801.71,
    change_24h: 25.95,
    tokens_burned: 22100000,
    live_holders: 8900,
  },
  {
    id: "lamine",
    name: "Lamine Bull",
    nation: "Spain",
    flag: "🇪🇸",
    ticker_symbol: "LAMIBULL",
    accent: "#E0B000",
    contract: "hf34pZHnV4entu9bdp4pFEmeKpivEUeSUhASgWopump",
    pair_address: "91b1Q46q5dif6GNubbRfgMY3XgcuzTofhnssTdpG5Uqw",
    image_url: "/laminebull-yellow.svg",
    market_cap: 1407167,
    price: 0.001407,
    volume_24h: 22642.36,
    change_24h: 6.53,
    tokens_burned: 0,
    live_holders: 0,
    debut_date: "2026-06-30T00:00:00Z",
  },
];

async function migrate() {
  console.log("Starting migration...");

  for (const player of INITIAL_PLAYERS) {
    const { 
      id, name, nation, flag, ticker_symbol, accent, contract, 
      pair_address, image_url, debut_date,
      market_cap, price, volume_24h, change_24h, tokens_burned, live_holders 
    } = player;

    console.log(`Migrating player: ${name}...`);

    // Insert to players table
    const { error: playerError } = await supabase
      .from('players')
      .upsert({
        id, name, nation, flag, ticker_symbol, accent, contract, pair_address, image_url, debut_date
      });

    if (playerError) {
      console.error(`Error inserting player ${id}:`, playerError.message);
      continue;
    }

    // Insert to player_stats table
    const { error: statsError } = await supabase
      .from('player_stats')
      .upsert({
        player_id: id,
        market_cap, price, volume_24h, change_24h, tokens_burned, live_holders
      });

    if (statsError) {
      console.error(`Error inserting stats for ${id}:`, statsError.message);
    }
  }

  console.log("Migration completed.");
}

migrate();
