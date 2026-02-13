-- Supabase SQL Migration for LoL Tracker
-- Run this in your Supabase SQL Editor

-- Players table
CREATE TABLE IF NOT EXISTS players (
  puuid TEXT PRIMARY KEY,
  game_name TEXT NOT NULL,
  tag_line TEXT NOT NULL,
  summoner_id TEXT,
  account_id TEXT,
  profile_icon_id INTEGER,
  summoner_level INTEGER,
  platform_region TEXT,
  routing_region TEXT,
  last_updated BIGINT,
  is_tracked BOOLEAN DEFAULT FALSE
);

-- Rank data table
CREATE TABLE IF NOT EXISTS ranks (
  id SERIAL PRIMARY KEY,
  puuid TEXT NOT NULL REFERENCES players(puuid) ON DELETE CASCADE,
  queue_type TEXT NOT NULL,
  tier TEXT,
  rank TEXT,
  league_points INTEGER,
  wins INTEGER,
  losses INTEGER,
  timestamp BIGINT NOT NULL
);

-- Create index for faster rank queries
CREATE INDEX IF NOT EXISTS idx_ranks_puuid_timestamp 
ON ranks(puuid, timestamp DESC);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  match_id TEXT PRIMARY KEY,
  game_creation BIGINT NOT NULL,
  game_duration INTEGER NOT NULL,
  game_mode TEXT NOT NULL,
  queue_id INTEGER NOT NULL,
  created_at BIGINT NOT NULL
);

-- Match participants table
CREATE TABLE IF NOT EXISTS match_participants (
  id SERIAL PRIMARY KEY,
  match_id TEXT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  puuid TEXT NOT NULL,
  summoner_name TEXT,
  champion_id INTEGER NOT NULL,
  champion_name TEXT NOT NULL,
  team_id INTEGER NOT NULL,
  win BOOLEAN NOT NULL,
  kills INTEGER NOT NULL,
  deaths INTEGER NOT NULL,
  assists INTEGER NOT NULL,
  item0 INTEGER DEFAULT 0,
  item1 INTEGER DEFAULT 0,
  item2 INTEGER DEFAULT 0,
  item3 INTEGER DEFAULT 0,
  item4 INTEGER DEFAULT 0,
  item5 INTEGER DEFAULT 0,
  item6 INTEGER DEFAULT 0,
  summoner1_id INTEGER,
  summoner2_id INTEGER,
  total_minions_killed INTEGER DEFAULT 0,
  neutral_minions_killed INTEGER DEFAULT 0,
  total_damage_dealt_to_champions INTEGER DEFAULT 0,
  gold_earned INTEGER DEFAULT 0,
  vision_score INTEGER DEFAULT 0,
  detector_wards_placed INTEGER DEFAULT 0,
  perks_json TEXT,
  UNIQUE(match_id, puuid)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_match_participants_puuid 
ON match_participants(puuid, match_id);

CREATE INDEX IF NOT EXISTS idx_matches_queue 
ON matches(queue_id, game_creation DESC);

-- Player sync status table
CREATE TABLE IF NOT EXISTS player_sync_status (
  puuid TEXT PRIMARY KEY REFERENCES players(puuid) ON DELETE CASCADE,
  rank_synced BOOLEAN DEFAULT FALSE,
  matches_synced INTEGER DEFAULT 0,
  target_match_count INTEGER DEFAULT 10,
  last_sync_attempt BIGINT,
  is_fully_synced BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_sync_status ENABLE ROW LEVEL SECURITY;

-- Create policies to allow service role full access
CREATE POLICY "Service role can do everything on players" ON players
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on ranks" ON ranks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on matches" ON matches
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on match_participants" ON match_participants
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on player_sync_status" ON player_sync_status
  FOR ALL USING (true) WITH CHECK (true);

-- Account groups table (for linking main accounts with smurfs)
CREATE TABLE IF NOT EXISTS account_groups (
  id TEXT PRIMARY KEY,
  primary_puuid TEXT NOT NULL,
  account_puuids TEXT[] NOT NULL,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_account_groups_primary_puuid
ON account_groups(primary_puuid);

-- Enable RLS
ALTER TABLE account_groups ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read/write account groups
CREATE POLICY "Anyone can read account_groups" ON account_groups
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert account_groups" ON account_groups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update account_groups" ON account_groups
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete account_groups" ON account_groups
  FOR DELETE USING (true);
