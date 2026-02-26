import { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Rating } from 'ts-fsrs';
import { db } from '@/db';
import type { SRSCard } from '@/types';
import { gradeCard } from '@/lib/fsrs';
import { QuizCard } from '@/components/practice/QuizCard';

interface ReviewDeckProps {
  onSessionComplete?: (reviewed: number) => void;
  onCardGraded?: (card: SRSCard, rating: number) => void;
  onCurrentCharChange?: (char: string | undefined) => void;
}

export function ReviewDeck({ onSessionComplete, onCardGraded, onCurrentCharChange }: ReviewDeckProps) {
  const [reviewed, setReviewed] = useState(0);
  // Snapshot due cards at mount time to avoid index shifts when cards are graded
  // (grading updates the card's due date, which would remove it from a live query)
  const [deckCards, setDeckCards] = useState<SRSCard[] | null>(null);

  useEffect(() => {
    const now = new Date();
    db.cards
      .where('due')
      .belowOrEqual(now)
      .toArray()
      .then((cards) => setDeckCards(cards));
  }, []);

  // Current card is indexed by `reviewed` count within the fixed snapshot
  const currentCard = deckCards ? deckCards[reviewed] : undefined;
  const total = deckCards?.length ?? 0;

  // Lookup current char name and notify parent via useEffect (not inside useLiveQuery)
  const currentCharData = useLiveQuery(async () => {
    if (!currentCard) return undefined;
    if (currentCard.itemType === 'radical') {
      const r = await db.radicals.get(currentCard.itemId);
      return r?.char;
    }
    const c = await db.characters.get(currentCard.itemId);
    return c?.char;
  }, [currentCard?.id]);

  useEffect(() => {
    onCurrentCharChange?.(currentCharData);
  }, [currentCharData, onCurrentCharChange]);

  const handleGrade = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      if (!currentCard) return;

      // Map numeric rating 1-4 to ts-fsrs Rating enum
      const fsrsRatingMap = {
        1: Rating.Again,
        2: Rating.Hard,
        3: Rating.Good,
        4: Rating.Easy,
      } as const;
      const fsrsRating = fsrsRatingMap[rating];
      const updated = gradeCard(currentCard, fsrsRating);

      // Persist the updated card to DB
      if (updated.id !== undefined) {
        await db.cards.put(updated);
      }

      onCardGraded?.(currentCard, rating);

      const nextReviewed = reviewed + 1;
      setReviewed(nextReviewed);

      // Check if we've reviewed all cards
      if (nextReviewed >= total) {
        onSessionComplete?.(nextReviewed);
      }
    },
    [currentCard, reviewed, total, onCardGraded, onSessionComplete],
  );

  // Loading state
  if (deckCards === null) {
    return (
      <div className="flex items-center justify-center h-64 text-rice-dim">
        Загрузка карточек...
      </div>
    );
  }

  // Empty state
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <span className="font-hanzi text-5xl text-rice-dim opacity-30">完</span>
        <p className="text-rice-muted text-sm">
          Нет карточек для повторения
        </p>
        <p className="text-rice-dim text-xs">
          Добавьте радикалы или иероглифы в повторение
        </p>
      </div>
    );
  }

  // Completed state
  if (reviewed >= total) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <span className="font-hanzi text-5xl text-jade">好</span>
        <p className="text-rice text-lg font-medium">Сессия завершена!</p>
        <p className="text-rice-muted text-sm">
          Повторено карточек: {reviewed}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-rice-muted">
        <span>Карточка {reviewed + 1} из {total}</span>
        <span>Повторено: {reviewed}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-ink-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-cinnabar rounded-full transition-[width] duration-300"
          style={{ width: `${(reviewed / total) * 100}%` }}
        />
      </div>

      {/* Current card */}
      <QuizCard card={currentCard!} onGrade={handleGrade} />
    </div>
  );
}
