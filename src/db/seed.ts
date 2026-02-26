/**
 * HanziFlow — Database seeding
 *
 * Imports static JSON data (radicals, HSK1 characters),
 * creates initial SRS cards, and writes default settings.
 */

import { State } from 'ts-fsrs';
import type { Radical, Character, SRSCard, AppSettings } from '@/types';
import type { default as DBType } from '@/db';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNewCard(
  itemId: number,
  itemType: 'radical' | 'character',
  cardType: 'recognition' | 'recall',
): SRSCard {
  return {
    itemId,
    itemType,
    cardType,
    due: new Date(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: 0,
    lapses: 0,
    state: State.New,
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  sessionMinutes: 30,
  cardsPerSession: 20,
  theme: 'light',
  seenExplainers: [],
  seeded: true,
};

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

/**
 * Seeds the database with radical and HSK1 character data.
 * Skips if already seeded (settings row with seeded=true exists).
 */
export async function seedDatabase(db: typeof DBType): Promise<void> {
  // Check if already seeded
  const existing = await db.settings.get(1);
  if (existing?.seeded) {
    return;
  }

  // Dynamic imports so the JSON is code-split by Vite
  const [radicalsModule, hsk1Module] = await Promise.all([
    import('@/data/radicals.json'),
    import('@/data/hsk1.json'),
  ]);

  const radicals: Radical[] = radicalsModule.default;
  const characters: Character[] = hsk1Module.default;

  // Build SRS cards for all radicals (recognition + recall)
  const radicalCards: SRSCard[] = radicals.flatMap((r) => [
    makeNewCard(r.id, 'radical', 'recognition'),
    makeNewCard(r.id, 'radical', 'recall'),
  ]);

  // Build SRS cards for all characters (recognition + recall)
  const characterCards: SRSCard[] = characters.flatMap((c) => [
    makeNewCard(c.id, 'character', 'recognition'),
    makeNewCard(c.id, 'character', 'recall'),
  ]);

  // Single transaction to ensure atomicity
  await db.transaction(
    'rw',
    [db.radicals, db.characters, db.cards, db.settings],
    async () => {
      // Clear existing data in case of partial seed
      await db.radicals.clear();
      await db.characters.clear();
      await db.cards.clear();

      // Bulk-insert content
      await db.radicals.bulkAdd(radicals);
      await db.characters.bulkAdd(characters);

      // Bulk-insert SRS cards
      await db.cards.bulkAdd([...radicalCards, ...characterCards]);

      // Write default settings (marks seeded=true)
      await db.settings.put(DEFAULT_SETTINGS);
    },
  );
}
