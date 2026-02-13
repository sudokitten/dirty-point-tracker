import { useQuery } from '@tanstack/react-query';
import { fetchTimeline } from '../api/client.js';

export function useMatchTimeline(matchId, puuid) {
  return useQuery({
    queryKey: ['timeline', matchId, puuid],
    queryFn: () => fetchTimeline(matchId, puuid),
    enabled: !!matchId && !!puuid,
    staleTime: Infinity,
    retry: 0,
  });
}
