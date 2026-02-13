import React from 'react';
import { Activity } from 'lucide-react';
import { DD_VERSION, getItemIconUrl } from '../../constants/ddragon.js';
import { useMatchTimeline } from '../../hooks/useMatchTimeline.js';
import RuneDisplay from '../shared/RuneDisplay.jsx';

export default function BuildTab({ playerRow, matchId, playerPuuid }) {
  const { data, isLoading } = useMatchTimeline(matchId, playerPuuid);
  const itemTimeline = data?.itemTimeline;
  const skillOrder = data?.skillOrder;

  const completedItems = playerRow.items.slice(0, 6).filter(id => id > 0);
  const trinket = playerRow.items[6];

  const getSkillPriority = () => {
    if (!skillOrder || skillOrder.length === 0) return ['Q', 'W', 'E'];
    const seen = new Set();
    const priority = [];
    for (const s of skillOrder) {
      if (s.skill !== 'R' && !seen.has(s.skill)) {
        seen.add(s.skill);
        priority.push(s.skill);
        if (priority.length === 3) break;
      }
    }
    return priority.length === 3 ? priority : ['Q', 'W', 'E'];
  };
  const skillPriority = getSkillPriority();

  return (
    <div className="p-4">
      {/* Item Build Timeline */}
      <section className="mb-4">
        <h3 className="text-[10px] font-black text-muted uppercase mb-3 tracking-tighter">Item Builds</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Activity className="w-4 h-4 text-accent animate-spin" />
          </div>
        ) : itemTimeline && itemTimeline.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {itemTimeline.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-0.5">
                    {group.items.map((itemId, itemIdx) => (
                      <div key={itemIdx} className="relative w-7 h-7 rounded border border-icon-border bg-item overflow-hidden">
                        <img src={getItemIconUrl(itemId)} className="w-full h-full" alt="" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] text-muted font-medium">{group.timestamp}m</span>
                </div>
                {groupIdx < itemTimeline.length - 1 && (
                  <div className="text-separator text-sm">›</div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 items-center">
            {completedItems.map((itemId, i) => (
              <div key={i} className="w-8 h-8 rounded border border-icon-border bg-item overflow-hidden">
                <img src={getItemIconUrl(itemId)} className="w-full h-full" alt="" />
              </div>
            ))}
            {trinket > 0 && (
              <div className="w-8 h-8 rounded-full border border-accent/30 bg-item overflow-hidden ml-2">
                <img src={getItemIconUrl(trinket)} className="w-full h-full" alt="" />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Skill Order Section */}
      <section className="mb-4">
        <h3 className="text-[10px] font-black text-muted uppercase mb-3 tracking-tighter">Skill Order</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Activity className="w-4 h-4 text-accent animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {skillPriority.map((skill, idx) => (
                <React.Fragment key={skill}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded border border-icon-border bg-item overflow-hidden">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${playerRow.championName}${skill}.png`}
                        className="w-full h-full"
                        alt={skill}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <span className={`text-[10px] font-black ${skill === 'Q' ? 'text-nord9' : skill === 'W' ? 'text-nord14' : 'text-nord12'}`}>{skill}</span>
                  </div>
                  {idx < 2 && <span className="text-separator text-lg">›</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {(skillOrder || []).slice(0, 18).map((s, idx) => (
                <div
                  key={idx}
                  className={`w-5 h-5 flex items-center justify-center rounded text-[9px] font-black
                    ${s.skill === 'R' ? 'bg-nord13/80 text-nord0' :
                      s.skill === 'Q' ? 'bg-nord9/20 text-nord9 border border-nord9/30' :
                      s.skill === 'W' ? 'bg-nord14/20 text-nord14 border border-nord14/30' :
                      'bg-nord12/20 text-nord12 border border-nord12/30'}`}
                >
                  {s.skill}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Runes */}
      <RuneDisplay playerRow={playerRow} />
    </div>
  );
}
