import { ChevronDown } from 'lucide-react';
import { getChampionIconUrl, getItemIconUrl } from '../../constants/ddragon.js';
import { getSpellIconUrl } from '../../constants/spells.js';
import { getRuneIconUrl, getStyleIconUrl } from '../../constants/runes.js';
import { getQueueName } from '../../constants/queues.js';
import { formatTimeAgo } from '../../utils/formatters.js';

export default function MatchCardHeader({ match, playerRow, isWin, isExpanded, onToggle }) {
  const totalCs = (playerRow.totalMinionsKilled || 0) + (playerRow.neutralMinionsKilled || 0);
  const durationMin = Math.floor(match.gameDuration / 60);
  const durationSec = match.gameDuration % 60;
  const csPerMin = (totalCs / (match.gameDuration / 60)).toFixed(1);
  const kdaRatio = playerRow.deaths === 0 ? "Perfect" : ((playerRow.kills + playerRow.assists) / playerRow.deaths).toFixed(2);

  return (
    <div
      onClick={onToggle}
      className={`cursor-pointer ${isExpanded ? 'rounded-t-xl border-b-0' : 'rounded-xl'} border border-border-default transition-all overflow-hidden ${
        isWin ? 'bg-nord14/10 hover:bg-nord14/15' : 'bg-nord11/10 hover:bg-nord11/15'
      } border-l-4 ${isWin ? 'border-l-win' : 'border-l-loss'}`}
    >
      {/* MOBILE LAYOUT */}
      <div className="md:hidden p-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-full border-2 border-icon-border shadow-xl overflow-hidden">
              <img src={getChampionIconUrl(match.champion?.name)} className="w-full h-full scale-110" alt="" />
            </div>
            <span className="absolute bottom-0 right-0 bg-icon-bg text-primary text-[8px] font-black px-1 rounded border border-icon-border">
              {playerRow.champLevel || 18}
            </span>
          </div>
          <div className="flex gap-1">
            <div className="flex flex-col gap-0.5">
              <img src={getSpellIconUrl(playerRow.summoner1Id)} className="w-5 h-5 rounded" alt="" />
              <img src={getSpellIconUrl(playerRow.summoner2Id)} className="w-5 h-5 rounded" alt="" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="w-5 h-5 rounded-full bg-icon-bg flex items-center justify-center overflow-hidden">
                <img src={getRuneIconUrl(playerRow.primaryRuneId)} className="w-4 h-4 object-contain" alt="" />
              </div>
              <div className="w-5 h-5 flex items-center justify-center">
                <img src={getStyleIconUrl(playerRow.secondaryStyleId)} className="w-4 h-4 opacity-80" alt="" />
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-primary truncate uppercase italic">{match.champion?.name}</p>
            <p className={`text-[10px] font-black uppercase ${isWin ? 'text-accent' : 'text-loss'}`}>
              {isWin ? 'Victory' : 'Defeat'} • {durationMin}m
            </p>
            <p className="text-[9px] text-muted">{getQueueName(match.queueId)} • {formatTimeAgo(match.gameCreation)}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-baseline gap-0.5 justify-end">
              <span className="text-sm font-black text-kda">{playerRow.kills}</span>
              <span className="text-separator text-xs">/</span>
              <span className="text-sm font-black text-loss">{playerRow.deaths}</span>
              <span className="text-separator text-xs">/</span>
              <span className="text-sm font-black text-kda">{playerRow.assists}</span>
            </div>
            <p className="text-[10px] text-secondary"><span className={isWin ? 'text-accent' : 'text-secondary'}>{kdaRatio}</span> KDA</p>
            <p className="text-[9px] text-muted">CS {totalCs}</p>
          </div>
        </div>

        {/* Mobile Items Row */}
        <div className="flex gap-1 justify-center bg-overlay py-2 rounded-lg border border-border-default">
          {[0, 1, 2, 3, 4, 5, 6].map((itemIdx) => {
            const itemId = (playerRow.items || [])[itemIdx] || 0;
            const isTrinket = itemIdx === 6;
            return (
              <div
                key={itemIdx}
                className={`w-8 h-8 rounded flex items-center justify-center overflow-hidden border
                  ${isTrinket ? 'rounded-full ml-1 border-accent/40 bg-accent/10' : 'bg-item border-icon-border'}`}
              >
                {itemId > 0 ? (
                  <img src={getItemIconUrl(itemId)} className="w-full h-full" alt="" />
                ) : (
                  <div className="w-full h-full bg-item-empty" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Participants Row */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border-default">
          <div className="space-y-1">
            {(match.participants?.blue || []).map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <img src={getChampionIconUrl(p.championName)} className="w-3.5 h-3.5 rounded-sm border border-icon-border" alt="" />
                <span className={`text-[9px] truncate uppercase font-bold ${p.puuid === playerRow.puuid ? 'text-accent' : 'text-muted'}`}>
                  {p.summonerName}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {(match.participants?.red || []).map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <img src={getChampionIconUrl(p.championName)} className="w-3.5 h-3.5 rounded-sm border border-icon-border" alt="" />
                <span className={`text-[9px] truncate uppercase font-bold ${p.puuid === playerRow.puuid ? 'text-accent' : 'text-muted'}`}>
                  {p.summonerName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex items-center">
        {/* Match Type & Duration */}
        <div className="flex flex-col w-28 lg:w-32 p-3 lg:p-4 shrink-0">
          <p className={`text-[10px] lg:text-[11px] font-black uppercase tracking-tight ${isWin ? 'text-accent' : 'text-loss'}`}>
            {getQueueName(match.queueId)}
          </p>
          <p className="text-[9px] lg:text-[10px] text-muted font-bold">{formatTimeAgo(match.gameCreation)}</p>
          <div className="h-[1px] w-8 my-2 bg-divider" />
          <p className="text-[11px] lg:text-[12px] font-black text-primary uppercase">{isWin ? 'Victory' : 'Defeat'}</p>
          <p className="text-[9px] lg:text-[10px] text-secondary font-medium">{durationMin}m {durationSec}s</p>
        </div>

        {/* Champion, Spells & Runes */}
        <div className="flex items-center gap-2 lg:gap-3 px-2 lg:px-4 min-w-[180px] lg:min-w-[220px]">
          <div className="relative">
            <div className="h-11 w-11 lg:h-14 lg:w-14 rounded-full border-2 border-icon-border shadow-xl overflow-hidden">
              <img src={getChampionIconUrl(match.champion?.name)} className="w-full h-full scale-110" alt="" />
            </div>
            <span className="absolute bottom-0 right-0 bg-icon-bg text-primary text-[8px] lg:text-[9px] font-black px-1 rounded border border-icon-border shadow-lg">
              {playerRow.champLevel || 18}
            </span>
          </div>
          <div className="flex gap-1 lg:gap-1.5 items-center">
            <div className="flex flex-col gap-0.5 lg:gap-1">
              <img src={getSpellIconUrl(playerRow.summoner1Id)} className="w-5 h-5 lg:w-[22px] lg:h-[22px] rounded border border-border-default shadow-sm" alt="" />
              <img src={getSpellIconUrl(playerRow.summoner2Id)} className="w-5 h-5 lg:w-[22px] lg:h-[22px] rounded border border-border-default shadow-sm" alt="" />
            </div>
            <div className="flex flex-col gap-0.5 lg:gap-1">
              <div className="w-5 h-5 lg:w-[22px] lg:h-[22px] rounded-full bg-icon-bg flex items-center justify-center border border-border-default shadow-inner overflow-hidden">
                <img src={getRuneIconUrl(playerRow.primaryRuneId)} className="w-4 h-4 lg:w-[18px] lg:h-[18px] object-contain" alt="" />
              </div>
              <div className="w-5 h-5 lg:w-[22px] lg:h-[22px] flex items-center justify-center">
                <img src={getStyleIconUrl(playerRow.secondaryStyleId)} className="w-4 h-4 lg:w-[16px] lg:h-[16px] opacity-80 object-contain grayscale-[0.2]" alt="" />
              </div>
            </div>
          </div>
          <div className="ml-1">
            <p className="text-xs lg:text-sm font-black text-primary truncate w-20 lg:w-24 tracking-tight uppercase italic">{match.champion?.name}</p>
          </div>
        </div>

        {/* KDA & Stats */}
        <div className="flex flex-col items-center justify-center w-32 lg:w-40 px-2 lg:px-4 border-x border-border-default">
          <div className="flex items-baseline gap-0.5 lg:gap-1">
            <span className="text-base lg:text-lg font-black text-kda">{playerRow.kills}</span>
            <span className="text-separator font-bold">/</span>
            <span className="text-base lg:text-lg font-black text-loss">{playerRow.deaths}</span>
            <span className="text-separator font-bold">/</span>
            <span className="text-base lg:text-lg font-black text-kda">{playerRow.assists}</span>
          </div>
          <p className="text-[10px] lg:text-[11px] font-bold text-secondary mt-1">
            <span className={isWin ? 'text-accent' : 'text-secondary'}>{kdaRatio}</span> KDA
          </p>
          <p className="text-[9px] lg:text-[10px] text-muted mt-1 uppercase font-bold">
            CS <span className="text-secondary">{totalCs}</span> <span className="text-[8px] lg:text-[9px] text-separator font-normal">({csPerMin})</span>
          </p>
        </div>

        {/* Participants */}
        <div className="hidden lg:grid grid-cols-2 gap-x-4 px-4 border-x border-border-default py-2">
          <div className="flex flex-col gap-1">
            {(match.participants?.blue || []).map((p, i) => (
              <div key={i} className={`flex items-center gap-1.5 p-0.5 rounded ${p.puuid === playerRow.puuid ? 'bg-win/10' : ''}`}>
                <div className="relative shrink-0">
                  <img src={getChampionIconUrl(p.championName)} className={`w-4 h-4 rounded-sm border ${p.puuid === playerRow.puuid ? 'border-accent' : 'border-icon-border'}`} alt="" />
                </div>
                <span className={`text-[9px] w-20 truncate uppercase tracking-tight font-bold ${p.puuid === playerRow.puuid ? 'text-accent italic' : 'text-secondary'}`}>
                  {p.summonerName}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {(match.participants?.red || []).map((p, i) => (
              <div key={i} className={`flex items-center gap-1.5 p-0.5 rounded ${p.puuid === playerRow.puuid ? 'bg-win/10' : ''}`}>
                <div className="relative shrink-0">
                  <img src={getChampionIconUrl(p.championName)} className={`w-4 h-4 rounded-sm border ${p.puuid === playerRow.puuid ? 'border-accent' : 'border-icon-border'}`} alt="" />
                </div>
                <span className={`text-[9px] w-20 truncate uppercase tracking-tight font-bold ${p.puuid === playerRow.puuid ? 'text-accent italic' : 'text-secondary'}`}>
                  {p.summonerName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="flex items-center pl-4 lg:pl-6">
          <div className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 6, 3, 4, 5].map((itemIdx, i) => {
              const itemId = (playerRow.items || [])[itemIdx] || 0;
              const isTrinket = itemIdx === 6;
              return (
                <div
                  key={i}
                  className={`w-7 h-7 lg:w-8 lg:h-8 rounded shadow-inner flex items-center justify-center overflow-hidden transition-colors border
                    ${isTrinket ? 'rounded-full border-accent/30 bg-accent/5' : 'bg-item border-icon-border'}`}
                >
                  {itemId > 0 ? (
                    <img src={getItemIconUrl(itemId)} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className={`w-full h-full ${isTrinket ? 'bg-accent/5' : 'bg-item-empty'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Expand/Collapse Chevron */}
        <div className={`ml-auto pr-4 text-muted chevron-rotate`} data-expanded={isExpanded}>
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
  );
}
