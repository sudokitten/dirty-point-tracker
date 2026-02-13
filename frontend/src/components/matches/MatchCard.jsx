import { useState } from 'react';
import MatchCardHeader from './MatchCardHeader.jsx';
import MatchCardDetail from './MatchCardDetail.jsx';

export default function MatchCard({ match, playerPuuid }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!match) return null;
  const isWin = match.result === 'win';
  const playerRow = [...(match.participants?.blue || []), ...(match.participants?.red || [])].find(p => p.puuid === playerPuuid);
  if (!playerRow) return null;

  return (
    <div className="mb-2 transition-all duration-300">
      <MatchCardHeader
        match={match}
        playerRow={playerRow}
        isWin={isWin}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
      {isExpanded && (
        <MatchCardDetail
          match={match}
          playerRow={playerRow}
          playerPuuid={playerPuuid}
        />
      )}
    </div>
  );
}
