/**
 * HanziFlow — useSession hook
 *
 * Manages the lifecycle of a 30-minute study session:
 * - Timer countdown
 * - Phase transitions (review → new → practice → summary)
 * - Persistence of session data to DB
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/db';
import {
  createSession,
  endSession as endSessionLib,
  getRemainingSeconds,
} from '@/lib/session';
import type { StudySession, AppSettings, SessionPhase } from '@/types';

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

interface UseSessionReturn {
  /** Current session (null if not started) */
  session: StudySession | null;
  /** Current phase of the session */
  phase: SessionPhase;
  /** Remaining seconds in the session */
  timeRemaining: number;
  /** Whether a session is currently active */
  isActive: boolean;
  /** Start a new session */
  startSession: (settings: AppSettings) => Promise<void>;
  /** End the current session early or naturally */
  endSession: () => Promise<void>;
  /** Advance to the next phase */
  nextPhase: () => void;
  /** Update the session in state (e.g. after grading a card) */
  updateSession: (session: StudySession) => void;
}

// ---------------------------------------------------------------------------
// Phase order
// ---------------------------------------------------------------------------

const PHASE_ORDER: SessionPhase[] = ['review', 'new', 'practice', 'summary'];

function getNextPhase(current: SessionPhase): SessionPhase {
  const idx = PHASE_ORDER.indexOf(current);
  if (idx === -1 || idx >= PHASE_ORDER.length - 1) return 'summary';
  return PHASE_ORDER[idx + 1];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<StudySession | null>(null);
  const [phase, setPhase] = useState<SessionPhase>('review');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Keep a ref to settings so the timer callback can read the latest value
  const settingsRef = useRef<AppSettings | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ------ Timer ------

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (sess: StudySession, settings: AppSettings) => {
      stopTimer();
      settingsRef.current = settings;

      // Immediate calc
      setTimeRemaining(getRemainingSeconds(sess, settings));

      timerRef.current = setInterval(() => {
        const remaining = getRemainingSeconds(sess, settings);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          // Time's up — auto-transition to summary
          setPhase('summary');
          stopTimer();
        }
      }, 1000);
    },
    [stopTimer],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // ------ Public API ------

  const startSession = useCallback(
    async (settings: AppSettings) => {
      const sess = await createSession(db, settings);
      setSession(sess);
      setPhase('review');
      startTimer(sess, settings);
    },
    [startTimer],
  );

  const endSession = useCallback(async () => {
    stopTimer();
    if (session) {
      const finalised = await endSessionLib(db, session);
      setSession(finalised);
    }
    setPhase('summary');
  }, [session, stopTimer]);

  const nextPhase = useCallback(() => {
    setPhase((prev) => getNextPhase(prev));
  }, []);

  const updateSession = useCallback((updated: StudySession) => {
    setSession(updated);
  }, []);

  return {
    session,
    phase,
    timeRemaining,
    isActive: session !== null && phase !== 'summary',
    startSession,
    endSession,
    nextPhase,
    updateSession,
  };
}
