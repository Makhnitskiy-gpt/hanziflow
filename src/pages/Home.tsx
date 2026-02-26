import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { ExplainerCard } from '@/components/explainer/ExplainerCard';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const dueCount = useLiveQuery(async () => {
    const now = new Date();
    return db.cards.where('due').belowOrEqual(now).count();
  }, []);

  const totalRadicals = useLiveQuery(() => db.radicals.count(), []);
  const totalChars = useLiveQuery(() => db.characters.count(), []);

  const knownCount = useLiveQuery(async () => {
    const cards = await db.cards.where('state').aboveOrEqual(2).toArray();
    return cards.length;
  }, []);

  const newAvailable = useLiveQuery(async () => {
    const allCards = await db.cards.toArray();
    const tracked = new Set(allCards.map((c) => `${c.itemType}:${c.itemId}`));
    const radCount = await db.radicals.count();
    const charCount = await db.characters.count();
    return (radCount + charCount) - tracked.size;
  }, []);

  const lastSession = useLiveQuery(async () => {
    const sessions = await db.sessions.orderBy('startTime').reverse().limit(1).toArray();
    return sessions[0] ?? null;
  }, []);

  const totalItems = (totalRadicals ?? 0) + (totalChars ?? 0);
  const overallProgress = totalItems > 0 ? (knownCount ?? 0) / totalItems : 0;

  return (
    <div className="flex flex-col gap-8 max-w-2xl fade-in">
      {/* Welcome explainer */}
      <ExplainerCard explainerKey="welcome" title="Добро пожаловать в HanziFlow">
        <p className="text-base text-rice-muted leading-relaxed">
          HanziFlow помогает изучать китайские иероглифы через систематический подход:
          радикалы, логика построения, интервальное повторение и практика написания.
        </p>
        <p className="text-base text-rice-muted mt-3 leading-relaxed">
          Начните с раздела <strong className="text-rice">Радикалы</strong> -- это
          базовые компоненты всех иероглифов.
        </p>
      </ExplainerCard>

      {/* Hero — adaptive based on user state */}
      {(dueCount ?? 0) > 0 ? (
        <div className="hongbao wave-border-top cursor-pointer" onClick={() => navigate('/review')}>
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-1">Сегодня</p>
            <p className="text-3xl font-bold text-white">
              {dueCount} карточек ждут повторения
            </p>
            <button className="mt-5 px-8 py-3 rounded-xl bg-white/20 text-white text-lg font-medium hover:bg-white/30 transition-colors backdrop-blur-sm">
              Начать сессию
            </button>
          </div>
        </div>
      ) : (
        <div className="hongbao wave-border-top cursor-pointer" onClick={() => navigate('/radicals')}>
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-1">С чего начать?</p>
            <p className="text-3xl font-bold text-white">
              Изучите первые радикалы
            </p>
            <p className="text-white/70 text-sm mt-2">
              Радикалы -- строительные блоки всех иероглифов. Начните с них.
            </p>
            <button className="mt-5 px-8 py-3 rounded-xl bg-white/20 text-white text-lg font-medium hover:bg-white/30 transition-colors backdrop-blur-sm">
              Перейти к радикалам
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-5">
        <div className="rice-paper rounded-2xl p-5 border border-ink-border">
          <p className="text-sm text-rice-muted mb-3">На повторении</p>
          <p className="text-4xl text-cinnabar font-mono font-bold">{dueCount ?? 0}</p>
        </div>
        <div className="rice-paper rounded-2xl p-5 border border-ink-border">
          <p className="text-sm text-rice-muted mb-3">Новые</p>
          <p className="text-4xl text-gold font-mono font-bold">{newAvailable ?? 0}</p>
        </div>
        <div className="rice-paper rounded-2xl p-5 border border-ink-border flex flex-col items-center">
          <p className="text-sm text-rice-muted mb-3">Прогресс</p>
          <ProgressRing progress={overallProgress} size={64} label={`${Math.round(overallProgress * 100)}%`} />
          <p className="text-sm text-rice-dim mt-2">{knownCount ?? 0}/{totalItems}</p>
        </div>
      </div>

      {/* Last session */}
      {lastSession && (
        <div className="rice-paper rounded-2xl p-5 border border-ink-border">
          <h3 className="text-sm text-rice-muted mb-3">Последняя сессия</h3>
          <div className="flex items-center gap-8 text-base">
            <div><span className="text-rice-dim">Повторено:</span> <span className="text-rice font-medium">{lastSession.cardsReviewed}</span></div>
            <div><span className="text-rice-dim">Новых:</span> <span className="text-rice font-medium">{lastSession.newItemsLearned}</span></div>
            <div><span className="text-rice-dim">Дата:</span> <span className="text-rice font-medium">{new Date(lastSession.startTime).toLocaleDateString('ru-RU')}</span></div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/radicals')} className="rice-paper p-5 rounded-2xl border border-ink-border text-left hover:border-cinnabar/30 hover:shadow-md transition-all group">
          <span className="font-hanzi text-3xl text-cinnabar group-hover:scale-110 transition-transform inline-block">部</span>
          <p className="text-base text-rice mt-2 font-medium">Радикалы</p>
          <p className="text-sm text-rice-muted mt-0.5">{totalRadicals ?? 0} элементов</p>
        </button>
        <button onClick={() => navigate('/characters')} className="rice-paper p-5 rounded-2xl border border-ink-border text-left hover:border-cinnabar/30 hover:shadow-md transition-all group">
          <span className="font-hanzi text-3xl text-cinnabar group-hover:scale-110 transition-transform inline-block">字</span>
          <p className="text-base text-rice mt-2 font-medium">Иероглифы HSK</p>
          <p className="text-sm text-rice-muted mt-0.5">{totalChars ?? 0} элементов</p>
        </button>
      </div>
    </div>
  );
}
