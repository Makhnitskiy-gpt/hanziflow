import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { Radical, ItemStatus } from '@/types';
import { RadicalCard } from './RadicalCard';

interface RadicalGridProps {
  onSelect: (radical: Radical) => void;
  selectedId?: number;
}

type StatusFilter = 'all' | ItemStatus;

const strokeGroups = [
  { label: '1-3', min: 1, max: 3 },
  { label: '4-6', min: 4, max: 6 },
  { label: '7-9', min: 7, max: 9 },
  { label: '10-12', min: 10, max: 12 },
  { label: '13+', min: 13, max: 99 },
];

export function RadicalGrid({ onSelect, selectedId }: RadicalGridProps) {
  const [strokeFilter, setStrokeFilter] = useState<{ label: string; min: number; max: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const radicals = useLiveQuery(async () => {
    const allItems = await db.radicals.toArray();
    const items = strokeFilter !== null
      ? allItems.filter((r) => r.strokes >= strokeFilter.min && r.strokes <= strokeFilter.max)
      : allItems;

    // Enrich with SRS card status
    const cards = await db.cards.where('itemType').equals('radical').toArray();
    const statusMap = new Map<number, ItemStatus>();
    for (const card of cards) {
      if (card.state >= 2) statusMap.set(card.itemId, 'known');
      else if (card.state >= 1 && !statusMap.has(card.itemId)) statusMap.set(card.itemId, 'learning');
    }
    return items.map((r) => ({ ...r, status: statusMap.get(r.id) ?? 'new' as ItemStatus }));
  }, [strokeFilter]);

  const filtered = useMemo(() => {
    if (!radicals) return [];
    if (statusFilter === 'all') return radicals;
    return radicals.filter((r) => (r.status ?? 'new') === statusFilter);
  }, [radicals, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Stroke count filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-rice-muted mr-1">Черты:</span>
          <button
            onClick={() => setStrokeFilter(null)}
            className={`px-3 py-1.5 min-h-[44px] text-sm rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar ${
              strokeFilter === null
                ? 'bg-cinnabar text-white'
                : 'text-rice-muted hover:text-rice bg-ink-elevated border border-ink-border'
            }`}
          >
            Все
          </button>
          {strokeGroups.map((g) => (
            <button
              key={g.label}
              onClick={() => setStrokeFilter(strokeFilter?.label === g.label ? null : g)}
              className={`px-3 py-1.5 min-h-[44px] text-sm rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar ${
                strokeFilter?.min === g.min
                  ? 'bg-cinnabar text-white'
                  : 'text-rice-muted hover:text-rice bg-ink-elevated border border-ink-border'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 ml-auto">
          {(['all', 'new', 'learning', 'known'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 min-h-[44px] text-sm rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar ${
                statusFilter === s
                  ? 'bg-cinnabar text-white'
                  : 'text-rice-muted hover:text-rice bg-ink-elevated border border-ink-border'
              }`}
            >
              {{ all: 'Все', new: 'Новые', learning: 'Учу', known: 'Знаю' }[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,88px)] gap-3">
        {filtered.map((radical) => (
          <RadicalCard
            key={radical.id}
            radical={radical}
            onClick={onSelect}
            isSelected={radical.id === selectedId}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-rice-dim text-sm text-center py-8">
          Нет радикалов по выбранным фильтрам
        </p>
      )}
    </div>
  );
}
