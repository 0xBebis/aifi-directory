import { Star } from 'lucide-react';
import { getScoreColorClass } from '@/lib/data';

interface ReputationBadgeProps {
  score: number | null;
  feedbackCount: number;
  className?: string;
}

export default function ReputationBadge({ score, feedbackCount, className = '' }: ReputationBadgeProps) {
  if (score === null) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-text-faint ${className}`}>
        <Star size={12} />
        <span>No ratings</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${getScoreColorClass(score)} ${className}`}>
      <Star size={12} className="fill-current" />
      <span>{score.toFixed(1)}</span>
      {feedbackCount > 0 && (
        <span className="text-text-faint font-normal">({feedbackCount})</span>
      )}
    </span>
  );
}
