import cron from 'node-cron';
import DatabaseManager from './database.js';

class PollingService {
  constructor(riotApiClient, cacheManager, trackedPlayers) {
    this.riotApi = riotApiClient;
    this.cache = cacheManager;
    this.trackedPlayers = trackedPlayers; // Initial list from file (for bootstrapping)
    this.isPolling = false;
    this.db = new DatabaseManager();
    this.BASELINE_MODE = true;
    this.MAX_MATCH_FETCH_PER_CYCLE = 50;
  }

  async initializePlayers() {
    console.log('=== PHASE 1: BASELINE INITIALIZATION ===');

    // First, ensure all players from trackedPlayers.js are in DB and marked as tracked
    for (const tracked of this.trackedPlayers) {
      try {
        await this.initializePlayer(tracked);
        const allPlayers = await this.db.getAllPlayers();
        const player = allPlayers.find(
          p => p.game_name === tracked.gameName && p.tag_line === tracked.tagLine
        );
        if (player) {
          // Mark as tracked in database
          await this.db.setPlayerTracked(player.puuid, true);
          await this.db.initializeSyncStatus(player.puuid, 30);
          console.log(`Initialized ${tracked.gameName}#${tracked.tagLine}`);
        }
      } catch (error) {
        console.error(`Failed to initialize ${tracked.gameName}#${tracked.tagLine}:`, error.message);
      }
    }

    await this.runBaselineSync();

    this.BASELINE_MODE = false;
    this.MAX_MATCH_FETCH_PER_CYCLE = 8;
    console.log('=== PHASE 2: MAINTENANCE MODE ACTIVATED ===');
  }

  async initializePlayer(tracked) {
    const account = await this.riotApi.getAccountByRiotId(tracked.gameName, tracked.tagLine);
    if (!account || !account.puuid) throw new Error('Could not fetch account info');

    let summoner = null;
    try {
      summoner = await this.riotApi.getSummonerByPuuid(account.puuid, tracked.platformRegion || 'na1');
    } catch (e) {}

    await this.db.upsertPlayer({
      puuid: account.puuid,
      gameName: tracked.gameName,
      tagLine: tracked.tagLine,
      summonerId: summoner?.id || null,
      accountId: summoner?.accountId || null,
      profileIconId: summoner?.profileIconId || null,
      summonerLevel: summoner?.summonerLevel || null,
      platformRegion: tracked.platformRegion || 'na1',
      routingRegion: tracked.routingRegion || 'americas',
      last_updated: Date.now(),
    }, true); // Mark as tracked
  }

  async runBaselineSync() {
    console.log('Starting baseline data sync...');

    // Get tracked players from database
    const players = await this.db.getTrackedPlayers();

    let totalRequests = 0;

    for (const player of players) {
      const syncStatus = await this.db.getSyncStatus(player.puuid);

      if (syncStatus && syncStatus.is_fully_synced) {
        console.log(`${player.game_name} already synced, skipping`);
        continue;
      }

      console.log(`\n--- Syncing ${player.game_name} ---`);

      // STEP 1: Sync rank data
      if (!syncStatus || !syncStatus.rank_synced) {
        console.log('Fetching rank data...');
        await this.updateRankData(player);
        await this.db.updateSyncStatus(player.puuid, {
          rank_synced: true,
          last_sync_attempt: Date.now()
        });
        totalRequests += 1;
      }

// STEP 2: Sync match history (2026 ranked solo queue only)
const START_TIME_2026 = 1735689600; // Jan 1, 2026 UTC
const currentMatchCount = await this.db.getMatchCount(player.puuid, [420]);
const targetCount = syncStatus ? syncStatus.target_match_count : 30;
const needed = targetCount - currentMatchCount;

if (needed > 0) {
  console.log(`Need ${needed} more ranked solo queue matches (have ${currentMatchCount}/${targetCount})...`);

  const rankedMatches = [];
  let start = 0;
  const batchSize = 20;
  let windowRequests = 0;
  let windowStart = Date.now();

  // Paginate through ALL available 2026 matches (no offset cap)
  while (rankedMatches.length < targetCount) {
    console.log(`Fetching 2026 matches ${start}-${start + batchSize}...`);

    const matchIds = await this.riotApi.getMatchIdsByPuuid(
      player.puuid,
      batchSize,
      player.routing_region,
      start,
      START_TIME_2026
    );
    windowRequests += 1;

    if (matchIds.length === 0) {
      console.log('No more 2026 matches available');
      break;
    }

    // Check each match to see if it's ranked solo queue
    for (const matchId of matchIds) {
      if (rankedMatches.length >= targetCount) break;

      // Skip if already in DB
      const exists = await this.db.matchExists(matchId);
      if (exists) {
        // Count it if it's a solo queue match we already have
        const existingCount = await this.db.getMatchCount(player.puuid, [420]);
        if (existingCount >= targetCount) {
          console.log(`Already have ${existingCount} solo queue matches in DB`);
          break;
        }
        continue;
      }

      try {
        // 1.2s delay between individual match fetches
        await new Promise(resolve => setTimeout(resolve, 1200));

        const matchData = await this.riotApi.getMatchById(
          matchId,
          player.routing_region
        );
        windowRequests += 1;

        // Only count ranked solo queue (420), not flex (440)
        if (matchData.info.queueId === 420) {
          rankedMatches.push({ matchId, matchData });
          console.log(`✓ Found Solo match ${matchId} (${rankedMatches.length}/${targetCount})`);
        } else if (matchData.info.queueId === 440) {
          console.log(`⊘ Skipped Flex match ${matchId}`);
        } else {
          console.log(`⊘ Skipped non-ranked (queue: ${matchData.info.queueId})`);
        }

        // Rate limit: pause for remainder of 2min window at 80 requests
        if (windowRequests >= 80) {
          const elapsed = Date.now() - windowStart;
          const remainingWait = Math.max(0, 120000 - elapsed);
          console.log(`⚠️  Hit 80 requests in window, pausing ${Math.ceil(remainingWait / 1000)}s...`);
          await new Promise(resolve => setTimeout(resolve, remainingWait + 1000));
          windowRequests = 0;
          windowStart = Date.now();
        }
      } catch (error) {
        console.error(`Failed to fetch ${matchId}: ${error.message}`);
      }
    }

    start += batchSize;

    if (rankedMatches.length >= targetCount) {
      console.log(`Found ${targetCount} ranked solo queue matches!`);
      break;
    }
  }

  // Store all the ranked matches we found
  let stored = 0;
  let failed = 0;
  for (const match of rankedMatches) {
    try {
      await this.db.insertMatch(this.simplifyMatchData(match.matchData));
      stored++;
    } catch (error) {
      console.error(`Failed to store match ${match.matchData.metadata.matchId}:`, error.message);
      failed++;
    }
  }

  if (failed > 0) {
    console.log(`${player.game_name}: Stored ${stored} new solo queue matches (${failed} failed)`);
  } else {
    console.log(`${player.game_name}: Stored ${stored} new solo queue matches`);
  }
}

const finalCount = await this.db.getMatchCount(player.puuid, [420]);
const isFullySynced = finalCount >= targetCount;

await this.db.updateSyncStatus(player.puuid, {
  matches_synced: finalCount,
  is_fully_synced: isFullySynced,
  last_sync_attempt: Date.now()
});

      console.log('Waiting 3 seconds before next player...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('\n=== BASELINE SYNC COMPLETE ===');
    console.log(`Total API requests: ${totalRequests}`);
  }

async updatePlayerData(puuid) {
  const player = await this.db.getPlayer(puuid);
  if (!player) return;

  if (this.BASELINE_MODE) return;

  // Update rank if stale
  const shouldUpdate = await this.db.shouldUpdateRank(puuid, 'RANKED_SOLO_5x5');
  if (shouldUpdate) {
    await this.updateRankData(player);
  }

  // Fetch recent matches and check for new ranked ones
  const matchIds = await this.riotApi.getMatchIdsByPuuid(player.puuid, 20, player.routing_region);

  if (matchIds.length === 0) return;

  const latestStored = await this.db.getLatestMatchId(puuid, [420, 440]);
  const latestApi = matchIds[0];

  if (latestStored === latestApi) {
    console.log(`No new matches for ${player.game_name}`);
    return;
  }

  console.log(`Checking for new matches for ${player.game_name}...`);

  // Collect all new match IDs until we hit the latest stored one
  const newMatchIds = [];
  for (const matchId of matchIds) {
    if (matchId === latestStored) break;
    newMatchIds.push(matchId);
  }

  console.log(`Found ${newMatchIds.length} potential new matches`);

  let newRankedCount = 0;

  for (const matchId of newMatchIds) {
    if (newRankedCount >= this.MAX_MATCH_FETCH_PER_CYCLE) {
      console.log(`Hit limit (${this.MAX_MATCH_FETCH_PER_CYCLE}), will check rest next cycle`);
      break;
    }

    try {
      const matchData = await this.riotApi.getMatchById(matchId, player.routing_region);

      if ([420, 440].includes(matchData.info.queueId)) {
        await this.db.insertMatch(this.simplifyMatchData(matchData));
        newRankedCount++;
        const queueType = matchData.info.queueId === 420 ? 'Solo' : 'Flex';
        console.log(`✓ Cached new ${queueType} match ${matchId}`);
      } else {
        console.log(`⊘ Skipped non-ranked match (queue: ${matchData.info.queueId})`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to fetch ${matchId}: ${error.message}`);
    }
  }

  console.log(`Added ${newRankedCount} new ranked matches for ${player.game_name}`);
}

  async updateRankData(player) {
    try {
      const rankData = await this.riotApi.getRankByPuuid(
        player.puuid,
        player.platform_region
      );

      const soloQueue = rankData.find(q => q.queueType === 'RANKED_SOLO_5x5');
      const flexQueue = rankData.find(q => q.queueType === 'RANKED_FLEX_SR');

      if (soloQueue) {
        await this.db.insertRank(player.puuid, 'RANKED_SOLO_5x5', {
          tier: soloQueue.tier,
          rank: soloQueue.rank,
          leaguePoints: soloQueue.leaguePoints,
          wins: soloQueue.wins,
          losses: soloQueue.losses
        });
        console.log(`Updated Solo rank for ${player.game_name}: ${soloQueue.tier} ${soloQueue.rank}`);
      }

      if (flexQueue) {
        await this.db.insertRank(player.puuid, 'RANKED_FLEX_SR', {
          tier: flexQueue.tier,
          rank: flexQueue.rank,
          leaguePoints: flexQueue.leaguePoints,
          wins: flexQueue.wins,
          losses: flexQueue.losses
        });
        console.log(`Updated Flex rank for ${player.game_name}: ${flexQueue.tier} ${flexQueue.rank}`);
      }
    } catch (error) {
      console.error(`Failed to update rank for ${player.game_name}:`, error.message);
    }
  }

  simplifyMatchData(rawMatch) {
    return {
      matchId: rawMatch.metadata.matchId,
      gameCreation: rawMatch.info.gameCreation,
      queueId: rawMatch.info.queueId,
      gameDuration: rawMatch.info.gameDuration,
      gameMode: rawMatch.info.gameMode,
      participants: rawMatch.info.participants.map(p => ({
        puuid: p.puuid,
        summonerName: p.riotIdGameName || p.summonerName,
        championId: p.championId,
        championName: p.championName,
        teamId: p.teamId,
        win: p.win,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
        summoner1Id: p.summoner1Id,
        summoner2Id: p.summoner2Id,
        // Riot API sometimes uses minionsKilled and jungleMinionsKilled
        totalMinionsKilled: p.totalMinionsKilled ?? p.minionsKilled ?? 0,
        neutralMinionsKilled: p.neutralMinionsKilled ?? p.jungleMinionsKilled ?? 0,
        totalDamageDealtToChampions: p.totalDamageDealtToChampions || 0,
        goldEarned: p.goldEarned || 0,
        visionScore: p.visionScore || 0,
        detectorWardsPlaced: p.detectorWardsPlaced || 0,
        // Pass through full perks object for database storage
        perks: p.perks || null,
        // Rune fields for frontend
        primaryRuneId: p.perks?.styles?.[0]?.selections?.[0]?.perk || null,
        secondaryStyleId: p.perks?.styles?.[1]?.style || null
      }))
    };
  }

  async pollAllPlayers() {
  if (this.isPolling) {
    console.log('Poll already in progress, skipping...');
    return;
  }

  this.isPolling = true;
  console.log(`[${new Date().toISOString()}] Starting poll cycle...`);

  try {
    // Get tracked players from database
    const playersToUpdate = await this.db.getTrackedPlayers();

    console.log(`Polling ${playersToUpdate.length} tracked players`);

    for (const player of playersToUpdate) {
      try {
        await this.updatePlayerData(player.puuid);
      } catch (error) {
        console.error(`Failed to update ${player.game_name}:`, error.message || error);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Poll cycle complete');
  } catch (error) {
    console.error('Poll cycle failed:', error.message || error);
  } finally {
    this.isPolling = false;
  }
}

  startPolling() {
    const poll = async () => {
      try {
        if (!this.BASELINE_MODE) {
          await this.pollAllPlayers();
        }
      } catch (error) {
        console.error('Poll error:', error.message || error);
      }
    };

    this._interval = setInterval(poll, 5 * 60 * 1000);
    setTimeout(poll, 5000);
    console.log('Polling service started (every 5 minutes)');
  }
}

export default PollingService;
