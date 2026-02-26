import { useNavigate } from 'react-router-dom';
import type { Character } from '@/types';
import { PinyinDisplay } from '@/components/shared/PinyinDisplay';

interface DecompositionViewProps {
  character: Character;
}

const formationLabels: Record<string, string> = {
  '象形': 'Пиктограмма (象形)',
  '指事': 'Указательный (指事)',
  '会意': 'Составной (会意)',
  '形声': 'Фоно-семантический (形声)',
};

export function DecompositionView({ character }: DecompositionViewProps) {
  const navigate = useNavigate();

  return (
    <div className="rice-paper rounded-lg p-6">
      {/* Main character */}
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center">
          <span className="hanzi-lg">{character.char}</span>
          <PinyinDisplay pinyin={character.pinyin} tone={character.tone} size="md" />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <h2 className="text-xl text-rice font-medium">{character.meaning_ru}</h2>
          <p className="text-sm text-rice-muted">{character.meaning_en}</p>

          {/* Formation type */}
          <div className="mt-1">
            <span className="ink-stamp mr-2">
              {character.formation_type === '象形' ? '象' :
               character.formation_type === '指事' ? '指' :
               character.formation_type === '会意' ? '会' : '形'}
            </span>
            <span className="text-sm text-gold">
              {formationLabels[character.formation_type] ?? character.formation_type}
            </span>
          </div>
        </div>
      </div>

      {/* Decomposition visual */}
      {character.radicals.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-rice-muted mb-3">Состав</p>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Full character */}
            <span className="hanzi-md">{character.char}</span>
            <span className="text-2xl text-rice-dim">=</span>

            {character.radicals.map((rad, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 && <span className="text-2xl text-rice-dim">+</span>}
                <button
                  onClick={() => navigate(`/radicals?char=${encodeURIComponent(rad)}`)}
                  className="flex flex-col items-center p-2 rounded-md bg-ink-elevated border border-ink-border hover:border-gold transition-colors"
                >
                  <span className="hanzi-md">{rad}</span>
                  <span className="text-xs text-rice-muted mt-1">радикал</span>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Formation explanation */}
      {character.formation_explanation_ru && (
        <div className="mt-5 p-3 bg-ink-elevated rounded-md border border-ink-border">
          <p className="text-xs text-gold-dim mb-1">Как запомнить</p>
          <p className="text-sm text-rice">{character.formation_explanation_ru}</p>
        </div>
      )}

      {/* Example words */}
      {character.examples_ru.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-rice-muted mb-2">Примеры</p>
          <div className="flex flex-col gap-1">
            {character.examples_ru.map((ex, i) => (
              <p key={i} className="text-sm text-rice-muted">{ex}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
