import { useState } from 'react';
import { getChampionIconUrl } from '../../constants/ddragon.js';

const STATS = [
  { id: 'damage', label: 'Damage', key: 'totalDamageDealtToChampions' },
  { id: 'gold', label: 'Gold', key: 'goldEarned' },
  { id: 'cs', label: 'CS', key: 'totalMinionsKilled' },
  { id: 'vision', label: 'Vision', key: 'visionScore' },
  { id: 'kills', label: 'Kills', key: 'kills' },
];

function formatStatValue(val, statId) {
  if (statId === 'gold' || statId === 'damage') {
    return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val;
  }
  return val;
}

export default function AnalysisTab({ match }) {
  const [selectedStat, setSelectedStat] = useState('damage');
  const currentStat = STATS.find(s => s.id === selectedStat) || STATS[0];

  const allPlayers = [
    ...match.participants.blue.map(p => ({ ...p, team: 'blue', isWin: p.win })),
    ...match.participants.red.map(p => ({ ...p, team: 'red', isWin: p.win }))
  ].sort((a, b) => (b[currentStat.key] || 0) - (a[currentStat.key] || 0));

  const maxVal = Math.max(...allPlayers.map(p => p[currentStat.key] || 0), 1);
  const blueTotal = match.participants.blue.reduce((s, p) => s + (p[currentStat.key] || 0), 0);
  const redTotal = match.participants.red.reduce((s, p) => s + (p[currentStat.key] || 0), 0);
  const totalAll = blueTotal + redTotal || 1;
  const blueWins = blueTotal >= redTotal;

  return (
    <div className="p-4">
      {/* Stat Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-border-default">
        {STATS.map((stat) => (
          <button
            key={stat.id}
            onClick={() => setSelectedStat(stat.id)}
            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wide rounded-lg whitespace-nowrap transition-colors ${
              selectedStat === stat.id
                ? 'bg-accent text-nord0'
                : 'bg-bar text-muted hover:text-primary'
            }`}
          >
            {stat.label}
          </button>
        ))}
      </div>

      {/* Team Comparison Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-center flex-1">
            <p className={`text-[10px] font-bold uppercase ${blueWins ? 'text-accent' : 'text-muted'}`}>
              {match.participants.blue[0]?.win ? 'Winning Team' : 'Losing Team'}
            </p>
            <p className={`text-2xl font-black ${blueWins ? 'text-accent' : 'text-secondary'}`}>
              {formatStatValue(blueTotal, selectedStat)}
            </p>
          </div>
          <div className="text-center flex-1">
            <p className={`text-[10px] font-bold uppercase ${!blueWins ? 'text-loss' : 'text-muted'}`}>
              {match.participants.red[0]?.win ? 'Winning Team' : 'Losing Team'}
            </p>
            <p className={`text-2xl font-black ${!blueWins ? 'text-loss' : 'text-secondary'}`}>
              {formatStatValue(redTotal, selectedStat)}
            </p>
          </div>
        </div>

        <div className="flex h-2 rounded-full overflow-hidden">
          <div className="bg-win transition-all duration-300" style={{ width: `${(blueTotal / totalAll) * 100}%` }} />
          <div className="bg-loss transition-all duration-300" style={{ width: `${(redTotal / totalAll) * 100}%` }} />
        </div>
      </div>

      {/* Player Rankings */}
      <div className="space-y-3">
        {allPlayers.map((p, idx) => {
          const value = p[currentStat.key] || 0;
          const percent = (value / maxVal) * 100;
          const isBlue = p.team === 'blue';

          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={getChampionIconUrl(p.championName)}
                  className="w-10 h-10 rounded-lg border border-icon-border"
                  alt=""
                />
                {idx < 3 && (
                  <span className={`absolute -bottom-1 -left-1 text-[8px] font-black px-1.5 py-0.5 rounded ${
                    idx === 0 ? 'bg-nord13 text-nord0' :
                    idx === 1 ? 'bg-nord4 text-nord0' :
                    'bg-nord12 text-nord0'
                  }`}>
                    {idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : 'rd'}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-primary mb-1">{formatStatValue(value, selectedStat)}</p>
                <div className="h-2 bg-bar rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isBlue ? 'bg-win' : 'bg-loss'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
