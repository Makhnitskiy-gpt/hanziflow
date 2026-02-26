import type { Character, ItemStatus } from '@/types';
import { PinyinDisplay } from '@/components/shared/PinyinDisplay';

interface CharacterCardProps {
  character: Character;
  onClick: (character: Character) => void;
  isSelected: boolean;
}

const formationLabels: Record<string, string> = {
  '象形': '象',
  '指事': '指',
  '会意': '会',
  '形声': '形',
};

const statusColors: Record<ItemStatus, string> = {
  known: 'bg-jade',
  learning: 'bg-gold',
  new: 'bg-rice-dim',
};

export function CharacterCard({ character, onClick, isSelected }: CharacterCardProps) {
  const status: ItemStatus = character.status ?? 'new';
  const formationChar = formationLabels[character.formation_type] ?? '?';

  return (
    <button
      onClick={() => onClick(character)}
      className={`rice-paper relative flex flex-col items-center justify-center w-24 h-24 rounded-md transition-all ${
        isSelected
          ? 'ring-2 ring-cinnabar shadow-lg shadow-cinnabar/10'
          : 'hover:bg-ink-elevated border border-ink-border'
      }`}
    >
      {/* Status dot */}
      <span
        className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${statusColors[status]}`}
      />

      {/* Formation type badge (ink stamp style) */}
      <span className="ink-stamp absolute top-1 left-1 !w-5 !h-5 !text-[8px]">
        {formationChar}
      </span>

      {/* Character */}
      <span className="hanzi-sm">{character.char}</span>

      {/* Pinyin */}
      <PinyinDisplay pinyin={character.pinyin} tone={character.tone} size="sm" />

      {/* Meaning */}
      <span className="text-[10px] text-rice-muted mt-0.5 leading-tight truncate max-w-[88px] text-center">
        {character.meaning_ru}
      </span>
    </button>
  );
}
