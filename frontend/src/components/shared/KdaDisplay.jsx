import { cn } from '../../utils/cn.js';

export default function KdaDisplay({ kills, deaths, assists, size = 'md', className }) {
  const sizes = {
    sm: 'text-[11px]',
    md: 'text-sm',
    lg: 'text-base lg:text-lg',
  };

  return (
    <div className={cn('tabular-nums', sizes[size] || sizes.md, className)}>
      <span className="font-black text-kda">{kills}</span>
      <span className="text-separator mx-0.5">/</span>
      <span className="font-black text-loss">{deaths}</span>
      <span className="text-separator mx-0.5">/</span>
      <span className="font-black text-kda">{assists}</span>
    </div>
  );
}
