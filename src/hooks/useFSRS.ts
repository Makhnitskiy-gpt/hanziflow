/**
 * HanziFlow — useFSRS hook
 *
 * Reactive hook that exposes due cards, new cards, stats,
 * and a gradeCard function. Uses Dexie's useLiveQuery for
 * automatic re-renders when the DB changes.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';
import { Rating } from 'ts-fsrs';
import { db } from '@/db';
import {
  getDueCards,
  getNewCards,
  getStats,
  gradeCard as gradeCardPure,
} from '@/lib/fsrs';
import type { SRSCard, SRSStats } from '@/types';

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

interface UseFSRSReturn {
  /** Cards that are due for review right now */
  dueCards: SRSCard[];
  /** Cards in New state (not yet introduced) */
  newCards: SRSCard[];
  /** Aggregate counts */
  stats: SRSStats;
  /** Grade a card and persist the result to DB */
  gradeCard: (
    card: SRSCard,
    rating: typeof Rating.Again | typeof Rating.Hard | typeof Rating.Good | typeof Rating.Easy,
  ) => Promise<SRSCard>;
  /** True while the initial queries are loading */
  loading: boolean;
}

const EMPTY_STATS: SRSStats = { new: 0, learning: 0, review: 0, known: 0 };

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFSRS(
  dueLimit: number = 50,
  newLimit: number = 10,
): UseFSRSReturn {
  // Live queries — re-run automatically when the underlying tables change
  const dueCards = useLiveQuery(() => getDueCards(db, dueLimit), [dueLimit]);
  const newCards = useLiveQuery(() => getNewCards(db, newLimit), [newLimit]);
  const stats = useLiveQuery(() => getStats(db), []);

  const loading =
    dueCards === undefined || newCards === undefined || stats === undefined;

  /**
   * Grade a card, compute the next scheduling, persist to DB.
   * Returns the updated card.
   */
  const gradeCard = useCallback(
    async (
      card: SRSCard,
      rating: typeof Rating.Again | typeof Rating.Hard | typeof Rating.Good | typeof Rating.Easy,
    ): Promise<SRSCard> => {
      const updated = gradeCardPure(card, rating);

      if (updated.id !== undefined) {
        await db.cards.put(updated);
      }

      return updated;
    },
    [],
  );

  return {
    dueCards: dueCards ?? [],
    newCards: newCards ?? [],
    stats: stats ?? EMPTY_STATS,
    gradeCard,
    loading,
  };
}
