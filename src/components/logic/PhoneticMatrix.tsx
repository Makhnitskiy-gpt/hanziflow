import { useState, useMemo } from 'react';

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
  const [highlightRow, setHighlightRow] = useState<number | null>(null);
  const [highlightCol, setHighlightCol] = useState<number | null>(null);

  // Build matrix: rows = semantic radicals, columns = phonetic components
  // Cell = intersection character (if exists)
  const matrix = useMemo(() => {
    const charLookup = new Map<string, { char: string; meaning_ru: string }>();

    for (const pc of phoneticComponents) {
      for (const d of pc.derivatives) {
        for (const sf of semanticFamilies) {
          if (sf.characters.includes(d.char)) {
            charLookup.set(`${sf.radical}|${pc.component}`, d);
          }
        }
      }
    }

    return charLookup;
  }, [phoneticComponents, semanticFamilies]);

  const known = learnedChars ?? new Set<string>();

  return (
    <div className="overflow-auto">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-ink-surface p-2 text-rice-muted text-xs border-b border-r border-ink-border">
              声/意
            </th>
            {phoneticComponents.map((pc, ci) => (
              <th
                key={pc.component}
                className={`p-2 text-center border-b border-ink-border cursor-pointer transition-colors ${
                  highlightCol === ci ? 'bg-ink-elevated' : ''
                }`}
                onClick={() => setHighlightCol(highlightCol === ci ? null : ci)}
              >
                <span className="font-hanzi text-hanzi text-lg">{pc.component}</span>
                <br />
                <span className="text-xs text-rice-muted">{pc.pinyin}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanticFamilies.map((sf, ri) => (
            <tr key={sf.radical}>
              <td
                className={`sticky left-0 z-10 bg-ink-surface p-2 border-r border-b border-ink-border cursor-pointer transition-colors ${
                  highlightRow === ri ? 'bg-ink-elevated' : ''
                }`}
                onClick={() => setHighlightRow(highlightRow === ri ? null : ri)}
              >
                <span className="font-hanzi text-hanzi text-lg">{sf.radical}</span>
                <br />
                <span className="text-xs text-rice-muted">{sf.meaning_ru}</span>
              </td>
              {phoneticComponents.map((pc, ci) => {
                const cell = matrix.get(`${sf.radical}|${pc.component}`);
                const isKnown = cell ? known.has(cell.char) : false;
                const isHighlighted = highlightRow === ri || highlightCol === ci;

                return (
                  <td
                    key={pc.component}
                    className={`p-2 text-center border-b border-ink-border transition-colors ${
                      isHighlighted ? 'bg-ink-elevated/50' : ''
                    }`}
                  >
                    {cell ? (
                      <button
                        onClick={() => onCharSelect(cell.char)}
                        className={`inline-flex flex-col items-center p-1 rounded transition-all focus-visible:ring-2 focus-visible:ring-cinnabar ${
                          isKnown
                            ? 'hover:bg-ink-elevated'
                            : 'fog hover:filter-none hover:opacity-100'
                        }`}
                      >
                        <span className="font-hanzi text-hanzi text-xl">{cell.char}</span>
                        <span className="text-xs text-rice-muted">{cell.meaning_ru}</span>
                      </button>
                    ) : (
                      <span className="text-rice-dim">--</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
