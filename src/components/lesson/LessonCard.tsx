import { useNavigate } from 'react-router-dom';
import type { LessonDef, LessonProgress } from '@/types';

interface LessonCardProps {
  lesson: LessonDef;
  progress: LessonProgress;
  index: number;
}

const statusColors = {
  locked: 'border-ink-border bg-ink-surface opacity-50',
  available: 'border-gold bg-ink-elevated',
  in_progress: 'border-cinnabar bg-ink-elevated',
  completed: 'border-jade bg-ink-elevated',
};

const statusLabels = {
  locked: 'Заблокирован',
  available: 'Доступен',
  in_progress: 'В процессе',
  completed: 'Пройден',
};

export function LessonCard({ lesson, progress, index }: LessonCardProps) {
  const navigate = useNavigate();
  const isClickable = progress.status !== 'locked';
  const totalItems = lesson.radicals.length + lesson.characters.length;
  const doneItems = progress.radicalsDone.length + progress.charactersDone.length;

  return (
    <button
      disabled={!isClickable}
      onClick={() => isClickable && navigate(`/lesson/${lesson.id}`)}
      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors text-left w-full ${
        statusColors[progress.status]
      } ${isClickable ? 'hover:border-gold cursor-pointer' : 'cursor-not-allowed'}`}
    >
      {/* Lesson number */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
          progress.status === 'completed'
            ? 'bg-jade text-white'
            : progress.status === 'in_progress'
            ? 'bg-cinnabar text-white'
            : progress.status === 'available'
            ? 'bg-gold text-ink'
            : 'bg-ink-border text-rice-dim'
        }`}
      >
        {progress.status === 'completed' ? '✓' : index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm text-rice font-medium truncate">{lesson.title}</h3>
        <p className="text-xs text-rice-dim truncate">{lesson.description}</p>
      </div>

      {/* Progress / status */}
      <div className="flex flex-col items-end flex-shrink-0">
        <span
          className={`text-xs font-medium ${
            progress.status === 'completed'
              ? 'text-jade'
              : progress.status === 'in_progress'
              ? 'text-cinnabar'
              : progress.status === 'available'
              ? 'text-gold'
              : 'text-rice-dim'
          }`}
        >
          {statusLabels[progress.status]}
        </span>
        {progress.status === 'in_progress' && totalItems > 0 && (
          <span className="text-xs text-rice-dim mt-0.5">
            {doneItems}/{totalItems}
          </span>
        )}
      </div>
    </button>
  );
}
