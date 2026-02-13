import { getChampionIconUrl } from '../../constants/ddragon.js';
import { cn } from '../../utils/cn.js';

export default function ChampionIcon({ name, size = 'md', level, className }) {
  const sizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11 lg:w-14 lg:w-14',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn('relative shrink-0', className)}>
      <img
        src={getChampionIconUrl(name)}
        className={cn(sizes[size] || sizes.md, 'rounded-md border border-icon-border object-cover')}
        alt={name || ''}
      />
      {level != null && (
        <span className="absolute bottom-0 right-0 bg-icon-bg text-primary text-[8px] font-black px-1 rounded border border-icon-border shadow-lg">
          {level}
        </span>
      )}
    </div>
  );
}
