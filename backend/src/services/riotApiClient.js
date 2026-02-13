import axios from 'axios';

class RiotApiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.rateLimiter = {
      perSecond: { count: 0, resetAt: Date.now() + 1000 },
      perTwoMinutes: { count: 0, resetAt: Date.now() + 120000 }
    };
  }

  // Helper to get correct base URL for endpoint type
  getBaseUrl(type, routingRegion = 'americas', platformRegion = 'na1') {
    // type: 'match', 'account', 'summoner', 'league', 'spectator', 'status'
    if (type === 'match' || type === 'account') {
      // Regional routing: americas, europe, asia, sea
      return `https://${routingRegion}.api.riotgames.com`;
    }
    // All others use platformRegion (e.g. na1, euw1, kr)
    return `https://${platformRegion}.api.riotgames.com`;
  }

  async waitForRateLimit() {
    const now = Date.now();
    
    if (now >= this.rateLimiter.perSecond.resetAt) {
      this.rateLimiter.perSecond = { count: 0, resetAt: now + 1000 };
    }
    if (now >= this.rateLimiter.perTwoMinutes.resetAt) {
      this.rateLimiter.perTwoMinutes = { count: 0, resetAt: now + 120000 };
    }

    if (this.rateLimiter.perSecond.count >= 20) {
      const waitTime = this.rateLimiter.perSecond.resetAt - now;
      await new Promise(resolve => setTimeout(resolve, waitTime + 10));
      return this.waitForRateLimit();
    }

    if (this.rateLimiter.perTwoMinutes.count >= 100) {
      const waitTime = this.rateLimiter.perTwoMinutes.resetAt - now;
      await new Promise(resolve => setTimeout(resolve, waitTime + 10));
      return this.waitForRateLimit();
    }

    this.rateLimiter.perSecond.count++;
    this.rateLimiter.perTwoMinutes.count++;
  }

  async makeRequest(url, region = 'americas') {
    await this.waitForRateLimit();

    try {
      const response = await axios.get(url, {
        headers: { 'X-Riot-Token': this.apiKey },
        timeout: 30000 // Increased timeout to 30 seconds
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 5;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.makeRequest(url, region);
      }
      throw error;
    }
  }

  async getAccountByRiotId(gameName, tagLine, routingRegion = 'americas') {
    // Use routing region (americas, europe, asia, sea) for account-v1
    const url = `${this.getBaseUrl('account', routingRegion)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    return this.makeRequest(url, routingRegion);
  }

  async getSummonerByPuuid(puuid, platformRegion = 'na1') {
    // summoner-v4 uses platformRegion
    const url = `${this.getBaseUrl('summoner', null, platformRegion)}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    return this.makeRequest(url, platformRegion);
  }

  async getRankByPuuid(puuid, platformRegion = 'na1') {
    // league-v4 uses platformRegion
    const url = `${this.getBaseUrl('league', null, platformRegion)}/lol/league/v4/entries/by-puuid/${puuid}`;
    return this.makeRequest(url, platformRegion);
  }

  async getMatchIdsByPuuid(puuid, count = 5, routingRegion = 'americas', start = 0, startTime = null) {
    // match-v5 uses routing region (americas, europe, asia, sea)
    let url = `${this.getBaseUrl('match', routingRegion)}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
    if (startTime) {
      url += `&startTime=${startTime}`;
    }
    return this.makeRequest(url, routingRegion);
  }

  async getMatchById(matchId, routingRegion = 'americas') {
    // match-v5 uses routing region (americas, europe, asia, sea)
    const url = `${this.getBaseUrl('match', routingRegion)}/lol/match/v5/matches/${matchId}`;
    return this.makeRequest(url, routingRegion);
  }

  async getMatchTimeline(matchId, routingRegion = 'americas') {
    // match-v5 timeline endpoint
    const url = `${this.getBaseUrl('match', routingRegion)}/lol/match/v5/matches/${matchId}/timeline`;
    return this.makeRequest(url, routingRegion);
  }
}

export default RiotApiClient;
