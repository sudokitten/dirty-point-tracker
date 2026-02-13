import { getChampionIconUrl, getItemIconUrl } from '../../constants/ddragon.js';

export default function TeamTable({ players, title, isWin, playerPuuid, maxDamage }) {
  return (
    <div className="w-full text-[11px]">
      {/* Mobile Team Header */}
      <div className={`flex md:hidden items-center justify-between px-4 py-2.5 border-b border-border-default ${isWin ? 'bg-win/5' : 'bg-loss/5'}`}>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isWin ? 'text-accent' : 'text-loss'}`}>
          {title}
        </span>
        <span className="text-[10px] text-muted font-bold uppercase">
          {isWin ? 'Victory' : 'Defeat'}
        </span>
      </div>

      {/* Desktop Table Header */}
      <div className={`hidden md:grid grid-cols-[200px_1fr_220px] gap-4 px-5 py-3 border-b border-border-default ${isWin ? 'bg-win/5' : 'bg-loss/5'}`}>
        <div className={`text-[10px] font-black uppercase tracking-widest ${isWin ? 'text-accent' : 'text-loss'}`}>
          {title}
        </div>
        <div className="flex justify-around items-center px-4 text-[10px] font-black uppercase tracking-wider text-muted">
          <span className="w-20 text-center">KDA</span>
          <span className="w-40 text-center">Damage</span>
          <span className="w-12 text-center">Vision</span>
          <span className="w-16 text-center">Gold</span>
          <span className="w-12 text-center">CS</span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-wider text-muted text-right pr-4">Items</div>
      </div>

      {/* Player Rows */}
      {players.map((p, i) => {
        const isMain = p.puuid === playerPuuid;
        const damage = p.totalDamageDealtToChampions || 0;
        const damagePercent = maxDamage > 0 ? (damage / maxDamage) * 100 : 0;
        const cs = (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);

        return (
          <div
            key={i}
            className={`px-3 py-2.5 border-b border-border-default transition-colors ${isMain ? 'bg-win/10 shadow-[inset_3px_0_0_0_var(--border-accent)]' : 'hover:bg-card-hover'}`}
          >
            {/* Mobile: Stacked Layout */}
            <div className="flex flex-col gap-2 md:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img src={getChampionIconUrl(p.championName)} className="w-8 h-8 rounded-md border border-icon-border" alt="" />
                  </div>
                  <p className={`font-bold truncate text-[11px] ${isMain ? 'text-primary' : 'text-secondary'}`}>
                    {p.summonerName}
                  </p>
                </div>
                <div className="text-[11px] tabular-nums shrink-0">
                  <span className="font-black text-kda">{p.kills}</span>
                  <span className="text-separator mx-0.5">/</span>
                  <span className="font-black text-loss">{p.deaths}</span>
                  <span className="text-separator mx-0.5">/</span>
                  <span className="font-black text-kda">{p.assists}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-bar rounded-full overflow-hidden">
                  <div
                    className={`h-full damage-bar-fill ${isWin ? 'bg-win' : 'bg-loss'}`}
                    style={{ width: `${damagePercent}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-muted">
                  {damage >= 1000 ? `${(damage / 1000).toFixed(1)}k` : damage} Damage
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-[10px] tabular-nums">
                  <span className="text-muted"><span className="text-secondary font-bold">{p.visionScore}</span> Vision</span>
                  <span className="text-muted"><span className="text-game-gold font-bold">{(p.goldEarned / 1000).toFixed(1)}k</span> Gold</span>
                  <span className="text-muted"><span className="text-secondary font-bold">{cs}</span> CS</span>
                </div>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const itemId = (p.items || [])[idx];
                    return (
                      <div key={idx} className="w-5 h-5 rounded bg-item border border-icon-border overflow-hidden">
                        {itemId > 0 && <img src={getItemIconUrl(itemId)} className="w-full h-full object-cover" alt="" />}
                      </div>
                    );
                  })}
                  {(() => {
                    const trinketId = (p.items || [])[6];
                    return (
                      <div key="trinket" className="w-5 h-5 rounded-full ml-1 border border-accent/30 bg-item overflow-hidden">
                        {trinketId > 0 && <img src={getItemIconUrl(trinketId)} className="w-full h-full object-cover" alt="" />}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Desktop: Horizontal Layout */}
            <div className="hidden md:grid grid-cols-[200px_1fr_220px] gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={getChampionIconUrl(p.championName)} className="w-9 h-9 rounded-md border border-icon-border shadow-md" alt="" />
                </div>
                <p className={`font-bold truncate text-[12px] ${isMain ? 'text-primary' : 'text-secondary'}`}>
                  {p.summonerName}
                </p>
              </div>

              <div className="flex justify-around items-center px-4 tabular-nums">
                <div className="w-20 text-center text-[12px]">
                  <span className="font-black text-kda">{p.kills}</span>
                  <span className="text-separator mx-0.5">/</span>
                  <span className="font-black text-loss">{p.deaths}</span>
                  <span className="text-separator mx-0.5">/</span>
                  <span className="font-black text-kda">{p.assists}</span>
                </div>
                <div className="w-40 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-bar rounded-full overflow-hidden">
                    <div
                      className={`h-full damage-bar-fill ${isWin ? 'bg-win' : 'bg-loss'}`}
                      style={{ width: `${damagePercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted min-w-[30px]">
                    {damage >= 1000 ? `${(damage / 1000).toFixed(1)}k` : damage}
                  </span>
                </div>
                <span className="w-12 text-center font-bold text-secondary">{p.visionScore}</span>
                <span className="w-16 text-center font-bold text-game-gold">{(p.goldEarned / 1000).toFixed(1)}k</span>
                <span className="w-12 text-center font-bold text-secondary">{cs}</span>
              </div>

              <div className="flex justify-end gap-1">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const itemId = (p.items || [])[idx];
                  return (
                    <div key={idx} className="w-7 h-7 rounded border border-icon-border bg-item overflow-hidden">
                      {itemId > 0 ? (
                        <img src={getItemIconUrl(itemId)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-item-empty" />
                      )}
                    </div>
                  );
                })}
                {(() => {
                  const trinketId = (p.items || [])[6];
                  return (
                    <div key="trinket" className="w-7 h-7 rounded-full ml-1 border border-accent/30 bg-item overflow-hidden">
                      {trinketId > 0 ? (
                        <img src={getItemIconUrl(trinketId)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-item-empty" />
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
