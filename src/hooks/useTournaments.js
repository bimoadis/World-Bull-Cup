import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useTournamentsData = () => {
  return useQuery({
    queryKey: ['tournamentsData'],
    queryFn: async () => {
      // 1. Fetch active/waiting tournaments
      const { data: tournaments, error: tErr } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['active', 'waiting'])
        .order('created_at', { ascending: false });

      if (tErr) throw tErr;

      // 2. Fetch matches for those tournaments
      const tournamentIds = tournaments.map(t => t.id);
      let matches = [];
      if (tournamentIds.length > 0) {
        const { data: mData, error: mErr } = await supabase
          .from('matches')
          .select('*')
          .in('tournament_id', tournamentIds);
        if (mErr) throw mErr;
        matches = mData;
      }

      // 3. Fetch Hall of Fame
      const { data: hallOfFame, error: hErr } = await supabase
        .from('hall_of_fame')
        .select('*')
        .order('created_at', { ascending: false });
      if (hErr) throw hErr;

      return { tournaments, matches, hallOfFame };
    },
    refetchInterval: 60_000, // Refetch every 1 min
  });
};
