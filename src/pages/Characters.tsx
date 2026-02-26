import { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useOutletContext, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle ?char= query param (e.g., from RadicalDetail link)
  const charParam = searchParams.get('char');
  const allCharsForLookup = useLiveQuery(() => db.characters.toArray(), []);

  useEffect(() => {
    if (charParam && allCharsForLookup) {
      const match = allCharsForLookup.find((c) => c.char === charParam);
      if (match) {
        setSelected(match);
        setCurrentChar(match.char);
        // Show all HSK levels so the character is visible
        setHskFilter(null);
        setSearchParams({}, { replace: true });
      }
    }
  }, [charParam, allCharsForLookup, setCurrentChar, setSearchParams]);

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

        {/* HSK level filter — only HSK-1 has data currently */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-rice-muted mr-1">HSK:</span>
          <button
            onClick={() => setHskFilter(hskFilter === 1 ? null : 1)}
            className={`min-w-[44px] min-h-[44px] px-3 py-2 text-sm rounded-lg transition-colors ${
              hskFilter === 1
                ? 'bg-cinnabar text-white'
                : 'text-rice-muted hover:text-rice bg-ink-elevated border border-ink-border'
            }`}
          >
            1
          </button>
          {[2, 3, 4, 5, 6].map((lvl) => (
            <span
              key={lvl}
              className="min-w-[44px] min-h-[44px] px-3 py-2 text-sm rounded-lg text-rice-dim bg-ink-elevated/50 border border-ink-border/50 flex items-center justify-center cursor-not-allowed"
              title="Скоро"
            >
              {lvl}
            </span>
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
