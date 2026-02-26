import { useState, useEffect, useCallback, useRef } from 'react';
import { StrokeCanvas } from '@/components/practice/StrokeCanvas';
import { PronounceButton, pronounce } from '@/components/shared/PronounceButton';
import type { LessonDef } from '@/types';

const SLOTS_PER_CHAR = 4;
const AUTO_ADVANCE_DELAY = 600;
const CANVAS_SIZE = 240;

interface LessonPracticeProps {
  lesson: LessonDef;
  onComplete: () => void;
  onCharChange: (char: string) => void;
}

export function LessonPractice({ lesson, onComplete, onCharChange }: LessonPracticeProps) {
  const allChars = [...lesson.radicals, ...lesson.characters];
  const [charIdx, setCharIdx] = useState(0);
  const [slotsDone, setSlotsDone] = useState(0);
  const [completedChars, setCompletedChars] = useState<Set<string>>(new Set());
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentChar = allChars[charIdx];

  // Pronounce current character on change
  useEffect(() => {
    if (currentChar) {
      onCharChange(currentChar);
      pronounce(currentChar);
    }
  }, [currentChar, onCharChange]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const handleSlotComplete = useCallback(() => {
    setSlotsDone((prev) => {
      const next = prev + 1;
      if (next >= SLOTS_PER_CHAR) {
        // All 4 slots done — auto-advance after delay
        advanceTimerRef.current = setTimeout(() => {
          setCompletedChars((s) => new Set(s).add(currentChar));
          if (charIdx < allChars.length - 1) {
            setCharIdx((i) => i + 1);
            setSlotsDone(0);
          } else {
            onComplete();
          }
        }, AUTO_ADVANCE_DELAY);
      }
      return next;
    });
  }, [charIdx, allChars.length, currentChar, onComplete]);

  if (!currentChar) {
    onComplete();
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 max-w-2xl mx-auto fade-in">
      {/* Progress */}
      <div className="flex items-center gap-2 w-full max-w-lg">
        <div className="flex-1 h-1.5 bg-ink-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${((charIdx + (slotsDone / SLOTS_PER_CHAR)) / allChars.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-rice-dim">
          {charIdx + 1}/{allChars.length}
        </span>
      </div>

      {/* Character display + audio */}
      <div className="flex items-center gap-3">
        <span className="hanzi-md text-hanzi">{currentChar}</span>
        <PronounceButton text={currentChar} size="md" />
        <span className="text-sm text-rice-dim">
          {slotsDone}/{SLOTS_PER_CHAR}
        </span>
      </div>

      {/* 2x2 Canvas grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: SLOTS_PER_CHAR }).map((_, slotIdx) => {
          const isActive = slotIdx === slotsDone;
          const isDone = slotIdx < slotsDone;
          const isLocked = slotIdx > slotsDone;

          return (
            <div
              key={`${currentChar}-${charIdx}-${slotIdx}`}
              className={`relative rounded-xl border-2 transition-colors ${
                isDone
                  ? 'border-jade/50 bg-jade/5'
                  : isActive
                  ? 'border-cinnabar bg-ink-surface'
                  : 'border-ink-border bg-ink-elevated opacity-40'
              }`}
            >
              {isDone && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-jade/40">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
              {isActive ? (
                <StrokeCanvas
                  char={currentChar}
                  size={CANVAS_SIZE}
                  skipAnimation={slotIdx > 0}
                  onComplete={handleSlotComplete}
                />
              ) : (
                <div
                  className="flex items-center justify-center"
                  style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
                >
                  {isDone ? (
                    <span className="font-hanzi text-4xl text-jade/30">{currentChar}</span>
                  ) : (
                    <span className="text-rice-dim text-sm">{slotIdx + 1}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Character sequence dots */}
      <div className="flex gap-1.5 flex-wrap justify-center mt-2">
        {allChars.map((ch, i) => (
          <span
            key={i}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-hanzi transition-colors ${
              i === charIdx
                ? 'bg-cinnabar text-white'
                : completedChars.has(ch)
                ? 'bg-jade/20 text-jade'
                : 'bg-ink-elevated text-rice-dim'
            }`}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}
