import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';

interface Derivative {
  char: string;
  meaning_ru: string;
  pinyin: string;
}

interface FamilyTreeProps {
  rootChar: string;
  rootPinyin?: string;
  rootMeaning?: string;
  derivatives: Derivative[];
  onCharSelect: (char: string) => void;
}

export function FamilyTree({
  rootChar,
  rootPinyin,
  rootMeaning,
  derivatives,
  onCharSelect,
}: FamilyTreeProps) {
  // Get learned characters
  const learnedChars = useLiveQuery(async () => {
    const cards = await db.cards.where('itemType').equals('character').toArray();
    const known = new Set<string>();
    const charData = await db.characters.toArray();
    const charMap = new Map(charData.map((c) => [c.id, c.char]));
    for (const card of cards) {
      if (card.state >= 1) {
        const ch = charMap.get(card.itemId);
        if (ch) known.add(ch);
      }
    }
    return known;
  }, []);

  const known = learnedChars ?? new Set<string>();

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Root character */}
      <div className="flex flex-col items-center">
        <div className="rice-paper rounded-lg p-4 border-2 border-gold-dim">
          <span className="hanzi-lg">{rootChar}</span>
        </div>
        {rootPinyin && (
          <span className="text-sm text-gold mt-1">{rootPinyin}</span>
        )}
        {rootMeaning && (
          <span className="text-xs text-rice-muted mt-0.5">{rootMeaning}</span>
        )}
        <span className="text-xs text-rice-dim mt-1">Корневой компонент</span>
      </div>

      {/* Connecting line */}
      <div className="w-px h-8 bg-ink-border" />

      {/* Branch connector */}
      <div className="relative w-full max-w-lg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-px bg-ink-border" />
      </div>

      {/* Derivatives */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3 w-full max-w-2xl">
        {derivatives.map((d) => {
          const isKnown = known.has(d.char);
          return (
            <button
              key={d.char}
              onClick={() => onCharSelect(d.char)}
              className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                isKnown
                  ? 'rice-paper border-ink-border hover:border-jade'
                  : 'bg-ink-surface border-ink-border fog hover:filter-none hover:opacity-100'
              }`}
            >
              <span className="font-hanzi text-3xl text-hanzi">{d.char}</span>
              <span className="text-xs text-gold mt-1">{d.pinyin}</span>
              <span className="text-xs text-rice-muted mt-0.5 text-center leading-tight">
                {d.meaning_ru}
              </span>
            </button>
          );
        })}
      </div>

      {derivatives.length === 0 && (
        <p className="text-sm text-rice-dim text-center">
          Нет производных иероглифов
        </p>
      )}
    </div>
  );
}
