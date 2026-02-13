import { getRankEmblemUrl, getTierGlowStyle, isAnimatedTier } from '../../constants/ranks.js';
import { cn } from '../../utils/cn.js';

export default function RankEmblem({ tier, size = 'lg', className }) {
  if (!tier) return null;

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        isAnimatedTier(tier) && 'tier-shimmer',
        className
      )}
      style={{
        '--tier-glow': getTierGlowStyle(tier).boxShadow ? undefined : 'transparent',
        ...getTierGlowStyle(tier),
        borderRadius: '50%',
      }}
    >
      <img
        src={getRankEmblemUrl(tier)}
        alt={tier}
        className={cn(sizes[size] || sizes.lg, 'object-contain max-w-none')}
      />
    </div>
  );
}
