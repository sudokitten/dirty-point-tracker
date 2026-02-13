export const RANK_ORDER = ['CHALLENGER', 'GRANDMASTER', 'MASTER', 'DIAMOND', 'EMERALD', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'IRON'];

export const TIER_COLORS = {
  IRON:         { color: '#6B5E5E', glow: 'rgba(107,94,94,0.3)' },
  BRONZE:       { color: '#8B6914', glow: 'rgba(139,105,20,0.3)' },
  SILVER:       { color: '#7C8B9A', glow: 'rgba(124,139,154,0.3)' },
  GOLD:         { color: '#D4A017', glow: 'rgba(212,160,23,0.4)' },
  PLATINUM:     { color: '#0FA87F', glow: 'rgba(15,168,127,0.35)' },
  EMERALD:      { color: '#1B9E56', glow: 'rgba(27,158,86,0.35)' },
  DIAMOND:      { color: '#576BCE', glow: 'rgba(87,107,206,0.4)' },
  MASTER:       { color: '#9D48E0', glow: 'rgba(157,72,224,0.4)' },
  GRANDMASTER:  { color: '#E04848', glow: 'rgba(224,72,72,0.4)' },
  CHALLENGER:   { color: '#F4C874', glow: 'rgba(244,200,116,0.5)' },
};

export const getRankEmblemUrl = (tier) => {
  if (!tier) return null;
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-emblem/emblem-${tier.toLowerCase()}.png`;
};

export const getTierGlowStyle = (tier) => {
  if (!tier) return {};
  const t = TIER_COLORS[tier.toUpperCase()];
  if (!t) return {};
  return { boxShadow: `0 0 20px ${t.glow}, 0 0 40px ${t.glow}` };
};

export const getTierColor = (tier) => {
  if (!tier) return '#4c566a';
  return TIER_COLORS[tier.toUpperCase()]?.color || '#4c566a';
};

export const isAnimatedTier = (tier) => {
  if (!tier) return false;
  const t = tier.toUpperCase();
  return t === 'DIAMOND' || t === 'MASTER' || t === 'GRANDMASTER' || t === 'CHALLENGER';
};
