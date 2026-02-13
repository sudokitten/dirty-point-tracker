import { TRACKED_PLAYERS } from '../trackedPlayers.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class DatabaseManager {
  constructor() {
    this.supabase = supabase;
    this.trackedList = TRACKED_PLAYERS.map(p => p.gameName + '#' + p.tagLine);
  }

  // ==================== PLAYER OPERATIONS ====================

  async upsertPlayer(playerData, isTracked = false) {
    const { error } = await this.supabase
      .from('players')
      .upsert({
        puuid: playerData.puuid,
        game_name: playerData.gameName,
        tag_line: playerData.tagLine,
        summoner_id: playerData.summonerId,
        account_id: playerData.accountId,
        profile_icon_id: playerData.profileIconId,
        summoner_level: playerData.summonerLevel,
        platform_region: playerData.platformRegion,
        routing_region: playerData.routingRegion,
        last_updated: Date.now(),
        is_tracked: isTracked
      }, { onConflict: 'puuid' });

    if (error) {
      throw error;
    }
  }

  async setPlayerTracked(puuid, isTracked = true) {
    const { error } = await this.supabase
      .from('players')
      .update({ is_tracked: isTracked })
      .eq('puuid', puuid);

    if (error) {
      throw error;
    }
  }

  async getTrackedPlayers() {
    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .eq('is_tracked', true);

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getPlayer(puuid) {
    const { data, error } = await this.supabase
      .from('players')
      .select('*')
      .eq('puuid', puuid)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  }

  async getAllPlayers() {
    const { data, error } = await this.supabase
      .from('players')
      .select('*');

    if (error) {
      throw error;
    }
    return data || [];
  }

  async deletePlayer(puuid) {
    // Due to CASCADE constraints, deleting from players will also delete:
    // - ranks
    // - player_sync_status
    // Note: match_participants won't be deleted as they reference matches, not players directly
    const { error } = await this.supabase
      .from('players')
      .delete()
      .eq('puuid', puuid);

    if (error) {
      throw error;
    }
    return true;
  }

  // ==================== RANK OPERATIONS ====================

  async insertRank(puuid, queueType, rankData) {
    const { error } = await this.supabase
      .from('ranks')
      .insert({
        puuid,
        queue_type: queueType,
        tier: rankData.tier,
        rank: rankData.rank,
        league_points: rankData.leaguePoints,
        wins: rankData.wins,
        losses: rankData.losses,
        timestamp: Date.now()
      });

    if (error) {
      throw error;
    }
  }

  async getLatestRank(puuid, queueType = 'RANKED_SOLO_5x5') {
    const { data, error } = await this.supabase
      .from('ranks')
      .select('*')
      .eq('puuid', puuid)
      .eq('queue_type', queueType)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  }

  async shouldUpdateRank(puuid, queueType = 'RANKED_SOLO_5x5') {
    const latestRank = await this.getLatestRank(puuid, queueType);
    if (!latestRank) return true;

    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return latestRank.timestamp < fiveMinutesAgo;
  }

  // ==================== MATCH OPERATIONS ====================

  async insertMatch(matchData) {
    // Insert match first and verify it exists before adding participants
    const { data: matchResult, error: matchError } = await this.supabase
      .from('matches')
      .upsert({
        match_id: matchData.matchId,
        game_creation: matchData.gameCreation,
        game_duration: matchData.gameDuration,
        game_mode: matchData.gameMode,
        queue_id: matchData.queueId,
        created_at: Date.now()
      }, { onConflict: 'match_id' })
      .select('match_id');

    if (matchError) {
      throw matchError;
    }

    // Verify the match was actually inserted/exists before adding participants
    const { data: verifyMatch, error: verifyError } = await this.supabase
      .from('matches')
      .select('match_id')
      .eq('match_id', matchData.matchId)
      .single();

    if (verifyError || !verifyMatch) {
      throw new Error(`Match ${matchData.matchId} insert verification failed`);
    }

    // Insert participants
    const trackedPuuids = [];
    for (const participant of matchData.participants) {
      const { error: participantError } = await this.supabase
        .from('match_participants')
        .upsert({
          match_id: matchData.matchId,
          puuid: participant.puuid,
          summoner_name: participant.summonerName,
          champion_id: participant.championId,
          champion_name: participant.championName,
          team_id: participant.teamId,
          win: participant.win,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          item0: participant.items[0] || 0,
          item1: participant.items[1] || 0,
          item2: participant.items[2] || 0,
          item3: participant.items[3] || 0,
          item4: participant.items[4] || 0,
          item5: participant.items[5] || 0,
          item6: participant.items[6] || 0,
          summoner1_id: participant.summoner1Id || null,
          summoner2_id: participant.summoner2Id || null,
          total_minions_killed: participant.totalMinionsKilled || 0,
          neutral_minions_killed: participant.neutralMinionsKilled || 0,
          total_damage_dealt_to_champions: participant.totalDamageDealtToChampions || 0,
          gold_earned: participant.goldEarned || 0,
          vision_score: participant.visionScore || 0,
          detector_wards_placed: participant.detectorWardsPlaced || 0,
          perks_json: participant.perks ? JSON.stringify(participant.perks) : null
        }, { onConflict: 'match_id,puuid' });

      if (participantError) {
        throw participantError;
      }

      // Track which puuids are tracked players for cleanup
      const player = await this.getPlayer(participant.puuid);
      if (player && this.trackedList.includes(player.game_name + '#' + player.tag_line)) {
        if (!trackedPuuids.includes(participant.puuid)) {
          trackedPuuids.push(participant.puuid);
        }
      }
    }

    // Cleanup: keep only the 30 most recent ranked solo queue matches per tracked player
    for (const puuid of trackedPuuids) {
      await this.cleanupOldMatches(puuid);
    }
  }

  async cleanupOldMatches(puuid) {
    // First, get all match IDs for this player
    const { data: playerMatches } = await this.supabase
      .from('match_participants')
      .select('match_id')
      .eq('puuid', puuid);

    const playerMatchIds = (playerMatches || []).map(m => m.match_id);
    if (playerMatchIds.length === 0) return;

    // Get the 30 most recent ranked solo queue matches for this player
    const { data: matchesToKeep } = await this.supabase
      .from('matches')
      .select('match_id')
      .eq('queue_id', 420)
      .in('match_id', playerMatchIds)
      .order('game_creation', { ascending: false })
      .limit(30);

    const keepIds = (matchesToKeep || []).map(m => m.match_id);

    // Filter to find matches to delete (not in the keep list)
    const matchesToDelete = playerMatchIds.filter(id => !keepIds.includes(id));

    for (const matchId of matchesToDelete) {
      // Delete participants for this match
      await this.supabase
        .from('match_participants')
        .delete()
        .eq('match_id', matchId);

      // Check if any participants remain
      const { data: remaining } = await this.supabase
        .from('match_participants')
        .select('id')
        .eq('match_id', matchId)
        .limit(1);

      if (!remaining || remaining.length === 0) {
        await this.supabase
          .from('matches')
          .delete()
          .eq('match_id', matchId);
      }
    }
  }

  async matchExists(matchId) {
    const { data, error } = await this.supabase
      .from('matches')
      .select('match_id')
      .eq('match_id', matchId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return !!data;
  }

  async getPlayerMatches(puuid, limit = 10, queueIds = [420, 440]) {
    // Get match IDs for this player
    const { data: participantMatches, error: pmError } = await this.supabase
      .from('match_participants')
      .select('match_id')
      .eq('puuid', puuid);

    if (pmError) {
      throw pmError;
    }

    const matchIds = (participantMatches || []).map(m => m.match_id);
    if (matchIds.length === 0) return [];

    // Get matches with the queue filter
    const { data: matches, error: matchError } = await this.supabase
      .from('matches')
      .select('*')
      .in('match_id', matchIds)
      .in('queue_id', queueIds)
      .order('game_creation', { ascending: false })
      .limit(limit);

    if (matchError) {
      throw matchError;
    }

    // Get all participants for these matches
    const result = [];
    for (const match of matches || []) {
      const { data: allParticipants, error: apError } = await this.supabase
        .from('match_participants')
        .select('*')
        .eq('match_id', match.match_id);

      if (apError) {
        throw apError;
      }

      result.push({
        matchId: match.match_id,
        gameCreation: match.game_creation,
        gameDuration: match.game_duration,
        gameMode: match.game_mode,
        queueId: match.queue_id,
        participants: (allParticipants || []).map(p => {
          const perks = p.perks_json ? JSON.parse(p.perks_json) : null;
          return {
            puuid: p.puuid,
            summonerName: p.summoner_name,
            championId: p.champion_id,
            championName: p.champion_name,
            teamId: p.team_id,
            win: p.win,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].map(x => (Number.isInteger(x) && x > 0) ? x : 0),
            summoner1Id: p.summoner1_id,
            summoner2Id: p.summoner2_id,
            totalMinionsKilled: p.total_minions_killed || 0,
            neutralMinionsKilled: p.neutral_minions_killed || 0,
            totalDamageDealtToChampions: p.total_damage_dealt_to_champions || 0,
            goldEarned: p.gold_earned || 0,
            visionScore: p.vision_score || 0,
            detectorWardsPlaced: p.detector_wards_placed || 0,
            // Primary runes (keystone + 3 minor runes)
            primaryStyleId: perks?.styles?.[0]?.style || null,
            primaryRunes: perks?.styles?.[0]?.selections?.map(s => s.perk) || [],
            // Secondary runes (2 minor runes)
            secondaryStyleId: perks?.styles?.[1]?.style || null,
            secondaryRunes: perks?.styles?.[1]?.selections?.map(s => s.perk) || [],
            // Stat shards
            statShards: perks?.statPerks || null,
            // Legacy fields for backwards compatibility
            primaryRuneId: perks?.styles?.[0]?.selections?.[0]?.perk || null
          };
        })
      });
    }

    return result;
  }

  async getLatestMatchId(puuid, queueIds = [420, 440]) {
    const { data: participantMatches } = await this.supabase
      .from('match_participants')
      .select('match_id')
      .eq('puuid', puuid);

    const matchIds = (participantMatches || []).map(m => m.match_id);
    if (matchIds.length === 0) return null;

    const { data, error } = await this.supabase
      .from('matches')
      .select('match_id')
      .in('match_id', matchIds)
      .in('queue_id', queueIds)
      .order('game_creation', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data ? data.match_id : null;
  }

  async getMatchCount(puuid, queueIds = [420, 440]) {
    const { data: participantMatches } = await this.supabase
      .from('match_participants')
      .select('match_id')
      .eq('puuid', puuid);

    const matchIds = (participantMatches || []).map(m => m.match_id);
    if (matchIds.length === 0) return 0;

    const { count, error } = await this.supabase
      .from('matches')
      .select('match_id', { count: 'exact', head: true })
      .in('match_id', matchIds)
      .in('queue_id', queueIds);

    if (error) {
      throw error;
    }
    return count || 0;
  }

  async getWinStreak(puuid, queueIds = [420, 440]) {
    // Get match IDs for this player
    const { data: participantMatches } = await this.supabase
      .from('match_participants')
      .select('match_id, win')
      .eq('puuid', puuid);

    if (!participantMatches || participantMatches.length === 0) return 0;

    const matchIds = participantMatches.map(m => m.match_id);

    // Get matches sorted by most recent first
    const { data: matches, error } = await this.supabase
      .from('matches')
      .select('match_id, game_creation')
      .in('match_id', matchIds)
      .in('queue_id', queueIds)
      .order('game_creation', { ascending: false });

    if (error || !matches || matches.length === 0) return 0;

    // Create a map of match_id -> win status
    const winMap = {};
    for (const pm of participantMatches) {
      winMap[pm.match_id] = pm.win;
    }

    // Count consecutive wins from the most recent game
    let streak = 0;
    for (const match of matches) {
      if (winMap[match.match_id] === true) {
        streak++;
      } else {
        break; // Streak ends on first loss
      }
    }

    return streak;
  }

  // ==================== SYNC STATUS OPERATIONS ====================

  async getSyncStatus(puuid) {
    const { data, error } = await this.supabase
      .from('player_sync_status')
      .select('*')
      .eq('puuid', puuid)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  }

  async initializeSyncStatus(puuid, targetMatchCount = 30) {
    const now = Date.now();

    // Check if sync status already exists
    const existing = await this.getSyncStatus(puuid);

    if (!existing) {
      // New player — insert fresh
      const { error } = await this.supabase
        .from('player_sync_status')
        .insert({
          puuid,
          target_match_count: targetMatchCount,
          last_sync_attempt: now,
          rank_synced: false,
          matches_synced: 0,
          is_fully_synced: false
        });
      if (error) throw error;
    } else if (existing.target_match_count < targetMatchCount) {
      // Target increased — update target and reset fully_synced so baseline re-runs
      const currentCount = await this.getMatchCount(puuid, [420]);
      const { error } = await this.supabase
        .from('player_sync_status')
        .update({
          target_match_count: targetMatchCount,
          is_fully_synced: currentCount >= targetMatchCount,
          matches_synced: currentCount,
          last_sync_attempt: now
        })
        .eq('puuid', puuid);
      if (error) throw error;
    }
  }

  async updateSyncStatus(puuid, updates) {
    const allowed = ['rank_synced', 'matches_synced', 'is_fully_synced', 'last_sync_attempt', 'target_match_count'];
    const updateObj = {};

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        updateObj[key] = updates[key];
      }
    }

    if (Object.keys(updateObj).length === 0) return;

    const { error } = await this.supabase
      .from('player_sync_status')
      .update(updateObj)
      .eq('puuid', puuid);

    if (error) {
      throw error;
    }
  }

  async isPlayerFullySynced(puuid) {
    const { data, error } = await this.supabase
      .from('player_sync_status')
      .select('is_fully_synced')
      .eq('puuid', puuid)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data ? data.is_fully_synced : false;
  }

  async getAllUnsyncedPlayers() {
    const { data, error } = await this.supabase
      .from('player_sync_status')
      .select('*')
      .eq('is_fully_synced', false);

    if (error) {
      throw error;
    }
    return data || [];
  }

  // ==================== CLEANUP ====================

  close() {
    // Supabase client doesn't require explicit closing
  }
}

export default DatabaseManager;
export { DatabaseManager };
