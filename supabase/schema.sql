-- Dirty Pointr Ranked Race — Supabase Schema
-- Run this ENTIRE script in the Supabase SQL Editor to initialize the database.
-- Safe to re-run: uses IF NOT EXISTS and DROP POLICY IF EXISTS.

-- ==================== PLAYERS ====================

create table if not exists players (
  puuid text primary key,
  game_name text not null,
  tag_line text not null,
  summoner_id text,
  account_id text,
  profile_icon_id integer,
  summoner_level integer,
  platform_region text not null default 'na1',
  routing_region text not null default 'americas',
  last_updated bigint,
  is_tracked boolean not null default false
);

-- ==================== RANKS ====================

create table if not exists ranks (
  id serial primary key,
  puuid text not null references players(puuid) on delete cascade,
  queue_type text not null,
  tier text,
  rank text,
  league_points integer default 0,
  wins integer default 0,
  losses integer default 0,
  timestamp bigint not null
);

create index if not exists idx_ranks_puuid on ranks(puuid);
create index if not exists idx_ranks_puuid_queue on ranks(puuid, queue_type);
create index if not exists idx_ranks_timestamp on ranks(timestamp desc);

-- ==================== MATCHES ====================

create table if not exists matches (
  match_id text primary key,
  game_creation bigint,
  game_duration integer,
  game_mode text,
  queue_id integer,
  created_at bigint
);

create index if not exists idx_matches_queue on matches(queue_id);
create index if not exists idx_matches_creation on matches(game_creation desc);

-- ==================== MATCH PARTICIPANTS ====================

create table if not exists match_participants (
  id serial,
  match_id text not null references matches(match_id) on delete cascade,
  puuid text not null,
  summoner_name text,
  champion_id integer,
  champion_name text,
  team_id integer,
  win boolean,
  kills integer default 0,
  deaths integer default 0,
  assists integer default 0,
  item0 integer default 0,
  item1 integer default 0,
  item2 integer default 0,
  item3 integer default 0,
  item4 integer default 0,
  item5 integer default 0,
  item6 integer default 0,
  summoner1_id integer,
  summoner2_id integer,
  total_minions_killed integer default 0,
  neutral_minions_killed integer default 0,
  total_damage_dealt_to_champions integer default 0,
  gold_earned integer default 0,
  vision_score integer default 0,
  detector_wards_placed integer default 0,
  perks_json text,
  primary key (match_id, puuid)
);

create index if not exists idx_participants_puuid on match_participants(puuid);
create index if not exists idx_participants_match on match_participants(match_id);

-- ==================== PLAYER SYNC STATUS ====================

create table if not exists player_sync_status (
  puuid text primary key references players(puuid) on delete cascade,
  target_match_count integer default 10,
  rank_synced boolean default false,
  matches_synced integer default 0,
  is_fully_synced boolean default false,
  last_sync_attempt bigint
);

-- ==================== ROW LEVEL SECURITY ====================

alter table players enable row level security;
alter table ranks enable row level security;
alter table matches enable row level security;
alter table match_participants enable row level security;
alter table player_sync_status enable row level security;

-- Drop policies first to make this script idempotent
drop policy if exists "Allow public read on players" on players;
drop policy if exists "Allow public read on ranks" on ranks;
drop policy if exists "Allow public read on matches" on matches;
drop policy if exists "Allow public read on match_participants" on match_participants;
drop policy if exists "Allow public read on player_sync_status" on player_sync_status;

-- Allow anon/authenticated SELECT (for frontend reads)
create policy "Allow public read on players"
  on players for select using (true);
create policy "Allow public read on ranks"
  on ranks for select using (true);
create policy "Allow public read on matches"
  on matches for select using (true);
create policy "Allow public read on match_participants"
  on match_participants for select using (true);
create policy "Allow public read on player_sync_status"
  on player_sync_status for select using (true);

-- ==================== EXPLICIT GRANTS ====================
-- PostgREST needs these grants to discover tables in its schema cache.
-- Without them, the REST API returns PGRST205 "table not found".

grant usage on schema public to anon, authenticated, service_role;

grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Also set default privileges so future tables get the same grants
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- ==================== RELOAD POSTGREST SCHEMA CACHE ====================

notify pgrst, 'reload schema';
