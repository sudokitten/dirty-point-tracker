const RANK_ORDER = ['CHALLENGER', 'GRANDMASTER', 'MASTER', 'DIAMOND', 'EMERALD', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'IRON'];
const DIVISION_ORDER = ['I', 'II', 'III', 'IV'];

export function compareRanks(a, b) {
  if (!a?.tier) return 1;
  if (!b?.tier) return -1;
  const idxA = RANK_ORDER.indexOf(a.tier.toUpperCase());
  const idxB = RANK_ORDER.indexOf(b.tier.toUpperCase());
  if (idxA !== idxB) return idxA - idxB;
  const divA = DIVISION_ORDER.indexOf(a.rank);
  const divB = DIVISION_ORDER.indexOf(b.rank);
  if (divA !== divB) return divA - divB;
  return (b.leaguePoints || 0) - (a.leaguePoints || 0);
}

export function calculateLpDifference(rankA, rankB) {
  if (!rankA || !rankB) return null;
  const tierLpA = (RANK_ORDER.length - RANK_ORDER.indexOf(rankA.tier.toUpperCase())) * 400
    + (4 - DIVISION_ORDER.indexOf(rankA.rank || 'IV')) * 100
    + (rankA.leaguePoints || 0);
  const tierLpB = (RANK_ORDER.length - RANK_ORDER.indexOf(rankB.tier.toUpperCase())) * 400
    + (4 - DIVISION_ORDER.indexOf(rankB.rank || 'IV')) * 100
    + (rankB.leaguePoints || 0);
  return tierLpA - tierLpB;
}

export function getHighestRanked(players) {
  const rankedPlayers = players.filter(p => p.rank?.tier);
  if (rankedPlayers.length === 0) return null;

  const sorted = [...rankedPlayers].sort((a, b) => compareRanks(a.rank, b.rank));
  return sorted[0]?.puuid;
}

export function normalizeRank(rankObj) {
  if (!rankObj || !rankObj.tier) return null;
  return {
    tier: rankObj.tier,
    rank: rankObj.rank,
    lp: rankObj.leaguePoints,
    wins: rankObj.wins || 0,
    losses: rankObj.losses || 0,
    wr: (rankObj.wins != null && rankObj.losses != null)
      ? Math.round((rankObj.wins / (rankObj.wins + rankObj.losses)) * 100)
      : 0
  };
}
