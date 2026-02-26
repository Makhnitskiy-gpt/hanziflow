import { useParams, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { LessonFlow } from '@/components/lesson/LessonFlow';
import type { StageDef, LessonDef } from '@/types';
import learningPath from '@/data/learning-path.json';

const stages = learningPath.stages as StageDef[];
const allLessons: LessonDef[] = stages.flatMap((s) => s.lessons);

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();

  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const lesson = lessonIndex >= 0 ? allLessons[lessonIndex] : null;

  const progress = useLiveQuery(
    () => (lessonId ? db.lessonProgress.get(lessonId) : undefined),
    [lessonId],
  );

  if (!lesson) {
    return <Navigate to="/lessons" replace />;
  }

  if (!progress) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="font-hanzi text-4xl text-rice-dim animate-pulse">載</span>
      </div>
    );
  }

  // Prevent accessing locked lessons
  if (progress.status === 'locked') {
    return <Navigate to="/lessons" replace />;
  }

  return (
    <LessonFlow
      key={lessonId}
      lesson={lesson}
      progress={progress}
      lessonIndex={lessonIndex}
    />
  );
}
