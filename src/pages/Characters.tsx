import { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/db';
import type { Character, ItemStatus } from '@/types';
import { CharacterCard } from '@/components/character/CharacterCard';
import { DecompositionView } from '@/components/character/DecompositionView';

interface OutletCtx {
  setCurrentChar: (char: string | undefined) => void;
}

export default function Characters() {
  const { setCurrentChar } = useOutletContext<OutletCtx>();
  const [selected, setSelected] = useState<Character | null>(null);
  const [hskFilter, setHskFilter] = useState<number | null>(1);

  const characters = useLiveQuery(async () => {
    const items = hskFilter !== null
      ? await db.characters.where('hsk_level').equals(hskFilter).toArray()
      : await db.characters.toArray();

    // Enrich with status
    const cards = await db.cards.where('itemType').equals('character').toArray();
    const statusMap = new Map<number, ItemStatus>();
    for (const card of cards) {
      if (card.state >= 2) statusMap.set(card.itemId, 'known');
      else if (card.state >= 1 && !statusMap.has(card.itemId)) statusMap.set(card.itemId, 'learning');
    }
    return items.map((c) => ({ ...c, status: statusMap.get(c.id) ?? 'new' as ItemStatus }));
  }, [hskFilter]);

  const handleSelect = useCallback(
    (character: Character) => {
      setSelected(character);
      setCurrentChar(character.char);
    },
    [setCurrentChar],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-rice font-medium">Иероглифы</h1>

        {/* HSK level filter */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-rice-muted mr-2">HSK:</span>
          {[1, 2, 3, 4, 5, 6].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setHskFilter(hskFilter === lvl ? null : lvl)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                hskFilter === lvl
                  ? 'bg-cinnabar text-rice'
                  : 'text-rice-muted hover:text-rice bg-ink-elevated'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Selected character detail */}
      {selected && (
        <>
          <DecompositionView character={selected} />
          <div className="brush-divider" />
        </>
      )}

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,104px)] gap-3">
        {characters?.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onClick={handleSelect}
            isSelected={character.id === selected?.id}
          />
        ))}
      </div>

      {characters && characters.length === 0 && (
        <p className="text-rice-dim text-sm text-center py-8">
          Нет иероглифов для выбранного уровня
        </p>
      )}
    </div>
  );
}
