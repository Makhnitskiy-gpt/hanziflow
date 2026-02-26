interface SessionTimerProps {
  phase: string;
  timeLeft: number; // seconds remaining
  cardsDone: number;
  cardsTotal: number;
}

export function SessionTimer({ phase, timeLeft, cardsDone, cardsTotal }: SessionTimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = cardsTotal > 0 ? cardsDone / cardsTotal : 0;

  const phaseLabels: Record<string, string> = {
    review: 'Повторение',
    new: 'Новые',
    practice: 'Практика',
    summary: 'Итоги',
  };

  return (
    <div className="relative px-6 py-2 bg-ink-elevated border-b border-ink-border">
      <div className="flex items-center justify-between text-sm">
        <span className="text-rice-muted">
          {phaseLabels[phase] ?? phase}
        </span>
        <span className="text-rice font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <span className="text-rice-muted">
          {cardsDone}/{cardsTotal}
        </span>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink-border">
        <div
          className="h-full bg-gradient-to-r from-cinnabar to-cinnabar-hover transition-[width] duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
