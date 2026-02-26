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

  // Single learned chars query — shared across all Logic sub-components
  const learnedChars = useLiveQuery(async () => {
    const cards = await db.cards.where('itemType').equals('character').toArray();
    const known = new Set<string>();
    if (!characterData) return known;
    const idMap = new Map(characterData.map((c) => [c.id, c.char]));
    for (const card of cards) {
      if (card.state >= 1) {
        const ch = idMap.get(card.itemId);
        if (ch) known.add(ch);
      }
    }
    return known;
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
            className={`flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar ${
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
          learnedChars={learnedChars}
          onCharSelect={handleCharSelect}
        />
      )}

      {activeTab === 'families' && (
        <div className="flex flex-col gap-4">
          {familyData ? (
            <>
              {/* Back button */}
              <button
                onClick={() => {
                  setSelectedFamily(null);
                  setCurrentChar(undefined);
                }}
                className="self-start flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-sm text-rice-muted hover:text-rice bg-ink-elevated rounded-lg border border-ink-border transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar"
              >
                <span aria-hidden="true">&larr;</span> Все семьи
              </button>

              <FamilyTree
                rootChar={familyData.rootChar}
                rootPinyin={familyData.rootPinyin}
                rootMeaning={familyData.rootMeaning}
                derivatives={familyData.derivatives}
                learnedChars={learnedChars}
                onCharSelect={handleCharSelect}
              />
            </>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Explanation */}
              <div className="rice-paper rounded-lg p-4 border border-ink-border">
                <p className="text-sm text-rice-muted leading-relaxed">
                  <strong className="text-rice">Семья иероглифов</strong> — группа знаков с общим компонентом.
                  Выберите корневой компонент, чтобы увидеть все производные иероглифы.
                </p>
              </div>

              {/* Section: Phonetic families */}
              <h3 className="text-sm text-rice font-medium">Фонетические семьи <span className="text-rice-dim font-normal">({Object.keys(logicData.phonetic_components).length})</span></h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(logicData.phonetic_components).map(([component, data]) => (
                  <button
                    key={component}
                    onClick={() => handleCharSelect(component)}
                    className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg bg-ink-elevated border border-ink-border text-sm hover:border-gold-dim transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar"
                  >
                    <span className="font-hanzi text-xl text-hanzi">{component}</span>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gold">{data.pinyin}</span>
                      <span className="text-xs text-rice-dim">{data.derivatives.length} производных</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Section: Semantic families */}
              <h3 className="text-sm text-rice font-medium mt-4">Семантические семьи <span className="text-rice-dim font-normal">({Object.keys(logicData.semantic_families).length})</span></h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(logicData.semantic_families).map(([radical, data]) => (
                  <button
                    key={radical}
                    onClick={() => handleCharSelect(radical)}
                    className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg bg-ink-elevated border border-ink-border text-sm hover:border-jade/30 transition-colors focus-visible:ring-2 focus-visible:ring-cinnabar"
                  >
                    <span className="font-hanzi text-xl text-hanzi">{radical}</span>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-jade">{data.meaning_ru ?? ''}</span>
                      <span className="text-xs text-rice-dim">{data.derivatives.length} производных</span>
                    </div>
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
          learnedChars={learnedChars}
          onCharSelect={handleCharSelect}
        />
      )}
    </div>
  );
}
