import { getRuneIconUrl, getStatShardIconUrl, getStyleIconUrl } from '../../constants/runes.js';

export default function RuneDisplay({ playerRow }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border-default">
      {/* Primary Runes */}
      <div className="flex items-center gap-3 bg-overlay p-3 rounded-xl border border-border-default">
        <div className="w-10 h-10 rounded-full border-2 border-accent p-0.5 shadow-[0_0_10px_rgba(136,192,208,0.3)] flex-shrink-0">
          <img src={getRuneIconUrl(playerRow.primaryRunes?.[0])} className="w-full h-full object-contain" alt="" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 opacity-60"><img src={getStyleIconUrl(playerRow.primaryStyleId)} className="w-full h-full" alt="" /></div>
            <span className="text-[10px] text-muted font-medium">Primary</span>
          </div>
          <div className="flex gap-1">
            {playerRow.primaryRunes?.slice(1, 4).map((runeId, idx) => (
              <div key={idx} className="w-5 h-5 rounded-full border border-icon-border bg-overlay overflow-hidden">
                {runeId && <img src={getRuneIconUrl(runeId)} className="w-full h-full object-contain" alt="" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Runes */}
      <div className="flex items-center gap-3 bg-overlay p-3 rounded-xl border border-border-default">
        <div className="w-8 h-8 opacity-70 flex-shrink-0">
          <img src={getStyleIconUrl(playerRow.secondaryStyleId)} className="w-full h-full" alt="" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted font-medium">Secondary</span>
          <div className="flex gap-1">
            {playerRow.secondaryRunes?.map((runeId, idx) => (
              <div key={idx} className="w-5 h-5 rounded-full border border-icon-border bg-overlay overflow-hidden">
                {runeId && <img src={getRuneIconUrl(runeId)} className="w-full h-full object-contain" alt="" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Shards */}
      <div className="flex items-center gap-3 bg-overlay p-3 rounded-xl border border-border-default">
        <span className="text-[10px] text-muted font-medium">Shards:</span>
        <div className="flex gap-2">
          {playerRow.statShards && (
            <>
              <div className="w-5 h-5 rounded-full border border-icon-border bg-overlay overflow-hidden" title="Offense">
                <img src={getStatShardIconUrl(playerRow.statShards.offense)} className="w-full h-full object-contain" alt="" />
              </div>
              <div className="w-5 h-5 rounded-full border border-icon-border bg-overlay overflow-hidden" title="Flex">
                <img src={getStatShardIconUrl(playerRow.statShards.flex)} className="w-full h-full object-contain" alt="" />
              </div>
              <div className="w-5 h-5 rounded-full border border-icon-border bg-overlay overflow-hidden" title="Defense">
                <img src={getStatShardIconUrl(playerRow.statShards.defense)} className="w-full h-full object-contain" alt="" />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
