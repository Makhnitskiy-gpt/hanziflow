interface RatingButtonsProps {
  onRate: (rating: 1 | 2 | 3 | 4) => void;
}

interface RatingOption {
  rating: 1 | 2 | 3 | 4;
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
}

const options: RatingOption[] = [
  {
    rating: 1,
    label: 'Снова',
    sublabel: 'сейчас',
    color: 'text-white',
    bgColor: 'bg-cinnabar hover:bg-cinnabar-hover',
  },
  {
    rating: 2,
    label: 'Трудно',
    sublabel: '1 день',
    color: 'text-gold',
    bgColor: 'bg-ink-elevated border border-gold-dim hover:border-gold',
  },
  {
    rating: 3,
    label: 'Хорошо',
    sublabel: '3 дня',
    color: 'text-jade',
    bgColor: 'bg-ink-elevated border border-jade-dim hover:border-jade',
  },
  {
    rating: 4,
    label: 'Легко',
    sublabel: '7 дней',
    color: 'text-rice-muted',
    bgColor: 'bg-ink-elevated border border-ink-border hover:border-rice-dim',
  },
];

export function RatingButtons({ onRate }: RatingButtonsProps) {
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
