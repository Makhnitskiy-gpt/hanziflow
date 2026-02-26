import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useOutletContext } from 'react-router-dom';
import { db } from '@/db';
import { PhoneticMatrix } from '@/components/logic/PhoneticMatrix';
import { FamilyTree } from '@/components/logic/FamilyTree';
import { MeaningClusters } from '@/components/logic/MeaningClusters';
import logicData from '@/data/character-logic.json';

interface OutletCtx {
  setCurrentChar: (char: string | undefined) => void;
}

type LogicTab = 'matrix' | 'families' | 'clusters';

export default function Logic() {
  const { setCurrentChar } = useOutletContext<OutletCtx>();
  const [activeTab, setActiveTab] = useState<LogicTab>('matrix');
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  // Fetch character data from DB for meaning lookups
  const characterData = useLiveQuery(() => db.characters.toArray(), []);
  const charMap = useMemo(() => {
    if (!characterData) return new Map<string, { meaning_ru: string; pinyin: string }>();
    return new Map(characterData.map((c) => [c.char, { meaning_ru: c.meaning_ru, pinyin: c.pinyin }]));
  }, [characterData]);

  // Build phonetic components from character-logic.json
  const phoneticComponents = useMemo(() => {
    return Object.entries(logicData.phonetic_components).map(([component, data]) => ({
      component,
      pinyin: data.pinyin,
      derivatives: data.derivatives.map((ch) => ({
        char: ch,
        meaning_ru: charMap.get(ch)?.meaning_ru ?? '',
      })),
    }));
  }, [charMap]);

  // Build semantic families from character-logic.json
  const semanticFamilies = useMemo(() => {
    return Object.entries(logicData.semantic_families).map(([radical, data]) => ({
      radical,
      meaning_ru: data.meaning_ru ?? (data as Record<string, unknown>).meaning as string ?? '',
      characters: data.derivatives,
    }));
  }, []);

  // Build meaning clusters from character-logic.json
  const meaningClusters = useMemo(() => {
    return Object.entries(logicData.meaning_clusters).map(([title, data]) => ({
      title,
      description: data.description_ru,
      characters: data.chars.map((ch) => ({
        char: ch,
        meaning_ru: charMap.get(ch)?.meaning_ru ?? '',
      })),
    }));
  }, [charMap]);

  const handleCharSelect = (char: string) => {
    setCurrentChar(char);
    setSelectedFamily(char);
  };

  // Get family data for selected character from character-logic.json
  const familyData = useMemo(() => {
    if (!selectedFamily) return null;

    // Search in phonetic_components
    for (const [component, data] of Object.entries(logicData.phonetic_components)) {
      if (component === selectedFamily || data.derivatives.includes(selectedFamily)) {
        return {
          rootChar: component,
          rootPinyin: data.pinyin,
          rootMeaning: data.meaning_ru,
          derivatives: data.derivatives.map((ch) => ({
            char: ch,
            meaning_ru: charMap.get(ch)?.meaning_ru ?? '',
            pinyin: charMap.get(ch)?.pinyin ?? '',
          })),
        };
      }
    }

    // Search in semantic_families
    for (const [radical, data] of Object.entries(logicData.semantic_families)) {
      if (radical === selectedFamily || data.derivatives.includes(selectedFamily)) {
        return {
          rootChar: radical,
          rootMeaning: data.meaning_ru ?? (data as Record<string, unknown>).meaning as string ?? '',
          derivatives: data.derivatives.map((ch) => ({
            char: ch,
            meaning_ru: charMap.get(ch)?.meaning_ru ?? '',
            pinyin: charMap.get(ch)?.pinyin ?? '',
          })),
        };
      }
    }

    return null;
  }, [selectedFamily, charMap]);

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
                ? 'bg-cinnabar text-white'
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
              rootPinyin={familyData.rootPinyin}
              rootMeaning={familyData.rootMeaning}
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
                {Object.entries(logicData.phonetic_components).slice(0, 12).map(([component, data]) => (
                  <button
                    key={component}
                    onClick={() => handleCharSelect(component)}
                    className="px-3 py-1.5 rounded-md bg-ink-elevated border border-ink-border text-sm hover:border-gold-dim transition-colors"
                  >
                    <span className="font-hanzi text-hanzi">{component}</span>
                    <span className="text-rice-dim ml-1">({data.derivatives.length})</span>
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
