class CacheManager {
  constructor() {
    this.cache = {
      players: new Map(),
      matches: new Map()
    };
    this.CACHE_TTL = 5 * 60 * 1000;
  }

  isStale(timestamp) {
    return Date.now() - timestamp > this.CACHE_TTL;
  }

  setPlayer(puuid, playerData) {
    this.cache.players.set(puuid, {
      ...playerData,
      cachedAt: Date.now()
    });
  }

  getPlayer(puuid) {
    return this.cache.players.get(puuid);
  }

  getAllPlayers() {
    return Array.from(this.cache.players.values());
  }

  updatePlayerRank(puuid, rankData) {
    const player = this.cache.players.get(puuid);
    if (player) {
      player.rankData = {
        ...rankData,
        cachedAt: Date.now()
      };
      this.cache.players.set(puuid, player);
    }
  }

  updatePlayerRankEntries(puuid, entries) {
    const player = this.cache.players.get(puuid);
    if (player) {
      player.rankEntries = entries;
      player.rankEntriesCachedAt = Date.now();
      this.cache.players.set(puuid, player);
    }
  }

  updatePlayerMatchHistory(puuid, matchIds) {
    const player = this.cache.players.get(puuid);
    if (player) {
      player.matchHistory = {
        matchIds: matchIds.slice(0, 20),
        lastMatchId: matchIds[0] || null,
        cachedAt: Date.now()
      };
      this.cache.players.set(puuid, player);
    }
  }

  shouldUpdateRank(puuid) {
    const player = this.cache.players.get(puuid);
    if (!player || !player.rankData) return true;
    return this.isStale(player.rankData.cachedAt);
  }

  hasNewMatches(puuid, latestMatchId) {
    const player = this.cache.players.get(puuid);
    if (!player || !player.matchHistory.lastMatchId) return true;
    return player.matchHistory.lastMatchId !== latestMatchId;
  }

  setMatch(matchId, matchData) {
    this.cache.matches.set(matchId, {
      ...matchData,
      cachedAt: Date.now()
    });
  }

  getMatch(matchId) {
    return this.cache.matches.get(matchId);
  }

  getMatchesForPlayer(matchIds) {
    return matchIds
      .map(id => this.cache.matches.get(id))
      .filter(match => match !== undefined);
  }

  getCacheStats() {
    return {
      playersCount: this.cache.players.size,
      matchesCount: this.cache.matches.size,
      players: this.getAllPlayers().map(p => ({
        gameName: p.gameName,
        tagLine: p.tagLine,
        lastUpdate: new Date(p.cachedAt).toISOString()
      }))
    };
  }

  pruneOldMatches(maxAge = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    for (const [matchId, match] of this.cache.matches.entries()) {
      if (now - match.cachedAt > maxAge) {
        this.cache.matches.delete(matchId);
      }
    }
  }

    updatePlayerFlexRank() {
      // Stub: implement logic if needed
      return;
    }
}

export default CacheManager;
