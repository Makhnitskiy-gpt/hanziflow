/**
 * HanziFlow — Learning path hook
 *
 * Loads the static learning-path.json and merges it with
 * per-lesson progress from IndexedDB. Provides the current
 * lesson, completion counts, and stage metadata.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { StageDef, LessonDef, LessonProgress } from '@/types';
import learningPath from '@/data/learning-path.json';

const stages: StageDef[] = learningPath.stages as StageDef[];
const allLessons: LessonDef[] = stages.flatMap((s) => s.lessons);

export interface LessonWithProgress extends LessonDef {
  progress: LessonProgress;
}

export interface StageWithProgress extends StageDef {
  lessons: LessonWithProgress[];
}

export function useLearningPath() {
  const progressRows = useLiveQuery(() => db.lessonProgress.toArray(), []);

  if (!progressRows) {
    return { stages: [], currentLesson: null, completedCount: 0, totalLessons: allLessons.length, loading: true };
  }

  const progressMap = new Map(progressRows.map((p) => [p.lessonId, p]));

  const defaultProgress = (id: string): LessonProgress => ({
    lessonId: id,
    status: 'locked',
    radicalsDone: [],
    charactersDone: [],
  });

  const stagesWithProgress: StageWithProgress[] = stages.map((stage) => ({
    ...stage,
    lessons: stage.lessons.map((lesson) => ({
      ...lesson,
      progress: progressMap.get(lesson.id) ?? defaultProgress(lesson.id),
    })),
  }));

  const allWithProgress = stagesWithProgress.flatMap((s) => s.lessons);
  const currentLesson =
    allWithProgress.find((l) => l.progress.status === 'in_progress') ??
    allWithProgress.find((l) => l.progress.status === 'available') ??
    null;
  const completedCount = allWithProgress.filter((l) => l.progress.status === 'completed').length;

  return {
    stages: stagesWithProgress,
    currentLesson,
    completedCount,
    totalLessons: allLessons.length,
    loading: false,
  };
}

/**
 * Unlock the next lesson after completing the given lessonId.
 */
export async function completeLesson(lessonId: string): Promise<void> {
  await db.lessonProgress.update(lessonId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });

  // Find and unlock the next lesson
  const idx = allLessons.findIndex((l) => l.id === lessonId);
  if (idx >= 0 && idx < allLessons.length - 1) {
    const next = allLessons[idx + 1];
    const nextProgress = await db.lessonProgress.get(next.id);
    if (nextProgress && nextProgress.status === 'locked') {
      await db.lessonProgress.update(next.id, { status: 'available' });
    }
  }
}

/**
 * Mark a lesson as in-progress.
 */
export async function startLesson(lessonId: string): Promise<void> {
  await db.lessonProgress.update(lessonId, { status: 'in_progress' });
}

/**
 * Restart a completed lesson (reset progress, keep status as in_progress).
 */
export async function restartLesson(lessonId: string): Promise<void> {
  await db.lessonProgress.update(lessonId, {
    status: 'in_progress',
    radicalsDone: [],
    charactersDone: [],
    completedAt: undefined,
  });
}

/**
 * Record that a specific item within a lesson has been studied.
 */
export async function markItemDone(
  lessonId: string,
  char: string,
  type: 'radical' | 'character',
): Promise<void> {
  const progress = await db.lessonProgress.get(lessonId);
  if (!progress) return;

  if (type === 'radical') {
    if (!progress.radicalsDone.includes(char)) {
      await db.lessonProgress.update(lessonId, {
        radicalsDone: [...progress.radicalsDone, char],
      });
    }
  } else {
    if (!progress.charactersDone.includes(char)) {
      await db.lessonProgress.update(lessonId, {
        charactersDone: [...progress.charactersDone, char],
      });
    }
  }
}
