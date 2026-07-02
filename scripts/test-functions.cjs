require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Querying players table...");
  let res = await supabase.from('players').select('*').limit(1);
  console.log("players row example:", res.data?.[0]);
}

run().catch(console.error);
