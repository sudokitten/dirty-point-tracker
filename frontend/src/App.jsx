import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlayers } from './hooks/usePlayers.js';
import { useMatches } from './hooks/useMatches.js';
import { useMatchTimeline } from './hooks/useMatchTimeline.js';
import { getRankEmblemUrl } from './constants/ranks.js';
import { getChampionIconUrl, getItemIconUrl, getProfileIconUrl, DD_VERSION } from './constants/ddragon.js';
import { getRuneIconUrl, getStyleIconUrl } from './constants/runes.js';
import { getSpellIconUrl } from './constants/spells.js';
import { getQueueName } from './constants/queues.js';
import { normalizeRank } from './utils/rankUtils.js';
import { formatTimeAgo } from './utils/formatters.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const RankCard = ({ player }) => {
  const solo = normalizeRank(player?.rank);
  if (!player) return null;

  return (
    <div className="glass-panel px-6 pt-4 pb-5 rounded-2xl flex flex-col items-center transition-all duration-300 hover:border-nord8/30 hover:shadow-[0_0_30px_rgba(136,192,208,0.08)]">
      {/* Player Icon + Name + Level */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <img
            src={getProfileIconUrl(player.profileIconId)}
            className="w-16 h-16 rounded-full border-2 border-nord8/30 shadow-lg shadow-nord8/10"
            alt=""
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-nord1 text-nord8 text-[10px] font-black px-2 py-0.5 rounded-full border border-nord8/20">
            {player.summonerLevel}
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight uppercase text-nord6">{player.gameName}</h2>
      </div>

      {/* Rank Emblem */}
      {solo?.tier && (
        <img src={getRankEmblemUrl(solo.tier)} className="w-96 h-96 lg:w-[28rem] lg:h-[28rem] object-contain -my-32 lg:-my-36" alt="Rank" />
      )}

      {/* Rank Info */}
      <div className="mt-1 text-lg font-bold text-nord13 tracking-wide">
        {solo ? `${solo.tier} ${solo.rank}` : 'Unranked'}
      </div>
      {solo && (
        <>
          <div className="mt-0.5 text-2xl font-black text-nord6">{solo.lp} <span className="text-sm font-bold text-nord9">LP</span></div>
          <div className="mt-2 flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
            <span className="text-nord14">{solo.wins}W</span>
            <span className="text-nord3">/</span>
            <span className="text-nord11">{solo.losses}L</span>
            <span className="text-nord3">&mdash;</span>
            <span className="text-nord8">{solo.wr}% WR</span>
          </div>
        </>
      )}
    </div>
  );
};

// ─── BUILD TAB ───
const MatchBuildTab = ({ match, playerRow, puuid }) => {
  const { data, isLoading, isError } = useMatchTimeline(match.matchId, puuid);
  const itemTimeline = data?.itemTimeline;
  const skillOrder = data?.skillOrder;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Runes */}
      <div>
        <h4 className="text-[10px] font-black text-nord8/60 uppercase tracking-[0.2em] mb-4">Runes</h4>
        {playerRow.primaryStyleId || playerRow.secondaryStyleId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Tree */}
            <div className="bg-nord2/40 rounded-xl p-4 border border-nord9/15">
              <div className="flex flex-col items-center gap-3">
                {playerRow.primaryStyleId && getStyleIconUrl(playerRow.primaryStyleId) && (
                  <img src={getStyleIconUrl(playerRow.primaryStyleId)} className="w-8 h-8 opacity-60" alt="" />
                )}
                {(playerRow.primaryRunes || []).map((runeId, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-all ${
                    i === 0 ? 'border-nord13 bg-nord13/10 shadow-[0_0_8px_rgba(235,203,139,0.15)]' : 'border-nord9/20'
                  }`}>
                    {runeId && getRuneIconUrl(runeId) && (
                      <img src={getRuneIconUrl(runeId)} className="w-full h-full p-1.5 object-contain" alt="" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Tree */}
            <div className="bg-nord2/40 rounded-xl p-4 border border-nord9/15">
              <div className="flex flex-col items-center gap-3">
                {playerRow.secondaryStyleId && getStyleIconUrl(playerRow.secondaryStyleId) && (
                  <img src={getStyleIconUrl(playerRow.secondaryStyleId)} className="w-8 h-8 opacity-60" alt="" />
                )}
                {(playerRow.secondaryRunes || []).map((runeId, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-nord9/20 overflow-hidden">
                    {runeId && getRuneIconUrl(runeId) && (
                      <img src={getRuneIconUrl(runeId)} className="w-full h-full p-1.5 object-contain" alt="" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-nord9/40">No rune data available</div>
        )}
      </div>

      {/* Item Build */}
      <div className="pt-4 border-t border-nord9/10">
        <h4 className="text-[10px] font-black text-nord8/60 uppercase tracking-[0.2em] mb-4">Item Build</h4>
        {isLoading ? (
          <div className="text-xs text-nord8/40">Loading build data...</div>
        ) : itemTimeline && itemTimeline.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {itemTimeline.map((group, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex gap-0.5">
                    {group.items.map((itemId, j) => (
                      <div key={j} className="w-8 h-8 rounded-lg border border-nord9/20 bg-nord0 overflow-hidden item-glow-hover transition-all">
                        {getItemIconUrl(itemId) && <img src={getItemIconUrl(itemId)} className="w-full h-full" alt="" />}
                      </div>
                    ))}
                  </div>
                  <span className="text-[8px] text-nord8/40 font-bold">{group.timestamp}m</span>
                </div>
                {i < itemTimeline.length - 1 && (
                  <svg className="w-3 h-3 text-nord8/30" fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(playerRow.items || []).map((itemId, i) => (
              itemId > 0 && (
                <div key={i} className={`w-10 h-10 bg-nord0 border border-nord9/20 overflow-hidden item-glow-hover transition-all ${i === 6 ? 'rounded-full' : 'rounded-lg'}`}>
                  <img src={getItemIconUrl(itemId)} className="w-full h-full" alt="" />
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Skill Order */}
      <div className="pt-4 border-t border-nord9/10">
        <h4 className="text-[10px] font-black text-nord8/60 uppercase tracking-[0.2em] mb-4">Skill Order</h4>
        {skillOrder && skillOrder.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {skillOrder.slice(0, 18).map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 flex items-center justify-center text-[10px] font-black rounded-md ${
                  s.skill === 'R' ? 'bg-nord13/80 text-nord0' :
                  s.skill === 'Q' ? 'bg-nord9/20 text-nord9 border border-nord9/30' :
                  s.skill === 'W' ? 'bg-nord14/20 text-nord14 border border-nord14/30' :
                  'bg-nord12/20 text-nord12 border border-nord12/30'
                }`}>
                  {s.skill}
                </div>
                <span className="text-[8px] text-nord9/40 font-bold">{i + 1}</span>
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <div className="text-xs text-nord8/40">Loading skill data...</div>
        ) : (
          <div className="text-xs text-nord9/40">
            {isError ? 'Timeline unavailable' : 'No skill data available'}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── SCOREBOARD ROW ───
const ScoreboardRow = ({ p, highestDamage, durationMin, puuid }) => {
  const cs = (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
  const csPerMin = durationMin > 0 ? (cs / durationMin).toFixed(1) : '0.0';
  const kdaRatio = p.deaths === 0 ? 'Perfect' : ((p.kills + p.assists) / p.deaths).toFixed(2);
  const dmgDealt = p.totalDamageDealtToChampions || 0;
  const isMe = p.puuid === puuid;

  return (
    <tr className={`border-b border-nord3/10 ${isMe ? 'bg-nord8/10' : 'hover:bg-nord2/40'} transition-colors`}>
      <td className="py-2 px-2">
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <img src={getChampionIconUrl(p.championName)} className={`w-8 h-8 rounded border ${isMe ? 'border-nord8/40' : 'border-nord3/20'}`} alt="" />
            <span className="absolute -bottom-0.5 -right-0.5 bg-nord0 text-nord8 text-[7px] px-0.5 rounded border border-nord3/30">{p.champLevel || 18}</span>
          </div>
          <div className="flex gap-0.5 shrink-0">
            <img src={getSpellIconUrl(p.summoner1Id)} className="w-4 h-4 rounded" alt="" />
            <img src={getSpellIconUrl(p.summoner2Id)} className="w-4 h-4 rounded" alt="" />
          </div>
          <span className={`text-[11px] font-bold truncate max-w-[90px] ${isMe ? 'text-nord8' : 'text-nord4/70'}`}>
            {p.summonerName}
          </span>
        </div>
      </td>
      <td className="py-2 px-2 text-center whitespace-nowrap">
        <div className="text-[11px] font-bold text-nord4">
          <span className="text-nord14">{p.kills}</span>/<span className="text-nord11">{p.deaths}</span>/<span className="text-nord4">{p.assists}</span>
        </div>
        <div className="text-[9px] text-nord9/60">{kdaRatio}</div>
      </td>
      <td className="py-2 px-2">
        <div className="text-[10px] text-nord12 text-right mb-0.5">{dmgDealt.toLocaleString()}</div>
        <div className="w-full bg-nord3/20 h-1 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-nord12 transition-all" style={{ width: `${(dmgDealt / highestDamage) * 100}%` }} />
        </div>
      </td>
      <td className="py-2 px-2 text-center">
        <div className="text-[11px] text-nord7">{p.visionScore || 0}</div>
      </td>
      <td className="py-2 px-2 text-center whitespace-nowrap">
        <div className="text-[11px] text-nord13">{cs}</div>
        <div className="text-[9px] text-nord13/40">{csPerMin}/m</div>
      </td>
      <td className="py-2 px-2">
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
            const itemId = (p.items || [])[idx] || 0;
            return (
              <div key={idx} className={`w-6 h-6 bg-nord0 border border-nord9/15 overflow-hidden ${idx === 6 ? 'rounded-full' : 'rounded'}`}>
                {itemId > 0 && <img src={getItemIconUrl(itemId)} className="w-full h-full" alt="" />}
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
};

// ─── TEAM SCOREBOARD ───
const TeamScoreboard = ({ team, label, isWin, highestDamage, durationMin, puuid }) => {
  const totalKills = team.reduce((s, p) => s + (p.kills || 0), 0);
  const totalGold = team.reduce((s, p) => s + (p.goldEarned || 0), 0);

  return (
    <div className="mb-4">
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${isWin ? 'bg-nord14/15 border border-nord14/25' : 'bg-nord11/15 border border-nord11/25'}`}>
        <span className={`text-[11px] font-black uppercase tracking-wider ${isWin ? 'text-nord14' : 'text-nord11'}`}>
          {isWin ? 'Victory' : 'Defeat'} ({label})
        </span>
        <div className="flex gap-4 text-[10px] font-bold text-nord9/60">
          <span>Kills: <span className="text-nord4">{totalKills}</span></span>
          <span>Gold: <span className="text-nord13">{totalGold.toLocaleString()}</span></span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nord9/15">
              <th className="text-[9px] font-black text-nord9/40 uppercase text-left px-2 py-1.5 w-[200px]">Player</th>
              <th className="text-[9px] font-black text-nord9/40 uppercase text-center px-2 py-1.5">KDA</th>
              <th className="text-[9px] font-black text-nord9/40 uppercase text-center px-2 py-1.5 w-[120px]">Damage</th>
              <th className="text-[9px] font-black text-nord9/40 uppercase text-center px-2 py-1.5">Wards</th>
              <th className="text-[9px] font-black text-nord9/40 uppercase text-center px-2 py-1.5">CS</th>
              <th className="text-[9px] font-black text-nord9/40 uppercase text-left px-2 py-1.5">Items</th>
            </tr>
          </thead>
          <tbody>
            {team.map((p, i) => (
              <ScoreboardRow key={i} p={p} highestDamage={highestDamage} durationMin={durationMin} puuid={puuid} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── OVERVIEW TAB ───
const MatchOverviewTab = ({ match, playerRow, puuid }) => {
  const blue = match.participants?.blue || [];
  const red = match.participants?.red || [];
  const allPlayers = [...blue, ...red];
  const highestDamage = Math.max(...allPlayers.map(p => p.totalDamageDealtToChampions || 0), 1);
  const durationMin = match.gameDuration / 60;
  const blueWon = blue.length > 0 && blue[0].win;

  return (
    <div className="space-y-2 animate-fade-in">
      <TeamScoreboard team={blue} label="Blue Team" isWin={blueWon} highestDamage={highestDamage} durationMin={durationMin} puuid={puuid} />
      <TeamScoreboard team={red} label="Red Team" isWin={!blueWon} highestDamage={highestDamage} durationMin={durationMin} puuid={puuid} />
    </div>
  );
};

// ─── MULTI-KILL TEXT HELPER ───
const getMultiKillText = (count) => {
  if (count === 2) return 'Double Kill';
  if (count === 3) return 'Triple Kill';
  if (count === 4) return 'Quadra Kill';
  if (count >= 5) return 'Penta Kill';
  return '';
};

// ─── MATCH CARD WITH TABS ───
const MatchCard = ({ match, puuid }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  if (!match) return <div />;

  const isWin = match.result === 'win';
  const allPlayers = [...(match.participants?.blue || []), ...(match.participants?.red || [])];
  const playerRow = allPlayers.find(p => p.puuid === puuid);
  if (!playerRow) return <div />;

  const cs = (playerRow.totalMinionsKilled || 0) + (playerRow.neutralMinionsKilled || 0);
  const durationMin = match.gameDuration / 60;
  const csPerMin = durationMin > 0 ? (cs / durationMin).toFixed(1) : '0.0';
  const kdaRatio = playerRow.deaths === 0 ? 'Perfect' : ((playerRow.kills + playerRow.assists) / playerRow.deaths).toFixed(1);
  const teamKills = allPlayers.filter(p => p.win === playerRow.win).reduce((sum, p) => sum + (p.kills || 0), 0) || 1;
  const killParticipation = Math.round(((playerRow.kills + playerRow.assists) / teamKills) * 100);

  return (
    <div className={`group mb-4 rounded-xl overflow-hidden transition-all duration-300 border ${
      isWin ? 'border-nord14/30 shadow-[0_2px_16px_rgba(163,190,140,0.08)]' : 'border-nord11/30 shadow-[0_2px_16px_rgba(191,97,106,0.08)]'
    }`}>
      {/* DENSE HEADER ROW */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between p-3 cursor-pointer transition-colors gap-4 h-[120px] ${
          isWin
            ? 'border-l-4 border-l-nord14 bg-gradient-to-r from-nord14/15 via-nord14/8 to-nord1/80 hover:from-nord14/20 hover:via-nord14/12'
            : 'border-l-4 border-l-nord11 bg-gradient-to-r from-nord11/15 via-nord11/8 to-nord1/80 hover:from-nord11/20 hover:via-nord11/12'
        }`}
      >
        {/* Left: Champ, Spells, Runes */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <img src={getChampionIconUrl(match.champion?.name)} className={`w-12 h-12 rounded-md border ${isWin ? 'border-nord14/30' : 'border-nord11/30'}`} alt="" />
            <span className={`absolute -bottom-1 -right-1 text-[10px] px-1 rounded-full border text-nord4 ${isWin ? 'bg-nord14/20 border-nord14/30' : 'bg-nord11/20 border-nord11/30'}`}>
              {playerRow.champLevel || 18}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-0.5">
            <img src={getSpellIconUrl(playerRow.summoner1Id)} className="w-5 h-5 rounded" alt="" />
            <img src={getSpellIconUrl(playerRow.summoner2Id)} className="w-5 h-5 rounded" alt="" />
            <img src={getRuneIconUrl(playerRow.primaryRuneId || playerRow.primaryRunes?.[0])} className="w-5 h-5 rounded-full bg-nord0/50" alt="" />
            <img src={getStyleIconUrl(playerRow.secondaryStyleId)} className="w-4 h-4 m-auto opacity-60" alt="" />
          </div>
          <div className="ml-1">
            <div className={`text-sm font-black uppercase leading-tight ${isWin ? 'text-nord14' : 'text-nord11'}`}>
              {isWin ? 'Victory' : 'Defeat'}
            </div>
            <div className="text-[9px] text-nord9/50 font-bold uppercase">{formatTimeAgo(match.gameCreation)}</div>
          </div>
        </div>

        {/* Center: Detailed Stats */}
        <div className={`hidden sm:flex flex-1 justify-around items-center px-4 border-x whitespace-nowrap gap-4 ${isWin ? 'border-nord14/15' : 'border-nord11/15'}`}>
          <div className="text-center">
            <div className="text-sm font-bold">
              <span className="text-nord14">{playerRow.kills}</span>
              <span className="text-nord4/40"> / </span>
              <span className="text-nord11">{playerRow.deaths}</span>
              <span className="text-nord4/40"> / </span>
              <span className="text-nord8">{playerRow.assists}</span>
            </div>
            <div className="text-[10px] font-black text-nord9/50 uppercase">{kdaRatio}:1 KDA</div>
          </div>
          <div className="text-center hidden md:block">
            <div className="text-xs font-bold text-nord7">P/Kill {killParticipation}%</div>
            <div className="text-[10px] font-black text-nord9/40 uppercase">{getQueueName(match.queueId)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-nord13">CS {cs} <span className="text-nord13/50">({csPerMin})</span></div>
            <div className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${isWin ? 'bg-nord14/15 text-nord14' : 'bg-nord11/15 text-nord11'}`}>
              {Math.floor(match.gameDuration / 60)}m {match.gameDuration % 60}s
            </div>
          </div>
        </div>

        {/* Right: Items and Multi-kills */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex gap-0.5 items-center">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const itemId = (playerRow.items || [])[idx] || 0;
              return (
                <div key={idx} className="w-7 h-7 bg-nord0/60 rounded border border-nord9/15 overflow-hidden">
                  {itemId > 0 && <img src={getItemIconUrl(itemId)} className="w-full h-full" alt="" />}
                </div>
              );
            })}
            {playerRow.largestMultiKill > 1 && (
              <span className="ml-2 px-2 py-0.5 bg-nord15 text-nord6 text-[9px] font-black uppercase rounded-full shadow-lg shadow-nord15/20">
                {getMultiKillText(playerRow.largestMultiKill)}
              </span>
            )}
          </div>
          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isWin ? 'text-nord14/50' : 'text-nord11/50'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* FULL DATA EXPANSION */}
      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`border-t bg-nord1/80 ${isWin ? 'border-nord14/15' : 'border-nord11/15'}`}>
          {/* Sub-Tabs */}
          <div className={`flex border-b ${isWin ? 'border-nord14/10 bg-nord14/5' : 'border-nord11/10 bg-nord11/5'}`}>
            {['overview', 'build'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === tab ? 'text-nord8 border-b-2 border-nord8 bg-nord8/5' : 'text-nord9/40 hover:text-nord9'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <MatchOverviewTab match={match} playerRow={playerRow} puuid={puuid} />}
            {activeTab === 'build' && <MatchBuildTab match={match} playerRow={playerRow} puuid={puuid} />}
          </div>
        </div>
      </div>
    </div>
  );
};

const INITIAL_DISPLAY = 10;

const BattleFeed = ({ players }) => {
  const { data: p1Matches = [], isLoading: p1Loading } = useMatches(players[0]?.puuid);
  const { data: p2Matches = [], isLoading: p2Loading } = useMatches(players[1]?.puuid);
  const [showAll, setShowAll] = useState(false);

  const p1Displayed = showAll ? p1Matches : p1Matches.slice(0, INITIAL_DISPLAY);
  const p2Displayed = showAll ? p2Matches : p2Matches.slice(0, INITIAL_DISPLAY);
  const isLoading = p1Loading || p2Loading;
  const hasMore = p1Matches.length > INITIAL_DISPLAY || p2Matches.length > INITIAL_DISPLAY;
  const extraCount = Math.max(p1Matches.length, p2Matches.length) - INITIAL_DISPLAY;

  return (
    <section className="max-w-[1600px] mx-auto mt-20 px-4 mb-20">
      <div className="flex flex-col items-center mb-12">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-nord8/20 to-transparent mb-8" />
        <div className="flex items-center gap-3">
          <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-nord8/40"></span>
          <h3 className="text-3xl font-black uppercase tracking-[0.2em] text-nord8">Recent Matches</h3>
          <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-nord8/40"></span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-nord8/40 text-sm py-12 uppercase tracking-widest">Loading matches...</div>
      ) : Math.max(p1Matches.length, p2Matches.length) === 0 ? (
        <div className="text-center text-nord9/40 text-sm py-12">No recent matches</div>
      ) : (
        <>
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Central Decorative Spine */}
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-nord8/20 via-nord9/10 to-transparent hidden md:block" />

            {/* Player 1 Column */}
            <div className="space-y-4">
              {p1Displayed.map((m, idx) => (
                <MatchCard key={m?.matchId || idx} match={m} puuid={players[0]?.puuid} />
              ))}
            </div>

            {/* Player 2 Column */}
            <div className="space-y-4">
              {p2Displayed.map((m, idx) => (
                <MatchCard key={m?.matchId || idx} match={m} puuid={players[1]?.puuid} />
              ))}
            </div>
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowAll(v => !v)}
                className={`px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 ${
                  showAll
                    ? 'text-nord9/40 hover:text-nord9/60 border border-nord9/10 hover:border-nord9/20'
                    : 'text-nord8/60 hover:text-nord8 border border-nord8/15 hover:border-nord8/30 bg-nord0/30 hover:bg-nord0/50'
                }`}
              >
                {showAll ? 'Show Less' : `Show More Matches (${extraCount} more)`}
              </button>
            </div>
          )}
        </>
      )}

    </section>
  );
};

function AppContent() {
  const { data: players = [], isLoading } = usePlayers();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-nord8/50 text-sm uppercase tracking-widest">Loading race data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      {/* HEADER */}
      <header className="max-w-[1600px] mx-auto mb-16 pt-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-nord7/40"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-nord7">Season 2026</span>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-nord7/40"></div>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-[0.15em] uppercase text-nord8">League of Legends</h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-nord9/50">Ranked Race</p>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-12">
        {/* VS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          <RankCard player={players[0]} />

          <div className="flex flex-col items-center">
            <div className="vs-glitch text-6xl font-black italic text-nord8/25 select-none">VS</div>
            <div className="h-24 w-[1px] bg-gradient-to-b from-transparent via-nord8/15 to-transparent"></div>
          </div>

          <RankCard player={players[1]} />
        </section>

        {/* BATTLE FEED */}
        <BattleFeed players={players} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
