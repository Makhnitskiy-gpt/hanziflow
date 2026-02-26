import { useEffect, useRef, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';

interface StrokeCanvasProps {
  char: string;
  onComplete?: () => void;
  onCorrectStroke?: () => void;
  onMistake?: () => void;
  size?: number;
  skipAnimation?: boolean;
}

export function StrokeCanvas({
  char,
  onComplete,
  onCorrectStroke,
  onMistake,
  size = 300,
  skipAnimation = false,
}: StrokeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  // Store callbacks in refs to avoid reinitializing HanziWriter on every parent render
  const onCompleteRef = useRef(onComplete);
  const onCorrectStrokeRef = useRef(onCorrectStroke);
  const onMistakeRef = useRef(onMistake);

  // Keep refs in sync
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onCorrectStrokeRef.current = onCorrectStroke; }, [onCorrectStroke]);
  useEffect(() => { onMistakeRef.current = onMistake; }, [onMistake]);

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

    const startQuiz = () => {
      writer.quiz({
        onCorrectStroke: () => { onCorrectStrokeRef.current?.(); },
        onMistake: () => { onMistakeRef.current?.(); },
        onComplete: () => { onCompleteRef.current?.(); },
      });
    };

    if (skipAnimation) {
      // Go straight to quiz (used in 4x practice mode)
      startQuiz();
    } else {
      // First animate stroke order, then start quiz
      writer.animateCharacter({ onComplete: startQuiz });
    }
  }, [char, size, skipAnimation]); // Only re-init when char, size, or skipAnimation changes

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
          className="px-4 py-2.5 text-sm text-rice-muted bg-ink-elevated rounded-lg border border-ink-border hover:text-rice transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-cinnabar"
        >
          Показать порядок
        </button>
        <button
          onClick={initWriter}
          className="px-4 py-2.5 text-sm text-rice-muted bg-ink-elevated rounded-lg border border-ink-border hover:text-rice transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-cinnabar"
        >
          Заново
        </button>
      </div>
    </div>
  );
}
