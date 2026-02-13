import { formatTimeAgo } from '../../utils/formatters.js';

export default function TimeAgo({ timestamp, className }) {
  return <span className={className}>{formatTimeAgo(timestamp)}</span>;
}
