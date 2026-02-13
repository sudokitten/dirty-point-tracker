import { Activity } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export default function LoadingSpinner({ size = 'lg', text, className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Activity className={cn(sizes[size] || sizes.lg, 'text-accent animate-spin')} />
      {text && (
        <p className="text-xs font-black uppercase tracking-widest text-muted">{text}</p>
      )}
    </div>
  );
}
