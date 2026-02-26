import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';

interface ExplainerTopic {
  key: string;
  title: string;
  description: string;
}

const topics: ExplainerTopic[] = [
  {
    key: 'welcome',
    title: 'Добро пожаловать в HanziFlow',
    description: 'Как устроено приложение и с чего начать',
  },
  {
    key: 'radicals',
    title: 'Что такое радикалы?',
    description: 'Базовые компоненты иероглифов — ключ к запоминанию',
  },
  {
    key: 'formation_types',
    title: 'Типы построения иероглифов',
    description: 'Пиктограммы, указательные, составные, фоно-семантические',
  },
  {
    key: 'srs',
    title: 'Интервальное повторение (SRS)',
    description: 'Как работает система повторения и кнопки оценки',
  },
  {
    key: 'phonetic_logic',
    title: 'Фонетическая логика',
    description: 'Как компоненты подсказывают произношение',
  },
  {
    key: 'semantic_logic',
    title: 'Семантическая логика',
    description: 'Как радикалы подсказывают значение',
  },
  {
    key: 'stroke_order',
    title: 'Порядок штрихов',
    description: 'Правила написания иероглифов — почему это важно',
  },
  {
    key: 'mnemonics',
    title: 'Мнемоники',
    description: 'Как создавать образы для запоминания',
  },
];

export function ExplainerIndex() {
  const settings = useLiveQuery(() => db.settings.get(1), []);
  const seenKeys = settings?.seenExplainers ?? [];

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg text-rice font-medium mb-2">Справочные материалы</h2>
      <p className="text-sm text-rice-muted mb-4">
        Краткие объяснения ключевых концепций изучения китайского языка.
      </p>

      <div className="flex flex-col gap-2">
        {topics.map((topic) => {
          const isSeen = seenKeys.includes(topic.key);
          return (
            <div
              key={topic.key}
              className="flex items-center gap-3 p-3 rounded-lg rice-paper border border-ink-border"
            >
              {/* Status icon */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                isSeen ? 'bg-jade/20 text-jade' : 'bg-ink-elevated text-rice-dim'
              }`}>
                {isSeen ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm text-rice font-medium">{topic.title}</h3>
                <p className="text-xs text-rice-muted mt-0.5">{topic.description}</p>
              </div>

              {/* Read status */}
              <span className={`text-[10px] flex-shrink-0 ${isSeen ? 'text-jade' : 'text-rice-dim'}`}>
                {isSeen ? 'Прочитано' : 'Новое'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
