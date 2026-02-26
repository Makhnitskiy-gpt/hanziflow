import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '@/db';
import type { Radical } from '@/types';
import { ExplainerCard } from '@/components/explainer/ExplainerCard';
import { PinyinDisplay } from '@/components/shared/PinyinDisplay';

const CATEGORY_RU: Record<string, string> = {
  basic: 'Базовые черты',
  human: 'Человек и тело',
  nature: 'Природа',
  animal: 'Животные',
  object: 'Предметы',
  abstract: 'Абстрактные',
};

/** Parse tone number from pinyin with diacritics */
function parseTone(pinyin: string): number {
  if (/[āēīōūǖ]/.test(pinyin)) return 1;
  if (/[áéíóúǘ]/.test(pinyin)) return 2;
  if (/[ǎěǐǒǔǚ]/.test(pinyin)) return 3;
  if (/[àèìòùǜ]/.test(pinyin)) return 4;
  return 5;
}

interface RadicalDetailProps {
  radical: Radical;
  onPractice?: (char: string) => void;
  onAddToReview?: (radical: Radical) => void;
}

export function RadicalDetail({ radical, onPractice, onAddToReview }: RadicalDetailProps) {
  const navigate = useNavigate();
  // Find characters containing this radical
  const containingChars = useLiveQuery(async () => {
    const allChars = await db.characters.toArray();
    return allChars.filter((c) => c.radicals.includes(radical.char));
  }, [radical.char]);

  // User-drawn mnemonic
  const mnemonic = useLiveQuery(
    () =>
      db.mnemonics
        .where('[itemType+itemId]')
        .equals(['radical', radical.id])
        .first(),
    [radical.id],
  );

  // Check if SRS card already exists
  const existingCard = useLiveQuery(
    () =>
      db.cards
        .where('[itemType+itemId]')
        .equals(['radical', radical.id])
        .first(),
    [radical.id],
  );

  const handleAddToReview = async () => {
    if (existingCard) return;
    await db.cards.add({
      itemId: radical.id,
      itemType: 'radical',
      cardType: 'recognition',
      due: new Date(),
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: 0,
    });
    onAddToReview?.(radical);
  };

  return (
    <div className="flex flex-col gap-4">
      <ExplainerCard explainerKey="radicals" title="Что такое радикалы?">
        <p className="text-sm text-rice-muted">
          Радикалы — базовые компоненты иероглифов. Зная ~214 радикалов,
          вы сможете разбирать и запоминать тысячи иероглифов по их составным частям.
        </p>
      </ExplainerCard>

      {/* Main info */}
      <div className="rice-paper rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Large character */}
          <div className="flex flex-col items-center">
            <span className="hanzi-lg">{radical.char}</span>
            <PinyinDisplay pinyin={radical.pinyin} tone={parseTone(radical.pinyin)} size="md" />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2 flex-1">
            <h2 className="text-xl text-rice font-medium">{radical.meaning_ru}</h2>
            <p className="text-sm text-rice-muted">{radical.meaning_en}</p>

            <div className="flex items-center gap-4 text-sm text-rice-muted mt-2">
              <span>Черты: <strong className="text-rice">{radical.strokes}</strong></span>
              <span>Категория: <strong className="text-rice">{CATEGORY_RU[radical.category] ?? radical.category}</strong></span>
            </div>

            {/* Mnemonic */}
            {radical.mnemonic_ru && (
              <div className="mt-3 p-3 bg-ink-elevated rounded-md border border-ink-border">
                <p className="text-xs text-gold-dim mb-1">Мнемоника</p>
                <p className="text-sm text-rice">{radical.mnemonic_ru}</p>
              </div>
            )}
          </div>
        </div>

        {/* User-drawn mnemonic */}
        {mnemonic && (
          <div className="mt-4 p-3 bg-ink-elevated rounded-md border border-ink-border">
            <p className="text-xs text-gold-dim mb-2">Ваш рисунок</p>
            <img
              src={mnemonic.dataUrl}
              alt="Мнемонический рисунок"
              className="max-w-[200px] rounded"
            />
          </div>
        )}
      </div>

      {/* Characters containing this radical */}
      {containingChars && containingChars.length > 0 && (
        <div className="rice-paper rounded-lg p-4">
          <h3 className="text-sm text-rice-muted mb-3">
            Входит в: <span className="text-rice">{containingChars.length} иероглифов</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {containingChars.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/characters?char=${c.char}`)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-ink-elevated border border-ink-border text-sm hover:border-cinnabar/30 transition-colors"
              >
                <span className="font-hanzi text-hanzi">{c.char}</span>
                <span className="text-rice-muted text-xs">{c.meaning_ru}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onPractice?.(radical.char)}
          className="flex-1 py-2.5 min-h-[44px] rounded-md bg-cinnabar text-white text-sm font-medium hover:bg-cinnabar-hover transition-colors"
        >
          Практика штрихов &rarr;
        </button>
        <button
          onClick={handleAddToReview}
          disabled={!!existingCard}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
            existingCard
              ? 'bg-ink-elevated text-rice-dim cursor-not-allowed'
              : 'bg-ink-elevated text-gold border border-gold-dim hover:border-gold'
          }`}
        >
          {existingCard ? 'Уже в повторении' : 'Добавить в повторение'}
        </button>
      </div>
    </div>
  );
}
