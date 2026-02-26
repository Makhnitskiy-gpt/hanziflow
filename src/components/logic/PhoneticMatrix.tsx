import { useState } from 'react';

interface PhoneticComponent {
  component: string;
  pinyin: string;
  derivatives: Array<{ char: string; meaning_ru: string }>;
}

interface SemanticFamily {
  radical: string;
  meaning_ru: string;
  characters: string[];
}

interface PhoneticMatrixProps {
  phoneticComponents: PhoneticComponent[];
  semanticFamilies: SemanticFamily[];
  learnedChars?: Set<string>;
  onCharSelect: (char: string) => void;
}

export function PhoneticMatrix({
  phoneticComponents,
  semanticFamilies,
  learnedChars,
  onCharSelect,
}: PhoneticMatrixProps) {
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'phonetic' | 'semantic'>('phonetic');
  const known = learnedChars ?? new Set<string>();

  // Find which semantic radical a character belongs to
  const getRadicalForChar = (char: string): { radical: string; meaning_ru: string } | null => {
    for (const sf of semanticFamilies) {
      if (sf.characters.includes(char)) {
        return { radical: sf.radical, meaning_ru: sf.meaning_ru };
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Explanation */}
      <div className="rice-paper rounded-lg p-4 border border-ink-border">
        <p className="text-sm text-rice-muted leading-relaxed">
          <strong className="text-rice">~80% иероглифов</strong> = семантический радикал (значение) + фонетический компонент (звук).
          Зная компоненты, можно угадывать произношение и значение новых иероглифов.
        </p>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('phonetic')}
          className={`px-3 py-1.5 min-h-[44px] text-sm rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar ${
            viewMode === 'phonetic'
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'text-rice-muted hover:text-rice bg-ink-elevated border border-ink-border'
          }`}
        >
          По звуку (фонетики)
        </button>
        <button
          onClick={() => setViewMode('semantic')}
          className={`px-3 py-1.5 min-h-[44px] text-sm rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar ${
            viewMode === 'semantic'
              ? 'bg-jade/20 text-jade border border-jade/30'
              : 'text-rice-muted hover:text-rice bg-ink-elevated border border-ink-border'
          }`}
        >
          По значению (радикалы)
        </button>
      </div>

      {viewMode === 'phonetic' ? (
        /* ---- Phonetic components as cards ---- */
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          {phoneticComponents.map((pc) => {
            const isExpanded = expandedComponent === pc.component;
            const knownCount = pc.derivatives.filter((d) => known.has(d.char)).length;

            return (
              <div
                key={pc.component}
                className="rice-paper rounded-lg border border-ink-border overflow-hidden"
              >
                {/* Card header */}
                <button
                  onClick={() => setExpandedComponent(isExpanded ? null : pc.component)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-ink-elevated/50 transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar focus-visible:ring-inset"
                >
                  <span className="font-hanzi text-2xl text-hanzi">{pc.component}</span>
                  <div className="flex-1 text-left">
                    <span className="text-sm text-gold">{pc.pinyin}</span>
                    <span className="text-xs text-rice-dim ml-2">
                      {pc.derivatives.length} иероглифов
                    </span>
                  </div>
                  {/* Mini progress */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-rice-dim">{knownCount}/{pc.derivatives.length}</span>
                    <div className="w-8 h-1.5 bg-ink-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-jade rounded-full"
                        style={{ width: `${pc.derivatives.length > 0 ? (knownCount / pc.derivatives.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-rice-dim text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-ink-border pt-3">
                    <div className="flex flex-wrap gap-2">
                      {pc.derivatives.map((d) => {
                        const radical = getRadicalForChar(d.char);
                        const isKnown = known.has(d.char);
                        return (
                          <button
                            key={d.char}
                            onClick={() => onCharSelect(d.char)}
                            className={`flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-md border transition-all focus-visible:ring-2 focus-visible:ring-cinnabar ${
                              isKnown
                                ? 'border-ink-border bg-ink-elevated hover:border-jade'
                                : 'border-ink-border bg-ink hover:bg-ink-elevated'
                            }`}
                          >
                            <span className={`font-hanzi text-xl ${isKnown ? 'text-hanzi' : 'text-rice-dim'}`}>
                              {d.char}
                            </span>
                            <div className="flex flex-col items-start">
                              <span className={`text-xs ${isKnown ? 'text-rice-muted' : 'text-rice-dim'}`}>
                                {d.meaning_ru || '—'}
                              </span>
                              {radical && (
                                <span className="text-xs text-jade/70">
                                  {radical.radical} {radical.meaning_ru}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ---- Semantic families as cards ---- */
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          {semanticFamilies.map((sf) => {
            const knownCount = sf.characters.filter((ch) => known.has(ch)).length;

            return (
              <div
                key={sf.radical}
                className="rice-paper rounded-lg border border-ink-border p-3"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-hanzi text-2xl text-hanzi">{sf.radical}</span>
                  <div className="flex-1">
                    <span className="text-sm text-rice">{sf.meaning_ru}</span>
                  </div>
                  <span className="text-xs text-rice-dim">{knownCount}/{sf.characters.length}</span>
                </div>

                {/* Characters */}
                <div className="flex flex-wrap gap-1.5">
                  {sf.characters.map((ch) => {
                    const isKnown = known.has(ch);
                    return (
                      <button
                        key={ch}
                        onClick={() => onCharSelect(ch)}
                        className={`font-hanzi text-lg px-2 py-1 min-h-[40px] rounded transition-all focus-visible:ring-2 focus-visible:ring-cinnabar ${
                          isKnown
                            ? 'text-hanzi hover:bg-ink-elevated'
                            : 'text-rice-dim hover:text-rice-muted'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
