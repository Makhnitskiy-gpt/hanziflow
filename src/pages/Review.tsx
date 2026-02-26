import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/db';
import { ReviewDeck } from '@/components/srs/ReviewDeck';
import { ExplainerCard } from '@/components/explainer/ExplainerCard';

interface OutletCtx {
  setCurrentChar: (char: string | undefined) => void;
  setSessionActive: (active: boolean) => void;
  setSessionPhase: (phase: string) => void;
  setSessionTimeLeft: (seconds: number) => void;
  setSessionProgress: (progress: { done: number; total: number }) => void;
}

export default function Review() {
  const {
    setCurrentChar,
    setSessionActive,
    setSessionPhase,
    setSessionTimeLeft,
    setSessionProgress,
  } = useOutletContext<OutletCtx>();

  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const startTimeRef = useRef<Date | undefined>(undefined);
  const sessionMinutes = 15; // Default

  const startSession = useCallback(() => {
    setSessionStarted(true);
    setSessionDone(false);
    setSessionActive(true);
    setSessionPhase('review');
    startTimeRef.current = new Date();

    // Start timer countdown
    const totalSeconds = sessionMinutes * 60;
    let remaining = totalSeconds;

    timerRef.current = setInterval(() => {
      remaining -= 1;
      setSessionTimeLeft(Math.max(0, remaining));

      if (remaining <= 0) {
        clearInterval(timerRef.current);
      }
    }, 1000);

    setSessionTimeLeft(totalSeconds);

    // Create session record
    db.sessions.add({
      startTime: new Date(),
      cardsReviewed: 0,
      newItemsLearned: 0,
      phase: 'review',
    });
  }, [setSessionActive, setSessionPhase, setSessionTimeLeft, sessionMinutes]);

  const handleSessionComplete = useCallback(
    (reviewed: number) => {
      setSessionDone(true);
      setSessionActive(false);
      setReviewedCount(reviewed);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Update session record
      db.sessions
        .orderBy('startTime')
        .reverse()
        .first()
        .then((session) => {
          if (session?.id) {
            db.sessions.update(session.id, {
              endTime: new Date(),
              cardsReviewed: reviewed,
              phase: 'summary',
            });
          }
        });
    },
    [setSessionActive],
  );

  const handleCardGraded = useCallback(
    (_card: unknown, _rating: number, deckTotal: number) => {
      const done = reviewedCount + 1;
      setReviewedCount(done);
      setSessionProgress({ done, total: deckTotal });
    },
    [setSessionProgress, reviewedCount],
  );

  const handleCharChange = useCallback(
    (char: string | undefined) => {
      setCurrentChar(char);
    },
    [setCurrentChar],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setSessionActive(false);
    };
  }, [setSessionActive]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl text-rice font-medium">Повторение</h1>

      <ExplainerCard explainerKey="srs" title="Как работает повторение?">
        <p className="text-sm text-rice-muted">
          Интервальное повторение (SRS) показывает карточки именно тогда, когда вы
          начинаете их забывать. Оценивайте свой ответ честно -- это помогает
          алгоритму точнее подбирать интервалы.
        </p>
        <ul className="text-sm text-rice-muted mt-2 space-y-1">
          <li><span className="text-cinnabar">Снова</span> -- не помню, показать сегодня</li>
          <li><span className="text-gold">Трудно</span> -- вспомнил с трудом</li>
          <li><span className="text-jade">Хорошо</span> -- вспомнил нормально</li>
          <li><span className="text-rice-muted">Легко</span> -- знаю отлично</li>
        </ul>
      </ExplainerCard>

      {!sessionStarted ? (
        <div className="flex flex-col items-center gap-6 py-8">
          <span className="font-hanzi text-6xl text-hanzi opacity-20">復</span>
          <button
            onClick={startSession}
            className="px-8 py-4 rounded-lg bg-cinnabar text-white text-lg font-medium hover:bg-cinnabar-hover transition-colors shadow-lg shadow-cinnabar/20"
          >
            Начать повторение
          </button>
          <p className="text-sm text-rice-dim">
            Сессия: {sessionMinutes} минут
          </p>
        </div>
      ) : sessionDone ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <span className="font-hanzi text-6xl text-jade">完</span>
          <h2 className="text-lg text-rice font-medium">Сессия завершена</h2>
          <p className="text-sm text-rice-muted">
            Повторено карточек: <strong className="text-rice">{reviewedCount}</strong>
          </p>
          <button
            onClick={() => {
              setSessionStarted(false);
              setSessionDone(false);
              setReviewedCount(0);
            }}
            className="mt-4 px-6 py-2.5 rounded-lg bg-ink-elevated text-rice border border-ink-border hover:border-gold-dim transition-colors"
          >
            Ещё сессия
          </button>
        </div>
      ) : (
        <ReviewDeck
          onSessionComplete={handleSessionComplete}
          onCardGraded={handleCardGraded}
          onCurrentCharChange={handleCharChange}
        />
      )}
    </div>
  );
}
