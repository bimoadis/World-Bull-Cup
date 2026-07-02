require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Invoking get-live-data...");
  let res1 = await supabase.functions.invoke('get-live-data');
  console.log("get-live-data response:", res1);

  console.log("Invoking tournament-manager...");
  let res2 = await supabase.functions.invoke('tournament-manager');
  console.log("tournament-manager response:", res2);
}

run().catch(console.error);
