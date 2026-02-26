import type { LessonDef } from '@/types';

interface LessonIntroProps {
  lesson: LessonDef;
  lessonIndex: number;
  onStart: () => void;
}

export function LessonIntro({ lesson, lessonIndex, onStart }: LessonIntroProps) {
  const totalItems = lesson.radicals.length + lesson.characters.length;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 max-w-md mx-auto text-center">
      {/* Lesson number badge */}
      <div className="ink-stamp w-16 h-16 flex items-center justify-center text-2xl">
        {lessonIndex + 1}
      </div>

      <h1 className="text-2xl text-rice font-medium">{lesson.title}</h1>
      <p className="text-sm text-rice-muted leading-relaxed">{lesson.description}</p>

      {/* What's inside */}
      <div className="flex gap-4 text-sm text-rice-dim">
        {lesson.radicals.length > 0 && (
          <span>
            <span className="text-gold font-medium">{lesson.radicals.length}</span> радикалов
          </span>
        )}
        {lesson.characters.length > 0 && (
          <span>
            <span className="text-gold font-medium">{lesson.characters.length}</span> иероглифов
          </span>
        )}
      </div>

      <button
        onClick={onStart}
        className="px-8 py-3 min-h-[48px] bg-cinnabar text-white rounded-lg font-medium text-lg hover:bg-cinnabar/90 transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Начать урок
      </button>

      <p className="text-xs text-rice-dim">
        {totalItems} {totalItems === 1 ? 'элемент' : totalItems < 5 ? 'элемента' : 'элементов'} для изучения
      </p>
    </div>
  );
}
