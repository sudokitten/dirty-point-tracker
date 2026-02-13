export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchPlayers() {
  const response = await fetch(`${API_BASE_URL}/players`);
  if (!response.ok) throw new Error('Failed to fetch players');
  const data = await response.json();
  return data.players || [];
}

export async function fetchMatches(puuid) {
  const response = await fetch(`${API_BASE_URL}/players/${puuid}/matches`);
  if (!response.ok) throw new Error('Failed to fetch matches');
  const data = await response.json();
  return data.matches || [];
}

export async function fetchTimeline(matchId, puuid) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}/timeline/${puuid}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Failed to fetch timeline');
    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
