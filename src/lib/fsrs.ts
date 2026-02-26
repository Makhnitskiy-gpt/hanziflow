/**
 * HanziFlow — FSRS wrapper
 *
 * Thin layer over ts-fsrs v5 providing:
 * - Pre-configured FSRS instance
 * - Card grading with DB persistence
 * - Query helpers for due / new cards
 * - Aggregate stats
 */

import { fsrs, Rating, State, createEmptyCard } from 'ts-fsrs';
import type { FSRS, Card, RecordLogItem } from 'ts-fsrs';
import type { SRSCard, SRSStats } from '@/types';
import type { default as DBType } from '@/db';

// ---------------------------------------------------------------------------
// FSRS instance (singleton)
// ---------------------------------------------------------------------------

let _fsrsInstance: FSRS | null = null;

/**
 * Returns a shared FSRS instance with sensible defaults for Chinese learning.
 * Slightly higher retention target (0.92) — characters are visual and benefit
 * from more frequent early review.
 */
export function createFSRS(): FSRS {
  if (!_fsrsInstance) {
    _fsrsInstance = fsrs({
      request_retention: 0.92,
      maximum_interval: 365,
      enable_short_term: true,
    });
  }
  return _fsrsInstance;
}

// ---------------------------------------------------------------------------
// Card ↔ ts-fsrs Card conversion
// ---------------------------------------------------------------------------

/** Extract the ts-fsrs Card fields from our SRSCard */
function toFSRSCard(card: SRSCard): Card {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  };
}

/** Merge ts-fsrs scheduling result back into our SRSCard */
function mergeFSRSResult(original: SRSCard, result: RecordLogItem): SRSCard {
  const c = result.card;
  return {
    ...original,
    due: c.due,
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Grade a card and return the updated SRSCard (not yet persisted).
 *
 * @param card  The current SRSCard from DB
 * @param rating  1 = Again, 2 = Hard, 3 = Good, 4 = Easy
 * @returns Updated SRSCard with next review date computed
 */
export function gradeCard(
  card: SRSCard,
  rating: typeof Rating.Again | typeof Rating.Hard | typeof Rating.Good | typeof Rating.Easy,
): SRSCard {
  const f = createFSRS();
  const fsrsCard = toFSRSCard(card);
  const now = new Date();

  const preview = f.repeat(fsrsCard, now);
  const result: RecordLogItem = preview[rating];

  return mergeFSRSResult(card, result);
}

/**
 * Get cards that are due for review (due <= now), sorted by due date ascending.
 */
export async function getDueCards(
  db: typeof DBType,
  limit: number = 50,
): Promise<SRSCard[]> {
  const now = new Date();
  return db.cards
    .where('due')
    .belowOrEqual(now)
    .and((card) => card.state !== State.New)
    .sortBy('due')
    .then((cards) => cards.slice(0, limit));
}

/**
 * Get cards in New state, ordered by id (introduction order).
 */
export async function getNewCards(
  db: typeof DBType,
  limit: number = 10,
): Promise<SRSCard[]> {
  return db.cards
    .where('state')
    .equals(State.New)
    .limit(limit)
    .sortBy('id');
}

/**
 * Aggregate card counts by learning status.
 */
export async function getStats(db: typeof DBType): Promise<SRSStats> {
  const allCards = await db.cards.toArray();

  let newCount = 0;
  let learning = 0;
  let review = 0;
  let known = 0;

  for (const card of allCards) {
    switch (card.state) {
      case State.New:
        newCount++;
        break;
      case State.Learning:
      case State.Relearning:
        learning++;
        break;
      case State.Review:
        // A card is "known" when it has matured past a stability threshold
        if (card.stability >= 21) {
          known++;
        } else {
          review++;
        }
        break;
    }
  }

  return { new: newCount, learning, review, known };
}

// Re-export Rating for convenience in components
export { Rating, State, createEmptyCard };
