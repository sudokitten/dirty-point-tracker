# Architecture

This document describes the system architecture of Dirty Pointr Ranked Race.

## Overview

Dirty Pointr Ranked Race is a full-stack application with three main layers:

```
┌─────────────────────────────────┐
│         Frontend (React)        │  Vercel
│         Vite + Tailwind         │
└──────────────┬──────────────────┘
               │ REST API
┌──────────────▼──────────────────┐
│       Backend (Express.js)      │  Render
│  Riot API + Supabase + Cache    │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│     Supabase (PostgreSQL)       │  Cloud
│   Players, Ranks, Matches       │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│       Riot Games API            │  External
│   Summoner, Rank, Match Data    │
└─────────────────────────────────┘
```

## Backend

### Entry Point (`server.js`)

The Express server handles HTTP requests, defines API routes, and coordinates the service layer. On startup it:

1. Starts the HTTP server immediately (so Render detects a healthy service)
2. Initializes the database and polling service in the background
3. Begins serving API requests

### Service Layer

The backend is organized into four focused services:

#### Riot API Client (`riotApiClient.js`)

Wraps the Riot Games API with built-in rate limiting:

- **20 requests/second** and **100 requests/2 minutes** (development key limits)
- Automatic retry on 429 (rate limited) responses
- Regional routing support — maps platform regions (na1, euw1) to routing regions (americas, europe, asia, sea)

Key methods:
- `getAccountByRiotId(gameName, tagLine, region)` — Resolve a Riot ID to a PUUID
- `getSummonerByPuuid(puuid, region)` — Fetch summoner profile data
- `getRankByPuuid(summonerId, region)` — Fetch ranked queue data
- `getMatchIdsByPuuid(puuid, region, count)` — List recent match IDs
- `getMatchById(matchId, region)` — Full match details
- `getMatchTimeline(matchId, region)` — Frame-by-frame match timeline

#### Database Manager (`database.js`)

Handles all Supabase/PostgreSQL operations:

- Player CRUD (upsert, track/untrack)
- Rank history storage with timestamps
- Match and participant data storage
- Win streak calculation (consecutive wins from most recent match)
- Sync status tracking per player
- Match cleanup — retains only the **10 most recent ranked matches** per player

#### Cache Manager (`cacheManager.js`)

In-memory cache sitting in front of the database:

- **5-minute TTL** for player and match data
- Reduces database reads during frequent polling cycles
- Auto-prunes stale cache entries older than 24 hours

#### Polling Service (`pollingService.js`)

Background service that keeps data fresh. Operates in two phases:

```
Startup ──► Baseline Sync ──► Maintenance Mode (every 5 min)
```

**Baseline Sync** (runs once at startup):
- Fetches rank data for all tracked players
- Pulls up to 10 ranked matches per player
- Pauses for 2 minutes after every 90 API requests to respect rate limits

**Maintenance Mode** (runs every 5 minutes):
- Updates rank data for players with stale data (>5 min old)
- Checks for new matches (up to 8 per cycle)
- Lightweight compared to baseline — only fetches deltas

### Request Flow

```
Client Request
     │
     ▼
  Express Route Handler
     │
     ├──► Cache Manager (check cache)
     │         │
     │         ├── Cache hit → Return cached data
     │         │
     │         └── Cache miss ──► Database Manager
     │                                  │
     │                                  └── Return from DB
     │
     └── (read-only API)
```

## Frontend

### Component Architecture

The frontend is a monolithic `App.jsx` file containing all components and logic:

```
App.jsx
├── App (root component)
│   ├── State management (useState hooks)
│   ├── API calls and data fetching
│   └── Theme context (dark/light)
│
├── PlayerCard
│   ├── Rank display (Solo/Duo + Flex)
│   └── Win streak indicator
│
├── MatchCard
│   ├── Match summary (champion, KDA, result)
│   └── Expandable detail tabs
│       ├── AnalysisTab (teams, damage, vision)
│       └── BuildTab (items, skills, runes)
│
├── TeamTable (5v5 team composition)
└── WinstreakFlame (animated SVG)
```

### Theme System

Uses React Context to provide theme-aware styling:

- Toggle between `dark` and `light` mode
- Persisted in `localStorage`
- A color mapping object (`t`) provides semantic color tokens:
  - `t.bg`, `t.bgCard`, `t.bgHover` — backgrounds
  - `t.text`, `t.textMuted`, `t.textSubtle` — typography
  - `t.border`, `t.divider` — borders
  - Component-specific tokens for items, bars, overlays

### Static Assets

Game assets are served from two sources:

- **Data Dragon** (`ddragon.leagueoflegends.com`) — Champion, item, spell, and profile icons (version 16.3.1)
- **Community Dragon** (`communitydragon.org`) — Rune images as a fallback
- **Local assets** (`/ranked-emblems/`) — Rank tier emblems (Iron through Challenger)

## Database Schema

### Tables

#### `players`
| Column | Type | Description |
|--------|------|-------------|
| `puuid` | text (PK) | Riot PUUID |
| `game_name` | text | Riot game name |
| `tag_line` | text | Riot tag line |
| `summoner_id` | text | Summoner ID |
| `account_id` | text | Account ID |
| `profile_icon_id` | int | Profile icon number |
| `summoner_level` | int | Summoner level |
| `platform_region` | text | Platform region (na1, euw1, etc.) |
| `routing_region` | text | Routing region (americas, europe, etc.) |
| `last_updated` | timestamp | Last data refresh |
| `is_tracked` | boolean | Whether actively tracked |

#### `ranks`
| Column | Type | Description |
|--------|------|-------------|
| `id` | serial (PK) | Auto-increment ID |
| `puuid` | text (FK) | Player reference |
| `queue_type` | text | RANKED_SOLO_5x5 or RANKED_FLEX_SR |
| `tier` | text | IRON through CHALLENGER |
| `rank` | text | I, II, III, or IV |
| `league_points` | int | LP within division |
| `wins` | int | Queue wins |
| `losses` | int | Queue losses |
| `timestamp` | timestamp | When rank was recorded |

#### `matches`
| Column | Type | Description |
|--------|------|-------------|
| `match_id` | text (PK) | Riot match ID |
| `game_creation` | bigint | Game start timestamp |
| `game_duration` | int | Duration in seconds |
| `game_mode` | text | Game mode |
| `queue_id` | int | Queue type (420=Solo, 440=Flex) |
| `created_at` | timestamp | Record creation time |

#### `match_participants`
| Column | Type | Description |
|--------|------|-------------|
| `match_id` | text (PK) | Match reference |
| `puuid` | text (PK) | Player reference |
| `champion_name` | text | Champion played |
| `champion_id` | int | Champion ID |
| `team_id` | int | 100 (blue) or 200 (red) |
| `win` | boolean | Whether the player won |
| `kills` | int | Kills |
| `deaths` | int | Deaths |
| `assists` | int | Assists |
| `item0-item6` | int | Item slot IDs |
| `summoner1_id` | int | First summoner spell |
| `summoner2_id` | int | Second summoner spell |
| `total_minions_killed` | int | CS count |
| `neutral_minions_killed` | int | Jungle CS |
| `total_damage_dealt_to_champions` | int | Champion damage |
| `gold_earned` | int | Gold earned |
| `vision_score` | int | Vision score |
| `perks` | jsonb | Rune build data |

#### `player_sync_status`
| Column | Type | Description |
|--------|------|-------------|
| `puuid` | text (PK) | Player reference |
| `target_match_count` | int | Matches to fetch |
| `rank_synced` | boolean | Rank data synced |
| `matches_synced` | int | Matches fetched so far |
| `is_fully_synced` | boolean | All data fetched |
| `last_sync_attempt` | timestamp | Last sync time |

## Deployment Architecture

```
GitHub Repository
     │
     ├──► Vercel (frontend/)
     │      └── Auto-deploys on push to main
     │      └── Environment: VITE_API_URL
     │
     └──► Render (backend/)
            └── Auto-deploys on push to main
            └── Environment: RIOT_API_KEY, PORT, FRONTEND_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY
```

Both services connect to a shared Supabase instance. The backend uses the **service key** for full access to player/match data management.
