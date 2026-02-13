import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn.js';

export default function TopBar({ lastUpdated }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Calculate staleness
  const staleness = lastUpdated ? (Date.now() - lastUpdated.getTime()) / 1000 : null;
  const staleClass = staleness == null ? 'text-muted'
    : staleness > 900 ? 'text-loss'
    : staleness > 300 ? 'text-game-gold'
    : 'text-muted';

  return (
    <header className={cn(
      'sticky top-0 z-50 h-12 flex items-center justify-between px-4 sm:px-6 transition-all duration-200 animate-slide-down',
      scrolled
        ? 'backdrop-blur-md bg-page/80 shadow-lg border-b border-border-default'
        : 'bg-transparent'
    )}>
      {/* Wordmark */}
      <h1 className="text-lg sm:text-xl font-black tracking-tighter uppercase italic text-primary">
        <span className="hidden xs:inline">DIRTY POINTR</span>
        <span className="xs:hidden">DP</span>
        <span className="text-accent ml-1 text-sm sm:text-base">RANKED RACE</span>
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <div className={cn('flex items-center gap-1.5 text-[10px] font-bold', staleClass)}>
            <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full bg-nord14 inline-block" />
            <span className="hidden sm:inline">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
