import { Crown } from 'lucide-react';
import { getProfileIconUrl } from '../../constants/ddragon.js';
import { getRankEmblemUrl, getTierColor, getTierGlowStyle, isAnimatedTier } from '../../constants/ranks.js';
import { normalizeRank } from '../../utils/rankUtils.js';
import { cn } from '../../utils/cn.js';
import LpCounter from './LpCounter.jsx';
import WinStreakFlame from './WinStreakFlame.jsx';
import RankBadge from './RankBadge.jsx';

export default function PlayerPanel({ player, isLeading, isSelected, onSelect, side = 'left' }) {
  const solo = normalizeRank(player.rank);
  const flex = normalizeRank(player.flexRank);
  const tierColor = getTierColor(solo?.tier);
  const tierGlow = getTierGlowStyle(solo?.tier);

  return (
    <button
      onClick={() => onSelect(player.puuid)}
      className={cn(
        'relative flex-1 flex flex-col items-center text-center p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 group overflow-hidden',
        isSelected
          ? 'border-accent bg-card-selected'
          : 'border-border-default bg-card hover:border-border-strong',
        side === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right',
        '@media (hover: hover) { hover:scale-[1.005] }'
      )}
      style={{
        backgroundImage: solo?.tier
          ? `radial-gradient(ellipse at ${side === 'left' ? 'bottom left' : 'bottom right'}, ${tierColor}08 0%, transparent 60%)`
          : undefined
      }}
    >
      {/* Profile Icon */}
      <div className="relative mb-3">
        <img
          src={getProfileIconUrl(player.profileIconId)}
          className="h-14 w-14 rounded-xl border-2 shadow-lg"
          style={{ borderColor: tierColor }}
          alt=""
        />
        <span className="absolute -bottom-1 -right-1 rounded bg-accent px-1.5 py-0.5 text-[7px] font-black text-nord0">
          {player.summonerLevel}
        </span>
      </div>

      {/* Name + Badges */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center mb-3">
        <h3 className="text-sm md:text-base font-black text-primary truncate uppercase italic">
          {player.gameName}
          <span className="text-muted not-italic text-xs">#{player.tagLine}</span>
        </h3>
        {isLeading && (
          <Crown size={16} fill="#ebcb8b" className="text-nord13 drop-shadow-[0_0_8px_rgba(235,203,139,0.5)] shrink-0" />
        )}
        <WinStreakFlame count={player.winStreak} />
      </div>

      {/* Rank Emblem */}
      {solo?.tier && (
        <div
          className={cn('mb-2 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center', isAnimatedTier(solo.tier) && 'tier-shimmer')}
          style={{ '--tier-glow': tierGlow.boxShadow ? undefined : 'transparent' }}
        >
          <img
            src={getRankEmblemUrl(solo.tier)}
            alt={solo.tier}
            className="w-20 h-20 md:w-24 md:h-24 object-contain max-w-none scale-[2.5] pointer-events-none"
          />
        </div>
      )}

      {/* Rank Text */}
      <RankBadge tier={solo?.tier} rank={solo?.rank} className="text-sm md:text-base mb-1" />

      {/* LP */}
      {solo && (
        <LpCounter value={solo.lp} className="text-lg md:text-xl font-black text-primary tabular-nums" />
      )}

      {/* Win Rate */}
      {solo && (
        <div className="mt-1.5 text-[11px] md:text-xs">
          <span className="font-black text-accent">{solo.wr}%</span>
          <span className="text-muted ml-1.5 font-bold">{solo.wins}W {solo.losses}L</span>
        </div>
      )}

      {/* Flex Rank (compact) */}
      {flex && (
        <div className="mt-3 pt-3 border-t border-border-default w-full">
          <div className="flex items-center justify-center gap-2">
            <img src={getRankEmblemUrl(flex.tier)} alt="" className="w-6 h-6 object-contain" />
            <span className="text-[10px] font-black text-muted uppercase">
              Flex: {flex.tier} {flex.rank} — {flex.lp} LP
            </span>
            <span className="text-[10px] text-muted font-bold">{flex.wr}%</span>
          </div>
        </div>
      )}

      {/* Click affordance */}
      <div className={cn(
        'mt-3 text-[10px] font-bold uppercase tracking-wider transition-colors',
        isSelected ? 'text-accent' : 'text-muted group-hover:text-secondary'
      )}>
        {isSelected ? '● Selected' : 'Click for History'}
      </div>
    </button>
  );
}
