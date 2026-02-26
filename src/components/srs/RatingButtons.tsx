import { useMemo } from 'react';
import { Rating } from 'ts-fsrs';
import type { SRSCard } from '@/types';
import { createFSRS } from '@/lib/fsrs';

interface RatingButtonsProps {
  card: SRSCard;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
}

interface RatingOption {
  rating: 1 | 2 | 3 | 4;
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
}

function formatInterval(days: number): string {
  if (days < 1 / 24) return 'сейчас';
  if (days < 1) {
    const mins = Math.round(days * 24 * 60);
    if (mins < 60) return `${mins} мин`;
    return `${Math.round(mins / 60)} ч`;
  }
  if (days < 30) return `${Math.round(days)} дн`;
  if (days < 365) return `${(days / 30).toFixed(1)} мес`;
  return `${(days / 365).toFixed(1)} г`;
}

export function RatingButtons({ card, onRate }: RatingButtonsProps) {
  const intervals = useMemo(() => {
    const f = createFSRS();
    const fsrsCard = {
      due: new Date(card.due),
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsed_days,
      scheduled_days: card.scheduled_days,
      learning_steps: card.learning_steps,
      reps: card.reps,
      lapses: card.lapses,
      state: card.state,
      last_review: card.last_review ? new Date(card.last_review) : undefined,
    };

    const now = new Date();
    const preview = f.repeat(fsrsCard, now);

    return {
      again: preview[Rating.Again].card.scheduled_days,
      hard: preview[Rating.Hard].card.scheduled_days,
      good: preview[Rating.Good].card.scheduled_days,
      easy: preview[Rating.Easy].card.scheduled_days,
    };
  }, [card]);

  const options: RatingOption[] = [
    {
      rating: 1,
      label: 'Снова',
      sublabel: formatInterval(intervals.again),
      color: 'text-white',
      bgColor: 'bg-cinnabar hover:bg-cinnabar-hover',
    },
    {
      rating: 2,
      label: 'Трудно',
      sublabel: formatInterval(intervals.hard),
      color: 'text-gold',
      bgColor: 'bg-ink-elevated border border-gold-dim hover:border-gold',
    },
    {
      rating: 3,
      label: 'Хорошо',
      sublabel: formatInterval(intervals.good),
      color: 'text-jade',
      bgColor: 'bg-ink-elevated border border-jade-dim hover:border-jade',
    },
    {
      rating: 4,
      label: 'Легко',
      sublabel: formatInterval(intervals.easy),
      color: 'text-rice-muted',
      bgColor: 'bg-ink-elevated border border-ink-border hover:border-rice-dim',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {options.map((opt) => (
        <button
          key={opt.rating}
          onClick={() => onRate(opt.rating)}
          className={`flex flex-col items-center justify-center min-h-[56px] py-3 px-3 rounded-xl transition-all ${opt.color} ${opt.bgColor}`}
        >
          <span className="text-base font-medium">{opt.label}</span>
          <span className="text-xs opacity-60 mt-1">{opt.sublabel}</span>
        </button>
      ))}
    </div>
  );
}
