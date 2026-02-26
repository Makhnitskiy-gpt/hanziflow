import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { StrokeCanvas } from '@/components/practice/StrokeCanvas';
import { WritingPad } from '@/components/practice/WritingPad';

interface CanvasPanelProps {
  currentChar?: string;
}

type CanvasMode = 'stroke' | 'draw';

export function CanvasPanel({ currentChar }: CanvasPanelProps) {
  const [mode, setMode] = useState<CanvasMode>('stroke');

  // Resolve itemId and itemType for the current character (for saving mnemonics)
  const itemInfo = useLiveQuery(async () => {
    if (!currentChar) return null;
    const radical = await db.radicals.where('char').equals(currentChar).first();
    if (radical) return { itemId: radical.id, itemType: 'radical' as const };
    const character = await db.characters.where('char').equals(currentChar).first();
    if (character) return { itemId: character.id, itemType: 'character' as const };
    return null;
  }, [currentChar]);

  return (
    <aside className="flex h-full w-[360px] flex-col border-l border-ink-border bg-ink-surface">
      {/* Mode toggle */}
      <div className="flex border-b border-ink-border">
        <button
          onClick={() => setMode('stroke')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === 'stroke'
              ? 'text-cinnabar border-b-2 border-cinnabar bg-ink-elevated/50'
              : 'text-rice-muted hover:text-rice'
          }`}
        >
          Штрихи
        </button>
        <button
          onClick={() => setMode('draw')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === 'draw'
              ? 'text-cinnabar border-b-2 border-cinnabar bg-ink-elevated/50'
              : 'text-rice-muted hover:text-rice'
          }`}
        >
          Рисование
        </button>
      </div>

      {/* Canvas content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {mode === 'stroke' ? (
          currentChar ? (
            <StrokeCanvas
              char={currentChar}
              onComplete={() => {}}
              size={300}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-rice-dim">
              <p className="text-sm text-center">
                Выберите иероглиф для<br />практики штрихов
              </p>
            </div>
          )
        ) : (
          <WritingPad
            itemId={itemInfo?.itemId}
            itemType={itemInfo?.itemType}
          />
        )}
      </div>
    </aside>
  );
}
