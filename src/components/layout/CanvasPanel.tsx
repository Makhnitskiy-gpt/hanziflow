import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { StrokeCanvas } from '@/components/practice/StrokeCanvas';
import { WritingPad } from '@/components/practice/WritingPad';

type CanvasMode = 'stroke' | 'draw';

interface CanvasPanelProps {
  currentChar?: string;
  mode?: CanvasMode;
  onModeChange?: (mode: CanvasMode) => void;
  highlight?: boolean;
  onHighlightDone?: () => void;
}

export function CanvasPanel({
  currentChar,
  mode: externalMode,
  onModeChange,
  highlight,
  onHighlightDone,
}: CanvasPanelProps) {
  const [internalMode, setInternalMode] = useState<CanvasMode>('stroke');
  const mode = externalMode ?? internalMode;
  const setMode = (m: CanvasMode) => {
    setInternalMode(m);
    onModeChange?.(m);
  };

  // Responsive canvas size: smaller on tablets (<1280px), full on desktop
  const [canvasSize, setCanvasSize] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= 1280 ? 300 : 240,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const handler = (e: MediaQueryListEvent) => setCanvasSize(e.matches ? 300 : 240);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Brief highlight animation when practice is triggered
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (highlight) {
      setFlash(true);
      const t = setTimeout(() => {
        setFlash(false);
        onHighlightDone?.();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [highlight, onHighlightDone]);

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
    <aside className={`flex h-full w-[280px] xl:w-[360px] flex-col border-l bg-ink-surface transition-colors duration-300 ${
      flash ? 'border-cinnabar bg-cinnabar/5' : 'border-ink-border'
    }`}>
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
              size={canvasSize}
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
