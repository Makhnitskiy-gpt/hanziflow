import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { SRSCard } from '@/types';
import { PinyinDisplay } from '@/components/shared/PinyinDisplay';
import { RatingButtons } from '@/components/srs/RatingButtons';

interface QuizCardProps {
  card: SRSCard;
  onGrade: (rating: 1 | 2 | 3 | 4) => void;
}

export function QuizCard({ card, onGrade }: QuizCardProps) {
  const [revealed, setRevealed] = useState(false);

  const itemData = useLiveQuery(async () => {
    if (card.itemType === 'radical') {
      return db.radicals.get(card.itemId);
    }
    return db.characters.get(card.itemId);
  }, [card.itemId, card.itemType]);

  // Fetch user-drawn mnemonic if it exists
  const mnemonic = useLiveQuery(async () => {
    const all = await db.mnemonics
      .where('[itemType+itemId]')
      .equals([card.itemType, card.itemId])
      .toArray();
    return all.length > 0 ? all[all.length - 1] : undefined;
  }, [card.itemId, card.itemType]);

  useEffect(() => {
    setRevealed(false);
  }, [card.id]);

  // Keyboard shortcuts: Space = reveal, 1-4 = grade
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ' && !revealed) {
      e.preventDefault();
      setRevealed(true);
    } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault();
      onGrade(Number(e.key) as 1 | 2 | 3 | 4);
    }
  }, [revealed, onGrade]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!itemData) {
    return (
      <div className="flex items-center justify-center h-64 text-rice-dim text-lg">
        Загрузка...
      </div>
    );
  }

  const isRecognition = card.cardType === 'recognition';
  const tone = 'tone' in itemData ? itemData.tone : 1;
  const pinyin = itemData.pinyin;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto fade-in">
      {/* Question card */}
      <div className="rice-paper rounded-2xl p-10 w-full text-center border border-ink-border ornament-corners">
        {isRecognition ? (
          <>
            <span className="hanzi-lg">{itemData.char}</span>
            <p className="text-sm text-rice-dim mt-4">
              Вспомните значение и чтение
            </p>
          </>
        ) : (
          <>
            <p className="text-xl text-rice font-medium mb-3">
              {itemData.meaning_ru}
            </p>
            <PinyinDisplay pinyin={pinyin} tone={tone} size="lg" />
            <p className="text-sm text-rice-dim mt-4">
              Напишите иероглиф на панели справа
            </p>
          </>
        )}
      </div>

      {/* Reveal / Answer */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full py-4 rounded-xl bg-cinnabar text-white text-lg font-medium hover:bg-cinnabar-hover transition-colors shadow-md shadow-cinnabar/15"
        >
          Показать ответ
          <span className="text-sm opacity-60 ml-2">[Пробел]</span>
        </button>
      ) : (
        <div className="w-full fade-in">
          <div className="rice-paper rounded-2xl p-8 w-full text-center mb-6 border border-ink-border">
            {isRecognition ? (
              <>
                <PinyinDisplay pinyin={pinyin} tone={tone} size="lg" />
                <p className="text-xl text-rice font-medium mt-4">
                  {itemData.meaning_ru}
                </p>
                {'meaning_en' in itemData && (
                  <p className="text-base text-rice-muted mt-2">{itemData.meaning_en}</p>
                )}
              </>
            ) : (
              <span className="hanzi-lg">{itemData.char}</span>
            )}

            {'mnemonic_ru' in itemData && itemData.mnemonic_ru && (
              <p className="text-sm text-gold mt-4 italic">{itemData.mnemonic_ru}</p>
            )}
            {'formation_explanation_ru' in itemData && itemData.formation_explanation_ru && (
              <p className="text-sm text-gold mt-4 italic">{itemData.formation_explanation_ru}</p>
            )}

            {mnemonic?.dataUrl && (
              <div className="mt-4 flex justify-center">
                <img
                  src={mnemonic.dataUrl}
                  alt="Мнемоника"
                  className="max-w-[200px] max-h-[120px] rounded-lg border border-ink-border opacity-80"
                />
              </div>
            )}
          </div>

          <RatingButtons card={card} onRate={onGrade} />
        </div>
      )}
    </div>
  );
}
