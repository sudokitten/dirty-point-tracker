# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2.0.0] - 2026-02-12

### Changed

- Renamed project from "LoL Friends Tracker" to "Dirty Pointr Ranked Race"
- Simplified to read-only tracker with static player list

### Removed

- Add Player functionality (frontend modal and backend POST endpoint)
- Delete Player functionality (frontend modal and backend DELETE endpoint)
- Player Grouping / Account Linking (frontend Supabase integration)
- Player Sorting dropdown (rank / A-Z)
- Frontend Supabase client dependency (groups were the only usage)

## [1.0.0] - 2026-02-07

### Added

- **Rank Dashboard** — View Solo/Duo and Flex queue ranks with tier emblems and LP
- **Match History** — Last 10 ranked matches per player with champion, KDA, items, and result
- **Expandable Match Details** — Two-tab detail view:
  - Analysis tab with team compositions, damage dealt charts, and vision scores
  - Build tab with item purchase timeline, skill level order, and full rune build
- **Win Streaks** — Animated flame indicator for players on 3+ game win streaks
- **Leaderboard** — Crown icon highlights the highest ranked player
- **Dark/Light Mode** — Theme toggle with localStorage persistence
- **Background Polling** — Automatic data sync with two-phase strategy (baseline + maintenance)
- **Rate Limit Handling** — Automatic retry with backoff for Riot API rate limits
- **In-Memory Caching** — 5-minute TTL cache to reduce database reads
- **Match Cleanup** — Retains only the 10 most recent ranked matches per player
