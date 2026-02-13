import { useAnimatedCounter } from '../../hooks/useAnimatedCounter.js';

export default function LpCounter({ value, className }) {
  const display = useAnimatedCounter(value ?? 0);
  return <span className={className}>{display} LP</span>;
}
