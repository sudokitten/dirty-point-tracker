import { getProfileIconUrl } from '../../constants/ddragon.js';
import { cn } from '../../utils/cn.js';

export default function PlayerMatchTab({ player, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-left',
        isSelected
          ? 'bg-accent/10 border border-accent/30 text-primary'
          : 'border border-border-default text-secondary hover:border-border-strong hover:text-primary'
      )}
    >
      <img
        src={getProfileIconUrl(player.profileIconId)}
        className={cn('w-7 h-7 rounded-md border', isSelected ? 'border-accent' : 'border-icon-border')}
        alt=""
      />
      <div className="min-w-0">
        <p className="text-xs font-black uppercase italic truncate">
          {player.gameName}
          <span className="text-muted not-italic font-bold">#{player.tagLine}</span>
        </p>
      </div>
    </button>
  );
}
