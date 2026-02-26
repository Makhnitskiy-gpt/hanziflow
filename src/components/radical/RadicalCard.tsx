import type { Radical, ItemStatus } from '@/types';

interface RadicalCardProps {
  radical: Radical;
  onClick: (radical: Radical) => void;
  isSelected: boolean;
}

const statusColors: Record<ItemStatus, string> = {
  known: 'bg-jade',
  learning: 'bg-gold',
  new: 'bg-rice-dim',
};

export function RadicalCard({ radical, onClick, isSelected }: RadicalCardProps) {
  const status: ItemStatus = radical.status ?? 'new';

  return (
    <button
      onClick={() => onClick(radical)}
      className={`rice-paper relative flex flex-col items-center justify-center w-[88px] h-[88px] rounded-xl transition-all ${
        isSelected
          ? 'ring-2 ring-cinnabar shadow-lg shadow-cinnabar/10'
          : 'border border-ink-border hover:border-cinnabar/30 hover:shadow-md'
      }`}
    >
      <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${statusColors[status]}`} />
      <span className="hanzi-sm">{radical.char}</span>
      <span className="text-xs text-rice-muted mt-1.5 leading-tight truncate max-w-[76px] text-center">
        {radical.meaning_ru}
      </span>
    </button>
  );
}
