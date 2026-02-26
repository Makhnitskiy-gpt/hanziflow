import { useState } from 'react';
import type { LessonDef } from '@/types';

interface LessonPracticeProps {
  lesson: LessonDef;
  onComplete: () => void;
  onCharChange: (char: string) => void;
}

export function LessonPractice({ lesson, onComplete, onCharChange }: LessonPracticeProps) {
  // All items that need stroke practice
  const allChars = [...lesson.radicals, ...lesson.characters];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const currentChar = allChars[currentIdx];

  // When StrokeCanvas in the right panel completes, this gets called via parent
  // For now, user manually advances
  const handleMarkDone = () => {
    const newCompleted = new Set(completed);
    newCompleted.add(currentChar);
    setCompleted(newCompleted);

    if (currentIdx < allChars.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      onCharChange(allChars[nextIdx]);
    } else {
      onComplete();
    }
  };

  // Sync canvas to current character
  if (currentChar) {
    // This effect runs on mount / idx change
    // We call onCharChange in the button handler and on initial render
    if (completed.size === 0 && currentIdx === 0) {
      // Initial call handled by useEffect in parent
    }
  }

  if (!currentChar) {
    onComplete();
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 max-w-md mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-1.5 bg-ink-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / allChars.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-rice-dim">
          {currentIdx + 1}/{allChars.length}
        </span>
      </div>

      <h2 className="text-lg text-rice font-medium">Практика штрихов</h2>

      {/* Current character */}
      <div className="flex flex-col items-center gap-2">
        <span className="hanzi-lg text-hanzi">{currentChar}</span>
        <p className="text-sm text-rice-muted">
          Напишите этот символ на панели справа
        </p>
      </div>

      {/* Character sequence dots */}
      <div className="flex gap-1.5 flex-wrap justify-center">
        {allChars.map((ch, i) => (
          <span
            key={i}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-hanzi transition-colors ${
              i === currentIdx
                ? 'bg-cinnabar text-white'
                : completed.has(ch)
                ? 'bg-jade/20 text-jade'
                : 'bg-ink-elevated text-rice-dim'
            }`}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Manual advance button */}
      <button
        onClick={handleMarkDone}
        className="px-8 py-3 min-h-[48px] bg-cinnabar text-white rounded-lg font-medium hover:bg-cinnabar/90 transition-colors"
      >
        {currentIdx < allChars.length - 1 ? 'Следующий' : 'Завершить практику'}
      </button>
    </div>
  );
}
