import { cn } from '../../utils/cn.js';

export default function StatValue({ value, label, delta, className }) {
  return (
    <span className={cn('text-muted', className)}>
      <span className="font-bold text-secondary">{value}</span>
      {delta != null && (
        <span className={delta > 0 ? 'text-win ml-1' : delta < 0 ? 'text-loss ml-1' : 'ml-1'}>
          {delta > 0 ? '+' : ''}{delta}
        </span>
      )}
      {label && <span className="ml-0.5">{label}</span>}
    </span>
  );
}
