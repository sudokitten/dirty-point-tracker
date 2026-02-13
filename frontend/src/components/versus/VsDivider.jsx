import { Swords } from 'lucide-react';

export default function VsDivider({ lpDelta, leaderName }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4 md:py-0 animate-vs-reveal">
      <div className="relative">
        <Swords className="w-8 h-8 text-accent opacity-80" />
      </div>
      <span className="text-2xl md:text-3xl font-black italic text-accent tracking-tighter">VS</span>
      {lpDelta != null && leaderName && (
        <p className="text-[10px] md:text-xs text-secondary font-bold text-center max-w-[140px]">
          <span className="text-accent">{leaderName}</span> leads by{' '}
          <span className="text-primary font-black">{Math.abs(lpDelta)}</span> LP
        </p>
      )}
    </div>
  );
}
