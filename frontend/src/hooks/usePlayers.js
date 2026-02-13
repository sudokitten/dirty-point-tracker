import { useQuery } from '@tanstack/react-query';
import { fetchPlayers } from '../api/client.js';

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
