import { useState, useCallback, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { Radical } from '@/types';
import { RadicalGrid } from '@/components/radical/RadicalGrid';
import { RadicalDetail } from '@/components/radical/RadicalDetail';

interface OutletCtx {
  setCurrentChar: (char: string | undefined) => void;
  setCanvasMode: (mode: 'stroke' | 'draw') => void;
  setCanvasHighlight: (v: boolean) => void;
}

export default function Radicals() {
  const { setCurrentChar, setCanvasMode, setCanvasHighlight } = useOutletContext<OutletCtx>();
  const [selected, setSelected] = useState<Radical | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle ?char= query param (e.g., from DecompositionView link)
  const charParam = searchParams.get('char');
  const allRadicals = useLiveQuery(() => db.radicals.toArray(), []);

  useEffect(() => {
    if (charParam && allRadicals) {
      const match = allRadicals.find((r) => r.char === charParam || r.variant === charParam);
      if (match) {
        setSelected(match);
        setCurrentChar(match.char);
        // Clear query param so it doesn't stick
        setSearchParams({}, { replace: true });
      }
    }
  }, [charParam, allRadicals, setCurrentChar, setSearchParams]);

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
      setCanvasMode('stroke');
      setCanvasHighlight(true);
    },
    [setCurrentChar, setCanvasMode, setCanvasHighlight],
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
