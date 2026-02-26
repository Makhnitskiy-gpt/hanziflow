/**
 * HanziFlow — Session manager
 *
 * Manages 30-minute study sessions:
 * - Plans how many review vs. new cards to show
 * - Creates and finalises session records in the DB
 */

import type { StudySession, AppSettings, SessionPlan } from '@/types';
import { getDueCards, getNewCards } from '@/lib/fsrs';
import type { default as DBType } from '@/db';

// ---------------------------------------------------------------------------
// Session plan
// ---------------------------------------------------------------------------

/**
 * Calculates the session plan: how many due reviews exist and how many
 * new items to introduce, based on user settings and current queue.
 *
 * Strategy:
 * - Reviews always come first (never skip due cards)
 * - New cards fill the remaining budget
 * - If reviews alone exceed the budget, cap new cards at 0
 */
export async function getSessionPlan(
  db: typeof DBType,
  settings: AppSettings,
): Promise<SessionPlan> {
  const maxCards = settings.cardsPerSession;

  const dueCards = await getDueCards(db, maxCards);
  const reviewCount = dueCards.length;

  // Remaining budget for new introductions
  const newBudget = Math.max(0, maxCards - reviewCount);
  const availableNew = await getNewCards(db, newBudget);
  const newCount = availableNew.length;

  return {
    reviewCount,
    newCount,
    totalCards: reviewCount + newCount,
  };
}

// ---------------------------------------------------------------------------
// Session lifecycle
// ---------------------------------------------------------------------------

/**
 * Creates a new study session and persists it to the DB.
 * Returns the session object (with auto-generated id).
 */
export async function createSession(
  db: typeof DBType,
  _settings: AppSettings,
): Promise<StudySession> {
  const session: StudySession = {
    startTime: new Date(),
    cardsReviewed: 0,
    newItemsLearned: 0,
    phase: 'review',
  };

  const id = await db.sessions.add(session);
  return { ...session, id: id as number };
}

/**
 * Finalises a session: sets the end time and updates the stored record.
 */
export async function endSession(
  db: typeof DBType,
  session: StudySession,
): Promise<StudySession> {
  const updated: StudySession = {
    ...session,
    endTime: new Date(),
    phase: 'summary',
  };

  if (updated.id !== undefined) {
    await db.sessions.put(updated);
  }

  return updated;
}

/**
 * Increments the reviewed-card counter on an active session.
 */
export async function recordReview(
  db: typeof DBType,
  session: StudySession,
  isNew: boolean,
): Promise<StudySession> {
  const updated: StudySession = {
    ...session,
    cardsReviewed: session.cardsReviewed + 1,
    newItemsLearned: session.newItemsLearned + (isNew ? 1 : 0),
  };

  if (updated.id !== undefined) {
    await db.sessions.put(updated);
  }

  return updated;
}

/**
 * Returns the elapsed time in seconds since session start.
 */
export function getElapsedSeconds(session: StudySession): number {
  const now = session.endTime ?? new Date();
  return Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
}

/**
 * Returns the remaining time in seconds based on session settings.
 */
export function getRemainingSeconds(
  session: StudySession,
  settings: AppSettings,
): number {
  const elapsed = getElapsedSeconds(session);
  const totalSeconds = settings.sessionMinutes * 60;
  return Math.max(0, totalSeconds - elapsed);
}
