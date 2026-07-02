import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Metric maps for each championship
    const metrics = {
      'goat': 'market_cap',
      'burn': 'tokens_burned',
      'holder': 'live_holders'
    }

    const championships = ['goat', 'burn', 'holder'];

    for (const champId of championships) {
      console.log(`Processing championship: ${champId}`);
      
      // 1. Get current tournament
      const { data: tournaments, error: tErr } = await supabaseClient
        .from('tournaments')
        .select('*')
        .eq('championship_id', champId)
        .in('status', ['active', 'waiting'])
        .order('created_at', { ascending: false })
        .limit(1)

      let currentTournament = tournaments && tournaments.length > 0 ? tournaments[0] : null;

      if (!currentTournament) {
        // Init first tournament ever
        currentTournament = await startNewTournament(supabaseClient, champId, metrics[champId]);
        continue;
      }

      const now = new Date();
      const endTime = new Date(currentTournament.end_time);

      if (currentTournament.status === 'active') {
        // Resolve matches if times have passed
        const { data: matches } = await supabaseClient
          .from('matches')
          .select('*')
          .eq('tournament_id', currentTournament.id);

        for (const match of matches) {
          if (!match.winner_id && match.player1_id && match.player2_id && new Date(match.match_time) <= now) {
            // resolve winner
            const winnerId = await resolveWinner(supabaseClient, match.player1_id, match.player2_id, metrics[champId]);
            await supabaseClient.from('matches').update({ winner_id: winnerId }).eq('id', match.id);

            // if it's semifinal, advance to final
            if (!match.is_final) {
              const { data: finals } = await supabaseClient
                .from('matches')
                .select('*')
                .eq('tournament_id', currentTournament.id)
                .eq('is_final', true)
                .limit(1);
              
              if (finals && finals.length > 0) {
                const finalMatch = finals[0];
                if (!finalMatch.player1_id) {
                  await supabaseClient.from('matches').update({ player1_id: winnerId }).eq('id', finalMatch.id);
                } else if (!finalMatch.player2_id) {
                  await supabaseClient.from('matches').update({ player2_id: winnerId }).eq('id', finalMatch.id);
                }
              }
            } else {
              // It's the final, log to hall of fame
              await supabaseClient.from('hall_of_fame').insert({
                championship_id: champId,
                season_number: currentTournament.season_number,
                tournament_name: currentTournament.name,
                winner_player_id: winnerId,
                start_date: currentTournament.start_time,
                end_date: currentTournament.end_time
              });
            }
          }
        }

        // Check if tournament is over (2 days passed)
        if (now >= endTime) {
          await supabaseClient.from('tournaments')
            .update({ status: 'waiting' })
            .eq('id', currentTournament.id);
        }

      } else if (currentTournament.status === 'waiting') {
        // Cooldown is 1 day after end_time
        const cooldownEnd = new Date(endTime.getTime() + (24 * 60 * 60 * 1000));
        
        if (now >= cooldownEnd) {
          // Close old tournament
          await supabaseClient.from('tournaments')
            .update({ status: 'completed' })
            .eq('id', currentTournament.id);

          // Start new tournament
          await startNewTournament(supabaseClient, champId, metrics[champId], currentTournament.id, currentTournament.season_number + 1);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// HELPER: Resolve match winner based on stats
async function resolveWinner(supabase, p1, p2, metricColumn) {
  const { data: stats } = await supabase
    .from('player_stats')
    .select(`player_id, ${metricColumn}`)
    .in('player_id', [p1, p2]);
    
  if (!stats || stats.length < 2) return p1; // fallback
  
  const v1 = Number(stats.find(s => s.player_id === p1)?.[metricColumn] || 0);
  const v2 = Number(stats.find(s => s.player_id === p2)?.[metricColumn] || 0);
  
  return v1 >= v2 ? p1 : p2;
}

// HELPER: Start a new tournament
async function startNewTournament(supabase, champId, metricColumn, previousTournamentId = null, newSeasonNumber = 3) {
  // 1. Get Top 4
  const { data: stats } = await supabase
    .from('player_stats')
    .select(`player_id, ${metricColumn}`)
    .order(metricColumn, { ascending: false })
    .limit(4);

  if (!stats || stats.length < 4) return null; // Not enough players

  let players = stats.map(s => s.player_id);

  // 2. Fetch previous bracket for anti-repetition
  let previousPairs = [];
  if (previousTournamentId) {
    const { data: prevMatches } = await supabase
      .from('matches')
      .select('player1_id, player2_id')
      .eq('tournament_id', previousTournamentId)
      .eq('is_final', false);
      
    if (prevMatches) {
      previousPairs = prevMatches.map(m => [m.player1_id, m.player2_id].sort().join('-'));
    }
  }

  // 3. Shuffle until different from previous
  let p1, p2, p3, p4;
  let attempts = 0;
  while (attempts < 10) {
    // Fisher-Yates shuffle
    let shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    [p1, p2, p3, p4] = shuffled;
    const currentPairs = [
      [p1, p2].sort().join('-'),
      [p3, p4].sort().join('-')
    ];
    
    // Check intersection with previousPairs
    const isSame = currentPairs.some(pair => previousPairs.includes(pair));
    if (!isSame) break; // found a unique combo!
    attempts++;
  }

  // 4. Create new tournament
  const now = new Date();
  const startTime = now.toISOString();
  const sfTime = new Date(now.getTime() + (24 * 60 * 60 * 1000)).toISOString(); // 1 day for SF
  const finalTime = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString(); // 2 days for Final

  const { data: tData } = await supabase
    .from('tournaments')
    .insert({
      championship_id: champId,
      season_number: newSeasonNumber,
      name: `Season ${newSeasonNumber}`,
      status: 'active',
      start_time: startTime,
      end_time: finalTime
    })
    .select()
    .single();

  const tId = tData.id;

  // 5. Create matches
  await supabase.from('matches').insert([
    {
      tournament_id: tId,
      round_name: 'SEMI-FINAL 1',
      player1_id: p1,
      player2_id: p2,
      match_time: sfTime,
      is_final: false
    },
    {
      tournament_id: tId,
      round_name: 'SEMI-FINAL 2',
      player1_id: p3,
      player2_id: p4,
      match_time: sfTime,
      is_final: false
    },
    {
      tournament_id: tId,
      round_name: 'THE FINAL',
      player1_id: null,
      player2_id: null,
      match_time: finalTime,
      is_final: true
    }
  ]);

  return tData;
}
