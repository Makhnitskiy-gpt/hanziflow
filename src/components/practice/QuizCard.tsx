import { useState, useEffect } from 'react';
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

  // Fetch the actual item data
  const itemData = useLiveQuery(async () => {
    if (card.itemType === 'radical') {
      return db.radicals.get(card.itemId);
    }
    return db.characters.get(card.itemId);
  }, [card.itemId, card.itemType]);

  // Reset reveal state when card changes
  useEffect(() => {
    setRevealed(false);
  }, [card.id]);

  if (!itemData) {
    return (
      <div className="flex items-center justify-center h-64 text-rice-dim">
        Загрузка...
      </div>
    );
  }

  const isRecognition = card.cardType === 'recognition';
  const tone = 'tone' in itemData ? itemData.tone : 1;
  const pinyin = itemData.pinyin;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Question */}
      <div className="rice-paper rounded-xl p-8 w-full text-center">
        {isRecognition ? (
          // Recognition: show character, recall meaning
          <>
            <span className="hanzi-lg">{itemData.char}</span>
            <p className="text-xs text-rice-dim mt-3">
              Вспомните значение и чтение
            </p>
          </>
        ) : (
          // Recall: show meaning + pinyin, write character
          <>
            <p className="text-lg text-rice font-medium mb-2">
              {itemData.meaning_ru}
            </p>
            <PinyinDisplay pinyin={pinyin} tone={tone} size="lg" />
            <p className="text-xs text-rice-dim mt-3">
              Напишите иероглиф на панели справа
            </p>
          </>
        )}
      </div>

      {/* Reveal button / Answer */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full py-3 rounded-lg bg-ink-elevated border border-ink-border text-rice hover:bg-ink-surface transition-colors"
        >
          Показать ответ
        </button>
      ) : (
        <div className="w-full">
          {/* Answer section */}
          <div className="rice-paper rounded-xl p-6 w-full text-center mb-6 border border-ink-border">
            {isRecognition ? (
              <>
                <PinyinDisplay pinyin={pinyin} tone={tone} size="lg" />
                <p className="text-lg text-rice font-medium mt-3">
                  {itemData.meaning_ru}
                </p>
                {'meaning_en' in itemData && (
                  <p className="text-sm text-rice-muted mt-1">
                    {itemData.meaning_en}
                  </p>
                )}
              </>
            ) : (
              <>
                <span className="hanzi-lg">{itemData.char}</span>
              </>
            )}

            {/* Mnemonic hint */}
            {'mnemonic_ru' in itemData && itemData.mnemonic_ru && (
              <p className="text-xs text-gold mt-3 italic">
                {itemData.mnemonic_ru}
              </p>
            )}
            {'formation_explanation_ru' in itemData && itemData.formation_explanation_ru && (
              <p className="text-xs text-gold mt-3 italic">
                {itemData.formation_explanation_ru}
              </p>
            )}
          </div>

          {/* Rating buttons */}
          <RatingButtons onRate={onGrade} />
        </div>
      )}
    </div>
  );
}
