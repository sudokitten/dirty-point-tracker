# Dirty Pointr Ranked Race

A League of Legends companion app to track your squad's ranked stats, match history, and performance. Keep tabs on everyone's climb through the ranks with a clean, modern interface.

## Features

- **Player Tracking** — Static player list tracked automatically
- **Rank Dashboard** — View Solo/Duo and Flex queue ranks at a glance
- **Match History** — Detailed match cards with KDA, items, runes, and more
- **Win Streaks** — Animated flame icon for players on a hot streak
- **Leaderboard** — Crown icon highlights the highest ranked player
- **Dark/Light Mode** — Toggle between themes for comfortable viewing
- **Expandable Match Details** — Team compositions, damage charts, skill orders, and build timelines
- **Real-time Updates** — Background polling keeps stats fresh every 5 minutes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express, Axios |
| **Database** | Supabase (PostgreSQL) |
| **Data Source** | Riot Games API, Data Dragon CDN |
| **Hosting** | Vercel (frontend), Render (backend) |

## Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+
- [Riot Games API Key](https://developer.riotgames.com/)
- [Supabase](https://supabase.com/) account with a project

### Clone

```bash
git clone https://github.com/your-username/dirty-pointr-tracker.git
cd dirty-pointr-tracker
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:

```env
RIOT_API_KEY=your-riot-api-key
PORT=3001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Fill in your `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the app.

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `RIOT_API_KEY` | Riot Games API key | — |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | — |
| `SUPABASE_URL` | Supabase project URL | — |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | — |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | — |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/players` | Get all tracked players |
| `GET` | `/api/players/:puuid` | Get a single player |
| `GET` | `/api/players/:puuid/matches` | Get match history |
| `GET` | `/api/matches/:matchId/timeline/:puuid` | Get match timeline |
| `GET` | `/api/health` | Health check |

See [docs/API.md](docs/API.md) for full request/response documentation.

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set framework preset to **Vite**
3. Set root directory to `frontend`
4. Add environment variables in the Vercel dashboard

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in the Render dashboard

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design, data flow, and database schema |
| [API Reference](docs/API.md) | Full endpoint documentation with examples |
| [Contributing](CONTRIBUTING.md) | Development setup and contribution guidelines |
| [Changelog](CHANGELOG.md) | Version history and release notes |

## License

MIT

## Acknowledgments

- [Riot Games API](https://developer.riotgames.com/) for game data
- [Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon) for static assets
- [Community Dragon](https://communitydragon.org/) for rune images
