import { cn } from '../../utils/cn.js';

export default function ComparisonCell({ label, valueA, valueB, formatFn, higherIsBetter = true, icon }) {
  const a = typeof formatFn === 'function' ? formatFn(valueA) : valueA;
  const b = typeof formatFn === 'function' ? formatFn(valueB) : valueB;

  const numA = typeof valueA === 'number' ? valueA : parseFloat(valueA) || 0;
  const numB = typeof valueB === 'number' ? valueB : parseFloat(valueB) || 0;
  const total = numA + numB || 1;

  const aWins = higherIsBetter ? numA > numB : numA < numB;
  const bWins = higherIsBetter ? numB > numA : numB < numA;
  const tied = numA === numB;

  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border-default min-w-[120px]">
      <span className="text-[9px] font-black uppercase tracking-widest text-muted">{label}</span>

      <div className="flex items-baseline gap-3 w-full justify-center">
        <span className={cn(
          'text-sm font-black tabular-nums',
          aWins ? 'text-accent' : tied ? 'text-primary' : 'text-secondary'
        )}>
          {icon && !aWins ? null : icon}{a}
        </span>
        <span className="text-[10px] text-separator font-bold">vs</span>
        <span className={cn(
          'text-sm font-black tabular-nums',
          bWins ? 'text-accent' : tied ? 'text-primary' : 'text-secondary'
        )}>
          {b}{icon && !bWins ? null : icon}
        </span>
      </div>

      {/* Split bar */}
      <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-bar">
        <div
          className={cn('h-full transition-all duration-500', aWins ? 'bg-accent' : 'bg-secondary/40')}
          style={{ width: `${(numA / total) * 100}%` }}
        />
        <div
          className={cn('h-full transition-all duration-500', bWins ? 'bg-accent' : 'bg-secondary/40')}
          style={{ width: `${(numB / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
