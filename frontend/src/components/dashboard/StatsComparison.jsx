import { normalizeRank } from '../../utils/rankUtils.js';
import ComparisonCell from './ComparisonCell.jsx';

export default function StatsComparison({ players }) {
  if (players.length !== 2) return null;

  const [a, b] = players;
  const rankA = normalizeRank(a.rank);
  const rankB = normalizeRank(b.rank);

  if (!rankA && !rankB) return null;

  return (
    <section className="animate-fade-slide-up mb-8 sm:mb-12">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        <ComparisonCell
          label="Win Rate"
          valueA={rankA?.wr ?? 0}
          valueB={rankB?.wr ?? 0}
          formatFn={(v) => `${v}%`}
          higherIsBetter={true}
        />
        <ComparisonCell
          label="Games"
          valueA={(rankA?.wins ?? 0) + (rankA?.losses ?? 0)}
          valueB={(rankB?.wins ?? 0) + (rankB?.losses ?? 0)}
          higherIsBetter={true}
        />
        <ComparisonCell
          label="Wins"
          valueA={rankA?.wins ?? 0}
          valueB={rankB?.wins ?? 0}
          higherIsBetter={true}
        />
        <ComparisonCell
          label="Losses"
          valueA={rankA?.losses ?? 0}
          valueB={rankB?.losses ?? 0}
          higherIsBetter={false}
        />
        <ComparisonCell
          label="LP"
          valueA={rankA?.lp ?? 0}
          valueB={rankB?.lp ?? 0}
          higherIsBetter={true}
        />
      </div>
    </section>
  );
}
