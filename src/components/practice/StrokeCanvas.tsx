import { useEffect, useRef, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';

interface StrokeCanvasProps {
  char: string;
  onComplete?: () => void;
  onCorrectStroke?: () => void;
  onMistake?: () => void;
  size?: number;
}

export function StrokeCanvas({
  char,
  onComplete,
  onCorrectStroke,
  onMistake,
  size = 300,
}: StrokeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  const initWriter = useCallback(() => {
    if (!containerRef.current) return;

    // Clean up previous instance
    if (writerRef.current) {
      writerRef.current.cancelQuiz();
      containerRef.current.innerHTML = '';
      writerRef.current = null;
    }

    const writer = HanziWriter.create(containerRef.current, char, {
      width: size,
      height: size,
      padding: 20,
      showOutline: true,
      showCharacter: false,
      strokeAnimationSpeed: 1.5,
      delayBetweenStrokes: 200,
      strokeColor: '#e8e0d4', // rice
      outlineColor: '#2a2520', // ink-border
      radicalColor: '#c9a96e', // gold
      highlightColor: '#c53d43', // cinnabar
      drawingColor: '#e8e0d4', // rice
      drawingWidth: 6,
      showHintAfterMisses: 3,
      highlightOnComplete: true,
      charDataLoader: (char: string) => {
        return fetch(
          `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`,
        ).then((r) => r.json());
      },
    });

    writerRef.current = writer;

    // First, animate the stroke order
    writer.animateCharacter({
      onComplete: () => {
        // Then start the quiz
        writer.quiz({
          onCorrectStroke: () => {
            onCorrectStroke?.();
          },
          onMistake: () => {
            onMistake?.();
          },
          onComplete: () => {
            onComplete?.();
          },
        });
      },
    });
  }, [char, size, onComplete, onCorrectStroke, onMistake]);

  useEffect(() => {
    initWriter();

    return () => {
      if (writerRef.current) {
        writerRef.current.cancelQuiz();
        writerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [initWriter]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Mizige grid container */}
      <div
        className="mizige rounded-lg overflow-hidden"
        style={{ width: size, height: size }}
      >
        <div ref={containerRef} />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            writerRef.current?.animateCharacter();
          }}
          className="px-3 py-1.5 text-xs text-rice-muted bg-ink-elevated rounded-md border border-ink-border hover:text-rice transition-colors"
        >
          Показать порядок
        </button>
        <button
          onClick={initWriter}
          className="px-3 py-1.5 text-xs text-rice-muted bg-ink-elevated rounded-md border border-ink-border hover:text-rice transition-colors"
        >
          Заново
        </button>
      </div>
    </div>
  );
}
