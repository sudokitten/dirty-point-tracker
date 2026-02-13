import { cn } from '../../utils/cn.js';

export default function DamageBar({ percent, isWin, className }) {
  return (
    <div className={cn('h-1.5 bg-bar rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full damage-bar-fill', isWin ? 'bg-win' : 'bg-loss')}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
