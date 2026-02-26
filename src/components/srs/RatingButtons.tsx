interface RatingButtonsProps {
  onRate: (rating: 1 | 2 | 3 | 4) => void;
}

interface RatingOption {
  rating: 1 | 2 | 3 | 4;
  label: string;
  sublabel: string;
  color: string;
  hoverColor: string;
}

const options: RatingOption[] = [
  {
    rating: 1,
    label: 'Снова',
    sublabel: 'сейчас',
    color: 'border-cinnabar text-cinnabar',
    hoverColor: 'hover:bg-cinnabar/10',
  },
  {
    rating: 2,
    label: 'Трудно',
    sublabel: '1 день',
    color: 'border-gold text-gold',
    hoverColor: 'hover:bg-gold/10',
  },
  {
    rating: 3,
    label: 'Хорошо',
    sublabel: '3 дня',
    color: 'border-jade text-jade',
    hoverColor: 'hover:bg-jade/10',
  },
  {
    rating: 4,
    label: 'Легко',
    sublabel: '7 дней',
    color: 'border-rice-dim text-rice-muted',
    hoverColor: 'hover:bg-rice-dim/10',
  },
];

export function RatingButtons({ onRate }: RatingButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map((opt) => (
        <button
          key={opt.rating}
          onClick={() => onRate(opt.rating)}
          className={`flex flex-col items-center justify-center min-h-12 py-2 px-2 rounded-lg border transition-colors ${opt.color} ${opt.hoverColor}`}
        >
          <span className="text-sm font-medium">{opt.label}</span>
          <span className="text-[10px] opacity-60 mt-0.5">{opt.sublabel}</span>
        </button>
      ))}
    </div>
  );
}
