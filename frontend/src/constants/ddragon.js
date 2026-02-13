export const DD_VERSION = '16.3.1';

export const getProfileIconUrl = (iconId) =>
  iconId ? `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/profileicon/${iconId}.png` : null;

export const getChampionIconUrl = (championName) => {
  if (!championName) return null;
  const nameMap = {
    'FiddleSticks': 'Fiddlesticks', 'Wukong': 'MonkeyKing', 'RekSai': 'RekSai',
    'Nunu & Willump': 'Nunu', 'BelVeth': 'Belveth', 'KaiSa': 'Kaisa',
    'KhaZix': 'Khazix', 'VelKoz': 'Velkoz', 'ChoGath': 'Chogath',
    'LeBlanc': 'Leblanc', 'KSante': 'KSante'
  };
  const formatted = nameMap[championName] || championName;
  return `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${formatted}.png`;
};

export const getItemIconUrl = (itemId) =>
  itemId > 0 ? `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/item/${itemId}.png` : null;
