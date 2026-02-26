import { useState, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';

interface ExplainerCardProps {
  explainerKey: string;
  title: string;
  children: ReactNode;
}

export function ExplainerCard({ explainerKey, title, children }: ExplainerCardProps) {
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);

  // Check if already seen
  const settings = useLiveQuery(() => db.settings.get(1), []);
  const isSeen = settings?.seenExplainers?.includes(explainerKey) ?? false;

  // Auto-expand if not seen, but respect manual toggle
  const isExpanded = manualExpanded !== null ? manualExpanded : !isSeen;

  const markSeen = async () => {
    const current = await db.settings.get(1);
    if (current) {
      const seen = current.seenExplainers ?? [];
      if (!seen.includes(explainerKey)) {
        await db.settings.update(1, {
          seenExplainers: [...seen, explainerKey],
        });
      }
    } else {
      await db.settings.add({
        sessionMinutes: 15,
        cardsPerSession: 20,
        theme: 'dark',
        seenExplainers: [explainerKey],
        seeded: false,
      });
    }
    setManualExpanded(false);
  };

  return (
    <div className="rounded-lg border border-jade-dim bg-ink-surface overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setManualExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-left hover:bg-ink-elevated transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-jade flex-shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span className="text-sm text-jade font-medium flex-1">{title}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-rice-dim transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-3 border-t border-jade-dim/30">
          <div className="pt-3">{children}</div>
          {!isSeen && (
            <button
              onClick={markSeen}
              className="mt-4 px-5 py-2.5 text-sm rounded-xl bg-jade text-white font-medium hover:bg-jade-dim transition-colors"
            >
              Понятно
            </button>
          )}
        </div>
      )}
    </div>
  );
}
