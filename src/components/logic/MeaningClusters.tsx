import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { ProgressRing } from '@/components/shared/ProgressRing';

interface ClusterChar {
  char: string;
  meaning_ru: string;
}

interface MeaningCluster {
  title: string;
  description?: string;
  characters: ClusterChar[];
}

interface MeaningClustersProps {
  clusters: MeaningCluster[];
  onCharSelect: (char: string) => void;
}

export function MeaningClusters({ clusters, onCharSelect }: MeaningClustersProps) {
  // Get learned characters
  const learnedChars = useLiveQuery(async () => {
    const cards = await db.cards.where('itemType').equals('character').toArray();
    const known = new Set<string>();
    const charData = await db.characters.toArray();
    const charMap = new Map(charData.map((c) => [c.id, c.char]));
    for (const card of cards) {
      if (card.state >= 1) {
        const ch = charMap.get(card.itemId);
        if (ch) known.add(ch);
      }
    }
    return known;
  }, []);

  const known = learnedChars ?? new Set<string>();

  return (
    <div className="flex flex-col gap-4">
      {clusters.map((cluster) => {
        const learnedCount = cluster.characters.filter((c) => known.has(c.char)).length;
        const progress = cluster.characters.length > 0
          ? learnedCount / cluster.characters.length
          : 0;

        return (
          <div
            key={cluster.title}
            className="rice-paper rounded-lg p-4 border border-ink-border"
          >
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm text-rice font-medium">{cluster.title}</h3>
                {cluster.description && (
                  <p className="text-xs text-rice-muted mt-0.5">{cluster.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-rice-muted">
                  {learnedCount}/{cluster.characters.length}
                </span>
                <ProgressRing progress={progress} size={32} />
              </div>
            </div>

            {/* Character chips */}
            <div className="flex flex-wrap gap-2">
              {cluster.characters.map((c) => {
                const isKnown = known.has(c.char);
                return (
                  <button
                    key={c.char}
                    onClick={() => onCharSelect(c.char)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all ${
                      isKnown
                        ? 'border-ink-border bg-ink-elevated hover:border-jade'
                        : 'border-ink-border bg-ink text-rice-dim hover:text-rice-muted'
                    }`}
                  >
                    <span className={`font-hanzi text-lg ${isKnown ? 'text-hanzi' : 'text-rice-dim'}`}>
                      {c.char}
                    </span>
                    <span className={`text-[10px] ${isKnown ? 'text-rice-muted' : 'text-rice-dim'}`}>
                      {c.meaning_ru}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {clusters.length === 0 && (
        <p className="text-sm text-rice-dim text-center py-8">
          Нет доступных кластеров
        </p>
      )}
    </div>
  );
}
