import { useMemo } from 'react';
import PlayerPanel from './PlayerPanel.jsx';
import VsDivider from './VsDivider.jsx';
import { calculateLpDifference, getHighestRanked } from '../../utils/rankUtils.js';

export default function VersusHero({ players, selectedPuuid, onSelectPlayer }) {
  const highestRankedPuuid = useMemo(() => getHighestRanked(players), [players]);

  // For 2 players, compute LP delta
  const lpDelta = useMemo(() => {
    if (players.length !== 2) return null;
    if (!players[0].rank?.tier || !players[1].rank?.tier) return null;
    return calculateLpDifference(players[0].rank, players[1].rank);
  }, [players]);

  const leaderName = useMemo(() => {
    if (lpDelta == null || players.length !== 2) return null;
    return lpDelta >= 0 ? players[0].gameName : players[1].gameName;
  }, [lpDelta, players]);

  if (players.length === 0) return null;

  // 2-player rivalry layout
  if (players.length === 2) {
    return (
      <section className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0 mb-8 sm:mb-12">
        <PlayerPanel
          player={players[0]}
          isLeading={players[0].puuid === highestRankedPuuid}
          isSelected={players[0].puuid === selectedPuuid}
          onSelect={onSelectPlayer}
          side="left"
        />

        <div className="flex items-center justify-center md:px-4 lg:px-6 shrink-0">
          <VsDivider
            lpDelta={lpDelta}
            leaderName={leaderName}
          />
        </div>

        <PlayerPanel
          player={players[1]}
          isLeading={players[1].puuid === highestRankedPuuid}
          isSelected={players[1].puuid === selectedPuuid}
          onSelect={onSelectPlayer}
          side="right"
        />
      </section>
    );
  }

  // 3+ players: leaderboard-style grid
  return (
    <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
      {players.map((player) => (
        <PlayerPanel
          key={player.puuid}
          player={player}
          isLeading={player.puuid === highestRankedPuuid}
          isSelected={player.puuid === selectedPuuid}
          onSelect={onSelectPlayer}
          side="left"
        />
      ))}
    </section>
  );
}
