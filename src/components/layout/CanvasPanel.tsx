import { useState } from 'react';
import { StrokeCanvas } from '@/components/practice/StrokeCanvas';
import { WritingPad } from '@/components/practice/WritingPad';

interface CanvasPanelProps {
  currentChar?: string;
}

type CanvasMode = 'stroke' | 'draw';

export function CanvasPanel({ currentChar }: CanvasPanelProps) {
  const [mode, setMode] = useState<CanvasMode>('stroke');

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
          <span className="font-hanzi mr-1">練習</span>
          <span className="text-xs">Штрихи</span>
        </button>
        <button
          onClick={() => setMode('draw')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === 'draw'
              ? 'text-cinnabar border-b-2 border-cinnabar bg-ink-elevated/50'
              : 'text-rice-muted hover:text-rice'
          }`}
        >
          <span className="font-hanzi mr-1">畫</span>
          <span className="text-xs">Рисование</span>
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
              <span className="font-hanzi text-4xl opacity-30">字</span>
              <p className="text-sm text-center">
                Выберите иероглиф для<br />практики штрихов
              </p>
            </div>
          )
        ) : (
          <WritingPad />
        )}
      </div>
    </aside>
  );
}
