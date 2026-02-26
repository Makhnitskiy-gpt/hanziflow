import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { ProgressRing } from '@/components/shared/ProgressRing';

export default function Progress() {
  // Overall stats
  const stats = useLiveQuery(async () => {
    const allCards = await db.cards.toArray();
    const totalRadicals = await db.radicals.count();
    const totalChars = await db.characters.count();

    const radicalCards = allCards.filter((c) => c.itemType === 'radical');
    const charCards = allCards.filter((c) => c.itemType === 'character');

    const countByState = (cards: typeof allCards) => ({
      new: cards.filter((c) => c.state === 0).length,
      learning: cards.filter((c) => c.state === 1 || c.state === 3).length, // Learning + Relearning
      review: cards.filter((c) => c.state === 2).length,
      known: cards.filter((c) => c.state === 2).length, // Only Review state = "known"
    });

    const radStats = countByState(radicalCards);
    const charStats = countByState(charCards);

    // Formation type distribution
    const allChars = await db.characters.toArray();
    const formationMap = new Map<string, number>();
    const formationLabels: Record<string, string> = {
      '象形': 'Пиктограммы',
      '指事': 'Указательные',
      '会意': 'Составные',
      '形声': 'Фоно-семант.',
    };
    for (const ch of allChars) {
      const type = ch.formation_type;
      formationMap.set(type, (formationMap.get(type) ?? 0) + 1);
    }
    const formations = Array.from(formationMap.entries()).map(([type, count]) => ({
      type,
      label: formationLabels[type] ?? type,
      count,
      total: allChars.length,
    }));

    // Study streak
    const sessions = await db.sessions.orderBy('startTime').reverse().toArray();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const nextDate = new Date(checkDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const hasSession = sessions.some((s) => {
        const sDate = new Date(s.startTime);
        return sDate >= checkDate && sDate < nextDate;
      });

      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      totalRadicals,
      totalChars,
      totalCards: allCards.length,
      radStats,
      charStats,
      formations,
      streak,
      sessionsCount: sessions.length,
    };
  }, []);

  if (!stats) {
    return <div className="text-rice-dim">Загрузка...</div>;
  }

  const totalKnown = stats.radStats.known + stats.charStats.known;
  const totalItems = stats.totalRadicals + stats.totalChars;
  const overallProgress = totalItems > 0 ? totalKnown / totalItems : 0;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-2xl text-rice font-medium">Прогресс</h1>

      {/* Overall */}
      <div className="rice-paper rounded-lg p-6 border border-ink-border flex items-center gap-6">
        <ProgressRing progress={overallProgress} size={80} />
        <div>
          <p className="text-2xl text-rice font-bold">
            {totalKnown} <span className="text-base text-rice-muted font-normal">из {totalItems}</span>
          </p>
          <p className="text-sm text-rice-muted mt-1">Всего изучено</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-lg text-gold font-mono">{stats.streak}</p>
          <p className="text-xs text-rice-muted">дней подряд</p>
        </div>
      </div>

      {/* Per-type breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* Radicals */}
        <div className="rice-paper rounded-lg p-4 border border-ink-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-rice font-medium">Радикалы</h3>
            <ProgressRing
              progress={stats.totalRadicals > 0 ? stats.radStats.known / stats.totalRadicals : 0}
              size={36}
            />
          </div>
          <div className="flex flex-col gap-2">
            <StatBar label="Изучено" count={stats.radStats.known} total={stats.totalRadicals} color="bg-jade" />
            <StatBar label="Учу" count={stats.radStats.learning} total={stats.totalRadicals} color="bg-gold" />
            <StatBar label="Новые" count={stats.totalRadicals - stats.radStats.known - stats.radStats.learning} total={stats.totalRadicals} color="bg-rice-dim" />
          </div>
        </div>

        {/* Characters */}
        <div className="rice-paper rounded-lg p-4 border border-ink-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-rice font-medium">Иероглифы</h3>
            <ProgressRing
              progress={stats.totalChars > 0 ? stats.charStats.known / stats.totalChars : 0}
              size={36}
            />
          </div>
          <div className="flex flex-col gap-2">
            <StatBar label="Изучено" count={stats.charStats.known} total={stats.totalChars} color="bg-jade" />
            <StatBar label="Учу" count={stats.charStats.learning} total={stats.totalChars} color="bg-gold" />
            <StatBar label="Новые" count={stats.totalChars - stats.charStats.known - stats.charStats.learning} total={stats.totalChars} color="bg-rice-dim" />
          </div>
        </div>
      </div>

      {/* Formation type distribution */}
      <div className="rice-paper rounded-lg p-4 border border-ink-border">
        <h3 className="text-sm text-rice font-medium mb-4">Типы построения иероглифов</h3>
        <div className="flex flex-col gap-3">
          {stats.formations.map((f) => (
            <div key={f.type} className="flex items-center gap-3">
              <span className="text-xs text-rice-muted w-28 flex-shrink-0">{f.label}</span>
              <div className="flex-1 h-5 bg-ink-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cinnabar to-gold rounded-full transition-[width] duration-500"
                  style={{ width: `${f.total > 0 ? (f.count / f.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-rice-dim w-12 text-right">{f.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions info */}
      <div className="rice-paper rounded-lg p-4 border border-ink-border">
        <h3 className="text-sm text-rice font-medium mb-2">Статистика сессий</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl text-rice font-mono">{stats.sessionsCount}</p>
            <p className="text-xs text-rice-muted">всего сессий</p>
          </div>
          <div>
            <p className="text-xl text-gold font-mono">{stats.streak}</p>
            <p className="text-xs text-rice-muted">дней подряд</p>
          </div>
          <div>
            <p className="text-xl text-rice font-mono">{stats.totalCards}</p>
            <p className="text-xs text-rice-muted">карточек в SRS</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** CSS-only bar chart row */
function StatBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-rice-muted w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-ink-elevated rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-rice-dim w-8 text-right">{count}</span>
    </div>
  );
}
