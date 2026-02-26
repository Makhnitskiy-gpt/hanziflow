import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/db';
import type { ItemStatus } from '@/types';
import { PinyinDisplay } from '@/components/shared/PinyinDisplay';

interface OutletCtx {
  setCurrentChar: (char: string | undefined) => void;
  currentChar?: string;
}

export default function Practice() {
  const { setCurrentChar, currentChar } = useOutletContext<OutletCtx>();
  const [mode, setMode] = useState<'weak' | 'recent' | 'free'>('weak');

  // Weak characters: high difficulty or many lapses
  const weakChars = useLiveQuery(async () => {
    const cards = await db.cards
      .where('itemType')
      .equals('character')
      .toArray();

    const weakCards = cards
      .filter((c) => c.lapses > 0 || c.difficulty > 5)
      .sort((a, b) => (b.lapses + b.difficulty) - (a.lapses + a.difficulty))
      .slice(0, 20);

    const charIds = weakCards.map((c) => c.itemId);
    const chars = await db.characters.where('id').anyOf(charIds).toArray();

    return chars.map((ch) => {
      const card = weakCards.find((c) => c.itemId === ch.id);
      return { ...ch, lapses: card?.lapses ?? 0, difficulty: card?.difficulty ?? 0 };
    });
  }, []);

  // Recently learned
  const recentChars = useLiveQuery(async () => {
    const cards = await db.cards
      .where('itemType')
      .equals('character')
      .toArray();

    const recent = cards
      .filter((c) => c.last_review)
      .sort((a, b) => {
        const aTime = a.last_review ? new Date(a.last_review).getTime() : 0;
        const bTime = b.last_review ? new Date(b.last_review).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 20);

    const charIds = recent.map((c) => c.itemId);
    const chars = await db.characters.where('id').anyOf(charIds).toArray();
    return chars;
  }, []);

  // All characters for free mode
  const allChars = useLiveQuery(async () => {
    return db.characters.toArray();
  }, []);

  const displayList = mode === 'weak' ? weakChars : mode === 'recent' ? recentChars : allChars;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl text-rice font-medium">Практика написания</h1>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {([
          { key: 'weak' as const, label: 'Слабые', icon: '弱' },
          { key: 'recent' as const, label: 'Недавние', icon: '新' },
          { key: 'free' as const, label: 'Свободная', icon: '自' },
        ]).map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${
              mode === m.key
                ? 'bg-cinnabar text-rice'
                : 'bg-ink-elevated text-rice-muted hover:text-rice border border-ink-border'
            }`}
          >
            <span className="font-hanzi">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Hint */}
      <p className="text-xs text-rice-dim">
        Выберите иероглиф для практики на панели правее.{' '}
        {currentChar && (
          <span className="text-gold">Сейчас: <span className="font-hanzi">{currentChar}</span></span>
        )}
      </p>

      {/* Character list */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
        {displayList?.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setCurrentChar(ch.char)}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
              currentChar === ch.char
                ? 'border-cinnabar bg-ink-elevated shadow-md shadow-cinnabar/10'
                : 'border-ink-border bg-ink-surface hover:bg-ink-elevated'
            }`}
          >
            <span className="font-hanzi text-2xl text-hanzi">{ch.char}</span>
            <PinyinDisplay pinyin={ch.pinyin} tone={ch.tone} size="sm" />
            <span className="text-[9px] text-rice-dim mt-0.5 truncate max-w-[72px]">
              {ch.meaning_ru}
            </span>
            {mode === 'weak' && 'lapses' in ch && (
              <span className="text-[8px] text-cinnabar mt-0.5">
                ошибок: {(ch as { lapses: number }).lapses}
              </span>
            )}
          </button>
        ))}
      </div>

      {displayList && displayList.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-12 text-rice-dim">
          <span className="font-hanzi text-4xl opacity-20">練</span>
          <p className="text-sm text-center">
            {mode === 'weak'
              ? 'Нет слабых иероглифов. Продолжайте изучение!'
              : mode === 'recent'
              ? 'Нет недавних иероглифов. Начните повторение.'
              : 'Нет иероглифов в базе.'}
          </p>
        </div>
      )}
    </div>
  );
}
