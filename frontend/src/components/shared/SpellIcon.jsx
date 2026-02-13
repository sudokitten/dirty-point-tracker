import { getSpellIconUrl } from '../../constants/spells.js';
import { cn } from '../../utils/cn.js';

export default function SpellIcon({ spellId, size = 'md', className }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-5 h-5 lg:w-[22px] lg:h-[22px]',
  };

  return (
    <img
      src={getSpellIconUrl(spellId)}
      className={cn(sizes[size] || sizes.md, 'rounded border border-border-default shadow-sm', className)}
      alt=""
    />
  );
}
