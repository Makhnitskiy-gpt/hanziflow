import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/db';
import { PhoneticMatrix } from '@/components/logic/PhoneticMatrix';
import { FamilyTree } from '@/components/logic/FamilyTree';
import { MeaningClusters } from '@/components/logic/MeaningClusters';

interface OutletCtx {
  setCurrentChar: (char: string | undefined) => void;
}

type LogicTab = 'matrix' | 'families' | 'clusters';

// Sample data structures (would normally come from character-logic.json)
// These are populated from DB characters or a dedicated logic data file

export default function Logic() {
  const { setCurrentChar } = useOutletContext<OutletCtx>();
  const [activeTab, setActiveTab] = useState<LogicTab>('matrix');
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  // Build phonetic and semantic data from characters
  const characterData = useLiveQuery(() => db.characters.toArray(), []);

  const phoneticComponents = useMemo(() => {
    if (!characterData) return [];

    // Group characters by shared radicals to detect phonetic components
    const phoneticMap = new Map<string, Array<{ char: string; meaning_ru: string }>>();

    for (const ch of characterData) {
      if (ch.formation_type === '形声' && ch.radicals.length >= 2) {
        // Last radical is typically the phonetic component
        const phonetic = ch.radicals[ch.radicals.length - 1];
        if (!phoneticMap.has(phonetic)) {
          phoneticMap.set(phonetic, []);
        }
        phoneticMap.get(phonetic)!.push({ char: ch.char, meaning_ru: ch.meaning_ru });
      }
    }

    return Array.from(phoneticMap.entries())
      .filter(([, derivs]) => derivs.length >= 2)
      .map(([component, derivatives]) => ({
        component,
        pinyin: '',
        derivatives,
      }));
  }, [characterData]);

  const semanticFamilies = useMemo(() => {
    if (!characterData) return [];

    const semanticMap = new Map<string, string[]>();

    for (const ch of characterData) {
      if (ch.radicals.length > 0) {
        const semantic = ch.radicals[0]; // First radical is typically semantic
        if (!semanticMap.has(semantic)) {
          semanticMap.set(semantic, []);
        }
        semanticMap.get(semantic)!.push(ch.char);
      }
    }

    return Array.from(semanticMap.entries())
      .filter(([, chars]) => chars.length >= 2)
      .map(([radical, characters]) => ({
        radical,
        meaning_ru: '',
        characters,
      }));
  }, [characterData]);

  const meaningClusters = useMemo(() => {
    if (!characterData) return [];

    // Group by formation type as a basic clustering
    const typeMap = new Map<string, Array<{ char: string; meaning_ru: string }>>();
    const typeLabels: Record<string, string> = {
      '象形': 'Пиктограммы',
      '指事': 'Указательные',
      '会意': 'Составные идеограммы',
      '形声': 'Фоно-семантические',
    };

    for (const ch of characterData) {
      const type = ch.formation_type;
      if (!typeMap.has(type)) {
        typeMap.set(type, []);
      }
      typeMap.get(type)!.push({ char: ch.char, meaning_ru: ch.meaning_ru });
    }

    return Array.from(typeMap.entries()).map(([type, characters]) => ({
      title: typeLabels[type] ?? type,
      description: `Иероглифы типа "${type}"`,
      characters,
    }));
  }, [characterData]);

  const handleCharSelect = (char: string) => {
    setCurrentChar(char);
    setSelectedFamily(char);
  };

  // Get family data for selected character
  const familyData = useMemo(() => {
    if (!selectedFamily || !characterData) return null;

    // Find all characters sharing a component with the selected one
    const target = characterData.find((c) => c.char === selectedFamily);
    if (!target || target.radicals.length === 0) return null;

    const rootRad = target.radicals[target.radicals.length - 1];
    const derivatives = characterData
      .filter((c) => c.radicals.includes(rootRad) && c.char !== rootRad)
      .map((c) => ({
        char: c.char,
        meaning_ru: c.meaning_ru,
        pinyin: c.pinyin,
      }));

    return {
      rootChar: rootRad,
      derivatives,
    };
  }, [selectedFamily, characterData]);

  const tabs: Array<{ key: LogicTab; label: string; hanzi: string }> = [
    { key: 'matrix', label: 'Матрица', hanzi: '矩' },
    { key: 'families', label: 'Семьи', hanzi: '族' },
    { key: 'clusters', label: 'Кластеры', hanzi: '群' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl text-rice font-medium">Логика иероглифов</h1>

      {/* Tab buttons */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-cinnabar text-rice'
                : 'bg-ink-elevated text-rice-muted hover:text-rice border border-ink-border'
            }`}
          >
            <span className="font-hanzi">{tab.hanzi}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'matrix' && (
        <PhoneticMatrix
          phoneticComponents={phoneticComponents}
          semanticFamilies={semanticFamilies}
          onCharSelect={handleCharSelect}
        />
      )}

      {activeTab === 'families' && (
        <div className="flex flex-col gap-4">
          {familyData ? (
            <FamilyTree
              rootChar={familyData.rootChar}
              derivatives={familyData.derivatives}
              onCharSelect={handleCharSelect}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-12 text-rice-dim">
              <span className="font-hanzi text-4xl opacity-20">族</span>
              <p className="text-sm text-center">
                Выберите иероглиф из матрицы или списка,<br />
                чтобы увидеть его семью
              </p>

              {/* Quick select from available families */}
              <div className="flex flex-wrap gap-2 max-w-md justify-center mt-4">
                {phoneticComponents.slice(0, 12).map((pc) => (
                  <button
                    key={pc.component}
                    onClick={() => handleCharSelect(pc.derivatives[0]?.char ?? pc.component)}
                    className="px-3 py-1.5 rounded-md bg-ink-elevated border border-ink-border text-sm hover:border-gold-dim transition-colors"
                  >
                    <span className="font-hanzi text-hanzi">{pc.component}</span>
                    <span className="text-rice-dim ml-1">({pc.derivatives.length})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'clusters' && (
        <MeaningClusters
          clusters={meaningClusters}
          onCharSelect={handleCharSelect}
        />
      )}
    </div>
  );
}
