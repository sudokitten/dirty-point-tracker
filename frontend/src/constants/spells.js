import { DD_VERSION } from './ddragon.js';

export const SPELL_MAP = {
  1: 'SummonerBoost', 3: 'SummonerExhaust', 4: 'SummonerFlash', 6: 'SummonerHaste',
  7: 'SummonerHeal', 11: 'SummonerSmite', 12: 'SummonerTeleport', 13: 'SummonerMana',
  14: 'SummonerDot', 21: 'SummonerBarrier', 32: 'SummonerSnowball'
};

export const getSpellIconUrl = (spellId) => {
  const spellName = SPELL_MAP[spellId] || 'SummonerFlash';
  return `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${spellName}.png`;
};
