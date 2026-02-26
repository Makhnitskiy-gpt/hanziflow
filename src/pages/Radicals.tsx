import { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Radical } from '@/types';
import { RadicalGrid } from '@/components/radical/RadicalGrid';
import { RadicalDetail } from '@/components/radical/RadicalDetail';

interface OutletCtx {
  setCurrentChar: (char: string | undefined) => void;
}

export default function Radicals() {
  const { setCurrentChar } = useOutletContext<OutletCtx>();
  const [selected, setSelected] = useState<Radical | null>(null);

  const handleSelect = useCallback(
    (radical: Radical) => {
      setSelected(radical);
      setCurrentChar(radical.char);
    },
    [setCurrentChar],
  );

  const handlePractice = useCallback(
    (char: string) => {
      setCurrentChar(char);
    },
    [setCurrentChar],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-rice font-medium">Радикалы</h1>
        {selected && (
          <button
            onClick={() => {
              setSelected(null);
              setCurrentChar(undefined);
            }}
            className="text-xs text-rice-muted hover:text-rice transition-colors"
          >
            Сбросить выбор
          </button>
        )}
      </div>

      {/* Show detail when selected */}
      {selected && (
        <RadicalDetail
          radical={selected}
          onPractice={handlePractice}
          onAddToReview={() => {}}
        />
      )}

      {/* Divider */}
      {selected && <div className="brush-divider" />}

      {/* Grid */}
      <RadicalGrid
        onSelect={handleSelect}
        selectedId={selected?.id}
      />
    </div>
  );
}
