import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { useNavigate } from 'react-router-dom';
import { useLearningPath } from '@/hooks/useLearningPath';

export default function Home() {
  const navigate = useNavigate();
  const { currentLesson, completedCount, totalLessons, stages, loading } = useLearningPath();

  const dueCount = useLiveQuery(async () => {
    const now = new Date();
    return db.cards.where('due').belowOrEqual(now).count();
  }, []);

  const settings = useLiveQuery(() => db.settings.get(1), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="font-hanzi text-4xl text-rice-dim animate-pulse">載</span>
      </div>
    );
  }

  // Check if onboarding needed
  if (settings && !settings.onboardingDone) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-16 max-w-md mx-auto text-center fade-in">
        <span className="font-hanzi text-6xl text-cinnabar">学</span>
        <h1 className="text-3xl text-rice font-medium">HanziFlow</h1>
        <p className="text-sm text-rice-muted leading-relaxed">
          Пошаговый путь к китайскому: от первой черты до HSK-1.
          Учи символы, практикуй штрихи стилусом, повторяй по расписанию.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-ink-elevated border border-ink-border text-left">
            <span className="font-hanzi text-2xl text-gold">学</span>
            <div>
              <p className="text-sm text-rice font-medium">Изучай</p>
              <p className="text-xs text-rice-dim">Пошаговые уроки от простого к сложному</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-ink-elevated border border-ink-border text-left">
            <span className="font-hanzi text-2xl text-cinnabar">練</span>
            <div>
              <p className="text-sm text-rice font-medium">Практикуй</p>
              <p className="text-xs text-rice-dim">Пиши штрихи стилусом в правильном порядке</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-ink-elevated border border-ink-border text-left">
            <span className="font-hanzi text-2xl text-jade">復</span>
            <div>
              <p className="text-sm text-rice font-medium">Повторяй</p>
              <p className="text-xs text-rice-dim">Умное расписание запоминает за тебя</p>
            </div>
          </div>
        </div>
        <button
          onClick={async () => {
            await db.settings.update(1, { onboardingDone: true });
            if (currentLesson) {
              navigate(`/lesson/${currentLesson.id}`);
            }
          }}
          className="px-10 py-4 min-h-[52px] bg-cinnabar text-white rounded-lg font-medium text-lg hover:bg-cinnabar/90 transition-colors"
        >
          Начать первый урок
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl fade-in">
      {/* Hero: Current lesson */}
      {currentLesson ? (
        <div
          className="hongbao wave-border-top cursor-pointer"
          onClick={() => navigate(`/lesson/${currentLesson.id}`)}
        >
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-1">
              Урок {stages.flatMap((s) => s.lessons).findIndex((l) => l.id === currentLesson.id) + 1} из {totalLessons}
            </p>
            <p className="text-2xl font-bold text-white">{currentLesson.title}</p>
            <p className="text-white/70 text-sm mt-1">{currentLesson.description}</p>
            <button className="mt-4 px-8 py-3 rounded-xl bg-white/20 text-white text-lg font-medium hover:bg-white/30 transition-colors backdrop-blur-sm">
              {currentLesson.progress.status === 'in_progress' ? 'Продолжить' : 'Начать урок'}
            </button>
          </div>
        </div>
      ) : (
        <div className="hongbao wave-border-top">
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-1">Поздравляем!</p>
            <p className="text-2xl font-bold text-white">Все уроки пройдены</p>
            <p className="text-white/70 text-sm mt-1">
              {completedCount} из {totalLessons} уроков завершено. Продолжайте повторять!
            </p>
          </div>
        </div>
      )}

      {/* Two-column: Review CTA + Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Review */}
        <button
          onClick={() => navigate('/review')}
          className="rice-paper p-5 rounded-2xl border border-ink-border text-left hover:border-cinnabar/30 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-hanzi text-2xl text-cinnabar">復</span>
            {(dueCount ?? 0) > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-cinnabar text-white text-xs font-medium">
                {dueCount}
              </span>
            )}
          </div>
          <p className="text-sm text-rice font-medium">Повторение</p>
          <p className="text-xs text-rice-dim mt-0.5">
            {(dueCount ?? 0) > 0
              ? `${dueCount} карточек ждут`
              : 'Все карточки повторены'}
          </p>
        </button>

        {/* Progress */}
        <button
          onClick={() => navigate('/lessons')}
          className="rice-paper p-5 rounded-2xl border border-ink-border text-left hover:border-gold/30 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-hanzi text-2xl text-gold">路</span>
            <span className="text-xs text-rice-dim">{completedCount}/{totalLessons}</span>
          </div>
          <p className="text-sm text-rice font-medium">Путь обучения</p>
          <div className="mt-2 h-1.5 bg-ink-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: totalLessons > 0 ? `${(completedCount / totalLessons) * 100}%` : '0%' }}
            />
          </div>
        </button>
      </div>

      {/* Learning path preview — next 5 lessons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm text-rice-muted font-medium">Ближайшие уроки</h2>
          <button onClick={() => navigate('/lessons')} className="text-xs text-gold hover:text-gold-dim transition-colors">
            Все уроки
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {stages
            .flatMap((s) => s.lessons)
            .slice(Math.max(0, completedCount - 1), completedCount + 5)
            .map((lesson, i) => {
              const globalIdx = stages.flatMap((s) => s.lessons).findIndex((l) => l.id === lesson.id);
              const isCurrent = currentLesson?.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  disabled={lesson.progress.status === 'locked'}
                  onClick={() => lesson.progress.status !== 'locked' && navigate(`/lesson/${lesson.id}`)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors min-w-[80px] ${
                    lesson.progress.status === 'completed'
                      ? 'border-jade/30 bg-jade/5'
                      : isCurrent
                      ? 'border-cinnabar bg-cinnabar/5'
                      : lesson.progress.status === 'available'
                      ? 'border-gold/30 bg-ink-elevated'
                      : 'border-ink-border bg-ink-surface opacity-50'
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      lesson.progress.status === 'completed'
                        ? 'text-jade'
                        : isCurrent
                        ? 'text-cinnabar'
                        : 'text-rice-dim'
                    }`}
                  >
                    {globalIdx + 1}
                  </span>
                  <span className="text-xs text-rice truncate max-w-[72px]">{lesson.title}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
