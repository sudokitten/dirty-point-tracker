export function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

export function formatValue(val, statId) {
  if (statId === 'gold' || statId === 'damage') {
    return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val;
  }
  return val;
}

export function formatKda(kills, deaths, assists) {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
}

export function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}

export function formatDurationShort(seconds) {
  return `${Math.floor(seconds / 60)}m`;
}
