import { useNavigate } from 'react-router-dom';
import type { LessonDef } from '@/types';

interface LessonSummaryProps {
  lesson: LessonDef;
  lessonIndex: number;
  isLastLesson: boolean;
  onRestart?: () => void;
}

export function LessonSummary({ lesson, lessonIndex, isLastLesson, onRestart }: LessonSummaryProps) {
  const navigate = useNavigate();
  const totalItems = lesson.radicals.length + lesson.characters.length;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 max-w-md mx-auto text-center">
      {/* Completion stamp */}
      <div className="ink-stamp w-20 h-20 flex items-center justify-center text-3xl">
        完
      </div>

      <h1 className="text-2xl text-rice font-medium">
        Урок {lessonIndex + 1} завершён!
      </h1>

      <p className="text-sm text-rice-muted leading-relaxed">
        {lesson.title}
      </p>

      {/* Stats */}
      <div className="flex gap-6 text-center">
        {lesson.radicals.length > 0 && (
          <div>
            <span className="text-2xl text-gold font-medium">{lesson.radicals.length}</span>
            <p className="text-xs text-rice-dim mt-0.5">радикалов</p>
          </div>
        )}
        {lesson.characters.length > 0 && (
          <div>
            <span className="text-2xl text-gold font-medium">{lesson.characters.length}</span>
            <p className="text-xs text-rice-dim mt-0.5">иероглифов</p>
          </div>
        )}
        <div>
          <span className="text-2xl text-jade font-medium">{totalItems * 2}</span>
          <p className="text-xs text-rice-dim mt-0.5">карточек SRS</p>
        </div>
      </div>

      <p className="text-sm text-rice-dim">
        Карточки добавлены в повторение. Они появятся в разделе "Повторение" по расписанию.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 min-h-[48px] bg-cinnabar text-white rounded-lg font-medium hover:bg-cinnabar/90 transition-colors"
        >
          {isLastLesson ? 'На главную' : 'К следующему уроку'}
        </button>
        {onRestart && (
          <button
            onClick={onRestart}
            className="px-6 py-3 min-h-[48px] bg-gold/10 text-gold rounded-lg font-medium border border-gold/30 hover:bg-gold/20 transition-colors"
          >
            Пройти заново
          </button>
        )}
        <button
          onClick={() => navigate('/review')}
          className="px-6 py-3 min-h-[48px] bg-ink-elevated text-rice rounded-lg font-medium border border-ink-border hover:bg-ink-surface transition-colors"
        >
          Повторение
        </button>
      </div>
    </div>
  );
}
