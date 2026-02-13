import { useQuery } from '@tanstack/react-query';
import { fetchMatches } from '../api/client.js';

export function useMatches(puuid) {
  return useQuery({
    queryKey: ['matches', puuid],
    queryFn: () => fetchMatches(puuid),
    enabled: !!puuid,
    staleTime: 60_000,
  });
}
