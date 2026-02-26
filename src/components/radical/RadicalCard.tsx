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
      className={`rice-paper relative flex flex-col items-center justify-center w-20 h-20 rounded-md transition-all ${
        isSelected
          ? 'ring-2 ring-cinnabar shadow-lg shadow-cinnabar/10'
          : 'hover:bg-ink-elevated border border-ink-border'
      }`}
    >
      {/* Status indicator */}
      <span
        className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${statusColors[status]}`}
      />

      {/* Character */}
      <span className="hanzi-sm">{radical.char}</span>

      {/* Meaning */}
      <span className="text-[10px] text-rice-muted mt-1 leading-tight truncate max-w-[72px] text-center">
        {radical.meaning_ru}
      </span>
    </button>
  );
}
