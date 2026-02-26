/**
 * HanziFlow — Database seeding
 *
 * Imports static JSON data (radicals, HSK1 characters)
 * and writes default settings. SRS cards are NOT created
 * at seed time — the user adds items to review explicitly.
 */

import type { Radical, Character, AppSettings } from '@/types';
import type { default as DBType } from '@/db';

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

  // Single transaction to ensure atomicity
  await db.transaction(
    'rw',
    [db.radicals, db.characters, db.cards, db.settings],
    async () => {
      // Clear existing data in case of partial seed
      await db.radicals.clear();
      await db.characters.clear();

      // Bulk-insert content (no SRS cards — user adds them manually)
      await db.radicals.bulkAdd(radicals);
      await db.characters.bulkAdd(characters);

      // Write default settings (marks seeded=true)
      await db.settings.put(DEFAULT_SETTINGS);
    },
  );
}
