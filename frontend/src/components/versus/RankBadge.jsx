import { getTierColor } from '../../constants/ranks.js';

export default function RankBadge({ tier, rank, className }) {
  if (!tier) return <span className={`text-muted font-black uppercase ${className || ''}`}>Unranked</span>;

  return (
    <span
      className={`font-black uppercase ${className || ''}`}
      style={{ color: getTierColor(tier) }}
    >
      {tier} {rank}
    </span>
  );
}
