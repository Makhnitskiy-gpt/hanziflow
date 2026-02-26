import { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { completeLesson, startLesson, restartLesson } from '@/hooks/useLearningPath';
import type { LessonDef, LessonProgress } from '@/types';
import { LessonIntro } from './LessonIntro';
import { LessonLearn } from './LessonLearn';
import { LessonPractice } from './LessonPractice';
import { LessonSummary } from './LessonSummary';
import { ExplainerCard } from '@/components/explainer/ExplainerCard';
import { getExplainerContent, explainerTitles } from '@/components/explainer/explainerContent';
import learningPath from '@/data/learning-path.json';

type Phase = 'intro' | 'explainers' | 'learn' | 'practice' | 'summary';

interface OutletCtx {
  setCurrentChar: (char: string | undefined) => void;
  setCanvasMode: (mode: 'stroke' | 'draw') => void;
  setCanvasHighlight: (v: boolean) => void;
  setPracticeMode: (v: boolean) => void;
}

interface LessonFlowProps {
  lesson: LessonDef;
  progress: LessonProgress;
  lessonIndex: number;
}

export function LessonFlow({ lesson, progress, lessonIndex }: LessonFlowProps) {
  const { setCurrentChar, setCanvasMode, setCanvasHighlight, setPracticeMode } = useOutletContext<OutletCtx>();

  // Determine initial phase based on progress
  // Completed lessons start at intro (allows re-learning)
  const getInitialPhase = (): Phase => {
    if (progress.status === 'in_progress') {
      const totalItems = lesson.radicals.length + lesson.characters.length;
      const doneItems = progress.radicalsDone.length + progress.charactersDone.length;
      if (doneItems >= totalItems) return 'practice';
      if (doneItems > 0) return 'learn';
    }
    return 'intro';
  };

  const [phase, setPhase] = useState<Phase>(getInitialPhase);

  const allLessons = learningPath.stages.flatMap((s) => s.lessons);
  const isLastLesson = lessonIndex === allLessons.length - 1;

  const handleStart = async () => {
    await startLesson(lesson.id);
    if (lesson.explainers && lesson.explainers.length > 0) {
      setPhase('explainers');
    } else {
      setPhase('learn');
    }
  };

  const handleExplainersDone = () => {
    setPhase('learn');
  };

  const handleLearnComplete = () => {
    // Hide CanvasPanel, 4x canvas is inline in LessonPractice
    setPracticeMode(true);
    setPhase('practice');
  };

  const handlePracticeComplete = async () => {
    setPracticeMode(false);
    await completeLesson(lesson.id);
    setPhase('summary');
  };

  const handleRestart = async () => {
    await restartLesson(lesson.id);
    setPhase('intro');
  };

  const handleCharChange = useCallback(
    (char: string) => {
      setCurrentChar(char);
      setCanvasMode('stroke');
    },
    [setCurrentChar, setCanvasMode],
  );

  switch (phase) {
    case 'intro':
      return <LessonIntro lesson={lesson} lessonIndex={lessonIndex} onStart={handleStart} />;

    case 'explainers':
      return (
        <div className="flex flex-col gap-4 max-w-lg mx-auto py-6">
          <h2 className="text-lg text-rice font-medium text-center mb-2">
            Прежде чем начать...
          </h2>
          {(lesson.explainers ?? []).map((key) => (
            <ExplainerCard key={key} explainerKey={key} title={explainerTitles[key] ?? key}>
              {getExplainerContent(key)}
            </ExplainerCard>
          ))}
          <button
            onClick={handleExplainersDone}
            className="self-center mt-4 px-8 py-3 min-h-[48px] bg-cinnabar text-white rounded-lg font-medium hover:bg-cinnabar/90 transition-colors"
          >
            Начать изучение
          </button>
        </div>
      );

    case 'learn':
      return (
        <LessonLearn
          lesson={lesson}
          onComplete={handleLearnComplete}
          onCharChange={handleCharChange}
        />
      );

    case 'practice':
      return (
        <LessonPractice
          lesson={lesson}
          onComplete={handlePracticeComplete}
          onCharChange={handleCharChange}
        />
      );

    case 'summary':
      return (
        <LessonSummary
          lesson={lesson}
          lessonIndex={lessonIndex}
          isLastLesson={isLastLesson}
          onRestart={handleRestart}
        />
      );
  }
}
