# API Reference — Dirty Pointr Ranked Race

Base URL: `http://localhost:3001/api` (development) or your deployed backend URL.

All responses return JSON. Errors return `{ "error": "message" }` with an appropriate HTTP status code.

---

## Health Check

### `GET /api/health`

Returns server and database status.

**Response**

```json
{
  "status": "healthy",
  "trackedPlayers": 12,
  "cachedPlayers": 8,
  "cachedMatches": 45
}
```

---

## Players

### `GET /api/players`

Get all tracked players with their current ranks and win streaks.

**Response**

```json
[
  {
    "puuid": "abc-123...",
    "game_name": "C R U N K",
    "tag_line": "NA1",
    "profile_icon_id": 5367,
    "summoner_level": 245,
    "platform_region": "na1",
    "ranks": [
      {
        "queue_type": "RANKED_SOLO_5x5",
        "tier": "GOLD",
        "rank": "II",
        "league_points": 45,
        "wins": 120,
        "losses": 110
      },
      {
        "queue_type": "RANKED_FLEX_SR",
        "tier": "SILVER",
        "rank": "I",
        "league_points": 72,
        "wins": 30,
        "losses": 25
      }
    ],
    "winStreak": 3
  }
]
```

**Notes**
- Players without rank data will have an empty `ranks` array
- `winStreak` is calculated from the most recent consecutive wins in ranked matches

---

### `GET /api/players/:puuid`

Get details for a single player.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `puuid` | string | The player's Riot PUUID |

**Response** `200 OK`

```json
{
  "puuid": "abc-123...",
  "game_name": "C R U N K",
  "tag_line": "NA1",
  "profile_icon_id": 5367,
  "summoner_level": 245,
  "platform_region": "na1",
  "ranks": [...],
  "winStreak": 3
}
```

---

## Matches

### `GET /api/players/:puuid/matches`

Get a player's recent ranked match history (up to 10 matches).

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `puuid` | string | The player's Riot PUUID |

**Response**

```json
[
  {
    "match_id": "NA1_5012345678",
    "game_creation": 1706900000000,
    "game_duration": 1845,
    "queue_id": 420,
    "participants": [
      {
        "puuid": "abc-123...",
        "champion_name": "Jinx",
        "champion_id": 222,
        "team_id": 100,
        "win": true,
        "kills": 8,
        "deaths": 3,
        "assists": 12,
        "item0": 3031,
        "item1": 3006,
        "item2": 3094,
        "item3": 3036,
        "item4": 3085,
        "item5": 0,
        "item6": 3340,
        "summoner1_id": 4,
        "summoner2_id": 7,
        "total_minions_killed": 210,
        "neutral_minions_killed": 15,
        "total_damage_dealt_to_champions": 32500,
        "gold_earned": 15200,
        "vision_score": 28,
        "perks": {
          "styles": [
            {
              "style": 8000,
              "selections": [
                { "perk": 8021 },
                { "perk": 9111 },
                { "perk": 9104 },
                { "perk": 8299 }
              ]
            },
            {
              "style": 8300,
              "selections": [
                { "perk": 8304 },
                { "perk": 8347 }
              ]
            }
          ],
          "statPerks": {
            "offense": 5005,
            "flex": 5008,
            "defense": 5002
          }
        }
      }
    ]
  }
]
```

**Notes**
- Matches are sorted by `game_creation` (most recent first)
- `queue_id` 420 = Ranked Solo/Duo, 440 = Ranked Flex
- `participants` includes all 10 players in the match
- `perks` contains the full rune build (primary tree, secondary tree, stat shards)

---

### `GET /api/matches/:matchId/timeline/:puuid`

Get the build timeline and skill order for a specific player in a match.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `matchId` | string | The Riot match ID (e.g., `NA1_5012345678`) |
| `puuid` | string | The player's Riot PUUID |

**Response**

```json
{
  "itemTimeline": [
    {
      "timestamp": 120000,
      "type": "ITEM_PURCHASED",
      "itemId": 1055
    },
    {
      "timestamp": 540000,
      "type": "ITEM_PURCHASED",
      "itemId": 3006
    },
    {
      "timestamp": 540500,
      "type": "ITEM_SOLD",
      "itemId": 1055
    }
  ],
  "skillOrder": [1, 3, 1, 2, 1, 4, 1, 3, 1, 3, 4, 3, 3, 2, 2, 4, 2, 2]
}
```

**Notes**
- `timestamp` is in milliseconds from match start
- `itemTimeline` includes purchases, sales, and undo events
- `skillOrder` is an array of skill slots leveled (1=Q, 2=W, 3=E, 4=R) in order from level 1 onwards

---

## Supported Regions

| Region Code | Region Name |
|-------------|-------------|
| `na1` | North America |
| `euw1` | Europe West |
| `eun1` | Europe Nordic & East |
| `kr` | Korea |
| `jp1` | Japan |
| `br1` | Brazil |
| `la1` | Latin America North |
| `la2` | Latin America South |
| `oc1` | Oceania |
| `tr1` | Turkey |
| `ru` | Russia |
| `ph2` | Philippines |
| `sg2` | Singapore |
| `th2` | Thailand |
| `tw2` | Taiwan |
| `vn2` | Vietnam |

### Region Routing

Platform regions are mapped to routing regions for Riot API calls:

| Routing Region | Platform Regions |
|----------------|-----------------|
| `americas` | na1, br1, la1, la2, oc1 |
| `europe` | euw1, eun1, tr1, ru |
| `asia` | kr, jp1 |
| `sea` | ph2, sg2, th2, tw2, vn2 |

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Human-readable error message"
}
```

Common error codes:

| Status | Meaning |
|--------|---------|
| 400 | Bad request (missing or invalid parameters) |
| 404 | Resource not found (invalid player, match, etc.) |
| 429 | Rate limited (Riot API limit exceeded) |
| 500 | Internal server error |

The backend automatically retries Riot API calls that return 429, so clients should rarely encounter this error directly.
