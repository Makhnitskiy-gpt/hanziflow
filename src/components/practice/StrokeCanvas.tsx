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

    // Read theme colors from CSS variables for light/dark mode support
    const styles = getComputedStyle(document.documentElement);
    const getVar = (name: string) => styles.getPropertyValue(name).trim();

    const writer = HanziWriter.create(containerRef.current, char, {
      width: size,
      height: size,
      padding: 20,
      showOutline: true,
      showCharacter: false,
      strokeAnimationSpeed: 1.5,
      delayBetweenStrokes: 200,
      strokeColor: getVar('--color-stroke') || '#1a1714',
      outlineColor: getVar('--color-stroke-outline') || '#e0d8cc',
      radicalColor: getVar('--color-gold') || '#b8942e',
      highlightColor: getVar('--color-cinnabar') || '#c53d43',
      drawingColor: getVar('--color-stroke') || '#1a1714',
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
          className="px-4 py-2.5 text-sm text-rice-muted bg-ink-elevated rounded-lg border border-ink-border hover:text-rice transition-colors min-h-[44px]"
        >
          Показать порядок
        </button>
        <button
          onClick={initWriter}
          className="px-4 py-2.5 text-sm text-rice-muted bg-ink-elevated rounded-lg border border-ink-border hover:text-rice transition-colors min-h-[44px]"
        >
          Заново
        </button>
      </div>
    </div>
  );
}
