require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Querying players table...");
  let res = await supabase.from('players').select('*');
  console.log("players list:");
  console.log(JSON.stringify(res.data, null, 2));
}

run().catch(console.error);
