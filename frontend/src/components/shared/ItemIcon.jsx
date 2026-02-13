import { getItemIconUrl } from '../../constants/ddragon.js';
import { cn } from '../../utils/cn.js';

export default function ItemIcon({ itemId, size = 'md', isTrinket = false, className }) {
  const sizes = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={cn(
      sizeClass,
      'flex items-center justify-center overflow-hidden border',
      isTrinket
        ? 'rounded-full border-accent/30 bg-accent/5 ml-1'
        : 'rounded bg-item border-icon-border',
      className
    )}>
      {itemId > 0 ? (
        <img src={getItemIconUrl(itemId)} className="w-full h-full object-cover" alt="" />
      ) : (
        <div className="w-full h-full bg-item-empty" />
      )}
    </div>
  );
}
