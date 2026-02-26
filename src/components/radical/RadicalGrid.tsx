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

const strokeGroups = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

export function RadicalGrid({ onSelect, selectedId }: RadicalGridProps) {
  const [strokeFilter, setStrokeFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const radicals = useLiveQuery(async () => {
    const allItems = await db.radicals.toArray();
    const items = strokeFilter !== null
      ? allItems.filter((r) => r.strokes === strokeFilter)
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
        <div className="flex items-center gap-1">
          <span className="text-xs text-rice-muted mr-1">Черты:</span>
          <button
            onClick={() => setStrokeFilter(null)}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              strokeFilter === null
                ? 'bg-cinnabar text-rice'
                : 'text-rice-muted hover:text-rice bg-ink-elevated'
            }`}
          >
            Все
          </button>
          {strokeGroups.map((n) => (
            <button
              key={n}
              onClick={() => setStrokeFilter(n)}
              className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                strokeFilter === n
                  ? 'bg-cinnabar text-rice'
                  : 'text-rice-muted hover:text-rice bg-ink-elevated'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-rice-muted mr-1">Статус:</span>
          {(['all', 'new', 'learning', 'known'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                statusFilter === s
                  ? 'bg-cinnabar text-rice'
                  : 'text-rice-muted hover:text-rice bg-ink-elevated'
              }`}
            >
              {{ all: 'Все', new: 'Новые', learning: 'Учу', known: 'Знаю' }[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,80px)] gap-2">
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
