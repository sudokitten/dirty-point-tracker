import { Flame } from 'lucide-react';

export default function WinStreakFlame({ count }) {
  if (!count || count < 3) return null;

  return (
    <div className="flex items-center gap-0.5 select-none">
      <Flame
        size={16}
        fill="#d08770"
        className="text-nord12 animate-pulse drop-shadow-[0_0_8px_rgba(208,135,112,0.8)]"
      />
      <span className="text-[11px] font-black italic text-nord12 drop-shadow-sm">
        {count}
      </span>
    </div>
  );
}
