import { getRuneIconUrl, getStyleIconUrl } from '../../constants/runes.js';
import { cn } from '../../utils/cn.js';

export function KeystoneIcon({ runeId, className }) {
  return (
    <div className={cn('w-5 h-5 lg:w-[22px] lg:h-[22px] rounded-full bg-icon-bg flex items-center justify-center border border-border-default shadow-inner overflow-hidden', className)}>
      <img src={getRuneIconUrl(runeId)} className="w-4 h-4 lg:w-[18px] lg:h-[18px] object-contain" alt="" />
    </div>
  );
}

export function StyleIcon({ styleId, className }) {
  return (
    <div className={cn('w-5 h-5 lg:w-[22px] lg:h-[22px] flex items-center justify-center', className)}>
      <img src={getStyleIconUrl(styleId)} className="w-4 h-4 lg:w-[16px] lg:h-[16px] opacity-80 object-contain grayscale-[0.2]" alt="" />
    </div>
  );
}

export default function RuneIcon({ runeId, size = 'sm', className }) {
  return (
    <div className={cn(
      size === 'sm' ? 'w-5 h-5' : 'w-8 h-8',
      'rounded-full border border-icon-border bg-overlay overflow-hidden',
      className
    )}>
      {runeId && <img src={getRuneIconUrl(runeId)} className="w-full h-full object-contain" alt="" />}
    </div>
  );
}
