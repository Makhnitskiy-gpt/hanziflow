import { ExplainerCard } from './ExplainerCard';
import { getExplainerContent, explainerTitles } from './explainerContent';

const explainerKeys = [
  'tones',
  'pinyin',
  'radicals',
  'stroke_order',
  'formation_types',
  'srs',
  'classifiers',
  'mnemonics',
];

export function ExplainerIndex() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl text-rice font-medium">Справочник</h1>
      <p className="text-sm text-rice-muted">
        Краткие объяснения ключевых концепций. Разделы, которые вы ещё не читали,
        раскрыты автоматически.
      </p>

      {explainerKeys.map((key) => (
        <ExplainerCard key={key} explainerKey={key} title={explainerTitles[key] ?? key}>
          {getExplainerContent(key)}
        </ExplainerCard>
      ))}
    </div>
  );
}
