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
      className={`rice-paper relative flex flex-col items-center justify-center w-[104px] h-[104px] rounded-xl transition-all ${
        isSelected
          ? 'ring-2 ring-cinnabar shadow-lg shadow-cinnabar/10'
          : 'border border-ink-border hover:border-cinnabar/30 hover:shadow-md'
      }`}
    >
      <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${statusColors[status]}`} />
      <span className="ink-stamp ink-stamp-sm absolute top-1.5 left-1.5">{formationChar}</span>
      <span className="hanzi-sm">{character.char}</span>
      <PinyinDisplay pinyin={character.pinyin} tone={character.tone} size="sm" />
      <span className="text-xs text-rice-muted mt-0.5 leading-tight truncate max-w-[92px] text-center">
        {character.meaning_ru}
      </span>
    </button>
  );
}
