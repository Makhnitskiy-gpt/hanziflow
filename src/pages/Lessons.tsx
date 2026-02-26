import { useLearningPath } from '@/hooks/useLearningPath';
import { LessonCard } from '@/components/lesson/LessonCard';

export default function Lessons() {
  const { stages, completedCount, totalLessons, loading } = useLearningPath();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="font-hanzi text-4xl text-rice-dim animate-pulse">載</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-rice font-medium">Путь обучения</h1>
        <span className="text-sm text-rice-dim">
          {completedCount}/{totalLessons} уроков
        </span>
      </div>

      {/* Overall progress */}
      <div className="h-2 bg-ink-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-jade rounded-full transition-all duration-500"
          style={{ width: totalLessons > 0 ? `${(completedCount / totalLessons) * 100}%` : '0%' }}
        />
      </div>

      {/* Stages */}
      {stages.map((stage) => (
        <div key={stage.id} className="flex flex-col gap-3">
          {/* Stage header */}
          <div className="flex items-center gap-3 mt-2">
            <span className="font-hanzi text-lg text-gold">{stage.title_cn}</span>
            <h2 className="text-lg text-rice font-medium">{stage.title}</h2>
            <span className="text-xs text-rice-dim">{stage.description}</span>
          </div>

          {/* Lesson list */}
          <div className="flex flex-col gap-2">
            {stage.lessons.map((lesson, i) => {
              // Calculate global index
              const globalIdx = stages
                .slice(0, stages.indexOf(stage))
                .reduce((acc, s) => acc + s.lessons.length, 0) + i;
              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  progress={lesson.progress}
                  index={globalIdx}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
