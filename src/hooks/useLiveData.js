import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const usePlayersData = (autoRefresh = true) => {
  return useQuery({
    queryKey: ['playersData'],
    queryFn: async () => {
      // Panggil Supabase Edge Function get-live-data
      const { data, error } = await supabase.functions.invoke('get-live-data');
      if (error) throw error;
      
      // format response to array of players
      return data.data; 
    },
    refetchInterval: autoRefresh ? 30_000 : false,
    staleTime: 10_000,
  });
};
