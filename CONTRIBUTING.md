# Contributing to Dirty Pointr Ranked Race

Thanks for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- A [Riot Games API Key](https://developer.riotgames.com/)
- A [Supabase](https://supabase.com/) account with a project set up

### Development Setup

1. Fork and clone the repository:

```bash
git clone https://github.com/<your-username>/dirty-pointr-tracker.git
cd dirty-pointr-tracker
```

2. Set up the backend:

```bash
cd backend
npm install
cp .env.example .env
# Fill in your RIOT_API_KEY, SUPABASE_URL, and SUPABASE_SERVICE_KEY
npm run dev
```

3. Set up the frontend (in a separate terminal):

```bash
cd frontend
npm install
cp .env.example .env
# Fill in VITE_API_URL
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3001`.

## Project Structure

```
backend/
  src/
    server.js              # Express routes and middleware
    trackedPlayers.js       # Default player list
    services/
      riotApiClient.js     # Riot Games API integration
      database.js          # Supabase database operations
      cacheManager.js      # In-memory cache
      pollingService.js    # Background data sync

frontend/
  src/
    App.jsx                # Main application component
    main.jsx               # React entry point
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a deeper dive into the system design.

## Development Guidelines

### Code Style

- **Frontend**: React with JSX, styled with Tailwind CSS utility classes
- **Backend**: ES modules (`import`/`export`), Express route handlers
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: camelCase for variables/functions, PascalCase for React components

### Riot API Rate Limits

The Riot Games API enforces strict rate limits. The backend handles this automatically, but keep in mind:

- **Development keys** are limited to 20 requests/second and 100 requests/2 minutes
- The polling service spaces out API calls to stay within limits
- If you hit a 429 error, the client will automatically retry after the cooldown

### Working with Data Dragon

Static game assets (champion icons, item images, etc.) come from Riot's Data Dragon CDN. The current version is **16.3.1**. If a new patch updates assets:

1. Update the version string in `frontend/src/App.jsx` (search for `ddragon.leagueoflegends.com`)
2. Check for new champion name mappings (e.g., Wukong -> MonkeyKing)

### Database Changes

If you need to modify the Supabase schema:

1. Document the change in your PR description
2. Include the SQL migration statements
3. Update `backend/src/services/database.js` accordingly
4. Update [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) with schema changes

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-champion-stats` - New features
- `fix/match-history-loading` - Bug fixes
- `docs/update-api-reference` - Documentation
- `refactor/split-app-components` - Code refactoring

### Commit Messages

Write clear, concise commit messages:

```
Add champion mastery display to player cards
Fix match timeline not loading for remade games
Update API docs with new timeline endpoint
```

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Test locally with both frontend and backend running
4. Open a PR against the `dev` branch with:
   - A summary of what changed and why
   - Screenshots for UI changes
   - Any relevant testing notes

## Reporting Issues

When reporting bugs, include:

- Steps to reproduce the issue
- Expected vs actual behavior
- Browser and OS information (for frontend issues)
- Relevant error messages or console output

## Areas for Contribution

Here are some areas where contributions are welcome:

- **Component splitting** - Breaking `App.jsx` into smaller, focused components
- **Testing** - Adding unit and integration tests
- **Accessibility** - Improving keyboard navigation and screen reader support
- **Performance** - Optimizing re-renders and data fetching
- **New features** - Champion mastery, live game status, historical rank graphs
