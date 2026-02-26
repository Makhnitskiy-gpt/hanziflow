import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { ExplainerCard } from '@/components/explainer/ExplainerCard';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  // Count due reviews
  const dueCount = useLiveQuery(async () => {
    const now = new Date();
    return db.cards.where('due').belowOrEqual(now).count();
  }, []);

  // Total cards
  const totalCards = useLiveQuery(() => db.cards.count(), []);

  // Total radicals
  const totalRadicals = useLiveQuery(() => db.radicals.count(), []);

  // Total characters
  const totalChars = useLiveQuery(() => db.characters.count(), []);

  // Known items (state >= 2)
  const knownCount = useLiveQuery(async () => {
    const cards = await db.cards.where('state').aboveOrEqual(2).toArray();
    return cards.length;
  }, []);

  // New items available (radicals + characters without SRS cards)
  const newAvailable = useLiveQuery(async () => {
    const allCards = await db.cards.toArray();
    const tracked = new Set(allCards.map((c) => `${c.itemType}:${c.itemId}`));
    const radCount = await db.radicals.count();
    const charCount = await db.characters.count();
    return (radCount + charCount) - tracked.size;
  }, []);

  // Last session
  const lastSession = useLiveQuery(async () => {
    const sessions = await db.sessions.orderBy('startTime').reverse().limit(1).toArray();
    return sessions[0] ?? null;
  }, []);

  const totalItems = (totalRadicals ?? 0) + (totalChars ?? 0);
  const overallProgress = totalItems > 0 ? (knownCount ?? 0) / totalItems : 0;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Welcome explainer */}
      <ExplainerCard explainerKey="welcome" title="Добро пожаловать в HanziFlow">
        <p className="text-sm text-rice-muted">
          HanziFlow помогает изучать китайские иероглифы через систематический подход:
          радикалы, логика построения, интервальное повторение и практика написания.
        </p>
        <p className="text-sm text-rice-muted mt-2">
          Начните с раздела <strong className="text-rice">Радикалы</strong> -- это
          базовые компоненты всех иероглифов. Затем переходите к иероглифам HSK-1.
        </p>
      </ExplainerCard>

      {/* Today heading */}
      <h1 className="text-2xl text-rice font-medium">Сегодня</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Due reviews */}
        <div className="rice-paper rounded-lg p-4 border border-ink-border">
          <p className="text-xs text-rice-muted mb-2">Ожидают повторения</p>
          <p className="text-3xl text-cinnabar font-mono font-bold">
            {dueCount ?? 0}
          </p>
          <p className="text-xs text-rice-dim mt-1">карточек</p>
        </div>

        {/* New available */}
        <div className="rice-paper rounded-lg p-4 border border-ink-border">
          <p className="text-xs text-rice-muted mb-2">Новые для изучения</p>
          <p className="text-3xl text-gold font-mono font-bold">
            {newAvailable ?? 0}
          </p>
          <p className="text-xs text-rice-dim mt-1">элементов</p>
        </div>

        {/* Overall progress */}
        <div className="rice-paper rounded-lg p-4 border border-ink-border flex flex-col items-center">
          <p className="text-xs text-rice-muted mb-2">Общий прогресс</p>
          <ProgressRing
            progress={overallProgress}
            size={56}
            label={`${Math.round(overallProgress * 100)}%`}
          />
          <p className="text-xs text-rice-dim mt-1">
            {knownCount ?? 0}/{totalItems}
          </p>
        </div>
      </div>

      {/* Start session button */}
      <button
        onClick={() => navigate('/review')}
        className="w-full py-4 rounded-lg bg-cinnabar text-rice text-lg font-medium hover:bg-cinnabar-hover transition-colors shadow-lg shadow-cinnabar/20"
      >
        {(dueCount ?? 0) > 0
          ? `Начать сессию (${dueCount} карточек)`
          : 'Начать изучение'}
      </button>

      {/* Last session summary */}
      {lastSession && (
        <div className="rice-paper rounded-lg p-4 border border-ink-border">
          <h3 className="text-sm text-rice-muted mb-2">Последняя сессия</h3>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-rice-dim">Повторено:</span>{' '}
              <span className="text-rice">{lastSession.cardsReviewed}</span>
            </div>
            <div>
              <span className="text-rice-dim">Новых:</span>{' '}
              <span className="text-rice">{lastSession.newItemsLearned}</span>
            </div>
            <div>
              <span className="text-rice-dim">Дата:</span>{' '}
              <span className="text-rice">
                {new Date(lastSession.startTime).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/radicals')}
          className="p-4 rounded-lg bg-ink-elevated border border-ink-border text-left hover:border-gold-dim transition-colors"
        >
          <span className="font-hanzi text-2xl text-hanzi">部首</span>
          <p className="text-sm text-rice-muted mt-1">Радикалы</p>
          <p className="text-xs text-rice-dim mt-0.5">{totalRadicals ?? 0} элементов</p>
        </button>
        <button
          onClick={() => navigate('/characters')}
          className="p-4 rounded-lg bg-ink-elevated border border-ink-border text-left hover:border-gold-dim transition-colors"
        >
          <span className="font-hanzi text-2xl text-hanzi">字</span>
          <p className="text-sm text-rice-muted mt-1">Иероглифы HSK</p>
          <p className="text-xs text-rice-dim mt-0.5">{totalChars ?? 0} элементов</p>
        </button>
      </div>
    </div>
  );
}
