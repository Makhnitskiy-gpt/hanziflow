import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { ensureSRSCards } from '@/lib/fsrs';
import { markItemDone } from '@/hooks/useLearningPath';
import { PinyinDisplay } from '@/components/shared/PinyinDisplay';
import type { LessonDef, Radical, Character } from '@/types';

interface LessonLearnProps {
  lesson: LessonDef;
  onComplete: () => void;
  onCharChange: (char: string) => void;
}

type LearnItem = {
  type: 'radical' | 'character';
  char: string;
  data: Radical | Character | null;
};

export function LessonLearn({ lesson, onComplete, onCharChange }: LessonLearnProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Build ordered list: radicals first, then characters
  const items: LearnItem[] = [
    ...lesson.radicals.map((c) => ({ type: 'radical' as const, char: c, data: null })),
    ...lesson.characters.map((c) => ({ type: 'character' as const, char: c, data: null })),
  ];

  // Load data for current item
  const current = items[currentIdx];
  const itemData = useLiveQuery(async () => {
    if (!current) return null;
    if (current.type === 'radical') {
      return db.radicals.where('char').equals(current.char).first() ?? null;
    }
    return db.characters.where('char').equals(current.char).first() ?? null;
  }, [currentIdx, current?.char]);

  // Update canvas when item changes
  useEffect(() => {
    if (current) {
      onCharChange(current.char);
    }
  }, [current?.char, onCharChange]);

  if (!current || !itemData) {
    return (
      <div className="flex items-center justify-center py-12 text-rice-dim">
        <span className="text-sm">Загрузка...</span>
      </div>
    );
  }

  const isRadical = current.type === 'radical';
  const rad = isRadical ? (itemData as Radical) : null;
  const ch = !isRadical ? (itemData as Character) : null;

  const handleNext = async () => {
    // Create SRS cards for this item
    if (itemData && 'id' in itemData) {
      await ensureSRSCards(db, itemData.id, current.type);
      await markItemDone(lesson.id, current.char, current.type);
    }

    if (currentIdx < items.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-ink-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-cinnabar rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / items.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-rice-dim">
          {currentIdx + 1}/{items.length}
        </span>
      </div>

      {/* Item card */}
      <div className="rice-paper rounded-lg p-6">
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2 py-0.5 rounded bg-ink-elevated text-rice-dim border border-ink-border">
            {isRadical ? 'Радикал' : 'Иероглиф'}
          </span>
          {ch?.formation_type && (
            <span className="ink-stamp text-xs">
              {ch.formation_type === '象形' ? '象' :
               ch.formation_type === '指事' ? '指' :
               ch.formation_type === '会意' ? '会' : '形'}
            </span>
          )}
        </div>

        {/* Main display */}
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center">
            <span className="hanzi-lg">{current.char}</span>
            {(rad || ch) && (
              <PinyinDisplay
                pinyin={rad?.pinyin ?? ch?.pinyin ?? ''}
                tone={ch?.tone ?? 1}
                size="md"
              />
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <h2 className="text-xl text-rice font-medium">
              {rad?.meaning_ru ?? ch?.meaning_ru}
            </h2>
            <p className="text-sm text-rice-muted">
              {rad?.meaning_en ?? ch?.meaning_en}
            </p>

            {/* Radical info */}
            {rad && (
              <>
                <p className="text-xs text-rice-dim mt-1">
                  Черт: {rad.strokes} | Категория: {rad.category}
                </p>
                {rad.mnemonic_ru && (
                  <div className="mt-2 p-3 bg-ink-elevated rounded-md border border-ink-border">
                    <p className="text-xs text-jade mb-1">Мнемоника</p>
                    <p className="text-sm text-rice">{rad.mnemonic_ru}</p>
                  </div>
                )}
              </>
            )}

            {/* Character decomposition */}
            {ch && ch.radicals.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-rice-dim mb-1">Состав:</p>
                <div className="flex items-center gap-2">
                  <span className="font-hanzi text-lg text-hanzi">{ch.char}</span>
                  <span className="text-rice-dim">=</span>
                  {ch.radicals.map((r, i) => (
                    <span key={i} className="flex items-center gap-2">
                      {i > 0 && <span className="text-rice-dim">+</span>}
                      <span className="font-hanzi text-lg text-gold">{r}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Formation explanation */}
            {ch?.formation_explanation_ru && (
              <div className="mt-2 p-3 bg-ink-elevated rounded-md border border-ink-border">
                <p className="text-xs text-gold-dim mb-1">Как запомнить</p>
                <p className="text-sm text-rice">{ch.formation_explanation_ru}</p>
              </div>
            )}

            {/* Examples */}
            {ch?.examples_ru && ch.examples_ru.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-rice-dim mb-1">Примеры:</p>
                {ch.examples_ru.map((ex, i) => (
                  <p key={i} className="text-sm text-rice-muted">{ex}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hint about canvas */}
      <p className="text-xs text-rice-dim text-center">
        Попрактикуйте написание на панели справа
      </p>

      {/* Next button */}
      <button
        onClick={handleNext}
        className="self-center px-8 py-3 min-h-[48px] bg-cinnabar text-white rounded-lg font-medium hover:bg-cinnabar/90 transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar"
      >
        {currentIdx < items.length - 1 ? 'Далее' : 'Завершить знакомство'}
      </button>
    </div>
  );
}
