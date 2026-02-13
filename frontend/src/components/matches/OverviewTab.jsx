import TeamTable from './TeamTable.jsx';

export default function OverviewTab({ match, playerPuuid }) {
  const blueTeam = match.participants?.blue || [];
  const redTeam = match.participants?.red || [];
  const blueKills = blueTeam.reduce((sum, p) => sum + (p.kills || 0), 0);
  const redKills = redTeam.reduce((sum, p) => sum + (p.kills || 0), 0);
  const totalKills = blueKills + redKills || 1;
  const allPlayers = [...blueTeam, ...redTeam];
  const maxDamage = Math.max(...allPlayers.map(p => p.totalDamageDealtToChampions || 0), 1);

  return (
    <>
      {/* Team Comparison Bar */}
      <div className="flex items-center justify-between px-6 lg:px-10 py-3 bg-section border-b border-border-default">
        <div className="flex items-center gap-3 lg:gap-4">
          <span className="text-accent font-black italic text-sm">{blueKills} Kills</span>
          <div className="h-1.5 w-24 lg:w-48 bg-bar rounded-full overflow-hidden">
            <div className="h-full bg-win transition-all" style={{ width: `${(blueKills / totalKills) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="h-1.5 w-24 lg:w-48 bg-bar rounded-full overflow-hidden flex justify-end">
            <div className="h-full bg-loss transition-all" style={{ width: `${(redKills / totalKills) * 100}%` }} />
          </div>
          <span className="text-loss font-black italic text-sm">{redKills} Kills</span>
        </div>
      </div>

      {/* Detailed Player Tables */}
      <div className="divide-y divide-border-default">
        <TeamTable players={blueTeam} title="Blue Team" isWin={blueTeam.some(p => p.win)} playerPuuid={playerPuuid} maxDamage={maxDamage} />
        <TeamTable players={redTeam} title="Red Team" isWin={redTeam.some(p => p.win)} playerPuuid={playerPuuid} maxDamage={maxDamage} />
      </div>
    </>
  );
}
