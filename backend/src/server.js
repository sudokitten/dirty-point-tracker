import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import RiotApiClient from './services/riotApiClient.js';
import CacheManager from './services/cacheManager.js';
import PollingService from './services/pollingService.js';
import DatabaseManager from './services/database.js';
import { TRACKED_PLAYERS } from './trackedPlayers.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DEPLOYED_FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (same-origin, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any Vercel preview/deployment URL
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true
}));

app.options('*', cors());
app.use(express.json());

const riotApi = new RiotApiClient(process.env.RIOT_API_KEY);
const cache = new CacheManager();
const db = new DatabaseManager();
const pollingService = new PollingService(riotApi, cache, TRACKED_PLAYERS);

app.get('/api/players', async (req, res) => {
  try {
    // Get all tracked players from database
    const trackedPlayers = await db.getTrackedPlayers();

    const players = await Promise.all(trackedPlayers.map(async (player) => {
      const soloRank = await db.getLatestRank(player.puuid, 'RANKED_SOLO_5x5');
      const flexRank = await db.getLatestRank(player.puuid, 'RANKED_FLEX_SR');
      const winStreak = await db.getWinStreak(player.puuid, [420]); // Solo queue only

      return {
        puuid: player.puuid,
        gameName: player.game_name,
        tagLine: player.tag_line,
        profileIconId: player.profile_icon_id,
        summonerLevel: player.summoner_level,
        winStreak,
        rank: soloRank ? {
          tier: soloRank.tier,
          rank: soloRank.rank,
          leaguePoints: soloRank.league_points,
          wins: soloRank.wins,
          losses: soloRank.losses,
          winRate: calculateWinRate(soloRank.wins, soloRank.losses),
          queueType: 'RANKED_SOLO_5x5'
        } : null,
        flexRank: flexRank ? {
          tier: flexRank.tier,
          rank: flexRank.rank,
          leaguePoints: flexRank.league_points,
          wins: flexRank.wins,
          losses: flexRank.losses,
          winRate: calculateWinRate(flexRank.wins, flexRank.losses),
          queueType: 'RANKED_FLEX_SR'
        } : null
      };
    }));

    res.json({ players });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.get('/api/players/:puuid', async (req, res) => {
  try {
    const player = await db.getPlayer(req.params.puuid);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const soloRank = await db.getLatestRank(player.puuid, 'RANKED_SOLO_5x5');
    const flexRank = await db.getLatestRank(player.puuid, 'RANKED_FLEX_SR');

    const rankEntries = [];
    if (soloRank) {
      rankEntries.push({
        queueType: 'RANKED_SOLO_5x5',
        tier: soloRank.tier,
        rank: soloRank.rank,
        leaguePoints: soloRank.league_points,
        wins: soloRank.wins,
        losses: soloRank.losses
      });
    }
    if (flexRank) {
      rankEntries.push({
        queueType: 'RANKED_FLEX_SR',
        tier: flexRank.tier,
        rank: flexRank.rank,
        leaguePoints: flexRank.league_points,
        wins: flexRank.wins,
        losses: flexRank.losses
      });
    }

    res.json({
      puuid: player.puuid,
      gameName: player.game_name,
      tagLine: player.tag_line,
      profileIconId: player.profile_icon_id,
      summonerLevel: player.summoner_level,
      rankEntries
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

app.get('/api/players/:puuid/matches', async (req, res) => {
  try {
    const player = await db.getPlayer(req.params.puuid);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const matches = await db.getPlayerMatches(player.puuid, 30, [420, 440]);

    const formattedMatches = matches.map(match => {
      const playerData = match.participants.find(p => p.puuid === player.puuid);

      if (!playerData) {
        return null;
      }

      return {
        matchId: match.matchId,
        gameCreation: match.gameCreation,
        gameDuration: match.gameDuration,
        gameMode: match.gameMode,
        queueId: match.queueId,
        queueType: match.queueId === 420 ? 'Ranked Solo' : 'Ranked Flex',
        result: playerData.win ? 'win' : 'loss',
        champion: {
          id: playerData.championId,
          name: playerData.championName
        },
        kda: {
          kills: playerData.kills,
          deaths: playerData.deaths,
          assists: playerData.assists,
          ratio: calculateKDA(playerData.kills, playerData.deaths, playerData.assists)
        },
        items: playerData.items,
        summoner1Id: playerData.summoner1Id,
        summoner2Id: playerData.summoner2Id,
        perks: playerData.perks,
        participants: formatParticipants(match.participants)
      };
    }).filter(m => m !== null);

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get item timeline for a specific match and player
app.get('/api/matches/:matchId/timeline/:puuid', async (req, res) => {
  try {
    const { matchId, puuid } = req.params;

    // Get player to determine their routing region
    const player = await db.getPlayer(puuid);
    const routingRegion = player?.routing_region || 'americas';

    // Fetch timeline from Riot API
    const timeline = await riotApi.getMatchTimeline(matchId, routingRegion);

    if (!timeline || !timeline.info) {
      return res.status(404).json({ error: 'Timeline not found' });
    }

    // Find participant ID for this puuid
    const participantMapping = timeline.info.participants?.find(p => p.puuid === puuid);
    const participantId = participantMapping?.participantId;

    if (!participantId) {
      return res.status(404).json({ error: 'Player not found in match' });
    }

    // Extract item events for this player
    const itemEvents = [];
    const skillLevelUps = [];
    const frames = timeline.info.frames || [];

    for (const frame of frames) {
      const events = frame.events || [];
      for (const event of events) {
        if (event.participantId === participantId) {
          if (event.type === 'ITEM_PURCHASED') {
            itemEvents.push({
              type: 'purchase',
              itemId: event.itemId,
              timestamp: Math.floor(event.timestamp / 60000) // Convert to minutes
            });
          } else if (event.type === 'ITEM_SOLD') {
            itemEvents.push({
              type: 'sold',
              itemId: event.itemId,
              timestamp: Math.floor(event.timestamp / 60000)
            });
          } else if (event.type === 'ITEM_UNDO') {
            // Remove the last purchase of this item
            const lastPurchaseIdx = itemEvents.findLastIndex(
              e => e.itemId === event.beforeId && e.type === 'purchase'
            );
            if (lastPurchaseIdx !== -1) {
              itemEvents.splice(lastPurchaseIdx, 1);
            }
          } else if (event.type === 'SKILL_LEVEL_UP') {
            // skillSlot: 1=Q, 2=W, 3=E, 4=R
            const skillMap = { 1: 'Q', 2: 'W', 3: 'E', 4: 'R' };
            skillLevelUps.push({
              skill: skillMap[event.skillSlot] || '?',
              level: event.levelUpType === 'NORMAL' ? skillLevelUps.length + 1 : 0
            });
          }
        }
      }
    }

    // Group items by timestamp
    const groupedByTime = {};
    for (const event of itemEvents) {
      if (event.type === 'purchase') {
        if (!groupedByTime[event.timestamp]) {
          groupedByTime[event.timestamp] = [];
        }
        groupedByTime[event.timestamp].push(event.itemId);
      }
    }

    // Convert to array sorted by timestamp
    const itemTimeline = Object.entries(groupedByTime)
      .map(([timestamp, items]) => ({
        timestamp: parseInt(timestamp),
        items
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    res.json({ itemTimeline, skillOrder: skillLevelUps });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const players = await db.getAllPlayers();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      dbStats: {
        players: players.length,
        trackedPlayers: TRACKED_PLAYERS.length
      }
    });
  } catch (error) {
    res.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.send('dirty-pointr-tracker backend is running');
});

function calculateWinRate(wins, losses) {
  const total = wins + losses;
  return total > 0 ? Math.round((wins / total) * 100 * 10) / 10 : 0;
}

function calculateKDA(kills, deaths, assists) {
  return deaths === 0
    ? kills + assists
    : Math.round(((kills + assists) / deaths) * 100) / 100;
}

function formatParticipants(participants) {
  const blueTeam = participants.filter(p => p.teamId === 100);
  const redTeam = participants.filter(p => p.teamId === 200);

  return {
    blue: blueTeam.map(p => ({
      puuid: p.puuid,
      summonerName: p.summonerName,
      championId: p.championId,
      championName: p.championName,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      items: p.items,
      win: p.win,
      summoner1Id: p.summoner1Id,
      summoner2Id: p.summoner2Id,
      totalMinionsKilled: p.totalMinionsKilled || 0,
      neutralMinionsKilled: p.neutralMinionsKilled || 0,
      totalDamageDealtToChampions: p.totalDamageDealtToChampions || 0,
      goldEarned: p.goldEarned || 0,
      visionScore: p.visionScore || 0,
      detectorWardsPlaced: p.detectorWardsPlaced || 0,
      primaryStyleId: p.primaryStyleId,
      primaryRunes: p.primaryRunes || [],
      secondaryStyleId: p.secondaryStyleId,
      secondaryRunes: p.secondaryRunes || [],
      statShards: p.statShards || null,
      primaryRuneId: p.primaryRuneId
    })),
    red: redTeam.map(p => ({
      puuid: p.puuid,
      summonerName: p.summonerName,
      championId: p.championId,
      championName: p.championName,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      items: p.items,
      win: p.win,
      summoner1Id: p.summoner1Id,
      summoner2Id: p.summoner2Id,
      totalMinionsKilled: p.totalMinionsKilled || 0,
      neutralMinionsKilled: p.neutralMinionsKilled || 0,
      totalDamageDealtToChampions: p.totalDamageDealtToChampions || 0,
      goldEarned: p.goldEarned || 0,
      visionScore: p.visionScore || 0,
      detectorWardsPlaced: p.detectorWardsPlaced || 0,
      primaryStyleId: p.primaryStyleId,
      primaryRunes: p.primaryRunes || [],
      secondaryStyleId: p.secondaryStyleId,
      secondaryRunes: p.secondaryRunes || [],
      statShards: p.statShards || null,
      primaryRuneId: p.primaryRuneId
    }))
  };
}

async function startServer() {
  // Start HTTP server FIRST so Render detects the port
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });

  // Initialize tracked players in DB, then start polling
  try {
    await pollingService.initializePlayers();
    pollingService.startPolling();
    console.log('✅ Polling service started');
  } catch (error) {
    console.error('Failed to start polling:', error);
  }
}

startServer();

export { TRACKED_PLAYERS };
