import { useState } from 'react';
import MatchCard from './MatchCard.jsx';
import SkeletonCard from '../shared/SkeletonCard.jsx';
import { useMatches } from '../../hooks/useMatches.js';

const INITIAL_DISPLAY = 10;

export default function MatchHistorySection({ players, selectedPuuid, onSelectPlayer }) {
  const { data: matches = [], isLoading } = useMatches(selectedPuuid);
  const selectedPlayer = players.find(p => p.puuid === selectedPuuid);
  const [showAll, setShowAll] = useState(false);

  if (!selectedPuuid || players.length === 0) return null;

  const wins = matches.filter(m => m.result === 'win').length;
  const losses = matches.length - wins;
  const displayedMatches = showAll ? matches : matches.slice(0, INITIAL_DISPLAY);
  const hasMore = matches.length > INITIAL_DISPLAY;

  return (
    <section className="animate-fade-in" id="match-history">
      {/* Header */}
      {selectedPlayer && (
        <h2 className="text-base sm:text-xl font-black text-primary uppercase italic mb-4 sm:mb-6 tracking-tight">
          Match History — <span className="text-accent underline underline-offset-4 sm:underline-offset-8">{selectedPlayer.gameName}</span>
        </h2>
      )}

      {/* Match Cards */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          displayedMatches.map(match => (
            <MatchCard key={match.matchId || match.gameId} match={match} playerPuuid={selectedPuuid} />
          ))
        )}
        {!isLoading && matches.length === 0 && (
          <p className="text-center text-muted py-8 text-sm">No recent matches found.</p>
        )}
      </div>
      {!isLoading && hasMore && (
        <button
          onClick={() => setShowAll(v => !v)}
          className={`mt-4 w-full py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 ${
            showAll
              ? 'text-nord9/40 hover:text-nord9/60 border border-nord9/10 hover:border-nord9/20'
              : 'text-nord8/60 hover:text-nord8 border border-nord8/15 hover:border-nord8/30 bg-nord0/30 hover:bg-nord0/50'
          }`}
        >
          {showAll ? 'Show Less' : `Show More Matches (${matches.length - INITIAL_DISPLAY} more)`}
        </button>
      )}
    </section>
  );
}
